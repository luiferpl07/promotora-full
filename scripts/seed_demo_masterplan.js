// Demo/illustrative masterplan render for Lagos del Palmar — a STYLIZED
// simulation loosely inspired by the real plan's macro shape (a diagonal
// upper corridor bending into lakes, then a regular grid lower section),
// NOT a trace of the real CAD file. Used only to show a prospective client
// the interactive experience before the real DXF exists.
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const PROJECT_ID = "cmtkfm6be000fyl7qmg36bevo"; // Lagos del Palmar

const W = 1550, H = 1700;
const BG = "#EFE9DC";
const OLIVE = "#7FA33C";
const OLIVE_DARK = "#6C8F2E";
const ROAD = "#B9B7AE";
const ROAD_EDGE = "#DCDAD0";
const LOT_LINE = "#FFFFFF";
const LAKE = "#3B7DD8";

const lots = []; // { points: [[px,py],...], codigo, area }
let shapeSvg = "";
let lakeSvg = "";
let labelSvg = "";

function rotateRect(cx, cy, w, h, angle) {
  const hw = w / 2, hh = h / 2;
  const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  return corners.map(([x, y]) => [
    cx + x * Math.cos(angle) - y * Math.sin(angle),
    cy + x * Math.sin(angle) + y * Math.cos(angle),
  ]);
}

function rectSvg(points, fill) {
  return `<polygon points="${points.map(p => p.join(",")).join(" ")}" fill="${fill}"/>`;
}

// --- Zone A: diagonal "fishbone" corridor (mirrors the real plan's upper wedge) ---
let fishboneNum = 0;
function fishbone(x0, y0, x1, y1, lotDepth, lotW, prefix, roadGap = 34) {
  const fullDx = x1 - x0, fullDy = y1 - y0;
  // Inset both ends so adjacent segments don't produce overlapping slivers at the bend.
  const inset = 0.06;
  const sx = x0 + fullDx * inset, sy = y0 + fullDy * inset;
  const ex = x0 + fullDx * (1 - inset), ey = y0 + fullDy * (1 - inset);
  const dx = ex - sx, dy = ey - sy;
  const len = Math.hypot(dx, dy);
  const dirAngle = Math.atan2(dy, dx);
  const perpAngle = dirAngle + Math.PI / 2;
  const nSteps = Math.floor(len / lotW);
  for (let i = 0; i < nSteps; i++) {
    const t = (i + 0.5) / nSteps;
    const cx = sx + dx * t, cy = sy + dy * t;
    for (const side of [1, -1]) {
      const offset = side * (roadGap / 2 + lotDepth / 2);
      const lcx = cx + Math.cos(perpAngle) * offset;
      const lcy = cy + Math.sin(perpAngle) * offset;
      const corners = rotateRect(lcx, lcy, lotW - 3, lotDepth, dirAngle);
      fishboneNum++;
      lots.push({ points: corners, codigo: `${prefix}-${String(fishboneNum).padStart(2, "0")}`, area: 300 + ((fishboneNum * 11) % 40) });
      shapeSvg += rectSvg(corners, OLIVE);
    }
  }
  // road bed spans the full (non-inset) segment so it stays continuous at bends
  const fullLen = Math.hypot(fullDx, fullDy);
  const fullAngle = Math.atan2(fullDy, fullDx);
  const roadCorners = rotateRect(x0 + fullDx / 2, y0 + fullDy / 2, fullLen, roadGap, fullAngle);
  return { roadCorners };
}

const seg1 = fishbone(140, 220, 620, 560, 90, 58, "MZ-A");
shapeSvg += rectSvg(seg1.roadCorners, ROAD);
const seg2 = fishbone(620, 560, 760, 980, 90, 58, "MZ-B");
shapeSvg += rectSvg(seg2.roadCorners, ROAD);

