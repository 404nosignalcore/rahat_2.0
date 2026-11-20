export interface SmsDispatchPayload {
  toPhone: string;
  recipientName: string;
  senderName: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  alertId: string;
}

export interface SmsDispatchResult {
  success: boolean;
  messageId?: string;
  provider: 'mock' | 'msg91' | 'twilio';
  error?: string;
  /**
   * In India, cellular SMS requires DLT (Distributed Ledger Technology) registration
   * under Telecom Commercial Communications Customer Preference Regulations (TCCCPR).
   * Headers and templates must be approved before production traffic.
   */
  dltTemplateId?: string;
}

export interface SmsProvider {
  readonly providerName: 'mock' | 'msg91' | 'twilio';
  sendEmergencyAlert(payload: SmsDispatchPayload): Promise<SmsDispatchResult>;
}
