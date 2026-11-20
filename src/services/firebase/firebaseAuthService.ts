import { IAuthService } from '../interfaces';
import { ConsentPreferences, EmergencyContact, PrivateUserInfo, UserProfile } from '../../types/safety';

export class FirebaseAuthService implements IAuthService {
  private fallbackAuth: IAuthService;

  constructor(fallbackAuth: IAuthService) {
    this.fallbackAuth = fallbackAuth;
  }

  getCurrentUser(): UserProfile | null {
    return this.fallbackAuth.getCurrentUser();
  }

  async getPrivateInfo(): Promise<PrivateUserInfo | null> {
    return this.fallbackAuth.getPrivateInfo();
  }

  async updateConsents(consents: Partial<ConsentPreferences>): Promise<void> {
    return this.fallbackAuth.updateConsents(consents);
  }

  async updateLanguage(lang: 'en' | 'hi'): Promise<void> {
    return this.fallbackAuth.updateLanguage(lang);
  }

  async addEmergencyContact(
    contact: Omit<EmergencyContact, 'id' | 'createdAt' | 'verificationStatus'>
  ): Promise<EmergencyContact> {
    return this.fallbackAuth.addEmergencyContact(contact);
  }

  async updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<void> {
    // Security rule enforcement: client cannot set verified
    if (updates.verificationStatus === 'verified') {
      throw new Error('Unauthorized: Verification status can only be updated by the SMS verification service.');
    }
    return this.fallbackAuth.updateEmergencyContact(id, updates);
  }

  async deleteEmergencyContact(id: string): Promise<void> {
    return this.fallbackAuth.deleteEmergencyContact(id);
  }

  async requestContactVerification(contactId: string): Promise<void> {
    return this.fallbackAuth.requestContactVerification(contactId);
  }

  async deleteAccount(): Promise<void> {
    // DPDP Act 2023 right to erasure
    return this.fallbackAuth.deleteAccount();
  }
}
