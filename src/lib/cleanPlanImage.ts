import sharp from "sharp";
import { PLAN_SHEET_CLUTTER } from "./planSheetRegions";

/**
 * Erases known "sheet furniture" (title block, area table, compass rose,
 * road-profile diagrams, locator inset) from a CAD plan export, making
 * those regions transparent so the real satellite photo shows through
 * instead of a scanned page border when the plan is overlaid on a map.
 */
export async function cleanPlanImage(inputPath: string, outputPath: string): Promise<void> {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const inClutter = (xp: number, yp: number) =>
    PLAN_SHEET_CLUTTER.some(e => xp >= e.x0 && xp <= e.x1 && yp >= e.y0 && yp <= e.y1);

  // also strip the printed page border near the very edge of the sheet
  const BORDER_PX = Math.round(Math.min(width, height) * 0.018);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nearBorder = x < BORDER_PX || y < BORDER_PX || x > width - BORDER_PX || y > height - BORDER_PX;
      if (nearBorder || inClutter(x / width, y / height)) {
        data[(y * width + x) * channels + 3] = 0;
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outputPath);
}
