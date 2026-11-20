import { SmsDispatchPayload, SmsDispatchResult, SmsProvider } from './interfaces';

/**
 * MockSmsProvider - In-memory and local emulator provider.
 * Implements realistic dispatch with mock delivery latency and DLT compliance logging.
 */
export class MockSmsProvider implements SmsProvider {
  readonly providerName = 'mock' as const;

  async sendEmergencyAlert(payload: SmsDispatchPayload): Promise<SmsDispatchResult> {
    // Simulated carrier delay
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Simulated carrier validation
    if (!payload.toPhone || payload.toPhone.length < 10) {
      return {
        success: false,
        provider: 'mock',
        error: 'Invalid recipient phone number',
      };
    }

    return {
      success: true,
      provider: 'mock',
      messageId: `mock_sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      dltTemplateId: 'DLT_RAHAT_SOS_V1_14071612345678',
    };
  }
}
