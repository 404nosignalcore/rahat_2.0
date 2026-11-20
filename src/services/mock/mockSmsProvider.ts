import { ISmsProvider } from '../interfaces';

export class MockSmsProvider implements ISmsProvider {
  async sendSms(to: string, _message: string): Promise<{
    success: boolean;
    status: 'sent' | 'failed' | 'offline_fallback_prepared';
    providerReceiptId?: string;
  }> {
    // In production (India DLT), messages must match registered template hashes (e.g., via MSG91 or Twilio)
    if (!to || to.length < 10) {
      return {
        success: false,
        status: 'failed',
      };
    }

    return {
      success: true,
      status: 'sent',
      providerReceiptId: `mock_dlt_msg_${Date.now()}`,
    };
  }
}
