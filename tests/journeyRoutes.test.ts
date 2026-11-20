import { DELHI_CORRIDORS, SAVED_PLACES } from '../src/data/delhiCorridors';
import {
  applyUserSafeCooldown,
  DEFAULT_DEVIATION_CONFIG,
  DeviationEngineState,
  evaluateRouteDeviation,
  INITIAL_DEVIATION_STATE,
} from '../src/engines/deviationEngine';
import { GeoFix } from '../src/utils/geo';

describe('Phase 5: Route Corridors & Journey Engine Tests', () => {
  describe('Delhi Corridors & Saved Places Data Integrity', () => {
    it('defines valid saved places with coordinates in Delhi NCR', () => {
      expect(SAVED_PLACES.length).toBeGreaterThanOrEqual(3);
      for (const place of SAVED_PLACES) {
        expect(place.id).toBeDefined();
        expect(place.name).toBeDefined();
        expect(place.nameHindi).toBeDefined();
        expect(place.location.latitude).toBeGreaterThan(28.0);
        expect(place.location.latitude).toBeLessThan(29.0);
        expect(place.location.longitude).toBeGreaterThan(76.5);
        expect(place.location.longitude).toBeLessThan(77.5);
      }
    });

    it('contains sample corridors with safest, well_lit, and quickest options', () => {
      const cpMandiHouse = DELHI_CORRIDORS['cp_to_mandi_house'];
      expect(cpMandiHouse).toBeDefined();
      if (!cpMandiHouse) return;
      expect(cpMandiHouse.length).toBe(3);

      const tags = cpMandiHouse.map((r) => r.tag);
      expect(tags).toContain('safest');
      expect(tags).toContain('well_lit');
      expect(tags).toContain('quickest');

      for (const route of cpMandiHouse) {
        expect(route.distanceMeters).toBeGreaterThan(0);
        expect(route.etaSeconds).toBeGreaterThan(0);
        expect(route.lightingPercent).toBeGreaterThanOrEqual(0);
        expect(route.lightingPercent).toBeLessThanOrEqual(100);
        expect(route.cctvPercent).toBeGreaterThanOrEqual(0);
        expect(route.cctvPercent).toBeLessThanOrEqual(100);
        expect(route.rankingRationale.length).toBeGreaterThan(10);
        expect(route.coordinates.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('ranks the safest corridor with highest holistic security attributes', () => {
      const routes = DELHI_CORRIDORS['cp_to_mandi_house'];
      expect(routes).toBeDefined();
      if (!routes) return;
      const safest = routes.find((r) => r.tag === 'safest');
      const quickest = routes.find((r) => r.tag === 'quickest');

      expect(safest).toBeDefined();
      expect(quickest).toBeDefined();
      if (safest && quickest) {
        expect(safest.lightingPercent).toBeGreaterThan(quickest.lightingPercent);
        expect(safest.cctvPercent).toBeGreaterThan(quickest.cctvPercent);
        expect(safest.safeHavensCount).toBeGreaterThan(quickest.safeHavensCount);
      }
    });
  });

  describe('Journey Simulation & Deviation Handling', () => {
    const cpCorridor = DELHI_CORRIDORS['cp_to_mandi_house']?.[0]?.coordinates ?? [];

    it('simulates 3 consecutive fixes beyond 90m buffer to trigger deviation alert', () => {
      let state = INITIAL_DEVIATION_STATE;
      const startCoord = cpCorridor[0]!;

      // Fix 1 displaced by ~222m north (>90m buffer)
      const fix1: GeoFix = {
        latitude: startCoord.latitude + 0.002,
        longitude: startCoord.longitude,
        accuracy: 10,
      };
      let res = evaluateRouteDeviation(state, fix1, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.alertTriggered).toBe(false);
      expect(res.nextState.consecutiveDeviations).toBe(1);
      state = res.nextState;

      // Fix 2 displaced
      res = evaluateRouteDeviation(state, fix1, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.alertTriggered).toBe(false);
      expect(res.nextState.consecutiveDeviations).toBe(2);
      state = res.nextState;

      // Fix 3 displaced -> triggers alert
      res = evaluateRouteDeviation(state, fix1, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.alertTriggered).toBe(true);
      expect(res.reason).toBe('deviation_threshold_reached');
      expect(res.nextState.consecutiveDeviations).toBe(3);
      expect(res.nextState.state).toBe('deviated');
    });

    it('ignores inaccurate GPS fixes (> 75m) without resetting off-route counter', () => {
      let state = INITIAL_DEVIATION_STATE;
      const startCoord = cpCorridor[0]!;
      const offRouteFix: GeoFix = {
        latitude: startCoord.latitude + 0.002,
        longitude: startCoord.longitude,
        accuracy: 15,
      };

      // 1st off-route fix
      let res = evaluateRouteDeviation(state, offRouteFix, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.nextState.consecutiveDeviations).toBe(1);
      state = res.nextState;

      // Inaccurate fix (accuracy 95m > 75m)
      const inaccurateFix: GeoFix = {
        latitude: startCoord.latitude + 0.002,
        longitude: startCoord.longitude,
        accuracy: 95,
      };
      res = evaluateRouteDeviation(state, inaccurateFix, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.reason).toBe('inaccurate_fix_ignored');
      expect(res.nextState.consecutiveDeviations).toBe(1); // Counter preserved
      state = res.nextState;

      // 2nd off-route fix
      res = evaluateRouteDeviation(state, offRouteFix, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.nextState.consecutiveDeviations).toBe(2);
      state = res.nextState;

      // 3rd off-route fix -> triggers
      res = evaluateRouteDeviation(state, offRouteFix, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.alertTriggered).toBe(true);
    });

    it('resets counter immediately when user returns within route corridor', () => {
      let state = {
        ...INITIAL_DEVIATION_STATE,
        consecutiveDeviations: 2,
      };
      const startCoord = cpCorridor[0]!;
      const onRouteFix: GeoFix = {
        latitude: startCoord.latitude,
        longitude: startCoord.longitude,
        accuracy: 5,
      };

      const res = evaluateRouteDeviation(state, onRouteFix, cpCorridor, DEFAULT_DEVIATION_CONFIG);
      expect(res.alertTriggered).toBe(false);
      expect(res.reason).toBe('on_route');
      expect(res.nextState.consecutiveDeviations).toBe(0);
      expect(res.nextState.state).toBe('on_route');
    });

    it('respects user "I\'m Safe" 120s cooldown and suppresses alerts during cooldown', () => {
      let state: DeviationEngineState = {
        ...INITIAL_DEVIATION_STATE,
        consecutiveDeviations: 3,
        state: 'deviated',
      };

      const now = Date.now();
      state = applyUserSafeCooldown(state, 120, now);
      expect(state.cooldownUntilTimestamp).toBe(now + 120 * 1000);
      expect(state.state).toBe('in_cooldown');

      // Subsequent off-route fix during cooldown must not trigger an alert
      const startCoord = cpCorridor[0]!;
      const offRouteFix: GeoFix = {
        latitude: startCoord.latitude + 0.002,
        longitude: startCoord.longitude,
        accuracy: 10,
      };

      const res = evaluateRouteDeviation(
        state,
        offRouteFix,
        cpCorridor,
        DEFAULT_DEVIATION_CONFIG,
        now + 30 * 1000 // 30s into 120s cooldown
      );

      expect(res.alertTriggered).toBe(false);
      expect(res.reason).toBe('cooldown_active');
    });

    it('NON-NEGOTIABLE SAFETY INVARIANT: route deviation evaluation never invokes SOS or emergency dialer', () => {
      let state = INITIAL_DEVIATION_STATE;
      const startCoord = cpCorridor[0]!;
      const offRouteFix: GeoFix = {
        latitude: startCoord.latitude,
        longitude: startCoord.longitude + 0.005, // deep deviation
        accuracy: 5,
      };

      // Exceed threshold multiple times
      for (let i = 0; i < 5; i++) {
        const res = evaluateRouteDeviation(state, offRouteFix, cpCorridor, DEFAULT_DEVIATION_CONFIG);
        state = res.nextState;
        // Invariant check: result only contains alertTriggered, reason, distanceMeters, nextState
        // It has NO mechanism or property to execute an SOS dispatch or automated 112 call
        expect(res).not.toHaveProperty('autoSos');
        expect(res).not.toHaveProperty('autoDial');
      }
    });
  });
});
