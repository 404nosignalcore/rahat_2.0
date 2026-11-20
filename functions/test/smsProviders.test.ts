import { MockSmsProvider } from '../src/sms/mockSmsProvider';
import { Msg91Provider } from '../src/sms/msg91Provider';
import { TwilioProvider } from '../src/sms/twilioProvider';

describe('Cloud Functions: SMS Providers & DLT Compliance', () => {
  const samplePayload = {
    toPhone: '+919876543210',
    recipientName: 'Sister Aarti',
    senderName: 'Pooja',
    latitude: 28.6289,
    longitude: 77.2195,
    mapsUrl: 'https://maps.google.com/?q=28.6289,77.2195',
    alertId: 'alert_delhi_101',
  };

  it('MockSmsProvider successfully dispatches with DLT template identifier', async () => {
    const provider = new MockSmsProvider();
    const result = await provider.sendEmergencyAlert(samplePayload);

    expect(result.success).toBe(true);
    expect(result.provider).toBe('mock');
    expect(result.messageId).toBeDefined();
    expect(result.dltTemplateId).toContain('DLT_RAHAT_SOS');
  });

  it('MockSmsProvider rejects invalid phone number', async () => {
    const provider = new MockSmsProvider();
    const result = await provider.sendEmergencyAlert({
      ...samplePayload,
      toPhone: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('Msg91Provider requires DLT configuration in production', async () => {
    const unconfigured = new Msg91Provider();
    const res = await unconfigured.sendEmergencyAlert(samplePayload);

    expect(res.success).toBe(false);
    expect(res.provider).toBe('msg91');
    expect(res.error).toContain('DLT approved');
    expect(res.dltTemplateId).toBe('14071612345678');
  });

  it('TwilioProvider validates SID and token before transmission', async () => {
    const unconfigured = new TwilioProvider();
    const res = await unconfigured.sendEmergencyAlert(samplePayload);

    expect(res.success).toBe(false);
    expect(res.provider).toBe('twilio');
    expect(res.error).toContain('unconfigured');
  });
});
