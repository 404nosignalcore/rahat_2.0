import { CreateReportInput, IReportsService } from '../interfaces';
import { SafetyReport } from '../../types/safety';

/**
 * Firebase Firestore implementation of IReportsService.
 * Ready for Phase 4 Firebase emulator / cloud configuration.
 * Mirrors Section 7.1 Firestore schema and 7.2 Security Rules invariants.
 */
export class FirebaseReportsService implements IReportsService {
  // Configured to interact with Firestore client SDK once initialized in Phase 4
  private mockFallbackService: IReportsService;
  private userReportTimestamps: number[] = [];

  constructor(mockFallbackService: IReportsService) {
    this.mockFallbackService = mockFallbackService;
  }

  async getReports(): Promise<SafetyReport[]> {
    // In emulator / production: reads from /safety_reports where hidden == false
    return this.mockFallbackService.getReports();
  }

  async getReportsByArea(areaTag: string): Promise<SafetyReport[]> {
    return this.mockFallbackService.getReportsByArea(areaTag);
  }

  async createReport(input: CreateReportInput): Promise<SafetyReport> {
    // Rate limit check: Maximum 5 reports per hour (Section 7.2)
    const now = Date.now();
    this.userReportTimestamps = this.userReportTimestamps.filter((t) => now - t < 3600000);
    if (this.userReportTimestamps.length >= 5) {
      throw new Error('Rate limit exceeded: You may only submit up to 5 safety reports per hour.');
    }

    // Enforce 7.2 security rule constraints before write:
    if (!input.title || input.title.length > 120) {
      throw new Error('Title must be between 1 and 120 characters.');
    }
    if (!input.description || input.description.length > 1000) {
      throw new Error('Description must be between 1 and 1000 characters.');
    }
    if (input.severity < 1 || input.severity > 5) {
      throw new Error('Severity must be an integer between 1 and 5.');
    }

    // PII Moderation rule:
    const piiRegex = /(\+91[\-\s]?)?[6789]\d{9}/g;
    if (piiRegex.test(input.title) || piiRegex.test(input.description)) {
      throw new Error('Safety reports cannot contain phone numbers or private identifying details.');
    }

    return this.mockFallbackService.createReport(input);
  }

  async corroborateReport(reportId: string): Promise<void> {
    // In Firestore: writes to /safety_reports/{id}/corroborations/{uid}
    return this.mockFallbackService.corroborateReport(reportId);
  }

  async flagReport(reportId: string, reason: string): Promise<void> {
    // In Firestore: writes to /safety_reports/{id}/flags/{uid}
    return this.mockFallbackService.flagReport(reportId, reason);
  }

  async addComment(reportId: string, body: string): Promise<void> {
    return this.mockFallbackService.addComment(reportId, body);
  }
}
