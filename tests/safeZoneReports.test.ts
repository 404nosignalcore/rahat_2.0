import { DELHI_NCR_ZONES } from '../src/data/delhiZones';
import { calculateDynamicZoneScore } from '../src/engines/safetyRiskEngine';
import { FirebaseReportsService } from '../src/services/firebase/firebaseReportsService';
import { MockReportsService } from '../src/services/mock/mockReportsService';

describe('Phase 3 — SafeZone, Polygons, and Reports Verification', () => {
  describe('Delhi NCR Geographic Zones & Polygons', () => {
    it('defines 5 verified launch corridors with complete polygon coordinates', () => {
      expect(DELHI_NCR_ZONES.length).toBe(5);

      const zoneIds = DELHI_NCR_ZONES.map((z) => z.id);
      expect(zoneIds).toContain('zone_cp_janpath');
      expect(zoneIds).toContain('zone_mandi_house');
      expect(zoneIds).toContain('zone_hauz_khas');
      expect(zoneIds).toContain('zone_saket_metro');
      expect(zoneIds).toContain('zone_cyber_city');

      for (const zone of DELHI_NCR_ZONES) {
        expect(zone.polygon.length).toBeGreaterThanOrEqual(4);
        expect(zone.geohash.length).toBeGreaterThanOrEqual(5);
        expect(zone.lightingPercent).toBeGreaterThanOrEqual(0);
        expect(zone.lightingPercent).toBeLessThanOrEqual(100);
        expect(zone.cctvPercent).toBeGreaterThanOrEqual(0);
        expect(zone.cctvPercent).toBeLessThanOrEqual(100);
        expect(zone.safeHavensCount).toBeGreaterThan(0);
      }
    });

    it('dynamically computes distinct scores across zones driven by time slider', () => {
      const cpZone = DELHI_NCR_ZONES.find((z) => z.id === 'zone_cp_janpath')!;
      const hkZone = DELHI_NCR_ZONES.find((z) => z.id === 'zone_hauz_khas')!;

      // At 14:00 (Daytime):
      const cpDay = calculateDynamicZoneScore({
        lightingPercent: cpZone.lightingPercent,
        cctvPercent: cpZone.cctvPercent,
        hour: 14,
        safeHavensCount: cpZone.safeHavensCount,
      });

      const hkDay = calculateDynamicZoneScore({
        lightingPercent: hkZone.lightingPercent,
        cctvPercent: hkZone.cctvPercent,
        hour: 14,
        safeHavensCount: hkZone.safeHavensCount,
      });

      // CP is brighter with more safe havens, so score must be higher
      expect(cpDay.score).toBeGreaterThan(hkDay.score);
      expect(cpDay.level).toBe('safe');

      // At 02:00 (Late Night):
      const cpHour02 = calculateDynamicZoneScore({
        lightingPercent: cpZone.lightingPercent,
        cctvPercent: cpZone.cctvPercent,
        hour: 2,
        safeHavensCount: cpZone.safeHavensCount,
      });

      // Night score must be strictly lower than Day score
      expect(cpHour02.score).toBeLessThan(cpDay.score);
    });
  });

  describe('Reports Lifecycle, Corroboration & Moderation', () => {
    let mockService: MockReportsService;

    beforeEach(() => {
      mockService = new MockReportsService();
    });

    it('creates a new report with initial unverified status and 0 corroborations', async () => {
      const report = await mockService.createReport({
        category: 'poor_lighting',
        severity: 3,
        title: 'Radial road lamp out of order',
        description: 'Between Block B and Janpath corridor sidewalk.',
        location: { latitude: 28.6300, longitude: 77.2180 },
        areaTag: 'Connaught Place / Janpath',
      });

      expect(report.verificationStatus).toBe('unverified');
      expect(report.corroborationCount).toBe(0);
      expect(report.flagCount).toBe(0);
      expect(report.hidden).toBe(false);
    });

    it('transitions report verificationStatus to community_corroborated on 3rd corroboration', async () => {
      const report = await mockService.createReport({
        category: 'secluded_area',
        severity: 4,
        title: 'Dark pathway behind metro substation',
        description: 'Completely unlit corner behind parking lot.',
        location: { latitude: 28.6258, longitude: 77.2345 },
        areaTag: 'Mandi House',
      });

      expect(report.verificationStatus).toBe('unverified');

      // 1st corroboration
      await mockService.corroborateReport(report.id);
      let list = await mockService.getReports();
      expect(list.find((r) => r.id === report.id)?.verificationStatus).toBe('unverified');

      // 2nd corroboration
      await mockService.corroborateReport(report.id);
      list = await mockService.getReports();
      expect(list.find((r) => r.id === report.id)?.verificationStatus).toBe('unverified');

      // 3rd corroboration -> transitions!
      await mockService.corroborateReport(report.id);
      list = await mockService.getReports();
      const finalReport = list.find((r) => r.id === report.id);
      expect(finalReport?.corroborationCount).toBe(3);
      expect(finalReport?.verificationStatus).toBe('community_corroborated');
    });

    it('transitions report to under_review at 3 flags, and hides at 5 flags', async () => {
      const report = await mockService.createReport({
        category: 'suspicious_activity',
        severity: 2,
        title: 'Outdated hazard report',
        description: 'Old report from last month.',
        location: { latitude: 28.5208, longitude: 77.2014 },
        areaTag: 'Saket Metro Corridor',
      });

      await mockService.flagReport(report.id, 'outdated');
      await mockService.flagReport(report.id, 'outdated');
      await mockService.flagReport(report.id, 'outdated');

      let list = await mockService.getReports();
      expect(list.find((r) => r.id === report.id)?.verificationStatus).toBe('under_review');

      // 4th and 5th flags
      await mockService.flagReport(report.id, 'spam');
      await mockService.flagReport(report.id, 'spam');

      list = await mockService.getReports();
      // At 5 flags, hidden: true, so getReports() filters it out
      expect(list.find((r) => r.id === report.id)).toBeUndefined();
    });

    it('enforces privacy moderation and rejects any reports with phone numbers', async () => {
      await expect(
        mockService.createReport({
          category: 'harassment',
          severity: 4,
          title: 'Suspicious phone',
          description: 'Contact witness at 9811122233 immediately.',
          location: { latitude: 28.6300, longitude: 77.2180 },
          areaTag: 'CP',
        })
      ).rejects.toThrow('Safety reports cannot contain phone numbers or private identifying details.');
    });
  });

  describe('FirebaseReportsService Constraints', () => {
    let mockService: MockReportsService;
    let fbService: FirebaseReportsService;

    beforeEach(() => {
      mockService = new MockReportsService();
      fbService = new FirebaseReportsService(mockService);
    });

    it('validates title and description length limits per Firestore rules', async () => {
      const longTitle = 'A'.repeat(125);
      await expect(
        fbService.createReport({
          category: 'poor_lighting',
          severity: 3,
          title: longTitle,
          description: 'Valid description',
          location: { latitude: 28.6300, longitude: 77.2180 },
          areaTag: 'CP',
        })
      ).rejects.toThrow('Title must be between 1 and 120 characters.');

      const longDesc = 'B'.repeat(1005);
      await expect(
        fbService.createReport({
          category: 'poor_lighting',
          severity: 3,
          title: 'Valid title',
          description: longDesc,
          location: { latitude: 28.6300, longitude: 77.2180 },
          areaTag: 'CP',
        })
      ).rejects.toThrow('Description must be between 1 and 1000 characters.');
    });

    it('validates severity range 1 to 5', async () => {
      await expect(
        fbService.createReport({
          category: 'poor_lighting',
          severity: 0 as unknown as 1,
          title: 'Valid title',
          description: 'Valid description',
          location: { latitude: 28.6300, longitude: 77.2180 },
          areaTag: 'CP',
        })
      ).rejects.toThrow('Severity must be an integer between 1 and 5.');
    });
  });
});
