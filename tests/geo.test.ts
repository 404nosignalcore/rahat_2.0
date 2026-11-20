import { LatLng } from '../src/types/safety';
import {
  haversineDistanceMeters,
  initialBearingRadians,
  normalizeLongitude,
  pointToPolylineMinDistanceMeters,
  pointToSegmentDistanceMeters,
} from '../src/utils/geo';

describe('Phase 2 — Geo Calculations & Spherical Cross-Track Projection', () => {
  // Known Delhi landmarks
  const rajivChowkGate3: LatLng = { latitude: 28.6328, longitude: 77.2197 };
  const mandiHouseMetro: LatLng = { latitude: 28.6258, longitude: 77.2345 };
  const indiaGate: LatLng = { latitude: 28.6129, longitude: 77.2295 };
  const rashtrapatiBhavan: LatLng = { latitude: 28.6143, longitude: 77.1995 };

  describe('Haversine Distance', () => {
    it('calculates distance between known Delhi landmarks accurately', () => {
      // Rajiv Chowk Gate 3 to Mandi House Metro is approx 1.64 km
      const d1 = haversineDistanceMeters(rajivChowkGate3, mandiHouseMetro);
      expect(d1).toBeGreaterThan(1500);
      expect(d1).toBeLessThan(1800);

      // India Gate to Rashtrapati Bhavan along Central Vista is approx 2.93 km
      const d2 = haversineDistanceMeters(indiaGate, rashtrapatiBhavan);
      expect(d2).toBeGreaterThan(2800);
      expect(d2).toBeLessThan(3100);
    });

    it('returns zero for identical coordinates', () => {
      expect(haversineDistanceMeters(indiaGate, indiaGate)).toBe(0);
    });

    it('handles antimeridian crossing safely with normalized longitude', () => {
      const p1: LatLng = { latitude: 0, longitude: 179.9 };
      const p2: LatLng = { latitude: 0, longitude: -179.9 };

      // Longitude difference across antimeridian is 0.2 degrees (~22.2 km at equator)
      const dist = haversineDistanceMeters(p1, p2);
      expect(dist).toBeGreaterThan(20000);
      expect(dist).toBeLessThan(25000);
    });
  });

  describe('Longitude Normalization & Bearings', () => {
    it('normalizes degrees to [-180, 180]', () => {
      expect(normalizeLongitude(180)).toBe(180);
      expect(normalizeLongitude(185)).toBe(-175);
      expect(normalizeLongitude(-185)).toBe(175);
      expect(normalizeLongitude(540)).toBe(180);
    });

    it('computes initial bearing accurately', () => {
      const pNorth1: LatLng = { latitude: 0, longitude: 0 };
      const pNorth2: LatLng = { latitude: 10, longitude: 0 };
      expect(initialBearingRadians(pNorth1, pNorth2)).toBeCloseTo(0, 4); // Due north = 0 rad

      const pEast: LatLng = { latitude: 0, longitude: 10 };
      expect(initialBearingRadians(pNorth1, pEast)).toBeCloseTo(Math.PI / 2, 4); // Due east = pi/2 rad
    });
  });

  describe('Point to Segment Cross-Track with Endpoint Clamping', () => {
    // Equator segment from 0,0 to 0,10 (length approx 1111 km)
    const segStart: LatLng = { latitude: 0, longitude: 0 };
    const segEnd: LatLng = { latitude: 0, longitude: 10 };

    it('calculates cross-track distance for point perpendicular to segment interior', () => {
      // Point at (1, 5) is 1 degree north of midpoint (5, 0)
      const queryPoint: LatLng = { latitude: 1, longitude: 5 };
      const dist = pointToSegmentDistanceMeters(queryPoint, segStart, segEnd);

      // 1 degree latitude at equator is approx 111,195 m
      expect(dist).toBeGreaterThan(111000);
      expect(dist).toBeLessThan(112000);
    });

    it('clamps to start endpoint when projection falls before segment start', () => {
      // Point at (1, -5) is behind segStart (0, 0)
      const queryPoint: LatLng = { latitude: 1, longitude: -5 };
      const dist = pointToSegmentDistanceMeters(queryPoint, segStart, segEnd);

      // Must equal direct distance to segStart, NOT infinite great-circle cross track
      const expectedDist = haversineDistanceMeters(queryPoint, segStart);
      expect(dist).toBeCloseTo(expectedDist, 1);
    });

    it('clamps to end endpoint when projection falls beyond segment end', () => {
      // Point at (1, 15) is past segEnd (0, 10)
      const queryPoint: LatLng = { latitude: 1, longitude: 15 };
      const dist = pointToSegmentDistanceMeters(queryPoint, segStart, segEnd);

      // Must equal direct distance to segEnd
      const expectedDist = haversineDistanceMeters(queryPoint, segEnd);
      expect(dist).toBeCloseTo(expectedDist, 1);
    });

    it('handles zero-length segment safely (segStart === segEnd)', () => {
      const queryPoint: LatLng = { latitude: 28.6300, longitude: 77.2200 };
      const dist = pointToSegmentDistanceMeters(queryPoint, rajivChowkGate3, rajivChowkGate3);
      const expected = haversineDistanceMeters(queryPoint, rajivChowkGate3);
      expect(dist).toBe(expected);
    });
  });

  describe('Point to Polyline Min Distance', () => {
    const polyline: LatLng[] = [
      { latitude: 28.6328, longitude: 77.2197 }, // CP
      { latitude: 28.6301, longitude: 77.2252 }, // Barakhamba
      { latitude: 28.6258, longitude: 77.2345 }, // Mandi House
    ];

    it('returns 0 or minimal distance when point lies directly on polyline vertex', () => {
      const dist = pointToPolylineMinDistanceMeters(polyline[1] as LatLng, polyline);
      expect(dist).toBeCloseTo(0, 3);
    });

    it('returns distance to nearest segment in polyline', () => {
      // Point slightly displaced from Barakhamba crossing (approx 50m north)
      const displaced: LatLng = { latitude: 28.6305, longitude: 77.2252 };
      const dist = pointToPolylineMinDistanceMeters(displaced, polyline);
      expect(dist).toBeGreaterThan(30);
      expect(dist).toBeLessThan(70);
    });

    it('handles single-point polyline safely', () => {
      const single: LatLng[] = [rajivChowkGate3];
      const p: LatLng = { latitude: 28.6338, longitude: 77.2197 };
      const dist = pointToPolylineMinDistanceMeters(p, single);
      expect(dist).toBeCloseTo(haversineDistanceMeters(p, rajivChowkGate3), 2);
    });

    it('returns Infinity for empty polyline', () => {
      expect(pointToPolylineMinDistanceMeters(rajivChowkGate3, [])).toBe(Infinity);
    });
  });
});
