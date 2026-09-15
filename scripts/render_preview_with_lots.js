// Composites the demo masterplan image with its lot-status overlay, exactly
// as ProjectShowroom renders it in the browser, to produce a static preview.
const sharp = require("sharp");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const PROJECT_ID = "cmtkfm6be000fyl7qmg36bevo"; // Lagos del Palmar
const COLORS = { disponible: "#22c55e", reservado: "#f59e0b", vendido: "#ef4444" };

async function main() {
  const prisma = new PrismaClient();
  const project = await prisma.project.findUnique({ where: { id: PROJECT_ID } });
  const lots = await prisma.projectLot.findMany({ where: { projectId: PROJECT_ID } });
  await prisma.$disconnect();

  const imgPath = path.join(process.cwd(), "public", project.planoUrl.replace(/^\//, ""));
  const meta = await sharp(imgPath).metadata();
  const W = meta.width, H = meta.height;

  const dotR = Math.max(W, H) * 0.0037;
  const polys = lots.map(lot => {
    const pts = JSON.parse(lot.geometry);
    const color = COLORS[lot.estado] || COLORS.disponible;
    const px = pts.map(([x, y]) => [(x / 100) * W, (y / 100) * H]);
    const cx = px.reduce((s, p) => s + p[0], 0) / px.length;
    const cy = px.reduce((s, p) => s + p[1], 0) / px.length;
    return `<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="${color}" stroke="white" stroke-width="${dotR * 0.25}"/>`;
  }).join("");

  const overlay = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${polys}</svg>`;
  const overlayBuf = await sharp(Buffer.from(overlay)).png().toBuffer();

  const outPath = path.join(process.cwd(), "scripts", "preview_with_lots.jpg");
  await sharp(imgPath).composite([{ input: overlayBuf, top: 0, left: 0 }]).jpeg({ quality: 92 }).toFile(outPath);
  console.log("Guardado:", outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