// --- Zone B: regular grid (lower-right, like the real plan's lower block) ---
const cellW = 44, cellH = 56;
function grid(x0, y0, cols, rows, prefix) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * cellW, y = y0 + r * cellH;
      const n = r * cols + c + 1;
      lots.push({ points: [[x, y], [x + cellW, y], [x + cellW, y + cellH], [x, y + cellH]], codigo: `${prefix}-${String(n).padStart(2, "0")}`, area: 300 + ((n * 7) % 25) });
      shapeSvg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${OLIVE}"/>`;
    }
  }
  let lines = "";
  for (let c = 1; c < cols; c++) lines += `<line x1="${x0 + c * cellW}" y1="${y0}" x2="${x0 + c * cellW}" y2="${y0 + rows * cellH}" stroke="${LOT_LINE}" stroke-width="2" opacity="0.85"/>`;
  for (let r = 1; r < rows; r++) lines += `<line x1="${x0}" y1="${y0 + r * cellH}" x2="${x0 + cols * cellW}" y2="${y0 + r * cellH}" stroke="${LOT_LINE}" stroke-width="2" opacity="0.85"/>`;
  shapeSvg += lines;
  return { w: cols * cellW, h: rows * cellH };
}

const gridOriginX = 760;
const blockA = grid(gridOriginX, 1150, 6, 5, "MZ-C");
const blockB = grid(gridOriginX + 6 * cellW + 40, 1150, 6, 5, "MZ-D");
shapeSvg += `<rect x="${gridOriginX + 6 * cellW}" y="1150" width="40" height="${blockA.h}" fill="${ROAD}" stroke="${ROAD_EDGE}"/>`;
shapeSvg += `<rect x="${gridOriginX - 20}" y="${1150 + blockA.h}" width="${6 * cellW * 2 + 80}" height="34" fill="${ROAD}" stroke="${ROAD_EDGE}"/>`;

// --- Lakes (echoing "9 lagos naturales") — placed in open background gaps,
// well clear of every lot/road so the interactive color overlay never
// collides with them.
function blob(cx, cy, rx, ry, rot = 0) {
  lakeSvg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${LAKE}" transform="rotate(${rot} ${cx} ${cy})"/>`;
}
blob(1200, 130, 55, 40, 15);
blob(1300, 260, 45, 35, -10);
blob(60, 520, 50, 65, 10);
blob(1250, 620, 60, 48, 20);
blob(150, 950, 55, 42, -15);
blob(420, 1300, 65, 50, 5);
blob(1420, 900, 45, 60, -20);
blob(1080, 1620, 50, 38, 0);
blob(1450, 1550, 45, 35, 10);

// --- Labels ---
const labelStyle = `font-family="Arial, sans-serif" font-weight="800" font-size="24"`;
function pill(x, y, text, color) {
  const w = text.length * 15 + 46;
  labelSvg += `
    <g>
      <rect x="${x - w / 2}" y="${y - 20}" width="${w}" height="40" rx="20" fill="white" stroke="${color}" stroke-width="2" filter="url(#shadow)"/>
      <circle cx="${x - w / 2 + 22}" cy="${y}" r="6" fill="${color}"/>
      <text x="${x - w / 2 + 38}" y="${y + 7}" ${labelStyle} fill="${color}">${text}</text>
    </g>`;
}
pill(380, 160, "VÍA NACIONAL", "#C97B1E");
pill(890, 1100, "ZONA SOCIAL", "#2E7D32");
pill(1150, 1660, "PARQUE", "#2E7D32");

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="${BG}"/>
  ${shapeSvg}
  ${lakeSvg}
  ${labelSvg}
</svg>`;

const ESTADOS = ["disponible", "disponible", "disponible", "disponible", "reservado", "vendido"];

async function main() {
  const dir = path.join(process.cwd(), "public", "uploads", "planos");
  fs.mkdirSync(dir, { recursive: true });
  const filename = `demo-masterplan.jpg`;
  const filepath = path.join(dir, filename);
  await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toFile(filepath);
  const planoUrl = `/uploads/planos/${filename}`;
  console.log("Render generado:", planoUrl, `(${lots.length} lotes)`);

  const prisma = new PrismaClient();
  await prisma.project.update({ where: { id: PROJECT_ID }, data: { planoUrl } });
  await prisma.projectLot.deleteMany({ where: { projectId: PROJECT_ID } });
  const PRECIO_POR_M2 = 180000;
  const data = lots.map((lot, i) => ({
    projectId: PROJECT_ID,
    codigo: lot.codigo,
    geometry: JSON.stringify(lot.points.map(([x, y]) => [
      Number(((x / W) * 100).toFixed(3)),
      Number(((y / H) * 100).toFixed(3)),
    ])),
    area: lot.area,
    precio: Math.round((lot.area * PRECIO_POR_M2) / 100000) * 100000,
    estado: ESTADOS[i % ESTADOS.length],
  }));
  const result = await prisma.projectLot.createMany({ data });
  console.log("Lotes insertados:", result.count);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
