import sharp from "sharp";

export interface DetectedLot {
  // 4 corners as fractions (0-1) of the source image's width/height
  corners: { fx: number; fy: number }[];
}

const TARGET_W = 1400; // working resolution for the flood-fill pass

/**
 * Finds individually-subdivided "cell" regions (lots) in a plan image: small,
 * fully-enclosed near-white regions bounded by darker grid/line pixels, as
 * opposed to large open areas (roads, parks) or colored fills (lakes).
 * Returns each lot's oriented bounding box (via PCA), as fractions of the
 * image so callers can map them onto real coordinates independently of
 * working resolution.
 */
export async function extractLotPolygons(imagePath: string): Promise<DetectedLot[]> {
  const meta = await sharp(imagePath).metadata();
  const scale = TARGET_W / (meta.width || TARGET_W);
  const targetH = Math.round((meta.height || TARGET_W) * scale);

  const { data, info } = await sharp(imagePath)
    .resize({ width: TARGET_W, height: targetH })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width, H = info.height, C = info.channels;
  const idx = (x: number, y: number) => (y * W + x) * C;

  const isBarrier = new Uint8Array(W * H);
  const isColorFill = new Uint8Array(W * H); // lakes / strong non-white,non-gray fills

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = idx(x, y);
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const p = y * W + x;
      const isWhite = r > 245 && g > 245 && b > 245;
      isBarrier[p] = isWhite ? 0 : 1;
      const isSaturatedColor =
        Math.max(r, g, b) - Math.min(r, g, b) > 60 && Math.max(r, g, b) > 100;
      if (isSaturatedColor) isColorFill[p] = 1;
    }
  }

  // Flood fill from the border through non-barrier pixels => "outside the plotted area"
  const outside = new Uint8Array(W * H);
  const stack: [number, number][] = [];
  for (let x = 0; x < W; x++) { stack.push([x, 0]); stack.push([x, H - 1]); }
  for (let y = 0; y < H; y++) { stack.push([0, y]); stack.push([W - 1, y]); }
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const p = y * W + x;
    if (outside[p] || isBarrier[p]) continue;
    outside[p] = 1;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  // Known non-lot regions in a typical CAD sheet export (title block, area
  // table, compass rose, road-profile diagrams, locator inset) — expressed
  // as fractions of the image so they scale with any sheet size. Harmless
  // to leave in place even if a given plan doesn't have all of these.
  const exclusions = [
    { x0: 0.27, y0: 0.085, x1: 0.40, y1: 0.15 },
    { x0: 0.36, y0: 0.27, x1: 0.46, y1: 0.33 },
    { x0: 0.68, y0: 0, x1: 1, y1: 0.37 },
    { x0: 0, y0: 0.38, x1: 0.17, y1: 0.49 },
    { x0: 0.28, y0: 0.86, x1: 1, y1: 1 },
    { x0: 0.85, y0: 0, x1: 1, y1: 0.86 },
  ];
  const inExclusion = (xp: number, yp: number) =>
    exclusions.some(e => xp >= e.x0 && xp <= e.x1 && yp >= e.y0 && yp <= e.y1);

  const visited = new Uint8Array(W * H);
  const CAP = 900; // px budget — a lot cell; roads/parks/margins blow past this

  function localRegion(sx: number, sy: number): [number, number][] | null {
    const q: [number, number][] = [[sx, sy]];
    const pts: [number, number][] = [];
    const seenLocal = new Set<number>([sy * W + sx]);
    while (q.length) {
      const [x, y] = q.pop()!;
      pts.push([x, y]);
      if (pts.length > CAP) return null;
      const neighbors: [number, number][] = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const np = ny * W + nx;
        if (seenLocal.has(np)) continue;
        if (outside[np] || isBarrier[np] || isColorFill[np]) continue;
        seenLocal.add(np);
        q.push([nx, ny]);
      }
    }
    return pts;
  }

  const lots: DetectedLot[] = [];
  const cell = 10;
  for (let y = cell; y < H - cell; y += cell) {
    for (let x = cell; x < W - cell; x += cell) {
      const p = y * W + x;
      if (outside[p] || isBarrier[p] || isColorFill[p] || visited[p]) continue;
      if (inExclusion(x / W, y / H)) continue;

      const region = localRegion(x, y);
      if (!region) continue; // too big -> road/park/margin
      for (const [rx, ry] of region) visited[ry * W + rx] = 1;
      if (region.length < 25) continue; // sliver noise

      lots.push({ corners: orientedBoundingBox(region, W, H) });
    }
  }

  return lots;
}

/** Minimum-area-ish oriented bounding box via PCA on a pixel region. */
function orientedBoundingBox(region: [number, number][], W: number, H: number) {
  const n = region.length;
  let sx = 0, sy = 0;
  for (const [x, y] of region) { sx += x; sy += y; }
  const cx = sx / n, cy = sy / n;

  let sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of region) {
    const dx = x - cx, dy = y - cy;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  }
  sxx /= n; syy /= n; sxy /= n;

  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  const cos = Math.cos(angle), sin = Math.sin(angle);

  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
  for (const [x, y] of region) {
    const dx = x - cx, dy = y - cy;
    const u = dx * cos + dy * sin;
    const v = -dx * sin + dy * cos;
    if (u < minU) minU = u; if (u > maxU) maxU = u;
    if (v < minV) minV = v; if (v > maxV) maxV = v;
  }

  const corners_uv = [
    [minU, minV], [maxU, minV], [maxU, maxV], [minU, maxV],
  ];
  return corners_uv.map(([u, v]) => {
    const dx = u * cos - v * sin;
    const dy = u * sin + v * cos;
    return { fx: (cx + dx) / W, fy: (cy + dy) / H };
  });
}
