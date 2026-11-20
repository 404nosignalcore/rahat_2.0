import { IAuthService } from '../interfaces';
import { ConsentPreferences, EmergencyContact, PrivateUserInfo, UserProfile } from '../../types/safety';

export class MockAuthService implements IAuthService {
  private currentUser: UserProfile = {
    uid: 'demo_user_delhi_01',
    displayName: 'Priya Sharma',
    preferredLanguage: 'en',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now(),
  };

  private privateInfo: PrivateUserInfo = {
    email: 'priya.sharma@example.com',
    phone: '+919811122233',
    consents: {
      dpdpAccepted: true,
      dpdpAcceptedAt: Date.now() - 86400000 * 30,
      foregroundLocation: true,
      backgroundLocation: true,
      deviationNotifications: true,
    },
    sosCountdownSeconds: 5,
    fcmTokens: ['mock_fcm_token_pixel_8a'],
  };

  private contacts: EmergencyContact[] = [
    {
      id: 'contact_01',
      name: 'Aarti (Sister)',
      relationship: 'Sister',
      phone: '+919876543210',
      verificationStatus: 'verified',
      notifyOnSOS: true,
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: 'contact_02',
      name: 'Neha (Roommate)',
      relationship: 'Roommate',
      phone: '+919812345678',
      verificationStatus: 'pending',
      notifyOnSOS: true,
      createdAt: Date.now() - 86400000 * 10,
    },
  ];

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  async getPrivateInfo(): Promise<PrivateUserInfo | null> {
    return { ...this.privateInfo };
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return [...this.contacts];
  }

  async updateConsents(consents: Partial<ConsentPreferences>): Promise<void> {
    this.privateInfo.consents = {
      ...this.privateInfo.consents,
      ...consents,
    };
  }

  async updateLanguage(lang: 'en' | 'hi'): Promise<void> {
    this.currentUser.preferredLanguage = lang;
    this.currentUser.updatedAt = Date.now();
  }

  async addEmergencyContact(
    contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'verificationStatus'>
  ): Promise<EmergencyContact> {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}`,
      verificationStatus: 'unverified',
      createdAt: Date.now(),
    };
    this.contacts.push(newContact);
    return newContact;
  }

  async updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<void> {
    const idx = this.contacts.findIndex((c) => c.id === id);
    if (idx >= 0 && this.contacts[idx]) {
      this.contacts[idx] = { ...this.contacts[idx], ...updates } as EmergencyContact;
    }
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    this.contacts = this.contacts.filter((c) => c.id !== id);
  }

  async requestContactVerification(contactId: string): Promise<void> {
    const contact = this.contacts.find((c) => c.id === contactId);
    if (contact) {
      contact.verificationStatus = 'verified'; // Simulates quick opt-in in mock
    }
  }

  async deleteAccount(): Promise<void> {
    // DPDP Act 2023 erasure
    this.currentUser = {
      uid: '',
      displayName: '',
      preferredLanguage: 'en',
      createdAt: 0,
      updatedAt: 0,
    };
    this.contacts = [];
    this.privateInfo = {
      email: '',
      phone: '',
      consents: {
        dpdpAccepted: false,
        dpdpAcceptedAt: 0,
        foregroundLocation: false,
        backgroundLocation: false,
        deviationNotifications: false,
      },
      sosCountdownSeconds: 5,
      fcmTokens: [],
    };
  }
}
