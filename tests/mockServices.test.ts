import {
  authService,
  circleService,
  forumService,
  journeyService,
  reportsService,
  safeHavenService,
  sosService,
} from '../src/services';

describe('Phase 1 — In-Memory Mock Services Contract & Behavior', () => {
  describe('MockAuthService & DPDP Act 2023', () => {
    it('returns current user profile and private info', async () => {
      const user = authService.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.displayName).toBe('Priya Sharma');

      const info = await authService.getPrivateInfo();
      expect(info?.consents.dpdpAccepted).toBe(true);
      expect(info?.email).toBe('priya.sharma@example.com');
    });

    it('supports DPDP Act 2023 right to erasure (account deletion)', async () => {
      await authService.deleteAccount();
      const userAfter = authService.getCurrentUser();
      expect(userAfter?.uid).toBe('');

      const infoAfter = await authService.getPrivateInfo();
      expect(infoAfter?.consents.dpdpAccepted).toBe(false);
    });
  });

  describe('MockReportsService', () => {
    it('seeds verified Delhi NCR reports', async () => {
      const reports = await reportsService.getReports();
      expect(reports.length).toBeGreaterThanOrEqual(4);
      expect(reports.some((r) => r.areaTag.includes('Connaught Place'))).toBe(true);
      expect(reports.some((r) => r.areaTag.includes('Hauz Khas'))).toBe(true);
    });

    it('increments corroborations and transitions status to community_corroborated at >= 3', async () => {
      const initial = await reportsService.createReport({
        category: 'poor_lighting',
        severity: 3,
        title: 'Dim sidewalk near Mandi House roundabout',
        description: 'Lamp post out of order.',
        location: { latitude: 28.6258, longitude: 77.2345 },
        areaTag: 'Mandi House',
      });

      expect(initial.verificationStatus).toBe('unverified');
      expect(initial.corroborationCount).toBe(0);

      await reportsService.corroborateReport(initial.id);
      await reportsService.corroborateReport(initial.id);
      await reportsService.corroborateReport(initial.id);

      const all = await reportsService.getReports();
      const updated = all.find((r) => r.id === initial.id);
      expect(updated?.corroborationCount).toBe(3);
      expect(updated?.verificationStatus).toBe('community_corroborated');
    });

    it('moderates content and rejects reports containing phone numbers or PII', async () => {
      await expect(
        reportsService.createReport({
          category: 'harassment',
          severity: 4,
          title: 'Suspicious individual',
          description: 'Call +919876543210 for details.',
          location: { latitude: 28.6258, longitude: 77.2345 },
          areaTag: 'CP',
        })
      ).rejects.toThrow('Safety reports cannot contain phone numbers or private identifying details.');
    });
  });

  describe('MockJourneyService', () => {
    it('provides Delhi NCR corridor routes with ranking rationales', async () => {
      const corridors = await journeyService.getCorridorRoutes();
      expect(corridors.length).toBeGreaterThanOrEqual(3);

      const safest = corridors.find((c) => c.tag === 'safest');
      expect(safest).toBeDefined();
      expect(safest?.lightingPercent).toBeGreaterThanOrEqual(90);
      expect(safest?.rankingRationale.length).toBeGreaterThan(0);
    });

    it('starts and manages an active journey', async () => {
      const journey = await journeyService.startJourney(
        { latitude: 28.6328, longitude: 77.2197 },
        { latitude: 28.6258, longitude: 77.2345 }
      );
      expect(journey.status).toBe('active');
      expect(journey.deviationState).toBe('on_route');

      const active = await journeyService.getActiveJourney();
      expect(active?.id).toBe(journey.id);

      await journeyService.endJourney(journey.id, 'completed');
      const activeAfter = await journeyService.getActiveJourney();
      expect(activeAfter).toBeNull();
    });
  });

  describe('MockSosService & Truth in Dispatch', () => {
    it('generates emergency alert with honest per-contact delivery receipts', async () => {
      const alert = await sosService.triggerAlert({
        location: { latitude: 28.6289, longitude: 77.2195 },
        coordsSource: 'gps',
        source: 'app',
        communityRescue: true,
      });

      expect(alert.status).toBe('active');
      expect(alert.contactDeliveries.length).toBeGreaterThan(0);

      // Verify delivery states
      for (const receipt of alert.contactDeliveries) {
        expect(['pending', 'sent', 'failed', 'offline_fallback_prepared', 'user_sent_via_sms']).toContain(
          receipt.status
        );
      }

      await sosService.cancelAlert(alert.id);
      const active = await sosService.getActiveAlert();
      expect(active).toBeNull();
    });

    it('simulates offline fallback delivery status when network is unavailable', async () => {
      const alert = await sosService.triggerAlert({
        location: { latitude: 28.6289, longitude: 77.2195 },
        coordsSource: 'demo',
        source: 'app',
        communityRescue: false,
      });

      const updated = await sosService.simulateOfflineDispatch(alert.id);
      for (const receipt of updated.contactDeliveries) {
        expect(receipt.status).toBe('offline_fallback_prepared');
      }

      await sosService.resolveAlert(alert.id);
    });
  });

  describe('MockSafeHavenService', () => {
    it('only returns real verified safe havens in Delhi NCR', async () => {
      const havens = await safeHavenService.getSafeHavens();
      expect(havens.length).toBeGreaterThanOrEqual(6);

      for (const haven of havens) {
        expect(haven.source.length).toBeGreaterThan(0);
        expect(haven.lastVerifiedAt).toBe('2026-11-01');
        expect(haven.phone.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('sorts nearby havens by distance from user location', async () => {
      const sorted = await safeHavenService.getHavensNear({
        latitude: 28.6328,
        longitude: 77.2197,
      });

      expect(sorted[0]?.name).toContain('Rajiv Chowk');
      for (let i = 1; i < sorted.length; i++) {
        expect((sorted[i]?.distanceMeters ?? 0)).toBeGreaterThanOrEqual(
          sorted[i - 1]?.distanceMeters ?? 0
        );
      }
    });
  });

  describe('MockCircleService & MockForumService', () => {
    it('manages SafeCircle and location sharing toggles', async () => {
      const circles = await circleService.getCircles();
      expect(circles.length).toBeGreaterThan(0);
      const first = circles[0];
      if (first) {
        await circleService.setShareLocation(first.id, false);
        const updated = await circleService.getCircles();
        expect(updated[0]?.members['demo_user_delhi_01']?.shareLocation).toBe(false);
      }
    });

    it('filters forum posts by coarse corridor tags and supports upvoting and blocking', async () => {
      const initial = await forumService.getPosts();
      expect(initial.length).toBeGreaterThan(0);

      const first = initial[0];
      if (first) {
        const initialUpvotes = first.upvotes;
        await forumService.upvotePost(first.id);
        const updated = await forumService.getPosts();
        const found = updated.find((p) => p.id === first.id);
        expect(found?.upvotes).toBe(initialUpvotes + 1);

        // Test user blocking
        await forumService.blockUser(first.authorUid);
        const afterBlock = await forumService.getPosts();
        expect(afterBlock.some((p) => p.authorUid === first.authorUid)).toBe(false);
      }
    });
  });
});
