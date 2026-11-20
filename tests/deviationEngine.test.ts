import {
  applyUserSafeCooldown,
  DEFAULT_DEVIATION_CONFIG,
  DeviationEngineState,
  evaluateRouteDeviation,
  INITIAL_DEVIATION_STATE,
} from '../src/engines/deviationEngine';
import { LatLng } from '../src/types/safety';
import { GeoFix } from '../src/utils/geo';

describe('Phase 2 — Route Deviation Engine & Safety State Machine', () => {
  // Simple corridor running due North along meridian 77.2197 (from lat 28.6200 to 28.6400)
  const corridorPolyline: LatLng[] = [
    { latitude: 28.6200, longitude: 77.2197 },
    { latitude: 28.6400, longitude: 77.2197 },
  ];

  // At lat 28.6300: 1 degree longitude is approx 97,600 meters.
  // Displacement of 0.0005 deg longitude is approx 48.8 meters (inside 90m buffer).
  // Displacement of 0.0012 deg longitude is approx 117 meters (outside 90m buffer).

  const onRouteFix: GeoFix = {
    latitude: 28.6300,
    longitude: 77.2197 + 0.0005, // ~48.8m from corridor
    accuracy: 10,
  };

  const offRouteFix: GeoFix = {
    latitude: 28.6300,
    longitude: 77.2197 + 0.0013, // ~127m from corridor (> 90m)
    accuracy: 12,
  };

  it('detects on-route fix within 90m buffer and does not trigger alert', () => {
    const res = evaluateRouteDeviation(INITIAL_DEVIATION_STATE, onRouteFix, corridorPolyline);

    expect(res.alertTriggered).toBe(false);
    expect(res.action).toBe('none');
    expect(res.reason).toBe('on_route');
    expect(res.distanceMeters).toBeLessThan(90);
    expect(res.nextState.consecutiveDeviations).toBe(0);
    expect(res.nextState.state).toBe('on_route');
  });

  it('triggers alert only after 3 consecutive fixes outside the 90m boundary', () => {
    let state = INITIAL_DEVIATION_STATE;
    const now = 1000000;

    // Fix 1: off-route -> consecutive = 1, no alert
    const res1 = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now);
    expect(res1.alertTriggered).toBe(false);
    expect(res1.action).toBe('none');
    expect(res1.reason).toBe('deviation_pending');
    expect(res1.nextState.consecutiveDeviations).toBe(1);
    expect(res1.nextState.state).toBe('on_route');
    state = res1.nextState;

    // Fix 2: off-route -> consecutive = 2, no alert
    const res2 = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 1000);
    expect(res2.alertTriggered).toBe(false);
    expect(res2.action).toBe('none');
    expect(res2.reason).toBe('deviation_pending');
    expect(res2.nextState.consecutiveDeviations).toBe(2);
    expect(res2.nextState.state).toBe('on_route');
    state = res2.nextState;

    // Fix 3: off-route -> consecutive = 3, ALERT TRIGGERED!
    const res3 = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 2000);
    expect(res3.alertTriggered).toBe(true);
    expect(res3.action).toBe('prompt_safety_check');
    expect(res3.reason).toBe('deviation_threshold_reached');
    expect(res3.nextState.consecutiveDeviations).toBe(3);
    expect(res3.nextState.state).toBe('deviated');
  });

  it('resets consecutive counter to 0 immediately when user returns to route', () => {
    let state = INITIAL_DEVIATION_STATE;
    const now = 1000000;

    // 2 consecutive off-route fixes
    state = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now).nextState;
    state = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 1000).nextState;
    expect(state.consecutiveDeviations).toBe(2);

    // 3rd fix returns within route (48m)
    const resReturn = evaluateRouteDeviation(state, onRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 2000);
    expect(resReturn.alertTriggered).toBe(false);
    expect(resReturn.reason).toBe('on_route');
    expect(resReturn.nextState.consecutiveDeviations).toBe(0);
    expect(resReturn.nextState.state).toBe('on_route');
  });

  it('ignores inaccurate fixes (accuracy > 75m) without incrementing or resetting counter', () => {
    let state = INITIAL_DEVIATION_STATE;
    const now = 1000000;

    // Fix 1: off-route -> consecutive = 1
    state = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now).nextState;
    expect(state.consecutiveDeviations).toBe(1);

    // Fix 2: off-route -> consecutive = 2
    state = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 1000).nextState;
    expect(state.consecutiveDeviations).toBe(2);

    // Inaccurate fix: accuracy = 90m (> 75m threshold)
    const inaccurateFix: GeoFix = {
      ...offRouteFix,
      accuracy: 90,
    };
    const resInaccurate = evaluateRouteDeviation(state, inaccurateFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 2000);
    expect(resInaccurate.alertTriggered).toBe(false);
    expect(resInaccurate.action).toBe('none');
    expect(resInaccurate.reason).toBe('inaccurate_fix_ignored');

    // CRITICAL: Counter must be neither incremented nor reset!
    expect(resInaccurate.nextState.consecutiveDeviations).toBe(2);
    state = resInaccurate.nextState;

    // Fix 4: Valid off-route fix -> now reaches 3 and fires alert!
    const resValidNext = evaluateRouteDeviation(state, offRouteFix, corridorPolyline, DEFAULT_DEVIATION_CONFIG, now + 3000);
    expect(resValidNext.alertTriggered).toBe(true);
    expect(resValidNext.nextState.consecutiveDeviations).toBe(3);
    expect(resValidNext.action).toBe('prompt_safety_check');
  });

  describe('Cooldown & Re-firing Behavior', () => {
    it('suppresses alerts during cooldown while maintaining consecutive tracking', () => {
      const now = 2000000;
      // Start in deviated state with 3 consecutive fixes
      const deviatedState: DeviationEngineState = {
        consecutiveDeviations: 3,
        state: 'deviated',
        lastFixTimestamp: now,
        lastDeviationDistanceMeters: 125,
        cooldownUntilTimestamp: null,
      };

      // User taps "I'm Safe (120s cooldown)"
      const cooldownState = applyUserSafeCooldown(deviatedState, 120, now);
      expect(cooldownState.state).toBe('in_cooldown');
      expect(cooldownState.cooldownUntilTimestamp).toBe(now + 120000);

      // Fix arrives 30 seconds later (still off route, cooldown active)
      const resDuringCooldown = evaluateRouteDeviation(
        cooldownState,
        offRouteFix,
        corridorPolyline,
        DEFAULT_DEVIATION_CONFIG,
        now + 30000
      );

      expect(resDuringCooldown.alertTriggered).toBe(false);
      expect(resDuringCooldown.action).toBe('none');
      expect(resDuringCooldown.reason).toBe('cooldown_active');
      // Tracks counter during cooldown
      expect(resDuringCooldown.nextState.consecutiveDeviations).toBe(4);
      expect(resDuringCooldown.nextState.state).toBe('in_cooldown');
    });

    it('re-fires alert after cooldown expires if user remains off route', () => {
      const now = 3000000;
      const cooldownState: DeviationEngineState = {
        consecutiveDeviations: 4,
        state: 'in_cooldown',
        lastFixTimestamp: now + 60000,
        lastDeviationDistanceMeters: 130,
        cooldownUntilTimestamp: now + 120000,
      };

      // Fix arrives at now + 125,000 (cooldown expired at 120,000, user STILL off route)
      const resAfterCooldown = evaluateRouteDeviation(
        cooldownState,
        offRouteFix,
        corridorPolyline,
        DEFAULT_DEVIATION_CONFIG,
        now + 125000
      );

      // Alert must re-fire immediately!
      expect(resAfterCooldown.alertTriggered).toBe(true);
      expect(resAfterCooldown.action).toBe('prompt_safety_check');
      expect(resAfterCooldown.reason).toBe('deviation_threshold_reached');
      expect(resAfterCooldown.nextState.consecutiveDeviations).toBe(5);
      expect(resAfterCooldown.nextState.state).toBe('deviated');
    });
  });

  describe('Non-Negotiable Safety Invariant: Never Auto-SOS', () => {
    it('guarantees action is NEVER an automated SOS or police call across all states', () => {
      const allPossibleStates: DeviationEngineState[] = [
        INITIAL_DEVIATION_STATE,
        { ...INITIAL_DEVIATION_STATE, consecutiveDeviations: 10, state: 'deviated' },
        { ...INITIAL_DEVIATION_STATE, consecutiveDeviations: 100, state: 'deviated' },
      ];

      for (const st of allPossibleStates) {
        const res = evaluateRouteDeviation(st, offRouteFix, corridorPolyline);
        // Action must strictly be 'none' or 'prompt_safety_check'
        expect(['none', 'prompt_safety_check']).toContain(res.action);
        expect((res.action as string)).not.toBe('sos');
        expect((res.action as string)).not.toBe('call_112');
        expect((res.action as string)).not.toBe('call_police');
      }
    });
  });
});
