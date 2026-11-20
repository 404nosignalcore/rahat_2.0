import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  applyUserSafeCooldown,
  DEFAULT_DEVIATION_CONFIG,
  DeviationEngineState,
  evaluateRouteDeviation,
  INITIAL_DEVIATION_STATE,
} from '../engines/deviationEngine';
import { journeyService } from '../services';
import { CorridorRoute, Journey, LatLng } from '../types/safety';
import { GeoFix } from '../utils/geo';

export interface JourneyContextValue {
  activeJourney: Journey | null;
  corridors: CorridorRoute[];
  selectedCorridor: CorridorRoute | null;
  isLoading: boolean;
  engineState: DeviationEngineState;
  isDeviationAlertVisible: boolean;
  lastDeviationDistance: number;
  backgroundTrackingActive: boolean;
  selectCorridor: (routeId: string) => void;
  startJourney: (origin: LatLng, destination: LatLng, routeId?: string) => Promise<Journey>;
  endJourney: (reason: 'completed' | 'cancelled') => Promise<void>;
  updateLocation: (fix: GeoFix) => Promise<void>;
  simulateDeviationFix: () => void;
  simulateGpsLoss: () => void;
  simulateReturnOnRoute: () => void;
  handleImSafeCooldown: () => void;
  handleRecalculate: () => void;
  handleShareLocationToCircle: () => void;
  dismissDeviationAlert: () => void;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

export const JourneyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [corridors, setCorridors] = useState<CorridorRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('cp_mh_safest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Deviation State Machine
  const [engineState, setEngineState] = useState<DeviationEngineState>(INITIAL_DEVIATION_STATE);
  const [isDeviationAlertVisible, setIsDeviationAlertVisible] = useState<boolean>(false);
  const [lastDeviationDistance, setLastDeviationDistance] = useState<number>(0);
  const [backgroundTrackingActive, setBackgroundTrackingActive] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const routes = await journeyService.getCorridorRoutes();
        setCorridors(routes);
        if (routes[0]) {
          setSelectedRouteId(routes[0].id);
        }
        const current = await journeyService.getActiveJourney();
        setActiveJourney(current);
        if (current && current.status === 'active') {
          setBackgroundTrackingActive(true);
        }
      } catch {
        // Safe fallback
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const selectedCorridor =
    corridors.find((c) => c.id === selectedRouteId) || corridors[0] || null;

  const selectCorridor = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  const startJourney = async (
    origin: LatLng,
    destination: LatLng,
    routeId?: string
  ): Promise<Journey> => {
    const idToUse = routeId || selectedRouteId;
    const j = await journeyService.startJourney(origin, destination, idToUse);
    setActiveJourney(j);
    setEngineState(INITIAL_DEVIATION_STATE);
    setIsDeviationAlertVisible(false);
    setBackgroundTrackingActive(true);
    return j;
  };

  const endJourney = async (reason: 'completed' | 'cancelled'): Promise<void> => {
    if (activeJourney) {
      await journeyService.endJourney(activeJourney.id, reason);
      setActiveJourney(null);
      setEngineState(INITIAL_DEVIATION_STATE);
      setIsDeviationAlertVisible(false);
      setBackgroundTrackingActive(false);
    }
  };

  const evaluateFix = (fix: GeoFix) => {
    if (!activeJourney || !selectedCorridor) return;

    const result = evaluateRouteDeviation(
      engineState,
      fix,
      selectedCorridor.coordinates,
      DEFAULT_DEVIATION_CONFIG
    );

    setEngineState(result.nextState);
    if (result.distanceMeters !== undefined) {
      setLastDeviationDistance(result.distanceMeters);
    }

    if (result.alertTriggered) {
      setIsDeviationAlertVisible(true);
      setActiveJourney((prev) =>
        prev ? { ...prev, deviationState: 'deviated' } : null
      );
    } else if (result.reason === 'on_route') {
      setIsDeviationAlertVisible(false);
      setActiveJourney((prev) =>
        prev ? { ...prev, deviationState: 'on_route' } : null
      );
    }
  };

  const updateLocation = async (fix: GeoFix): Promise<void> => {
    if (activeJourney) {
      const updated = await journeyService.updateLocation(activeJourney.id, fix);
      setActiveJourney({ ...updated });
      evaluateFix(fix);
    }
  };

  // Dev Simulation Triggers
  const simulateDeviationFix = () => {
    if (!selectedCorridor) return;
    const firstCoord = selectedCorridor.coordinates[0] || {
      latitude: 28.6328,
      longitude: 77.2197,
    };
    // Displace by 0.002 deg latitude (~222 meters north, cleanly exceeding 90m buffer)
    const displacedFix: GeoFix = {
      latitude: firstCoord.latitude + 0.002,
      longitude: firstCoord.longitude,
      accuracy: 10,
    };
    evaluateFix(displacedFix);
  };

  const simulateGpsLoss = () => {
    if (!selectedCorridor) return;
    const firstCoord = selectedCorridor.coordinates[0] || {
      latitude: 28.6328,
      longitude: 77.2197,
    };
    // Inaccurate fix: accuracy = 95m (> 75m threshold)
    const inaccurateFix: GeoFix = {
      latitude: firstCoord.latitude + 0.002,
      longitude: firstCoord.longitude,
      accuracy: 95,
    };
    evaluateFix(inaccurateFix);
  };

  const simulateReturnOnRoute = () => {
    if (!selectedCorridor) return;
    const onRouteCoord = selectedCorridor.coordinates[0] || {
      latitude: 28.6328,
      longitude: 77.2197,
    };
    const validOnRouteFix: GeoFix = {
      latitude: onRouteCoord.latitude,
      longitude: onRouteCoord.longitude,
      accuracy: 8,
    };
    evaluateFix(validOnRouteFix);
  };

  // Modal Actions
  const handleImSafeCooldown = () => {
    const next = applyUserSafeCooldown(engineState, 120);
    setEngineState(next);
    setIsDeviationAlertVisible(false);
    if (activeJourney) {
      setActiveJourney({ ...activeJourney, deviationState: 'in_cooldown' });
    }
  };

  const handleRecalculate = () => {
    setIsDeviationAlertVisible(false);
    // In production: triggers route recalculation
  };

  const handleShareLocationToCircle = () => {
    setIsDeviationAlertVisible(false);
    // In production: transmits location update to circle
  };

  const dismissDeviationAlert = () => {
    setIsDeviationAlertVisible(false);
  };

  const value: JourneyContextValue = {
    activeJourney,
    corridors,
    selectedCorridor,
    isLoading,
    engineState,
    isDeviationAlertVisible,
    lastDeviationDistance,
    backgroundTrackingActive,
    selectCorridor,
    startJourney,
    endJourney,
    updateLocation,
    simulateDeviationFix,
    simulateGpsLoss,
    simulateReturnOnRoute,
    handleImSafeCooldown,
    handleRecalculate,
    handleShareLocationToCircle,
    dismissDeviationAlert,
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
