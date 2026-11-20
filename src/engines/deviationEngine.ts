import { LatLng } from '../types/safety';
import { GeoFix, pointToPolylineMinDistanceMeters } from '../utils/geo';

export interface DeviationConfig {
  deviationBufferMeters: number; // Default 90m
  consecutiveFixesThreshold: number; // Default 3 consecutive fixes
  maxAllowedAccuracyMeters: number; // Default 75m (ignore fixes with accuracy > 75m)
  cooldownDurationSeconds: number; // Default 120s
}

export const DEFAULT_DEVIATION_CONFIG: DeviationConfig = {
  deviationBufferMeters: 90,
  consecutiveFixesThreshold: 3,
  maxAllowedAccuracyMeters: 75,
  cooldownDurationSeconds: 120,
};

export type DeviationStateCategory = 'on_route' | 'deviated' | 'in_cooldown';

export interface DeviationEngineState {
  consecutiveDeviations: number;
  state: DeviationStateCategory;
  lastFixTimestamp: number | null;
  lastDeviationDistanceMeters: number | null;
  cooldownUntilTimestamp: number | null;
}

export const INITIAL_DEVIATION_STATE: DeviationEngineState = {
  consecutiveDeviations: 0,
  state: 'on_route',
  lastFixTimestamp: null,
  lastDeviationDistanceMeters: null,
  cooldownUntilTimestamp: null,
};

export interface DeviationEvaluationResult {
  alertTriggered: boolean;
  action: 'none' | 'prompt_safety_check';
  reason:
    | 'on_route'
    | 'inaccurate_fix_ignored'
    | 'deviation_pending'
    | 'deviation_threshold_reached'
    | 'cooldown_active';
  distanceMeters?: number;
  nextState: DeviationEngineState;
}

/**
 * Evaluates route deviation for an active journey.
 *
 * Strict safety rules:
 * 1. Deviation buffer is 90m.
 * 2. Requires 3 consecutive fixes outside the 90m buffer before triggering an alert.
 * 3. Inaccurate fixes (accuracy > 75m) MUST neither increment nor reset the consecutive counter.
 * 4. During cooldown, counter continues tracking so the alert can re-fire after cooldown if user remains off route.
 * 5. Returns nextState in EVERY branch.
 * 6. Never triggers an automatic SOS or call to police (action is strictly 'prompt_safety_check' or 'none').
 *
 * @param currentState Current engine state
 * @param fix Current GPS fix with accuracy
 * @param polyline Planned corridor polyline coordinates
 * @param config Injected configuration
 * @param now Current timestamp in ms
 * @returns Evaluation result with nextState and trigger status
 */
export function evaluateRouteDeviation(
  currentState: DeviationEngineState,
  fix: GeoFix,
  polyline: LatLng[],
  config: DeviationConfig = DEFAULT_DEVIATION_CONFIG,
  now: number = Date.now()
): DeviationEvaluationResult {
  // 1. Accuracy Check: Ignore fixes with accuracy worse than threshold
  if (
    fix.accuracy !== undefined &&
    fix.accuracy > config.maxAllowedAccuracyMeters
  ) {
    return {
      alertTriggered: false,
      action: 'none',
      reason: 'inaccurate_fix_ignored',
      distanceMeters: undefined,
      nextState: {
        ...currentState,
        lastFixTimestamp: now,
      },
    };
  }

  // 2. Calculate minimum spherical cross-track distance to polyline
  const distance = pointToPolylineMinDistanceMeters(fix, polyline);

  // 3. User is On Route (within 90m buffer)
  if (distance <= config.deviationBufferMeters) {
    return {
      alertTriggered: false,
      action: 'none',
      reason: 'on_route',
      distanceMeters: distance,
      nextState: {
        ...currentState,
        consecutiveDeviations: 0,
        state: 'on_route',
        cooldownUntilTimestamp: null,
        lastDeviationDistanceMeters: distance,
        lastFixTimestamp: now,
      },
    };
  }

  // 4. User is Outside Buffer (> 90m): Increment consecutive counter
  const newConsecutive = currentState.consecutiveDeviations + 1;

  // 5. Check if Cooldown is Active
  const isCooldownActive =
    currentState.cooldownUntilTimestamp !== null &&
    now < currentState.cooldownUntilTimestamp;

  if (isCooldownActive) {
    // During cooldown, still track counter so alert can re-fire once cooldown expires
    return {
      alertTriggered: false,
      action: 'none',
      reason: 'cooldown_active',
      distanceMeters: distance,
      nextState: {
        ...currentState,
        consecutiveDeviations: newConsecutive,
        state: 'in_cooldown',
        lastDeviationDistanceMeters: distance,
        lastFixTimestamp: now,
      },
    };
  }

  // 6. Cooldown is Not Active (or has expired)
  if (newConsecutive >= config.consecutiveFixesThreshold) {
    // 3 or more consecutive fixes outside buffer -> prompt user
    return {
      alertTriggered: true,
      action: 'prompt_safety_check',
      reason: 'deviation_threshold_reached',
      distanceMeters: distance,
      nextState: {
        ...currentState,
        consecutiveDeviations: newConsecutive,
        state: 'deviated',
        cooldownUntilTimestamp: null,
        lastDeviationDistanceMeters: distance,
        lastFixTimestamp: now,
      },
    };
  }

  // 7. Deviation Pending (1st or 2nd fix outside buffer)
  return {
    alertTriggered: false,
    action: 'none',
    reason: 'deviation_pending',
    distanceMeters: distance,
    nextState: {
      ...currentState,
      consecutiveDeviations: newConsecutive,
      state: 'on_route',
      lastDeviationDistanceMeters: distance,
      lastFixTimestamp: now,
    },
  };
}

/**
 * Puts the deviation engine into a user-initiated cooldown (e.g. "I'm Safe" tapped).
 * Retains the consecutive count so that if the user stays off route, the alert will re-fire
 * as soon as cooldown expires.
 */
export function applyUserSafeCooldown(
  currentState: DeviationEngineState,
  cooldownDurationSeconds: number = DEFAULT_DEVIATION_CONFIG.cooldownDurationSeconds,
  now: number = Date.now()
): DeviationEngineState {
  return {
    ...currentState,
    state: 'in_cooldown',
    cooldownUntilTimestamp: now + cooldownDurationSeconds * 1000,
  };
}
