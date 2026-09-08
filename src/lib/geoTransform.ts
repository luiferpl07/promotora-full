// Shared math for placing a flat plan image onto real-world lat/lng,
// given a calibration (center, rotation, real-world width in meters).

export interface MapConfig {
  lat: number;
  lng: number;
  rotationDeg: number;
  widthMeters: number;
}

const METERS_PER_DEG_LAT = 111320;
export const metersPerDegLng = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);

export function metersToLatLng(center: { lat: number; lng: number }, eastM: number, northM: number) {
  return {
    lat: center.lat + northM / METERS_PER_DEG_LAT,
    lng: center.lng + eastM / metersPerDegLng(center.lat),
  };
}

export function latLngToMeters(center: { lat: number; lng: number }, p: { lat: number; lng: number }) {
  return {
    eastM: (p.lng - center.lng) * metersPerDegLng(center.lat),
    northM: (p.lat - center.lat) * METERS_PER_DEG_LAT,
  };
}

export function rotateCW(x: number, y: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: x * Math.cos(t) + y * Math.sin(t), y: -x * Math.sin(t) + y * Math.cos(t) };
}

/**
 * Converts a point given as a fraction (0-1) of the plan image's width/height
 * into a real-world lat/lng, using the same transform the image overlay itself
 * uses to sit on the map (center + rotation + real width, height from aspect ratio).
 */
export function imageFractionToLatLng(
  fx: number,
  fy: number,
  aspectRatio: number,
  config: MapConfig
): { lat: number; lng: number } {
  const heightMeters = config.widthMeters * aspectRatio;
  // fx,fy in [0,1] -> local meters, centered at image center, y-up (north positive)
  const localX = (fx - 0.5) * config.widthMeters;
  const localY = (0.5 - fy) * heightMeters;
  const rotated = rotateCW(localX, localY, config.rotationDeg);
  return metersToLatLng({ lat: config.lat, lng: config.lng }, rotated.x, rotated.y);
}
