import {
  ConsentPreferences,
  CorridorRoute,
  EmergencyAlert,
  EmergencyContact,
  ForumPost,
  IncidentCategory,
  Journey,
  LatLng,
  PrivateUserInfo,
  SafeCircle,
  SafeHaven,
  SafetyReport,
  UserProfile,
  WearableTelemetry,
} from '../types/safety';

export interface IAuthService {
  getCurrentUser(): UserProfile | null;
  getPrivateInfo(): Promise<PrivateUserInfo | null>;
  updateConsents(consents: Partial<ConsentPreferences>): Promise<void>;
  updateLanguage(lang: 'en' | 'hi'): Promise<void>;
  addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'verificationStatus'>): Promise<EmergencyContact>;
  updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<void>;
  deleteEmergencyContact(id: string): Promise<void>;
  requestContactVerification(contactId: string): Promise<void>;
  sendContactOtp(contactId: string): Promise<string>;
  verifyContactOtp(contactId: string, otp: string): Promise<boolean>;
  exportUserDataJson(): Promise<string>;
  deleteAccount(): Promise<void>;
}

export interface CreateReportInput {
  category: IncidentCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  location: LatLng;
  areaTag: string;
}

export interface IReportsService {
  getReports(): Promise<SafetyReport[]>;
  getReportsByArea(areaTag: string): Promise<SafetyReport[]>;
  createReport(input: CreateReportInput): Promise<SafetyReport>;
  corroborateReport(reportId: string): Promise<void>;
  flagReport(reportId: string, reason: string): Promise<void>;
  addComment(reportId: string, body: string): Promise<void>;
}

export interface IJourneyService {
  getActiveJourney(): Promise<Journey | null>;
  startJourney(origin: LatLng, destination: LatLng, routeId?: string): Promise<Journey>;
  updateLocation(journeyId: string, location: LatLng): Promise<Journey>;
  endJourney(journeyId: string, reason: 'completed' | 'cancelled'): Promise<void>;
  getCorridorRoutes(): Promise<CorridorRoute[]>;
}

export interface CreateAlertInput {
  location: LatLng;
  coordsSource: 'gps' | 'stale' | 'demo';
  source: 'app' | 'wearable';
  communityRescue: boolean;
}

export interface ISosService {
  getActiveAlert(): Promise<EmergencyAlert | null>;
  triggerAlert(input: CreateAlertInput): Promise<EmergencyAlert>;
  cancelAlert(alertId: string): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  simulateOfflineDispatch(alertId: string): Promise<EmergencyAlert>;
  recordUserSentSms(alertId: string, contactId: string): Promise<EmergencyAlert>;
}

export interface ICircleService {
  getCircles(): Promise<SafeCircle[]>;
  setShareLocation(circleId: string, shareLocation: boolean): Promise<void>;
  createCircle(name: string): Promise<SafeCircle>;
}

export interface ISafeHavenService {
  getSafeHavens(): Promise<SafeHaven[]>;
  getHavensNear(location: LatLng, maxDistanceMeters?: number): Promise<SafeHaven[]>;
}

export interface IForumService {
  getPosts(areaTag?: string): Promise<ForumPost[]>;
  createPost(areaTag: string, topic: ForumPost['topic'], body: string): Promise<ForumPost>;
  upvotePost(postId: string): Promise<void>;
  blockUser(blockedUid: string): Promise<void>;
}

export interface IWearableService {
  getTelemetry(): Promise<WearableTelemetry>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  simulateSosPress(): Promise<void>;
}

export interface ISmsProvider {
  sendSms(to: string, message: string): Promise<{
    success: boolean;
    status: 'sent' | 'failed' | 'offline_fallback_prepared';
    providerReceiptId?: string;
  }>;
}

export interface IRoutingProvider {
  getCorridors(): Promise<CorridorRoute[]>;
  compareRoutes(origin: LatLng, destination: LatLng): Promise<CorridorRoute[]>;
}
