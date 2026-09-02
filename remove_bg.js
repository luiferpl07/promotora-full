const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function removeWhiteAndSave(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Pure white removal with smooth edge falloff
    if (r > 200 && g > 200 && b > 200) {
      const brightness = (r + g + b) / 3;
      // 200=fully opaque, 255=fully transparent
      const alpha = Math.round(255 * (1 - (brightness - 200) / 55));
      data[i + 3] = Math.max(0, Math.min(255, alpha));
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log('Done:', outputPath);
}

const src = path.join(__dirname, 'C:/Users/godri/.gemini/antigravity-ide/brain/7eb20843-3c3e-427b-a860-0c1d02cc02e6/palm_left_clean_1788358426456.jpg');
const dest = path.join(__dirname, 'public/assets/palms/palm_top_left.png');

removeWhiteAndSave(src, dest).catch(console.error);
