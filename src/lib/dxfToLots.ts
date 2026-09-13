import DxfParser from "dxf-parser";

/**
 * Reads the closed polylines of a DXF and turns them into lot polygons.
 *
 * Points come back normalized to 0..1 over the drawing's bounding box, with Y
 * already flipped (DXF grows upwards, images grow downwards). The admin then
 * maps that unit square onto the plano image, which is what finally produces
 * the 0-100 percentages stored in the database.
 */

export type UnitPoint = [number, number];

export interface DxfLot {
  points: UnitPoint[];  // 0..1, Y already flipped for screen space
  codigo: string | null; // from a TEXT/MTEXT sitting inside the polygon
  area: number;          // in drawing units² (metres² when the CAD is in metres)
}

export interface DxfLayerSummary {
  name: string;
  polygons: number;
}

export interface DxfParseResult {
  layers: DxfLayerSummary[];
  lots: DxfLot[];
  layerUsed: string | null;
  /** Drawing units across the bounding box — lets the admin sanity-check scale. */
  widthUnits: number;
  heightUnits: number;
}

interface RawPolygon {
  layer: string;
  points: UnitPoint[]; // raw DXF coordinates
}

interface RawLabel {
  layer: string;
  x: number;
  y: number;
  text: string;
}

function shoelaceArea(points: UnitPoint[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

function pointInPolygon(x: number, y: number, points: UnitPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Drops a trailing point that just repeats the first one. */
function dedupeRing(points: UnitPoint[]): UnitPoint[] {
  if (points.length < 2) return points;
  const [fx, fy] = points[0];
  const [lx, ly] = points[points.length - 1];
  const sameEnds = Math.abs(fx - lx) < 1e-9 && Math.abs(fy - ly) < 1e-9;
  return sameEnds ? points.slice(0, -1) : points;
}

function collect(entities: any[], polygons: RawPolygon[], labels: RawLabel[]) {
  for (const entity of entities ?? []) {
    const layer = String(entity.layer ?? "0");

    if (entity.type === "LWPOLYLINE" || entity.type === "POLYLINE") {
      const verts: UnitPoint[] = (entity.vertices ?? [])
        .filter((v: any) => Number.isFinite(v?.x) && Number.isFinite(v?.y))
        .map((v: any) => [v.x, v.y] as UnitPoint);

      const ring = dedupeRing(verts);
      // `shape` is dxf-parser's closed flag; a ring whose ends already meet
      // counts too, which is how a lot of exporters write closed lots.
      const closed = entity.shape === true || entity.closed === true || ring.length < verts.length;
      if (closed && ring.length >= 3) polygons.push({ layer, points: ring });
      continue;
    }

    if (entity.type === "TEXT" || entity.type === "MTEXT") {
      const pos = entity.startPoint ?? entity.position;
      const text = String(entity.text ?? "").trim();
      if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y) && text) {
        labels.push({ layer, x: pos.x, y: pos.y, text });
      }
    }
  }
}

export function parseDxfLots(dxfText: string, requestedLayer?: string): DxfParseResult {
  const parser = new (DxfParser as any)();
  const dxf = parser.parseSync(dxfText);

  const polygons: RawPolygon[] = [];
  const labels: RawLabel[] = [];
  collect(dxf?.entities ?? [], polygons, labels);

  // Layer inventory, busiest first — the lots layer is almost always the one
  // with the most closed polylines.
  const counts = new Map<string, number>();
  for (const p of polygons) counts.set(p.layer, (counts.get(p.layer) ?? 0) + 1);
  const layers: DxfLayerSummary[] = [...counts.entries()]
    .map(([name, polygons]) => ({ name, polygons }))
    .sort((a, b) => b.polygons - a.polygons);

  const layerUsed = requestedLayer ?? layers[0]?.name ?? null;
  const chosen = polygons.filter(p => p.layer === layerUsed);

  if (chosen.length === 0) {
    return { layers, lots: [], layerUsed, widthUnits: 0, heightUnits: 0 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const poly of chosen) {
    for (const [x, y] of poly.points) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  const width = maxX - minX || 1;
  const height = maxY - minY || 1;

  const lots: DxfLot[] = chosen.map(poly => {
    const label = labels.find(l => pointInPolygon(l.x, l.y, poly.points));
    return {
      area: Math.round(shoelaceArea(poly.points) * 100) / 100,
      codigo: label?.text ?? null,
      points: poly.points.map(([x, y]) => [
        Number(((x - minX) / width).toFixed(6)),
        Number(((maxY - y) / height).toFixed(6)), // flip to screen space
      ] as UnitPoint),
    };
  });

  return {
    layers,
    lots,
    layerUsed,
    widthUnits: Math.round(width * 100) / 100,
    heightUnits: Math.round(height * 100) / 100,
  };
}
