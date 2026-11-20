import { MockAuthService } from '../src/services/mock/mockAuthService';
import { MockCircleService } from '../src/services/mock/mockCircleService';
import { MockSafeHavenService } from '../src/services/mock/mockSafeHavenService';
import { MockWearableService } from '../src/services/mock/mockWearableService';
import { LatLng } from '../src/types/safety';

describe('Phase 8: Connect & Profile Tests (DPDP Compliance & Services)', () => {
  let authService: MockAuthService;
  let circleService: MockCircleService;
  let safeHavenService: MockSafeHavenService;
  let wearableService: MockWearableService;

  beforeEach(() => {
    authService = new MockAuthService();
    circleService = new MockCircleService();
    safeHavenService = new MockSafeHavenService();
    wearableService = new MockWearableService();
  });

  describe('Emergency Contact Verification (6-digit OTP)', () => {
    it('supports 6-digit OTP generation and verification', async () => {
      const contacts = await authService.getEmergencyContacts();
      const unverified = contacts.find((c) => c.verificationStatus === 'pending');
      expect(unverified).toBeDefined();

      if (unverified) {
        // Send OTP
        const otp = await authService.sendContactOtp(unverified.id);
        expect(otp).toMatch(/^\d{6}$/);

        // Incorrect OTP fails
        const failed = await authService.verifyContactOtp(unverified.id, '000000');
        expect(failed).toBe(false);

        // Correct OTP succeeds and updates status
        const verified = await authService.verifyContactOtp(unverified.id, otp);
        expect(verified).toBe(true);

        const updatedContacts = await authService.getEmergencyContacts();
        const verifiedContact = updatedContacts.find((c) => c.id === unverified.id);
        expect(verifiedContact?.verificationStatus).toBe('verified');
      }
    });

    it('rejects unconsenting contacts from receiving live tracking', async () => {
      const newContact = await authService.addEmergencyContact({
        name: 'Friend Kavita',
        phone: '+919999988888',
        relationship: 'Friend',
        notifyOnSOS: true,
      });

      expect(newContact.verificationStatus).toBe('unverified');
    });
  });

  describe('DPDP Act 2023 Data Portability & Right to Erasure', () => {
    it('generates compliant JSON export archive of all user data', async () => {
      const jsonStr = await authService.exportUserDataJson();
      expect(jsonStr).toBeDefined();

      const parsed = JSON.parse(jsonStr);
      expect(parsed.profile).toBeDefined();
      expect(parsed.private).toBeDefined();
      expect(parsed.contacts).toBeDefined();
      expect(parsed.dpdpCompliance).toContain('DPDP Act 2023');
    });

    it('permanently purges account data upon user deletion request', async () => {
      await authService.deleteAccount();

      const user = authService.getCurrentUser();
      expect(user?.uid).toBe('');
      expect(user?.displayName).toBe('');

      const contacts = await authService.getEmergencyContacts();
      expect(contacts.length).toBe(0);

      const privateInfo = await authService.getPrivateInfo();
      expect(privateInfo?.phone).toBe('');
      expect(privateInfo?.consents.dpdpAccepted).toBe(false);
    });
  });

  describe('Safe Havens Directory', () => {
    const cpLocation: LatLng = { latitude: 28.6328, longitude: 77.2197 };

    it('returns verified Delhi NCR safe havens sorted by distance', async () => {
      const havens = await safeHavenService.getHavensNear(cpLocation);
      expect(havens.length).toBeGreaterThanOrEqual(3);

      for (const haven of havens) {
        expect(haven.id).toBeDefined();
        expect(haven.name).toBeDefined();
        expect(haven.phone).toBeDefined();
        expect(haven.type).toBeDefined();
        expect(haven.lastVerifiedAt).toBeDefined();
      }

      // Check distance is ascending
      for (let i = 0; i < havens.length - 1; i++) {
        const d1 = havens[i]?.distanceMeters ?? 0;
        const d2 = havens[i + 1]?.distanceMeters ?? 0;
        expect(d1).toBeLessThanOrEqual(d2);
      }
    });
  });

  describe('SafeCircle Location Sharing & Wearable Companion', () => {
    it('allows toggling circle location sharing with explicit user consent', async () => {
      const circles = await circleService.getCircles();
      const circleId = circles[0]!.id;

      await circleService.setShareLocation(circleId, true);
      let updated = await circleService.getCircles();
      expect(updated[0]?.sharingEnabled).toBe(true);

      await circleService.setShareLocation(circleId, false);
      updated = await circleService.getCircles();
      expect(updated[0]?.sharingEnabled).toBe(false);
    });

    it('simulates Bluetooth LE wearable telemetry and panic button trigger', async () => {
      const telemetry = await wearableService.getTelemetry();
      expect(telemetry.isConnected).toBe(true);
      expect(telemetry.batteryPercent).toBeGreaterThan(0);
      expect(telemetry.firmwareVersion).toBeDefined();

      await expect(wearableService.simulateSosPress()).resolves.toBeUndefined();
    });
  });
});
