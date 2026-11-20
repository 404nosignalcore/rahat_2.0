import { CreateAlertInput, ISosService } from '../interfaces';
import { EmergencyAlert } from '../../types/safety';

export class MockSosService implements ISosService {
  private activeAlert: EmergencyAlert | null = null;

  async getActiveAlert(): Promise<EmergencyAlert | null> {
    return this.activeAlert;
  }

  async triggerAlert(input: CreateAlertInput): Promise<EmergencyAlert> {
    const newAlert: EmergencyAlert = {
      id: `sos_${Date.now()}`,
      userId: 'demo_user_delhi_01',
      status: 'active',
      location: input.location,
      coordsSource: input.coordsSource,
      source: input.source,
      communityRescue: input.communityRescue,
      createdAt: Date.now(),
      contactDeliveries: [
        {
          contactId: 'contact_01',
          contactName: 'Aarti (Sister)',
          phone: '+919876543210',
          channel: 'push',
          status: 'sent',
          detail: 'High priority FCM delivered to receiver device',
          timestamp: Date.now(),
        },
        {
          contactId: 'contact_02',
          contactName: 'Neha (Roommate)',
          phone: '+919812345678',
          channel: 'sms',
          status: 'sent',
          detail: 'Transmitted to cellular SMS gateway (DLT template approved)',
          timestamp: Date.now(),
        },
      ],
    };

    this.activeAlert = newAlert;
    return newAlert;
  }

  async cancelAlert(alertId: string): Promise<void> {
    if (this.activeAlert && this.activeAlert.id === alertId) {
      this.activeAlert.status = 'cancelled';
      this.activeAlert.resolvedAt = Date.now();
      this.activeAlert = null;
    }
  }

  async resolveAlert(alertId: string): Promise<void> {
    if (this.activeAlert && this.activeAlert.id === alertId) {
      this.activeAlert.status = 'resolved';
      this.activeAlert.resolvedAt = Date.now();
      this.activeAlert = null;
    }
  }

  async simulateOfflineDispatch(alertId: string): Promise<EmergencyAlert> {
    if (!this.activeAlert || this.activeAlert.id !== alertId) {
      throw new Error('Active alert not found');
    }

    this.activeAlert.contactDeliveries = this.activeAlert.contactDeliveries.map((delivery) => ({
      ...delivery,
      status: 'offline_fallback_prepared',
      detail: 'Native SMS client opened with maps link prefilled',
      timestamp: Date.now(),
    }));

    return this.activeAlert;
  }

  async recordUserSentSms(alertId: string, contactId: string): Promise<EmergencyAlert> {
    if (!this.activeAlert || this.activeAlert.id !== alertId) {
      throw new Error('Active alert not found');
    }

    this.activeAlert.contactDeliveries = this.activeAlert.contactDeliveries.map((delivery) => {
      if (delivery.contactId === contactId) {
        return {
          ...delivery,
          status: 'user_sent_via_sms',
          detail: 'User tapped Send in native SMS composer',
          timestamp: Date.now(),
        };
      }
      return delivery;
    });

    return this.activeAlert;
  }
}
