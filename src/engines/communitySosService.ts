import ngeohash from 'ngeohash';
import {
  CommunitySosSession,
  CommunitySosStatus,
  LatLng,
  Responder,
  WaveTier,
} from '../types/safety';
import { haversineDistanceMeters } from '../utils/geo';

export interface WaveConfig {
  wave: WaveTier;
  maxRadiusMeters: number;
  escalationDelayMs: number;
}

export const SOS_WAVE_TIERS: Record<WaveTier, WaveConfig> = {
  1: { wave: 1, maxRadiusMeters: 500, escalationDelayMs: 60000 },
  2: { wave: 2, maxRadiusMeters: 1000, escalationDelayMs: 60000 },
  3: { wave: 3, maxRadiusMeters: 2000, escalationDelayMs: 0 },
};

/**
 * Returns geohash precision required for a given radius in meters:
 * Precision 5: ~4.9km x 4.9km
 * Precision 6: ~1.2km x 0.6km
 * Precision 7: ~152m x 152m
 */
export function getGeohashPrecisionForRadius(radiusMeters: number): number {
  if (radiusMeters <= 200) return 7;
  if (radiusMeters <= 1500) return 6;
  return 5;
}

/**
 * Returns bounding geohashes (center + 8 neighbors) covering the radius circle.
 */
export function getGeohashQueryBounds(center: LatLng, radiusMeters: number): string[] {
  const precision = getGeohashPrecisionForRadius(radiusMeters);
  const centerHash = ngeohash.encode(center.latitude, center.longitude, precision);
  const neighbors = ngeohash.neighbors(centerHash);
  return [centerHash, ...neighbors];
}

export interface AcceptSessionResult {
  success: boolean;
  status: CommunitySosStatus;
  session?: CommunitySosSession;
  error?: 'ALREADY_ACCEPTED' | 'SESSION_CLOSED' | 'UNAUTHORIZED';
}

export interface CancellationResult {
  canceled: boolean;
  isDuressAlarm: boolean;
  message: string;
}

/**
 * Client-side Community SOS State Machine & Engine
 * Supports wave escalation, first-acceptance-wins, and safe-code / duress-code verification.
 */
export class CommunitySosEngine {
  private activeSession: CommunitySosSession | null = null;
  private safeCode: string = '1234'; // Default 4-digit user PIN

  setSafeCode(code: string) {
    if (code.length === 4 && /^\d{4}$/.test(code)) {
      this.safeCode = code;
    }
  }

  getSafeCode(): string {
    return this.safeCode;
  }

  getDuressCode(): string {
    const num = parseInt(this.safeCode, 10);
    const duressNum = (num + 1) % 10000;
    return duressNum.toString().padStart(4, '0');
  }

  createSession(
    alertId: string,
    victimUid: string,
    victimFirstName: string,
    location: LatLng
  ): CommunitySosSession {
    const session: CommunitySosSession = {
      id: `session_${alertId}`,
      alertId,
      victimUid,
      victimFirstName,
      location,
      wave: 1,
      status: 'searching',
      createdAt: Date.now(),
    };
    this.activeSession = session;
    return session;
  }

  getActiveSession(): CommunitySosSession | null {
    return this.activeSession;
  }

  /**
   * Evaluates wave escalation:
   * Wave 1 (500m) -> Wave 2 (1000m) after 60s
   * Wave 2 (1000m) -> Wave 3 (2000m) after 60s
   */
  evaluateWaveEscalation(now: number = Date.now()): CommunitySosSession | null {
    if (!this.activeSession || this.activeSession.status !== 'searching') {
      return null;
    }

    const elapsed = now - this.activeSession.createdAt;

    if (this.activeSession.wave === 1 && elapsed >= SOS_WAVE_TIERS[1].escalationDelayMs) {
      this.activeSession.wave = 2;
      this.activeSession.expandedAt = now;
      return { ...this.activeSession };
    }

    if (this.activeSession.wave === 2 && elapsed >= SOS_WAVE_TIERS[1].escalationDelayMs + SOS_WAVE_TIERS[2].escalationDelayMs) {
      this.activeSession.wave = 3;
      this.activeSession.expandedAt = now;
      return { ...this.activeSession };
    }

    return null;
  }

  /**
   * First acceptance wins: atomic transition from 'searching' to 'accepted'.
   * Subsequent responders receive ALREADY_ACCEPTED.
   */
  attemptAcceptance(
    session: CommunitySosSession,
    responder: Responder,
    responderLocation: LatLng
  ): AcceptSessionResult {
    // 1. Session must be in 'searching' state
    if (session.status !== 'searching') {
      return {
        success: false,
        status: session.status,
        error: session.status === 'accepted' ? 'ALREADY_ACCEPTED' : 'SESSION_CLOSED',
      };
    }

    // 2. Responder must be verified and on duty
    if (!responder.onDuty || responder.verificationStatus !== 'verified') {
      return {
        success: false,
        status: session.status,
        error: 'UNAUTHORIZED',
      };
    }

    // 3. Calculate distance and estimated walking ETA (80m/min)
    const distanceMeters = Math.round(
      haversineDistanceMeters(responderLocation, session.location)
    );
    const etaSeconds = Math.max(60, Math.round((distanceMeters / 80) * 60));

    // 4. Atomic win: attach first name only and credentials
    const updated: CommunitySosSession = {
      ...session,
      status: 'accepted',
      acceptedBy: responder.uid,
      responderInfo: {
        firstName: responder.firstName, // FIRST NAME ONLY (Section 6 & 8.3)
        credentials: responder.credentials,
        distanceMeters,
        etaSeconds,
      },
    };

    this.activeSession = updated;

    return {
      success: true,
      status: 'accepted',
      session: updated,
    };
  }

  /**
   * Verify cancellation PIN:
   * - Matching safeCode: cancels normally without distress
   * - Matching duressCode (safeCode + 1): silently marks duressAlarm to trigger police covert dispatch
   *   while outwardly rendering as canceled to protect victim from coercer.
   */
  verifyCancellationCode(enteredCode: string): CancellationResult {
    const trimmed = enteredCode.trim();

    if (trimmed === this.safeCode) {
      if (this.activeSession) {
        this.activeSession.status = 'cancelled';
      }
      return {
        canceled: true,
        isDuressAlarm: false,
        message: 'Alert canceled safely with personal safe-code.',
      };
    }

    if (trimmed === this.getDuressCode()) {
      if (this.activeSession) {
        this.activeSession.status = 'cancelled';
      }
      return {
        canceled: true,
        isDuressAlarm: true,
        message: 'Duress code received. Quietly notifying police (112) while showing canceled.',
      };
    }

    return {
      canceled: false,
      isDuressAlarm: false,
      message: 'Invalid safe-code. Emergency alert remains active.',
    };
  }
}

export const communitySosEngine = new CommunitySosEngine();
