// Scans a horizontal strip of the source photo at a given Y and reports the
// X positions of bright (white plan-line) pixels, to locate real boundaries
// precisely instead of guessing coordinates by eye.
const sharp = require("sharp");

const [,, ySt, xStartSt, xEndSt] = process.argv;
const y = Number(ySt), xStart = Number(xStartSt), xEnd = Number(xEndSt);

async function main() {
  const img = sharp("C:/Users/godri/Downloads/lagos-del-palmar-satelital-grid.webp");
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, channels } = info;
  const bright = [];
  for (let x = xStart; x < xEnd; x++) {
    const idx = (y * width + x) * channels;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const brightness = (r + g + b) / 3;
    if (brightness > 180 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) {
      bright.push(x);
    }
  }
  console.log(`y=${y}: bright x positions in [${xStart},${xEnd}]:`, bright.join(","));
}

main().catch(e => { console.error(e); process.exit(1); });
