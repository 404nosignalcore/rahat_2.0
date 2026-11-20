import { SmsProvider } from './interfaces';
import { MockSmsProvider } from './mockSmsProvider';
import { Msg91Provider } from './msg91Provider';
import { TwilioProvider } from './twilioProvider';

export * from './interfaces';
export * from './mockSmsProvider';
export * from './msg91Provider';
export * from './twilioProvider';

export function getSmsProvider(providerType: 'mock' | 'msg91' | 'twilio' = 'mock'): SmsProvider {
  switch (providerType) {
    case 'msg91':
      return new Msg91Provider(process.env.MSG91_AUTH_KEY, process.env.MSG91_SENDER_ID);
    case 'twilio':
      return new TwilioProvider(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
        process.env.TWILIO_FROM_PHONE
      );
    case 'mock':
    default:
      return new MockSmsProvider();
  }
}
