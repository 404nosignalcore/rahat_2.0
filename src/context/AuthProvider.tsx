import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services';
import { ConsentPreferences, EmergencyContact, PrivateUserInfo, UserProfile } from '../types/safety';

export interface AuthContextValue {
  user: UserProfile | null;
  privateInfo: PrivateUserInfo | null;
  contacts: EmergencyContact[];
  isLoading: boolean;
  hasConsented: boolean;
  isConsentModalVisible: boolean;
  showConsentModal: () => void;
  hideConsentModal: () => void;
  acceptConsent: () => Promise<void>;
  updateConsents: (consents: Partial<ConsentPreferences>) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [privateInfo, setPrivateInfo] = useState<PrivateUserInfo | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConsentModalVisible, setIsConsentModalVisible] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const u = authService.getCurrentUser();
      const p = await authService.getPrivateInfo();
      setUser(u);
      setPrivateInfo(p);
      if (u) {
        // mock auth has contacts
        const mockAuth = authService as unknown as { getEmergencyContacts?: () => Promise<EmergencyContact[]> };
        if (mockAuth.getEmergencyContacts) {
          const c = await mockAuth.getEmergencyContacts();
          setContacts(c);
        }
      }
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const hasConsented = Boolean(privateInfo?.consents.dpdpAccepted);

  const acceptConsent = async () => {
    await authService.updateConsents({
      dpdpAccepted: true,
      dpdpAcceptedAt: Date.now(),
      foregroundLocation: true,
      backgroundLocation: true,
      deviationNotifications: true,
    });
    setIsConsentModalVisible(false);
    await loadData();
  };

  const updateConsents = async (newConsents: Partial<ConsentPreferences>) => {
    await authService.updateConsents(newConsents);
    await loadData();
  };

  const value: AuthContextValue = {
    user,
    privateInfo,
    contacts,
    isLoading,
    hasConsented,
    isConsentModalVisible,
    showConsentModal: () => setIsConsentModalVisible(true),
    hideConsentModal: () => setIsConsentModalVisible(false),
    acceptConsent,
    updateConsents,
    refreshUserData: loadData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
