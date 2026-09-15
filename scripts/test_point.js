const sharp = require("sharp");

const [,, leftS, topS, wS, hS, outName, ...pts] = process.argv;
const left = Number(leftS), top = Number(topS), w = Number(wS), h = Number(hS);

let grid = "";
for (let x = 0; x <= w; x += 50) {
  grid += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="yellow" stroke-width="1" opacity="0.5"/><text x="${x + 2}" y="12" fill="yellow" font-size="12">${left + x}</text>`;
}
for (let y = 0; y <= h; y += 50) {
  grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="yellow" stroke-width="1" opacity="0.5"/><text x="2" y="${y + 12}" fill="yellow" font-size="12">${top + y}</text>`;
}
for (let i = 0; i < pts.length; i += 2) {
  const px = Number(pts[i]) - left, py = Number(pts[i + 1]) - top;
  grid += `<circle cx="${px}" cy="${py}" r="8" fill="magenta" stroke="white" stroke-width="2"/>`;
}
const overlay = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${grid}</svg>`);

sharp("C:/Users/godri/Downloads/lagos-del-palmar-satelital-grid.webp")
  .extract({ left, top, width: w, height: h })
  .composite([{ input: overlay }])
  .toFile(`scripts/crops/${outName}`)
  .then(() => console.log("done"));
