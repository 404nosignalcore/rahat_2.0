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

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface ContactDeliveryReceipt {
  contactId: string;
  contactName: string;
  phone: string;
  channel: DeliveryChannel;
  status: DeliveryStatus;
  detail?: string;
  timestamp: number;
}

export interface EmergencyAlertDoc {
  id?: string;
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

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  notifyOnSOS: boolean;
  relationship?: string;
}
