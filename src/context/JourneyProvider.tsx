import React, { createContext, useContext, useEffect, useState } from 'react';
import { journeyService } from '../services';
import { CorridorRoute, Journey, LatLng } from '../types/safety';

export interface JourneyContextValue {
  activeJourney: Journey | null;
  corridors: CorridorRoute[];
  isLoading: boolean;
  isDeviationAlertVisible: boolean;
  startJourney: (origin: LatLng, destination: LatLng, routeId?: string) => Promise<Journey>;
  endJourney: (reason: 'completed' | 'cancelled') => Promise<void>;
  updateLocation: (location: LatLng) => Promise<void>;
  dismissDeviationAlert: () => void;
  triggerSimulatedDeviation: () => void;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [corridors, setCorridors] = useState<CorridorRoute[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeviationAlertVisible, setIsDeviationAlertVisible] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const routes = await journeyService.getCorridorRoutes();
        setCorridors(routes);
        const current = await journeyService.getActiveJourney();
        setActiveJourney(current);
      } catch {
        // Safe fallback
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const startJourney = async (origin: LatLng, destination: LatLng, routeId?: string): Promise<Journey> => {
    const j = await journeyService.startJourney(origin, destination, routeId);
    setActiveJourney(j);
    return j;
  };

  const endJourney = async (reason: 'completed' | 'cancelled'): Promise<void> => {
    if (activeJourney) {
      await journeyService.endJourney(activeJourney.id, reason);
      setActiveJourney(null);
      setIsDeviationAlertVisible(false);
    }
  };

  const updateLocation = async (location: LatLng): Promise<void> => {
    if (activeJourney) {
      const updated = await journeyService.updateLocation(activeJourney.id, location);
      setActiveJourney({ ...updated });
    }
  };

  const triggerSimulatedDeviation = () => {
    if (activeJourney) {
      setActiveJourney({
        ...activeJourney,
        deviationState: 'deviated',
      });
      setIsDeviationAlertVisible(true);
    }
  };

  const dismissDeviationAlert = () => {
    setIsDeviationAlertVisible(false);
    if (activeJourney) {
      setActiveJourney({
        ...activeJourney,
        deviationState: 'in_cooldown',
      });
    }
  };

  const value: JourneyContextValue = {
    activeJourney,
    corridors,
    isLoading,
    isDeviationAlertVisible,
    startJourney,
    endJourney,
    updateLocation,
    dismissDeviationAlert,
    triggerSimulatedDeviation,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
};

export const useJourney = (): JourneyContextValue => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
