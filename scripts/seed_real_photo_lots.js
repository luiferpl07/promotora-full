// Uses the REAL satellite photo (with the real plan already traced on it,
// exported from Google Earth Pro) as the plano background. Lot positions are
// found by scanning the photo's own pixels for the bright/white plan lines
// (edge detection), not by eyeballing coordinates — much more reliable, as
// manual guesses kept landing lots in the open field next to the real grid.
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const PROJECT_ID = "cmtkfm6be000fyl7qmg36bevo"; // Lagos del Palmar
const SOURCE = "C:/Users/godri/Downloads/lagos-del-palmar-satelital-grid.webp";

function isBright(data, width, channels, x, y) {
  const idx = (y * width + x) * channels;
  const r = data[idx], g = data[idx + 1], b = data[idx + 2];
  const brightness = (r + g + b) / 3;
  return brightness > 180 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25;
}

// Leftmost bright (white plan-line) pixel in [xStart,xEnd) at row y — i.e.
// the real boundary between open field and the developed grid.
function leftmostEdge(data, width, channels, y, xStart, xEnd) {
  for (let x = xStart; x < xEnd; x++) {
    if (isBright(data, width, channels, x, y)) return x;
  }
  return null;
}

// Walks a boundary by sampling the real edge at each Y step, offsets inward
// by `inset` px (toward the development, away from open field), and drops a
// small lot rectangle at each point oriented along the local boundary
// direction.
function traceBand(data, width, channels, { yStart, yEnd, yStep, xSearchStart, xSearchEnd, inset, lotW, lotH, prefix }, lots) {
  const raw = [];
  for (let y = yStart; y <= yEnd; y += yStep) {
    const x = leftmostEdge(data, width, channels, y, xSearchStart, xSearchEnd);
    if (x !== null) raw.push([x + inset, y]);
  }
  // Drop stray hits (a bright patch of bare soil, a cloud) that jump far from
  // both neighbors — a real boundary moves gradually between rows.
  const edge = raw.filter((p, i) => {
    const prev = raw[i - 1], next = raw[i + 1];
    if (!prev || !next) return true;
    const avgNeighborX = (prev[0] + next[0]) / 2;
    return Math.abs(p[0] - avgNeighborX) < 45;
  });
  let n = 0;
  for (let i = 0; i < edge.length; i++) {
    const prev = edge[Math.max(0, i - 1)];
    const next = edge[Math.min(edge.length - 1, i + 1)];
    const angle = Math.atan2(next[1] - prev[1], next[0] - prev[0]);
    const [cx, cy] = edge[i];
    const hw = lotW / 2, hh = lotH / 2;
    const corners = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([dx, dy]) => [
      cx + dx * Math.cos(angle) - dy * Math.sin(angle),
      cy + dx * Math.sin(angle) + dy * Math.cos(angle),
    ]);
    n++;
    lots.push({ points: corners, codigo: `${prefix}-${String(n).padStart(2, "0")}`, area: 300 + ((n * 11) % 35) });
  }
}

const ESTADOS = ["disponible", "disponible", "disponible", "disponible", "reservado", "vendido"];

async function main() {
  const { data, info } = await sharp(SOURCE).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const lots = [];
  // Band 1: the upper wedge's real left boundary.
  traceBand(data, width, channels, {
    yStart: 250, yEnd: 555, yStep: 22, xSearchStart: 650, xSearchEnd: 1100,
    inset: 70, lotW: 34, lotH: 26, prefix: "MZ-1",
  }, lots);
  // Band 2: the lower-left grid's real left boundary.
  traceBand(data, width, channels, {
    yStart: 1335, yEnd: 1605, yStep: 20, xSearchStart: 250, xSearchEnd: 700,
    inset: 70, lotW: 34, lotH: 26, prefix: "MZ-2",
  }, lots);

  const dir = path.join(process.cwd(), "public", "uploads", "planos");
  fs.mkdirSync(dir, { recursive: true });
  const filename = "demo-masterplan.jpg";
  const filepath = path.join(dir, filename);
  await sharp(SOURCE).jpeg({ quality: 92 }).toFile(filepath);
  const planoUrl = `/uploads/planos/${filename}`;
  console.log("Foto real copiada:", planoUrl, `(${width}x${height})`, `${lots.length} lotes trazados`);

  const prisma = new PrismaClient();
  await prisma.project.update({ where: { id: PROJECT_ID }, data: { planoUrl } });
  await prisma.projectLot.deleteMany({ where: { projectId: PROJECT_ID } });
  const PRECIO_POR_M2 = 180000;
  const rows = lots.map((lot, i) => ({
    projectId: PROJECT_ID,
    codigo: lot.codigo,
    geometry: JSON.stringify(lot.points.map(([x, y]) => [
      Number(((x / width) * 100).toFixed(3)),
      Number(((y / height) * 100).toFixed(3)),
    ])),
    area: lot.area,
    precio: Math.round((lot.area * PRECIO_POR_M2) / 100000) * 100000,
    estado: ESTADOS[i % ESTADOS.length],
  }));
  const result = await prisma.projectLot.createMany({ data: rows });
  console.log("Lotes insertados:", result.count);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
