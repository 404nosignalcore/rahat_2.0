import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { sosService } from '../services';
import { CreateAlertInput } from '../services';
import { EmergencyAlert, LatLng } from '../types/safety';

export interface SOSContextValue {
  activeAlert: EmergencyAlert | null;
  countdownSeconds: number | null;
  isDispatching: boolean;
  startCountdown: (totalSeconds?: number) => void;
  cancelCountdown: () => void;
  sendImmediately: () => Promise<void>;
  cancelAlert: () => Promise<void>;
  resolveAlert: () => Promise<void>;
  triggerOfflineFallback: () => Promise<void>;
}

const SOSContext = createContext<SOSContextValue | null>(null);

export const SOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const a = await sosService.getActiveAlert();
        setActiveAlert(a);
      } catch {
        // Safe fallback
      }
    };
    init();
  }, []);

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
        coordsSource: 'gps',
        source: 'app',
        communityRescue: true,
      };
      const alert = await sosService.triggerAlert(input);
      setActiveAlert(alert);
    } catch {
      // Offline fallback
    } finally {
      setIsDispatching(false);
    }
  };

  const startCountdown = (totalSeconds: number = 5) => {
    clearTimer();
    setCountdownSeconds(totalSeconds);

    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearTimer();
          dispatchAlert();
          return null;
        }
        return prev - 1;
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

  const value: SOSContextValue = {
    activeAlert,
    countdownSeconds,
    isDispatching,
    startCountdown,
    cancelCountdown,
    sendImmediately,
    cancelAlert,
    resolveAlert,
    triggerOfflineFallback,
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
