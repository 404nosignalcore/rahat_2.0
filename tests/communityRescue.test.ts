import {
  communitySosEngine,
  getGeohashPrecisionForRadius,
  getGeohashQueryBounds,
  SOS_WAVE_TIERS,
} from '../src/engines/communitySosService';
import { LatLng, Responder } from '../src/types/safety';

describe('Phase 7: Community Rescue Network & Wave Escalation Tests', () => {
  const delhiCenter: LatLng = { latitude: 28.6328, longitude: 77.2197 };

  describe('Geohash Bounding & Radius Precision', () => {
    it('selects appropriate geohash precision for search radius', () => {
      expect(getGeohashPrecisionForRadius(150)).toBe(7); // ~150m
      expect(getGeohashPrecisionForRadius(500)).toBe(6); // ~1.2km (Wave 1)
      expect(getGeohashPrecisionForRadius(1000)).toBe(6); // Wave 2
      expect(getGeohashPrecisionForRadius(2000)).toBe(5); // Wave 3
    });

    it('returns center hash and 8 surrounding neighbor tiles for spatial query', () => {
      const bounds = getGeohashQueryBounds(delhiCenter, 500);
      expect(bounds.length).toBe(9);
      // All bounds should have length 6
      for (const hash of bounds) {
        expect(hash.length).toBe(6);
      }
    });
  });

  describe('Wave Escalation State Machine', () => {
    it('defines Wave 1 (500m), Wave 2 (1000m), and Wave 3 (2000m) tiers', () => {
      expect(SOS_WAVE_TIERS[1].maxRadiusMeters).toBe(500);
      expect(SOS_WAVE_TIERS[1].escalationDelayMs).toBe(60000); // 60s
      expect(SOS_WAVE_TIERS[2].maxRadiusMeters).toBe(1000);
      expect(SOS_WAVE_TIERS[2].escalationDelayMs).toBe(60000);
      expect(SOS_WAVE_TIERS[3].maxRadiusMeters).toBe(2000);
    });

    it('escalates from Wave 1 to Wave 2 after 60 seconds with no acceptance', () => {
      const session = communitySosEngine.createSession(
        'alert_101',
        'victim_uid_01',
        'Pooja',
        delhiCenter
      );

      expect(session.wave).toBe(1);

      // 30s elapsed -> remains Wave 1
      const noEscalation = communitySosEngine.evaluateWaveEscalation(session.createdAt + 30000);
      expect(noEscalation).toBeNull();

      // 61s elapsed -> escalates to Wave 2
      const wave2 = communitySosEngine.evaluateWaveEscalation(session.createdAt + 61000);
      expect(wave2).not.toBeNull();
      expect(wave2?.wave).toBe(2);

      // 121s elapsed -> escalates to Wave 3
      const wave3 = communitySosEngine.evaluateWaveEscalation(session.createdAt + 121000);
      expect(wave3).not.toBeNull();
      expect(wave3?.wave).toBe(3);
    });
  });

  describe('First Acceptance Wins & Privacy Invariant', () => {
    const verifiedResponder1: Responder = {
      uid: 'resp_priya_01',
      firstName: 'Priya',
      onDuty: true,
      geohash: 'ttnfu',
      credentials: ['First Aid Certified', 'Self-Defense Coach'],
      verificationStatus: 'verified',
      updatedAt: Date.now(),
    };

    const verifiedResponder2: Responder = {
      uid: 'resp_anita_02',
      firstName: 'Anita',
      onDuty: true,
      geohash: 'ttnfu',
      credentials: ['Campus Marshal'],
      verificationStatus: 'verified',
      updatedAt: Date.now(),
    };

    const offDutyResponder: Responder = {
      uid: 'resp_inactive_03',
      firstName: 'Kavita',
      onDuty: false,
      geohash: 'ttnfu',
      credentials: ['First Aid'],
      verificationStatus: 'verified',
      updatedAt: Date.now(),
    };

    it('allows first verified on-duty responder to win the rescue session', () => {
      const session = communitySosEngine.createSession(
        'alert_102',
        'victim_uid_02',
        'Simran',
        delhiCenter
      );

      const res = communitySosEngine.attemptAcceptance(
        session,
        verifiedResponder1,
        { latitude: 28.6301, longitude: 77.2252 }
      );

      expect(res.success).toBe(true);
      expect(res.status).toBe('accepted');
      expect(res.session?.acceptedBy).toBe(verifiedResponder1.uid);

      // NON-NEGOTIABLE PRIVACY INVARIANT: only first name and credentials exposed
      expect(res.session?.responderInfo?.firstName).toBe('Priya');
      expect(res.session?.responderInfo?.credentials).toContain('First Aid Certified');
      expect(res.session?.responderInfo?.distanceMeters).toBeGreaterThan(0);
      expect(res.session?.responderInfo?.etaSeconds).toBeGreaterThan(0);
    });

    it('rejects subsequent responder with ALREADY_ACCEPTED when session was won', () => {
      const session = communitySosEngine.createSession(
        'alert_103',
        'victim_uid_03',
        'Neha',
        delhiCenter
      );

      // Responder 1 accepts
      const winResult = communitySosEngine.attemptAcceptance(
        session,
        verifiedResponder1,
        { latitude: 28.6301, longitude: 77.2252 }
      );
      expect(winResult.success).toBe(true);

      // Responder 2 tries to accept the now accepted session
      const raceResult = communitySosEngine.attemptAcceptance(
        winResult.session!,
        verifiedResponder2,
        { latitude: 28.6310, longitude: 77.2220 }
      );

      expect(raceResult.success).toBe(false);
      expect(raceResult.error).toBe('ALREADY_ACCEPTED');
    });

    it('rejects off-duty responder with UNAUTHORIZED', () => {
      const session = communitySosEngine.createSession(
        'alert_104',
        'victim_uid_04',
        'Kavita',
        delhiCenter
      );

      const res = communitySosEngine.attemptAcceptance(
        session,
        offDutyResponder,
        delhiCenter
      );

      expect(res.success).toBe(false);
      expect(res.error).toBe('UNAUTHORIZED');
    });
  });

  describe('Safe-Code & Covert Duress-Code Verification', () => {
    beforeEach(() => {
      communitySosEngine.setSafeCode('4321');
    });

    it('cancels alert safely when exact 4-digit safe-code is entered', () => {
      const result = communitySosEngine.verifyCancellationCode('4321');
      expect(result.canceled).toBe(true);
      expect(result.isDuressAlarm).toBe(false);
      expect(result.message).toContain('canceled safely');
    });

    it('covertly triggers duress alarm when duress-code (safe-code + 1) is entered', () => {
      expect(communitySosEngine.getDuressCode()).toBe('4322');

      const result = communitySosEngine.verifyCancellationCode('4322');
      expect(result.canceled).toBe(true);
      expect(result.isDuressAlarm).toBe(true);
      expect(result.message).toContain('Duress code received');
    });

    it('rejects incorrect PIN without canceling the alert', () => {
      const result = communitySosEngine.verifyCancellationCode('9999');
      expect(result.canceled).toBe(false);
      expect(result.isDuressAlarm).toBe(false);
      expect(result.message).toContain('Invalid safe-code');
    });
  });
});
