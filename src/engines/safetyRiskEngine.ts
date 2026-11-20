import { IncidentCategory, SafetyScoreLevel, VerificationBadge } from '../types/safety';

export interface ScoreIncidentInput {
  category: IncidentCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  verificationStatus: VerificationBadge;
}

export interface ZoneScoreInputs {
  lightingPercent: number; // 0 - 100
  cctvPercent: number; // 0 - 100
  footfallPercent?: number; // 0 - 100 (defaults to lightingPercent if omitted)
  hour: number; // 0 - 23 (24-hour format)
  incidents?: ScoreIncidentInput[];
  safeHavensCount?: number;
}

export interface SafetyScoreAdjustment {
  factor: 'base' | 'lighting' | 'cctv' | 'time_of_day' | 'incidents' | 'safe_havens';
  delta: number;
  description: string;
}

export interface SafetyRiskConfig {
  baseScore: number;
  minScore: number;
  maxScore: number;
  dangerThreshold: number;
  safeThreshold: number;
  timeModifiers: {
    dayBonus: number;
    eveningPenalty: number;
    nightBasePenalty: number;
    nightMaxPenalty: number;
    earlyMorningPenalty: number;
  };
  lightingBaseline: number;
  lightingScale: number;
  cctvThresholds: {
    highPercent: number;
    highBonus: number;
    mediumPercent: number;
    mediumBonus: number;
    lowPercent: number;
    lowPenalty: number;
  };
  incidentWeights: Record<VerificationBadge, number>;
  incidentPenaltyCap: number;
  incidentSeverityMultiplier: number;
  safeHavenBonusPerUnit: number;
  safeHavenBonusCap: number;
}

export const DEFAULT_SAFETY_RISK_CONFIG: SafetyRiskConfig = {
  baseScore: 70,
  minScore: 5,
  maxScore: 98,
  dangerThreshold: 45, // < 45 is danger; >= 45 is caution
  safeThreshold: 75, // >= 75 is safe; <= 74 is caution
  timeModifiers: {
    dayBonus: 5, // 08:00 - 18:00
    eveningPenalty: -12, // 18:00 - 23:00
    nightBasePenalty: -20, // 23:00 - 05:00 (optimal conditions)
    nightMaxPenalty: -32, // 23:00 - 05:00 (poor conditions)
    earlyMorningPenalty: -5, // 05:00 - 08:00
  },
  lightingBaseline: 70,
  lightingScale: 0.2,
  cctvThresholds: {
    highPercent: 75,
    highBonus: 5,
    mediumPercent: 50,
    mediumBonus: 2,
    lowPercent: 25,
    lowPenalty: -5,
  },
  incidentWeights: {
    unverified: 0.5,
    under_review: 0.5,
    community_corroborated: 1.0,
    authorized_verified: 1.5,
  },
  incidentPenaltyCap: 30,
  incidentSeverityMultiplier: 2.0,
  safeHavenBonusPerUnit: 2,
  safeHavenBonusCap: 6,
};

export interface SafetyRiskResult {
  score: number;
  level: SafetyScoreLevel;
  explanation: SafetyScoreAdjustment[];
}

/**
 * Calculates the dynamic zone safety risk score (5 to 98) based exclusively on
 * physical infrastructure, environmental visibility, time-of-day modifiers, and verified hazards.
 *
 * Strict architectural rule: Crime profiling, demographic, socioeconomic, religious, or caste data
 * are NEVER accepted or factored into this calculation.
 *
 * @param inputs Zone parameters (lighting, CCTV, time, incidents, safe havens)
 * @param config Optional injected configuration for tests or regional tuning
 * @returns Score, safety level, and itemized transparent explanation
 */
