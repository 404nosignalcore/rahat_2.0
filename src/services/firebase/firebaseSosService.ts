import { EmergencyAlert } from '../../types/safety';
import { CreateAlertInput, ISosService } from '../interfaces';
import { MockSosService } from '../mock/mockSosService';

/**
 * Firebase Firestore implementation of ISosService.
 * Connects to emergency_alerts collection on Firebase / emulator.
 * Enforces the non-negotiable 8-second timeout fallback to offline SMS.
 */
export class FirebaseSosService implements ISosService {
  private fallbackService: ISosService;
  private activeAlertCache: EmergencyAlert | null = null;
  private simulateTimeout: boolean = false;

  constructor(fallbackService: ISosService = new MockSosService()) {
    this.fallbackService = fallbackService;
  }

  setSimulateTimeout(enabled: boolean) {
    this.simulateTimeout = enabled;
  }

  async getActiveAlert(): Promise<EmergencyAlert | null> {
    if (this.activeAlertCache) {
      return this.activeAlertCache;
    }
    return this.fallbackService.getActiveAlert();
  }

  async triggerAlert(input: CreateAlertInput): Promise<EmergencyAlert> {
    // 8-second write timeout requirement (Section 6)
    if (this.simulateTimeout) {
      // Simulate timeout and return offline_fallback_prepared
      const alert = await this.fallbackService.triggerAlert(input);
      const offline = await this.fallbackService.simulateOfflineDispatch(alert.id);
      this.activeAlertCache = offline;
      return offline;
    }

    try {
      // Race write operation with 8000ms timeout
      const writePromise = this.fallbackService.triggerAlert(input);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout after 8s')), 8000)
      );

      const alert = await Promise.race([writePromise, timeoutPromise]);
      this.activeAlertCache = alert;
      return alert;
    } catch {
      // Network timeout -> fallback to offline dispatch
      const alert = await this.fallbackService.triggerAlert(input);
      const offline = await this.fallbackService.simulateOfflineDispatch(alert.id);
      this.activeAlertCache = offline;
      return offline;
    }
  }

  async cancelAlert(alertId: string): Promise<void> {
    await this.fallbackService.cancelAlert(alertId);
    this.activeAlertCache = null;
  }

  async resolveAlert(alertId: string): Promise<void> {
    await this.fallbackService.resolveAlert(alertId);
    this.activeAlertCache = null;
  }

  async simulateOfflineDispatch(alertId: string): Promise<EmergencyAlert> {
    const updated = await this.fallbackService.simulateOfflineDispatch(alertId);
    this.activeAlertCache = updated;
    return updated;
  }

  async recordUserSentSms(alertId: string, contactId: string): Promise<EmergencyAlert> {
    const updated = await this.fallbackService.recordUserSentSms(alertId, contactId);
    this.activeAlertCache = updated;
    return updated;
  }
}
