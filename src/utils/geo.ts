import { LatLng } from '../types/safety';

export const EARTH_RADIUS_METERS = 6371000;

export interface GeoFix extends LatLng {
  accuracy?: number;
}

/**
 * Converts degrees to radians.
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Normalizes an angle in degrees to [-180, 180].
 * Handles antimeridian crossing safely.
 */
export function normalizeLongitude(lon: number): number {
  let normalized = ((((lon + 180) % 360) + 360) % 360) - 180;
  if (normalized === -180 && lon > 0) {
    normalized = 180;
  }
  return normalized;
}

/**
 * Great-circle distance between two coordinates using the Haversine formula.
 * Antimeridian-safe.
 *
 * @param p1 Point 1
 * @param p2 Point 2
 * @param radius Earth radius in meters (default 6,371,000m)
 * @returns Distance in meters
 */
export function haversineDistanceMeters(
  p1: LatLng,
  p2: LatLng,
  radius: number = EARTH_RADIUS_METERS
): number {
  const lat1 = toRadians(p1.latitude);
  const lat2 = toRadians(p2.latitude);

  // Normalize longitude delta to handle antimeridian crossing
  const dLonDegrees = normalizeLongitude(p2.longitude - p1.longitude);
  const dLat = toRadians(p2.latitude - p1.latitude);
  const dLon = toRadians(dLonDegrees);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

/**
 * Initial bearing from start point to destination point in radians [0, 2pi).
 *
 * @param start Start coordinate
 * @param dest Destination coordinate
 * @returns Initial bearing in radians
 */
export function initialBearingRadians(start: LatLng, dest: LatLng): number {
  const lat1 = toRadians(start.latitude);
  const lat2 = toRadians(dest.latitude);
  const dLon = toRadians(normalizeLongitude(dest.longitude - start.longitude));

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = Math.atan2(y, x);
  return (bearing + 2 * Math.PI) % (2 * Math.PI);
}

/**
 * Calculates the spherical cross-track distance from a point to a great-circle segment [start -> end],
 * clamped strictly to segment endpoints using spherical along-track distance.
 *
 * Cross-track on an infinite great circle is inaccurate beyond the segment's ends.
 * If the projection falls before `start` or past `end`, the nearest distance is to the respective endpoint.
 *
 * @param point The query coordinate
 * @param segStart The segment start coordinate
 * @param segEnd The segment end coordinate
 * @param radius Earth radius in meters
 * @returns Minimum distance from point to segment in meters
 */
export function pointToSegmentDistanceMeters(
  point: LatLng,
  segStart: LatLng,
  segEnd: LatLng,
  radius: number = EARTH_RADIUS_METERS
): number {
  // 1. Handle zero-length segment
  const segLengthMeters = haversineDistanceMeters(segStart, segEnd, radius);
  if (segLengthMeters === 0) {
    return haversineDistanceMeters(point, segStart, radius);
  }

  const d12 = segLengthMeters / radius; // Angular length of segment in radians
  const d13Meters = haversineDistanceMeters(segStart, point, radius);
  const d13 = d13Meters / radius; // Angular distance from start to query point

  if (d13 === 0) {
    return 0;
  }

  // Initial bearings
  const theta12 = initialBearingRadians(segStart, segEnd);
  const theta13 = initialBearingRadians(segStart, point);

  // Angular difference between bearings
  const angleDiff = theta13 - theta12;

  // Along-track distance from segStart in radians
  // tan(d_at) = tan(d13) * cos(theta13 - theta12) -> atan2 formulation
  const alongTrackRadians = Math.atan2(
    Math.sin(d13) * Math.cos(angleDiff),
    Math.cos(d13)
  );

  // If projection falls before segStart, clamp to segStart
  if (alongTrackRadians < 0) {
    return d13Meters;
  }

  // If projection falls beyond segEnd, clamp to segEnd
  if (alongTrackRadians > d12) {
    return haversineDistanceMeters(point, segEnd, radius);
  }

  // Projection falls within the segment: calculate spherical cross-track distance
  // sin(d_xt) = sin(d13) * sin(theta13 - theta12)
  const sinCrossTrack = Math.sin(d13) * Math.sin(angleDiff);
  const clampedSin = Math.max(-1, Math.min(1, sinCrossTrack));
  const crossTrackRadians = Math.abs(Math.asin(clampedSin));

  return crossTrackRadians * radius;
}

/**
 * Calculates minimum distance in meters from a point to a polyline.
 * Handles single-point polylines, empty polylines, and zero-length segments safely.
 *
 * @param point Query coordinate
 * @param polyline Array of path coordinates
 * @param radius Earth radius in meters
 * @returns Minimum distance in meters
 */
export function pointToPolylineMinDistanceMeters(
  point: LatLng,
  polyline: LatLng[],
  radius: number = EARTH_RADIUS_METERS
): number {
  if (!polyline || polyline.length === 0) {
    return Infinity;
  }

  if (polyline.length === 1) {
    const singlePoint = polyline[0];
    if (!singlePoint) return Infinity;
    return haversineDistanceMeters(point, singlePoint, radius);
  }

  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const segStart = polyline[i];
    const segEnd = polyline[i + 1];
    if (!segStart || !segEnd) continue;

    const dist = pointToSegmentDistanceMeters(point, segStart, segEnd, radius);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
}