export function calculateDynamicZoneScore(
  inputs: ZoneScoreInputs,
  config: SafetyRiskConfig = DEFAULT_SAFETY_RISK_CONFIG
): SafetyRiskResult {
  const explanation: SafetyScoreAdjustment[] = [];

  // 1. Base Score
  let currentScore = config.baseScore;
  explanation.push({
    factor: 'base',
    delta: config.baseScore,
    description: `Baseline infrastructure calibration score (${config.baseScore})`,
  });

  // 2. Lighting Delta
  const clampedLighting = Math.max(0, Math.min(100, inputs.lightingPercent));
  const lightingDelta = Math.round(
    (clampedLighting - config.lightingBaseline) * config.lightingScale
  );
  currentScore += lightingDelta;
  explanation.push({
    factor: 'lighting',
    delta: lightingDelta,
    description: `Lighting ${clampedLighting}% vs baseline ${config.lightingBaseline}% (${lightingDelta >= 0 ? '+' : ''}${lightingDelta} pts)`,
  });

  // 3. CCTV Coverage
  const clampedCctv = Math.max(0, Math.min(100, inputs.cctvPercent));
  let cctvDelta = 0;
  if (clampedCctv >= config.cctvThresholds.highPercent) {
    cctvDelta = config.cctvThresholds.highBonus;
  } else if (clampedCctv >= config.cctvThresholds.mediumPercent) {
    cctvDelta = config.cctvThresholds.mediumBonus;
  } else if (clampedCctv < config.cctvThresholds.lowPercent) {
    cctvDelta = config.cctvThresholds.lowPenalty;
  }
  currentScore += cctvDelta;
  explanation.push({
    factor: 'cctv',
    delta: cctvDelta,
    description: `CCTV surveillance density ${clampedCctv}% (${cctvDelta >= 0 ? '+' : ''}${cctvDelta} pts)`,
  });

  // 4. Time-of-Day Modifier
  const hour = ((inputs.hour % 24) + 24) % 24;
  let timeDelta = 0;
  let timeDescription = '';

  if (hour >= 8 && hour < 18) {
    // Daytime: 08:00 - 18:00
    timeDelta = config.timeModifiers.dayBonus;
    timeDescription = `Daytime corridor activity (08:00–18:00) (+${timeDelta} pts)`;
  } else if (hour >= 18 && hour < 23) {
    // Evening: 18:00 - 23:00
    timeDelta = config.timeModifiers.eveningPenalty;
    timeDescription = `Evening transit period (18:00–23:00) (${timeDelta} pts)`;
  } else if (hour >= 5 && hour < 8) {
    // Early morning: 05:00 - 08:00
    timeDelta = config.timeModifiers.earlyMorningPenalty;
    timeDescription = `Early morning hours (05:00–08:00) (${timeDelta} pts)`;
  } else {
    // Night: 23:00 - 05:00 (Graded -20 to -32 based on lighting & footfall)
    const footfall = inputs.footfallPercent !== undefined
      ? Math.max(0, Math.min(100, inputs.footfallPercent))
      : clampedLighting;

    const safetyCondition = (clampedLighting * 0.5 + footfall * 0.5) / 100; // 0.0 to 1.0
    const penaltyRange =
      Math.abs(config.timeModifiers.nightMaxPenalty) -
      Math.abs(config.timeModifiers.nightBasePenalty); // 32 - 20 = 12

    // Graded: safetyCondition 1.0 -> -20; safetyCondition 0.0 -> -32
    timeDelta = Math.round(
      config.timeModifiers.nightBasePenalty - (1 - safetyCondition) * penaltyRange
    );
    timeDescription = `Late night (23:00–05:00) graded by visibility & footfall (${timeDelta} pts)`;
  }

  currentScore += timeDelta;
  explanation.push({
    factor: 'time_of_day',
    delta: timeDelta,
    description: timeDescription,
  });

  // 5. Safe Havens Proximity Bonus
  if (inputs.safeHavensCount && inputs.safeHavensCount > 0) {
    const rawBonus = inputs.safeHavensCount * config.safeHavenBonusPerUnit;
    const havenBonus = Math.min(rawBonus, config.safeHavenBonusCap);
    currentScore += havenBonus;
    explanation.push({
      factor: 'safe_havens',
      delta: havenBonus,
      description: `${inputs.safeHavensCount} verified safe havens nearby (+${havenBonus} pts)`,
    });
  }

  // 6. Community & Verified Hazard Incidents
  if (inputs.incidents && inputs.incidents.length > 0) {
    let rawPenalty = 0;
    for (const incident of inputs.incidents) {
      const weight = config.incidentWeights[incident.verificationStatus] ?? 0.5;
      rawPenalty += incident.severity * weight * config.incidentSeverityMultiplier;
    }

    const cappedPenalty = Math.min(rawPenalty, config.incidentPenaltyCap);
    const incidentDelta = -Math.round(cappedPenalty);
    currentScore += incidentDelta;

    explanation.push({
      factor: 'incidents',
      delta: incidentDelta,
      description: `${inputs.incidents.length} hazard reports (raw: -${rawPenalty.toFixed(1)}, capped at -${config.incidentPenaltyCap} pts)`,
    });
  }

  // 7. Clamping at minScore (5) and maxScore (98)
  const finalScore = Math.max(config.minScore, Math.min(config.maxScore, Math.round(currentScore)));

  // 8. Determine Safety Level
  let level: SafetyScoreLevel = 'caution';
  if (finalScore >= config.safeThreshold) {
    level = 'safe';
  } else if (finalScore < config.dangerThreshold) {
    level = 'danger';
  } else {
    level = 'caution';
  }

  return {
    score: finalScore,
    level,
    explanation,
  };
}
