/**
 * Rahat (राहत) Safety System Architecture & Type Definitions
 * Strict TypeScript definitions mirroring firebase-blueprint.json and specifications.
 */

export type LanguageCode = 'en' | 'hi';

export type SafetyScoreLevel = 'safe' | 'caution' | 'danger';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export type IncidentCategory =
  | 'harassment'
  | 'stalking'
  | 'verbal_abuse'
  | 'physical_assault'
  | 'poor_lighting'
  | 'secluded_area'
  | 'unsafe_transport'
  | 'suspicious_activity';

export type VerificationBadge =
  | 'unverified'
  | 'under_review'
  | 'community_corroborated'
  | 'authorized_verified';

export type ContactVerificationStatus = 'unverified' | 'pending' | 'verified';

export interface UserProfile {
  uid: string;
  displayName: string;
  preferredLanguage: LanguageCode;
  createdAt: number;
  updatedAt: number;
}

export interface ConsentPreferences {
  dpdpAccepted: boolean;
  dpdpAcceptedAt: number;
  foregroundLocation: boolean;
  backgroundLocation: boolean;
  deviationNotifications: boolean;
}

export interface PrivateUserInfo {
  email: string;
  phone: string;
  consents: ConsentPreferences;
  sosCountdownSeconds: 3 | 5 | 10;
  fcmTokens: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  verificationStatus: ContactVerificationStatus;
  notifyOnSOS: boolean;
  createdAt: number;
}

export interface SafetyReport {
  id: string;
  authorUid: string;
  category: IncidentCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  location: LatLng;
  geohash: string;
  areaTag: string;
  verificationStatus: VerificationBadge;
  corroborationCount: number;
  flagCount: number;
  hidden: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ReportCorroboration {
  uid: string;
  corroboratedAt: number;
}

export interface ReportFlag {
  uid: string;
  reason: string;
  flaggedAt: number;
}

export interface ReportComment {
  id: string;
  authorUid: string;
  body: string;
  createdAt: number;
}

export type JourneyStatus = 'active' | 'completed' | 'cancelled' | 'deviated';
export type DeviationState = 'on_route' | 'deviated' | 'in_cooldown';

export interface JourneyWaypoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface Journey {
  id: string;
  userId: string;
  origin: JourneyWaypoint;
  destination: JourneyWaypoint;
  routePolyline: string; // Encoded or geojson coordinates
  status: JourneyStatus;
  currentLocation?: LatLng;
  deviationState: DeviationState;
  startedAt: number;
  endedAt?: number;
}

export interface CorridorRoute {
  id: string;
  title: string;
  tag: 'safest' | 'quickest' | 'well_lit';
  distanceMeters: number;
  etaSeconds: number;
  lightingPercent: number;
  cctvPercent: number;
  safeHavensCount: number;
  rankingRationale: string;
  coordinates: LatLng[];
}

export type CircleRole = 'owner' | 'admin' | 'member';

export interface CircleMember {
  uid: string;
  displayName: string;
  shareLocation: boolean;
  role: CircleRole;
  joinedAt: number;
  lastKnownLocation?: LatLng;
  activeJourney?: {
    status: JourneyStatus;
    destinationName: string;
  };
}

export interface SafeCircle {
  id: string;
  ownerUid: string;
  name: string;
  sharingEnabled: boolean;
  createdAt: number;
  members: Record<string, CircleMember>;
}

export type AlertStatus = 'countdown' | 'active' | 'resolved' | 'cancelled';
export type CoordsSource = 'gps' | 'stale' | 'demo';
export type AlertSource = 'app' | 'wearable';
export type DeliveryChannel = 'push' | 'sms';
export type DeliveryStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'offline_fallback_prepared'
  | 'user_sent_via_sms';

export interface ContactDeliveryReceipt {
  contactId: string;
  contactName: string;
  phone: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  detail?: string;
  timestamp: number;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  status: AlertStatus;
  location: LatLng;
  coordsSource: CoordsSource;
  source: AlertSource;
  contactDeliveries: ContactDeliveryReceipt[];
  communityRescue: boolean;
  createdAt: number;
  resolvedAt?: number;
}

export type ResponderVerificationStatus = 'pending' | 'verified' | 'suspended';

export interface Responder {
  uid: string;
  firstName: string;
  onDuty: boolean;
  geohash: string;
  credentials: string[]; // e.g. ["First Aid", "Self-Defense Coach"]
  verificationStatus: ResponderVerificationStatus;
  fcmToken?: string;
  updatedAt: number;
}

export type CommunitySosStatus = 'searching' | 'accepted' | 'resolved' | 'cancelled';
export type WaveTier = 1 | 2 | 3;

export interface CommunitySosResponse {
  uid: string;
  decision: 'accepted' | 'declined';
  etaSeconds: number;
  respondedAt: number;
}

export interface CommunitySosSession {
  id: string;
  alertId: string;
  victimUid: string;
  victimFirstName: string;
  location: LatLng;
  wave: WaveTier;
  status: CommunitySosStatus;
  acceptedBy?: string;
  responderInfo?: {
    firstName: string;
    credentials: string[];
    distanceMeters: number;
    etaSeconds: number;
  };
  createdAt: number;
  expandedAt?: number;
}

export type SafeHavenType =
  | 'police_station'
  | 'pink_booth'
  | 'hospital_er'
  | 'pharmacy_24x7'
  | 'metro_help_desk'
  | 'sakhi_centre'
  | 'campus_security';

export interface SafeHaven {
  id: string;
  name: string;
  type: SafeHavenType;
  latitude: number;
  longitude: number;
  phone: string;
  open24x7: boolean;
  source: string;
  lastVerifiedAt: string; // ISO date e.g. "2026-11-01"
  distanceMeters?: number;
}

export type ForumTopic = 'Area Updates' | 'Lighting Alerts' | 'Suspicious Activity' | 'Safe Tips';

export interface ForumPost {
  id: string;
  areaTag: string; // e.g. "Janpath / Mandi House corridor"
  topic: ForumTopic;
  body: string;
  authorUid: string;
  upvotes: number;
  hidden: boolean;
  createdAt: number;
}

export interface WearableTelemetry {
  deviceId: string;
  name: string;
  batteryPercent: number;
  firmwareVersion: string;
  isConnected: boolean;
  heartbeatTimestamp: number;
}
