import * as Haptics from 'expo-haptics';
import * as SMS from 'expo-sms';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { CreateAlertInput, sosService } from '../services';
import { CoordsSource, EmergencyAlert, LatLng } from '../types/safety';

export type CountdownOption = 3 | 5 | 10;

export interface SOSContextValue {
  activeAlert: EmergencyAlert | null;
  countdownSeconds: number | null;
  countdownDuration: CountdownOption;
  isDispatching: boolean;
  coordsSource: CoordsSource;
  setCountdownDuration: (duration: CountdownOption) => void;
  setCoordsSource: (source: CoordsSource) => void;
  startCountdown: (totalSeconds?: CountdownOption) => void;
  cancelCountdown: () => void;
  sendImmediately: () => Promise<void>;
  cancelAlert: () => Promise<void>;
  resolveAlert: () => Promise<void>;
  triggerOfflineFallback: () => Promise<void>;
  sendOfflineSmsToContacts: () => Promise<void>;
}

const SOSContext = createContext<SOSContextValue | null>(null);

export const SOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [countdownDuration, setCountdownDuration] = useState<CountdownOption>(5);
  const [coordsSource, setCoordsSource] = useState<CoordsSource>('gps');
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const a = await sosService.getActiveAlert();
        setActiveAlert(a);
        if (a) {
          setCoordsSource(a.coordsSource);
        }
      } catch {
        // Safe fallback
      }
    };
    init();
  }, []);

  const triggerHapticTick = () => {
    try {
      if (Haptics && Haptics.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    } catch {
      // Haptics unavailable on emulator or web
    }
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const dispatchAlert = async (location: LatLng = { latitude: 28.6289, longitude: 77.2195 }) => {
    clearTimer();
    setCountdownSeconds(null);
    setIsDispatching(true);

    try {
      const input: CreateAlertInput = {
        location,
        coordsSource,
        source: 'app',
        communityRescue: true,
      };
      const alert = await sosService.triggerAlert(input);
      setActiveAlert(alert);
    } catch {
      // Fallback if network or service throws
      if (activeAlert) {
        const offline = await sosService.simulateOfflineDispatch(activeAlert.id);
        setActiveAlert({ ...offline });
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const startCountdown = (totalSeconds?: CountdownOption) => {
    clearTimer();
    const duration = totalSeconds ?? countdownDuration;
    setCountdownSeconds(duration);
    triggerHapticTick();

    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearTimer();
          dispatchAlert();
          return null;
        }
        triggerHapticTick();
        return (prev - 1) as CountdownOption;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    clearTimer();
    setCountdownSeconds(null);
  };

  const sendImmediately = async () => {
    clearTimer();
    await dispatchAlert();
  };

  const cancelAlert = async () => {
    if (activeAlert) {
      await sosService.cancelAlert(activeAlert.id);
      setActiveAlert(null);
    }
  };

  const resolveAlert = async () => {
    if (activeAlert) {
      await sosService.resolveAlert(activeAlert.id);
      setActiveAlert(null);
    }
  };

  const triggerOfflineFallback = async () => {
    if (activeAlert) {
      const updated = await sosService.simulateOfflineDispatch(activeAlert.id);
      setActiveAlert({ ...updated });
    }
  };

  /**
   * Honest Native SMS dispatch using expo-sms (Section 6 & 1.4):
   * Opens the device SMS composer with emergency maps link.
   * Tracks exact outcome:
   * - offline_fallback_prepared (composer opened)
   * - user_sent_via_sms (user confirmed and sent in SMS app)
   */
  const sendOfflineSmsToContacts = async () => {
    if (!activeAlert) return;

    const lat = activeAlert.location.latitude;
    const lng = activeAlert.location.longitude;
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `EMERGENCY: I need help. My current location is ${mapsUrl} (Sent via Rahat Offline Fallback)`;

    const phoneNumbers = activeAlert.contactDeliveries.map((c) => c.phone);

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable && phoneNumbers.length > 0) {
        // First mark as offline_fallback_prepared
        await triggerOfflineFallback();

        const result = await SMS.sendSMSAsync(phoneNumbers, message);
        if (result.result === 'sent') {
          // Update all contact deliveries to user_sent_via_sms
          let current = activeAlert;
          for (const delivery of activeAlert.contactDeliveries) {
            current = await sosService.recordUserSentSms(current.id, delivery.contactId);
          }
          setActiveAlert({ ...current });
        }
      } else {
        // SMS unavailable, keep offline fallback prepared state
        await triggerOfflineFallback();
      }
    } catch {
      await triggerOfflineFallback();
    }
  };

  const value: SOSContextValue = {
    activeAlert,
    countdownSeconds,
    countdownDuration,
    isDispatching,
    coordsSource,
    setCountdownDuration,
    setCoordsSource,
    startCountdown,
    cancelCountdown,
    sendImmediately,
    cancelAlert,
    resolveAlert,
    triggerOfflineFallback,
    sendOfflineSmsToContacts,
  };

  return <SOSContext.Provider value={value}>{children}</SOSContext.Provider>;
};

export const useSOS = (): SOSContextValue => {
  const context = useContext(SOSContext);
  if (!context) {
    throw new Error('useSOS must be used within an SOSProvider');
  }
  return context;
};
