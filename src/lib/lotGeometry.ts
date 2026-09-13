/**
 * Lot polygons are stored as [x, y] pairs in percent (0-100) of the plano
 * image, so the SVG overlay lines up with the image at any size without
 * needing the image's pixel dimensions or any geographic reference.
 */
export type LotPoint = [number, number];

export function parseLotGeometry(geometry: string): LotPoint[] {
  try {
    const parsed = JSON.parse(geometry);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is LotPoint =>
        Array.isArray(p) && p.length === 2 && p.every(n => typeof n === "number" && Number.isFinite(n))
    );
  } catch {
    return [];
  }
}

export function polygonPoints(points: LotPoint[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

export function polygonCentroid(points: LotPoint[]): LotPoint {
  const sum = points.reduce<LotPoint>((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}
