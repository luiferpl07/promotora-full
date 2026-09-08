// Known non-plan regions in a typical CAD sheet export (title block, area
// table, compass rose, road-profile diagrams, locator inset), as fractions
// of the image. Used both to keep the lot detector from picking them up and
// to blank them out of the image actually shown to visitors/admins, so the
// overlay reads as a clean site plan instead of a whole scanned sheet.
export const PLAN_SHEET_EXCLUSIONS = [
  { x0: 0.27, y0: 0.085, x1: 0.40, y1: 0.15 },   // clubhouse/pool detail — kept for detection only
  { x0: 0.36, y0: 0.27, x1: 0.46, y1: 0.33 },    // small internal park detail — kept for detection only
  { x0: 0.68, y0: 0, x1: 1, y1: 0.37 },          // "LOCALIZACIÓN" inset + "CUADRO DE ÁREAS" table
  { x0: 0, y0: 0.38, x1: 0.17, y1: 0.49 },       // compass rose
  { x0: 0.28, y0: 0.86, x1: 1, y1: 1 },          // "PERFILES VIALES" diagram strip
  { x0: 0.85, y0: 0, x1: 1, y1: 0.86 },          // title block column
];

// Subset that should actually be erased from the displayed image — the two
// "kept for detection only" entries above sit inside real plan content
// (they're just dense clusters, not sheet furniture) so leave them visible.
export const PLAN_SHEET_CLUTTER = PLAN_SHEET_EXCLUSIONS.filter(
  (_, i) => i !== 0 && i !== 1
);
