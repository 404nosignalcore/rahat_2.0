import { MockAuthService } from './mock/mockAuthService';
import { MockReportsService } from './mock/mockReportsService';
import { MockJourneyService } from './mock/mockJourneyService';
import { MockSosService } from './mock/mockSosService';
import { MockCircleService } from './mock/mockCircleService';
import { MockSafeHavenService } from './mock/mockSafeHavenService';
import { MockForumService } from './mock/mockForumService';
import { MockWearableService } from './mock/mockWearableService';
import { MockSmsProvider } from './mock/mockSmsProvider';
import {
  IAuthService,
  ICircleService,
  IForumService,
  IJourneyService,
  IReportsService,
  ISafeHavenService,
  ISmsProvider,
  ISosService,
  IWearableService,
} from './interfaces';

/**
 * Service mode configuration:
 * 'mock' enables complete in-memory operation with Delhi NCR seed datasets.
 * 'firebase' connects to Firebase Auth, Firestore, and Cloud Functions emulators or cloud backend.
 */
export type ServiceMode = 'firebase' | 'mock';
export const SERVICE_MODE: ServiceMode = 'mock';

// Mock service singletons
const mockAuth = new MockAuthService();
const mockReports = new MockReportsService();
const mockJourney = new MockJourneyService();
const mockSos = new MockSosService();
const mockCircle = new MockCircleService();
const mockSafeHaven = new MockSafeHavenService();
const mockForum = new MockForumService();
const mockWearable = new MockWearableService();
const mockSms = new MockSmsProvider();

export const authService: IAuthService = mockAuth;
export const reportsService: IReportsService = mockReports;
export const journeyService: IJourneyService = mockJourney;
export const sosService: ISosService = mockSos;
export const circleService: ICircleService = mockCircle;
export const safeHavenService: ISafeHavenService = mockSafeHaven;
export const forumService: IForumService = mockForum;
export const wearableService: IWearableService = mockWearable;
export const smsProvider: ISmsProvider = mockSms;

export * from './interfaces';
