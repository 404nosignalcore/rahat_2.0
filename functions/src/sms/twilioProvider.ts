import { SmsDispatchPayload, SmsDispatchResult, SmsProvider } from './interfaces';

/**
 * TwilioProvider - International SMS Gateway stub.
 */
export class TwilioProvider implements SmsProvider {
  readonly providerName = 'twilio' as const;
  readonly accountSid: string;
  readonly authToken: string;
  readonly fromPhone: string;

  constructor(accountSid: string = '', authToken: string = '', fromPhone: string = '') {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromPhone = fromPhone;
  }

  async sendEmergencyAlert(payload: SmsDispatchPayload): Promise<SmsDispatchResult> {
    if (!this.accountSid || !this.authToken) {
      return {
        success: false,
        provider: 'twilio',
        error: 'Twilio credentials unconfigured.',
      };
    }

    // In production with Twilio credentials:
    // client.messages.create({ to: payload.toPhone, from: this.fromPhone, body: `EMERGENCY ALERT: ${payload.senderName}...` })
    return {
      success: true,
      provider: 'twilio',
      messageId: `SM_${Date.now()}_${payload.alertId.substring(0, 8)}`,
    };
  }
}
