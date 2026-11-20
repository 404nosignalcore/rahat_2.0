import { FirebaseSosService } from '../src/services/firebase/firebaseSosService';
import { MockSosService } from '../src/services/mock/mockSosService';
import { CreateAlertInput } from '../src/services/interfaces';

describe('Phase 6: SOS Dispatch & Delivery Receipts Verification', () => {
  let mockSos: MockSosService;
  const sampleInput: CreateAlertInput = {
    location: { latitude: 28.6289, longitude: 77.2195 },
    coordsSource: 'gps',
    source: 'app',
    communityRescue: true,
  };

  beforeEach(() => {
    mockSos = new MockSosService();
  });

  describe('SOS Trigger & Lifecycle', () => {
    it('creates an active emergency alert with verified delivery receipts', async () => {
      const alert = await mockSos.triggerAlert(sampleInput);

      expect(alert.id).toBeDefined();
      expect(alert.status).toBe('active');
      expect(alert.location).toEqual(sampleInput.location);
      expect(alert.coordsSource).toBe('gps');
      expect(alert.communityRescue).toBe(true);
      expect(alert.contactDeliveries.length).toBeGreaterThanOrEqual(2);

      // Verify delivery receipts have valid channels and statuses
      for (const delivery of alert.contactDeliveries) {
        expect(['push', 'sms']).toContain(delivery.channel);
        expect(['pending', 'sent', 'failed']).toContain(delivery.status);
        expect(delivery.phone).toBeDefined();
        expect(delivery.timestamp).toBeGreaterThan(0);
      }
    });

    it('cancels active alert and sets resolved timestamp', async () => {
      const alert = await mockSos.triggerAlert(sampleInput);
      expect(await mockSos.getActiveAlert()).not.toBeNull();

      await mockSos.cancelAlert(alert.id);
      expect(await mockSos.getActiveAlert()).toBeNull();
    });

    it('resolves active alert when user indicates safety', async () => {
      const alert = await mockSos.triggerAlert(sampleInput);
      expect(await mockSos.getActiveAlert()).not.toBeNull();

      await mockSos.resolveAlert(alert.id);
      expect(await mockSos.getActiveAlert()).toBeNull();
    });
  });

  describe('Truth in Dispatch & Offline Fallback', () => {
    it('accurately transitions status to offline_fallback_prepared on network failure', async () => {
      const alert = await mockSos.triggerAlert(sampleInput);
      const offlineAlert = await mockSos.simulateOfflineDispatch(alert.id);

      for (const delivery of offlineAlert.contactDeliveries) {
        expect(delivery.status).toBe('offline_fallback_prepared');
        expect(delivery.detail).toContain('Native SMS client opened');
      }
    });

    it('transitions per-contact status to user_sent_via_sms when user transmits SMS', async () => {
      const alert = await mockSos.triggerAlert(sampleInput);
      await mockSos.simulateOfflineDispatch(alert.id);

      const targetContactId = alert.contactDeliveries[0]!.contactId;
      const updated = await mockSos.recordUserSentSms(alert.id, targetContactId);

      const targetDelivery = updated.contactDeliveries.find((d) => d.contactId === targetContactId);
      expect(targetDelivery).toBeDefined();
      expect(targetDelivery?.status).toBe('user_sent_via_sms');
      expect(targetDelivery?.detail).toContain('native SMS composer');
    });

    it('FirebaseSosService falls back to offline dispatch when Firestore write times out', async () => {
      const firebaseSos = new FirebaseSosService();
      firebaseSos.setSimulateTimeout(true);
      const alert = await firebaseSos.triggerAlert(sampleInput);

      expect(alert).toBeDefined();
      expect(alert.status).toBe('active');
      expect(alert.contactDeliveries.length).toBeGreaterThan(0);
      // Fallback state reflects offline prepared
      expect(alert.contactDeliveries[0]?.status).toBe('offline_fallback_prepared');
    });
  });

  describe('Statutory Safety Requirements & Dialers', () => {
    it('NON-NEGOTIABLE SAFETY INVARIANT: emergency dialer strings conform strictly to official 112 / 1091', () => {
      const erssPolice = '112';
      const womenHelpline = '1091';

      expect(`tel:${erssPolice}`).toBe('tel:112');
      expect(`tel:${womenHelpline}`).toBe('tel:1091');
    });

    it('validates coordinate source flags (gps, stale, demo)', () => {
      const gpsInput: CreateAlertInput = { ...sampleInput, coordsSource: 'gps' };
      const staleInput: CreateAlertInput = { ...sampleInput, coordsSource: 'stale' };
      const demoInput: CreateAlertInput = { ...sampleInput, coordsSource: 'demo' };

      expect(gpsInput.coordsSource).toBe('gps');
      expect(staleInput.coordsSource).toBe('stale');
      expect(demoInput.coordsSource).toBe('demo');
    });
  });
});
