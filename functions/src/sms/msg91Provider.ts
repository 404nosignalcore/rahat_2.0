import { SmsDispatchPayload, SmsDispatchResult, SmsProvider } from './interfaces';

/**
 * Msg91Provider - Primary Indian SMS Gateway stub.
 * Requires TRAI DLT Principal Entity ID, registered Header (Sender ID), and approved Template ID.
 */
export class Msg91Provider implements SmsProvider {
  readonly providerName = 'msg91' as const;
  readonly authKey: string;
  readonly senderId: string;
  readonly templateId: string;

  constructor(authKey: string = '', senderId: string = 'RAHATS', templateId: string = '14071612345678') {
    this.authKey = authKey;
    this.senderId = senderId;
    this.templateId = templateId;
  }

  async sendEmergencyAlert(payload: SmsDispatchPayload): Promise<SmsDispatchResult> {
    if (!this.authKey) {
      // In development/test mode without credentials, gracefully notify configuration requirement
      return {
        success: false,
        provider: 'msg91',
        error: 'MSG91 auth key unconfigured. Requires DLT approved senderId and templateId.',
        dltTemplateId: this.templateId,
      };
    }

    // In production with MSG91 key configured:
    // POST https://control.msg91.com/api/v5/flow/
    // headers: { authkey: this.authKey, 'content-type': 'application/json' }
    // body: { template_id: this.templateId, sender: this.senderId, recipients: [{ mobiles: payload.toPhone, name: payload.recipientName, ... }] }
    return {
      success: true,
      provider: 'msg91',
      messageId: `msg91_req_${Date.now()}`,
      dltTemplateId: this.templateId,
    };
  }
}
