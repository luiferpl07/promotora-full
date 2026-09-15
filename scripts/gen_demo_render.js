const sharp = require("sharp");

const W = 1280, H = 1280;
const OLIVE = "#9CAA34";
const OLIVE_DARK = "#8A9A2C";
const ROAD = "#B9B7AE";
const ROAD_EDGE = "#DCDAD0";
const LOT_LINE = "#FFFFFF";

function lotGrid(x0, y0, cols, rows, cellW, cellH, gap) {
  let rects = "";
  let lines = "";
  const w = cols * cellW, h = rows * cellH;
  rects += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${OLIVE}"/>`;
  for (let c = 1; c < cols; c++) {
    const x = x0 + c * cellW;
    lines += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + h}" stroke="${LOT_LINE}" stroke-width="2" opacity="0.85"/>`;
  }
  for (let r = 1; r < rows; r++) {
    const y = y0 + r * cellH;
    lines += `<line x1="${x0}" y1="${y}" x2="${x0 + w}" y2="${y}" stroke="${LOT_LINE}" stroke-width="2" opacity="0.85"/>`;
  }
  return { block: `<g>${rects}${lines}</g>`, w, h };
}

function roadRect(x, y, w, h) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ROAD}" stroke="${ROAD_EDGE}" stroke-width="1"/>`;
}

const cellW = 46, cellH = 64, gap = 0;
const roadW = 34;

// Layout: two rectangular blocks side by side (like AVENIDA/BOULEVARD),
// separated by a road, plus a cul-de-sac loop block below (like PARQUE).
const originX = 260, originY = 260;

const blockA = lotGrid(originX, originY, 6, 5, cellW, cellH);
const blockB = lotGrid(originX + blockA.w + roadW, originY, 6, 5, cellW, cellH);

const mainRoadY = originY + blockA.h;
const mainRoad = roadRect(originX - roadW, mainRoadY, blockA.w + roadW + blockB.w + roadW, roadW);
const vRoad = roadRect(originX + blockA.w, originY - roadW, roadW, blockA.h + roadW * 2 + 260);

// cul-de-sac loop (approx) below block A, teardrop-ish via a rounded path
const loopCx = originX + blockA.w / 2 - 40, loopCy = mainRoadY + roadW + 230;
const loopRx = 150, loopRy = 200;

const culDeSac = `
  <g>
    <path d="M ${loopCx - loopRx},${loopCy - loopRy * 0.5}
             a ${loopRx},${loopRy} 0 1 0 ${loopRx * 2},0
             a ${loopRx},${loopRy} 0 1 0 -${loopRx * 2},0 Z"
          fill="${OLIVE_DARK}" stroke="${ROAD}" stroke-width="26"/>
  </g>`;

// small radial lot slices inside the loop ring (decorative, approximate)
let radialLots = "";
const nSlices = 14;
for (let i = 0; i < nSlices; i++) {
  const a0 = (i / nSlices) * Math.PI * 2;
  const a1 = ((i + 0.92) / nSlices) * Math.PI * 2;
  const rOuter = Math.min(loopRx, loopRy) * 0.78;
  const rInner = rOuter * 0.55;
  const p = (a, r) => [loopCx + r * Math.cos(a) * (loopRx / Math.min(loopRx, loopRy)), loopCy + r * Math.sin(a) * (loopRy / Math.min(loopRx, loopRy))];
  const [x0, y0] = p(a0, rOuter), [x1, y1] = p(a1, rOuter);
  const [x2, y2] = p(a1, rInner), [x3, y3] = p(a0, rInner);
  radialLots += `<path d="M ${x0},${y0} L ${x1},${y1} L ${x2},${y2} L ${x3},${y3} Z" fill="${OLIVE}" stroke="${LOT_LINE}" stroke-width="1.5"/>`;
}

const labelStyle = `font-family="Arial, sans-serif" font-weight="800" font-size="26"`;
function pill(x, y, text, color) {
  const w = text.length * 19 + 50;
  return `
    <g>
      <rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="22" fill="white" stroke="${color}" stroke-width="2" filter="url(#shadow)"/>
      <circle cx="${x - w / 2 + 24}" cy="${y}" r="7" fill="${color}"/>
      <text x="${x - w / 2 + 42}" y="${y + 8}" ${labelStyle} fill="${color}">${text}</text>
    </g>`;
}

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
    </filter>
  </defs>
  ${mainRoad}
  ${vRoad}
  ${blockA.block}
  ${blockB.block}
  ${culDeSac}
  ${radialLots}
  ${pill(originX + blockA.w / 2, originY - 40, "AVENIDA", "#C97B1E")}
  ${pill(originX + blockA.w + roadW + blockB.w / 2, originY - 40, "BOULEVARD", "#C0392B")}
  ${pill(loopCx, loopCy - loopRy - 40, "PARQUE", "#2E7D32")}
</svg>`;

(async () => {
  const overlay = await sharp(Buffer.from(svg)).png().toBuffer();
  await sharp("scripts/demo_satellite.jpg")
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 92 })
    .toFile("scripts/demo_render.jpg");
  console.log("done");
})();
