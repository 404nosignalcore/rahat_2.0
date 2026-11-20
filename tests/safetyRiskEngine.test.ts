import {
  calculateDynamicZoneScore,
  DEFAULT_SAFETY_RISK_CONFIG,
  SafetyRiskConfig,
} from '../src/engines/safetyRiskEngine';

describe('Phase 2 — Safety Risk Engine & Dynamic Scoring Algorithm', () => {
  describe('Time-of-Day Bands', () => {
    it('applies +5 bonus for Daytime (08:00–18:00)', () => {
      const res12 = calculateDynamicZoneScore({
        lightingPercent: 70, // neutral baseline (0 delta)
        cctvPercent: 40, // neutral (0 delta)
        hour: 12,
      });
      const timeAdj = res12.explanation.find((e) => e.factor === 'time_of_day');
      expect(timeAdj?.delta).toBe(5);
      expect(res12.score).toBe(75); // 70 + 5
    });

    it('applies -12 penalty for Evening (18:00–23:00)', () => {
      const res20 = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 40,
        hour: 20,
      });
      const timeAdj = res20.explanation.find((e) => e.factor === 'time_of_day');
      expect(timeAdj?.delta).toBe(-12);
      expect(res20.score).toBe(58); // 70 - 12
    });

    it('applies -5 penalty for Early Morning (05:00–08:00)', () => {
      const res06 = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 40,
        hour: 6,
      });
      const timeAdj = res06.explanation.find((e) => e.factor === 'time_of_day');
      expect(timeAdj?.delta).toBe(-5);
      expect(res06.score).toBe(65); // 70 - 5
    });

    it('grades Night penalty strictly between -20 and -32 based on lighting & footfall', () => {
      // 1. Optimal night conditions (100% lighting, 100% footfall) -> -20 penalty
      const resNightBest = calculateDynamicZoneScore({
        lightingPercent: 100,
        footfallPercent: 100,
        cctvPercent: 40,
        hour: 1, // 01:00 AM
      });
      const adjBest = resNightBest.explanation.find((e) => e.factor === 'time_of_day');
      expect(adjBest?.delta).toBe(-20);

      // 2. Worst night conditions (0% lighting, 0% footfall) -> -32 penalty
      const resNightWorst = calculateDynamicZoneScore({
        lightingPercent: 0,
        footfallPercent: 0,
        cctvPercent: 40,
        hour: 2, // 02:00 AM
      });
      const adjWorst = resNightWorst.explanation.find((e) => e.factor === 'time_of_day');
      expect(adjWorst?.delta).toBe(-32);

      // 3. Mid-range night conditions (50% lighting, 50% footfall) -> -26 penalty
      const resNightMid = calculateDynamicZoneScore({
        lightingPercent: 50,
        footfallPercent: 50,
        cctvPercent: 40,
        hour: 3, // 03:00 AM
      });
      const adjMid = resNightMid.explanation.find((e) => e.factor === 'time_of_day');
      expect(adjMid?.delta).toBe(-26);
    });
  });

  describe('Lighting Delta Calculation', () => {
    it('awards positive points when lighting exceeds 70% baseline', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 100, // (100 - 70) * 0.2 = +6
        cctvPercent: 40,
        hour: 12,
      });
      const lightingAdj = res.explanation.find((e) => e.factor === 'lighting');
      expect(lightingAdj?.delta).toBe(6);
    });

    it('penalizes when lighting falls below 70% baseline', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 40, // (40 - 70) * 0.2 = -6
        cctvPercent: 40,
        hour: 12,
      });
      const lightingAdj = res.explanation.find((e) => e.factor === 'lighting');
      expect(lightingAdj?.delta).toBe(-6);
    });
  });

  describe('CCTV Coverage Thresholds', () => {
    it('awards +5 bonus for high CCTV coverage (>= 75%)', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 80,
        hour: 12,
      });
      const cctvAdj = res.explanation.find((e) => e.factor === 'cctv');
      expect(cctvAdj?.delta).toBe(5);
    });

    it('awards +2 bonus for medium CCTV coverage (>= 50% and < 75%)', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 60,
        hour: 12,
      });
      const cctvAdj = res.explanation.find((e) => e.factor === 'cctv');
      expect(cctvAdj?.delta).toBe(2);
    });

    it('penalizes -5 for low CCTV coverage (< 25%)', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 15,
        hour: 12,
      });
      const cctvAdj = res.explanation.find((e) => e.factor === 'cctv');
      expect(cctvAdj?.delta).toBe(-5);
    });

    it('awards 0 delta for neutral CCTV coverage (25% to 49%)', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 35,
        hour: 12,
      });
      const cctvAdj = res.explanation.find((e) => e.factor === 'cctv');
      expect(cctvAdj?.delta).toBe(0);
    });
  });

  describe('Incident Weights & Cap', () => {
    it('applies 0.5x weight for unverified and under_review reports', () => {
      const resUnverified = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 40,
        hour: 12,
        incidents: [
          { category: 'poor_lighting', severity: 4, verificationStatus: 'unverified' },
        ],
      });
      // 4 * 0.5 * 2 = 4 penalty
      const adj = resUnverified.explanation.find((e) => e.factor === 'incidents');
      expect(adj?.delta).toBe(-4);
    });

    it('applies 1.0x weight for community_corroborated reports', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 40,
        hour: 12,
        incidents: [
          { category: 'harassment', severity: 4, verificationStatus: 'community_corroborated' },
        ],
      });
      // 4 * 1.0 * 2 = 8 penalty
      const adj = res.explanation.find((e) => e.factor === 'incidents');
      expect(adj?.delta).toBe(-8);
    });

    it('applies 1.5x weight for authorized_verified reports', () => {
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 40,
        hour: 12,
        incidents: [
          { category: 'physical_assault', severity: 4, verificationStatus: 'authorized_verified' },
        ],
      });
      // 4 * 1.5 * 2 = 12 penalty
      const adj = res.explanation.find((e) => e.factor === 'incidents');
      expect(adj?.delta).toBe(-12);
    });

    it('strictly caps total incident penalty at -30 pts', () => {
      // 5 incidents with severity 5 and authorized_verified:
      // raw = 5 * (5 * 1.5 * 2) = 75 penalty -> capped at 30
      const res = calculateDynamicZoneScore({
        lightingPercent: 70,
        cctvPercent: 40,
        hour: 12,
        incidents: [
          { category: 'physical_assault', severity: 5, verificationStatus: 'authorized_verified' },
          { category: 'harassment', severity: 5, verificationStatus: 'authorized_verified' },
          { category: 'stalking', severity: 5, verificationStatus: 'authorized_verified' },
          { category: 'poor_lighting', severity: 5, verificationStatus: 'authorized_verified' },
          { category: 'secluded_area', severity: 5, verificationStatus: 'authorized_verified' },
        ],
      });
      const adj = res.explanation.find((e) => e.factor === 'incidents');
      expect(adj?.delta).toBe(-30);
    });
  });

  describe('Clamping & Boundary Verification (44 / 45 / 74 / 75)', () => {
    it('clamps scores between 5 and 98', () => {
      // Very high inputs (super lit, daytime, safe havens)
      const resHigh = calculateDynamicZoneScore({
        lightingPercent: 100,
        cctvPercent: 100,
        hour: 12,
        safeHavensCount: 10,
      });
      expect(resHigh.score).toBeLessThanOrEqual(98);

      // Very low inputs (midnight, no lighting, no cctv, multiple severe incidents)
      const resLow = calculateDynamicZoneScore({
        lightingPercent: 0,
        footfallPercent: 0,
        cctvPercent: 0,
        hour: 2,
        incidents: [
          { category: 'physical_assault', severity: 5, verificationStatus: 'authorized_verified' },
          { category: 'harassment', severity: 5, verificationStatus: 'authorized_verified' },
        ],
      });
      expect(resLow.score).toBeGreaterThanOrEqual(5);
    });

    it('correctly maps level boundary 44 to danger and 45 to caution', () => {
      // Create custom config with baseScore directly at boundary
      const config44: SafetyRiskConfig = {
        ...DEFAULT_SAFETY_RISK_CONFIG,
        baseScore: 44,
        lightingBaseline: 50,
        lightingScale: 0,
      };
      const res44 = calculateDynamicZoneScore(
        { lightingPercent: 50, cctvPercent: 30, hour: 12 },
        { ...config44, timeModifiers: { ...config44.timeModifiers, dayBonus: 0 } }
      );
      expect(res44.score).toBe(44);
      expect(res44.level).toBe('danger');

      const config45: SafetyRiskConfig = {
        ...config44,
        baseScore: 45,
      };
      const res45 = calculateDynamicZoneScore(
        { lightingPercent: 50, cctvPercent: 30, hour: 12 },
        { ...config45, timeModifiers: { ...config45.timeModifiers, dayBonus: 0 } }
      );
      expect(res45.score).toBe(45);
      expect(res45.level).toBe('caution');
    });

    it('correctly maps level boundary 74 to caution and 75 to safe', () => {
      const config74: SafetyRiskConfig = {
        ...DEFAULT_SAFETY_RISK_CONFIG,
        baseScore: 74,
        lightingBaseline: 50,
        lightingScale: 0,
      };
      const res74 = calculateDynamicZoneScore(
        { lightingPercent: 50, cctvPercent: 30, hour: 12 },
        { ...config74, timeModifiers: { ...config74.timeModifiers, dayBonus: 0 } }
      );
      expect(res74.score).toBe(74);
      expect(res74.level).toBe('caution');

      const config75: SafetyRiskConfig = {
        ...config74,
        baseScore: 75,
      };
      const res75 = calculateDynamicZoneScore(
        { lightingPercent: 50, cctvPercent: 30, hour: 12 },
        { ...config75, timeModifiers: { ...config75.timeModifiers, dayBonus: 0 } }
      );
      expect(res75.score).toBe(75);
      expect(res75.level).toBe('safe');
    });
  });
});
