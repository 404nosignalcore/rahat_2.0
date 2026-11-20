import { CreateReportInput, IReportsService } from '../interfaces';
import { SafetyReport } from '../../types/safety';

export class MockReportsService implements IReportsService {
  private reports: SafetyReport[] = [
    {
      id: 'rep_cp_01',
      authorUid: 'user_cp_99',
      category: 'poor_lighting',
      severity: 3,
      title: 'Broken streetlights along radial road 3',
      description: 'The pedestrian walkway between Block C and Janpath metro gate 2 has 4 non-functional lights.',
      location: { latitude: 28.6289, longitude: 77.2195 },
      geohash: 'ttnfuh',
      areaTag: 'Connaught Place / Janpath',
      verificationStatus: 'community_corroborated',
      corroborationCount: 4,
      flagCount: 0,
      hidden: false,
      createdAt: Date.now() - 3600000 * 5,
      updatedAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'rep_hk_02',
      authorUid: 'user_hk_44',
      category: 'secluded_area',
      severity: 4,
      title: 'Dark deserted stretch near Deer Park boundary gate',
      description: 'Extremely secluded pathway with zero lighting and no guard presence after 8 PM.',
      location: { latitude: 28.5529, longitude: 77.1937 },
      geohash: 'ttng5k',
      areaTag: 'Hauz Khas Village',
      verificationStatus: 'authorized_verified',
      corroborationCount: 8,
      flagCount: 0,
      hidden: false,
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'rep_saket_03',
      authorUid: 'user_saket_12',
      category: 'harassment',
      severity: 3,
      title: 'Group loitering and passing verbal remarks',
      description: 'Near Saket Metro Station Gate 1 auto stand, recurring catcalling observed around 9 PM.',
      location: { latitude: 28.5208, longitude: 77.2014 },
      geohash: 'ttng49',
      areaTag: 'Saket Metro Corridor',
      verificationStatus: 'unverified',
      corroborationCount: 1,
      flagCount: 0,
      hidden: false,
      createdAt: Date.now() - 3600000 * 8,
      updatedAt: Date.now() - 3600000 * 8,
    },
    {
      id: 'rep_cyber_04',
      authorUid: 'user_cyber_78',
      category: 'poor_lighting',
      severity: 2,
      title: 'Flickering lamps on underpass walkway',
      description: 'Underpass footpath connecting Cyber City Rapid Metro to Building 10 is dim.',
      location: { latitude: 28.4952, longitude: 77.0892 },
      geohash: 'ttng92',
      areaTag: 'Cyber City Gurgaon',
      verificationStatus: 'community_corroborated',
      corroborationCount: 3,
      flagCount: 0,
      hidden: false,
      createdAt: Date.now() - 3600000 * 18,
      updatedAt: Date.now() - 3600000 * 6,
    },
  ];

  async getReports(): Promise<SafetyReport[]> {
    return [...this.reports.filter((r) => !r.hidden)];
  }

  async getReportsByArea(areaTag: string): Promise<SafetyReport[]> {
    return this.reports.filter((r) => !r.hidden && r.areaTag.toLowerCase().includes(areaTag.toLowerCase()));
  }

  async createReport(input: CreateReportInput): Promise<SafetyReport> {
    // Moderation check: block phone numbers or personal PII
    const piiRegex = /(\+91[\-\s]?)?[6789]\d{9}/g;
    if (piiRegex.test(input.description) || piiRegex.test(input.title)) {
      throw new Error('Safety reports cannot contain phone numbers or private identifying details.');
    }

    const newReport: SafetyReport = {
      id: `rep_${Date.now()}`,
      authorUid: 'demo_user_delhi_01',
      category: input.category,
      severity: input.severity,
      title: input.title.trim().slice(0, 120),
      description: input.description.trim().slice(0, 1000),
      location: input.location,
      geohash: 'ttnfuh', // Mock geohash
      areaTag: input.areaTag,
      verificationStatus: 'unverified',
      corroborationCount: 0,
      flagCount: 0,
      hidden: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.reports.unshift(newReport);
    return newReport;
  }

  async corroborateReport(reportId: string): Promise<void> {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) {
      report.corroborationCount += 1;
      if (report.corroborationCount >= 3 && report.verificationStatus === 'unverified') {
        report.verificationStatus = 'community_corroborated';
      }
      report.updatedAt = Date.now();
    }
  }

  async flagReport(reportId: string, _reason: string): Promise<void> {
    const report = this.reports.find((r) => r.id === reportId);
    if (report) {
      report.flagCount += 1;
      if (report.flagCount >= 3) {
        report.verificationStatus = 'under_review';
      }
      if (report.flagCount >= 5) {
        report.hidden = true;
      }
      report.updatedAt = Date.now();
    }
  }

  async addComment(_reportId: string, _body: string): Promise<void> {
    // Stored in mock
  }
}
