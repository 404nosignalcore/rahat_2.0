import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CompareRoutesModal } from '../components/CompareRoutesModal';
import { DeviationSimulationHarness } from '../components/DeviationSimulationHarness';
import { useJourney } from '../context/JourneyProvider';
import { SAVED_PLACES, SavedPlace } from '../data/delhiCorridors';
import { useI18n } from '../i18n';
import { DeviationAlertModal } from '../modals/DeviationAlertModal';
import { useTheme } from '../theme';

export const RouteScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { language } = useI18n();

  const {
    activeJourney,
    corridors,
    selectedCorridor,
    engineState,
    isDeviationAlertVisible,
    lastDeviationDistance,
    backgroundTrackingActive,
    selectCorridor,
    startJourney,
    endJourney,
    simulateDeviationFix,
    simulateGpsLoss,
    simulateReturnOnRoute,
    handleImSafeCooldown,
    handleRecalculate,
    handleShareLocationToCircle,
    dismissDeviationAlert,
  } = useJourney();

  const [isCompareModalVisible, setIsCompareModalVisible] = useState<boolean>(false);
  const [originPlace, setOriginPlace] = useState<SavedPlace>(SAVED_PLACES[2]!); // Rajiv Chowk
  const [destPlace, setDestPlace] = useState<SavedPlace>(SAVED_PLACES[1]!); // Office Barakhamba

  const handleSwapPlaces = () => {
    const temp = originPlace;
    setOriginPlace(destPlace);
    setDestPlace(temp);
  };

  const handleStartFromHeader = async () => {
    if (!selectedCorridor) return;
    await startJourney(originPlace.location, destPlace.location, selectedCorridor.id);
  };

  const handleActivateSosFromModal = () => {
    dismissDeviationAlert();
    Alert.alert('SOS Triggered', 'Opening emergency distress broadcast.');
  };

  const handleShareCircleFromModal = () => {
    handleShareLocationToCircle();
    Alert.alert('Location Shared', 'Your real-time coordinates have been dispatched to your SafeCircle.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* Origin & Destination Corridor Bar */}
      <View
        style={[
          styles.tripCard,
          {
            backgroundColor: colors.canvas,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            margin: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.tripHeader, { color: colors.ink, ...typography.captionStrong, marginBottom: spacing.xs }]}>
          Trip Corridors & Saved Places
        </Text>

        {/* Origin Row */}
        <View style={styles.placeRow}>
          <Text style={[styles.placeIcon, { fontSize: 18 }]}>🟢</Text>
          <View style={styles.placeInfo}>
            <Text style={[styles.placeLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
              STARTING FROM
            </Text>
            <Text style={[styles.placeName, { color: colors.ink, ...typography.bodyStrong }]}>
              {language === 'hi' ? originPlace.nameHindi : originPlace.name}
            </Text>
          </View>
        </View>

        {/* Divider with Swap Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs }}>
          <View style={[styles.tripDivider, { backgroundColor: colors.dividerSoft, flex: 1 }]} />
          <TouchableOpacity
            onPress={handleSwapPlaces}
            accessibilityRole="button"
            accessibilityLabel="Swap origin and destination"
            style={{
              paddingHorizontal: spacing.sm,
              paddingVertical: 2,
              borderRadius: rounded.pill,
              backgroundColor: colors.surfacePearl,
              borderWidth: 1,
              borderColor: colors.hairline,
              marginHorizontal: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 12 }}>⇅ Swap</Text>
          </TouchableOpacity>
          <View style={[styles.tripDivider, { backgroundColor: colors.dividerSoft, flex: 1 }]} />
        </View>

        {/* Destination Row */}
        <View style={styles.placeRow}>
          <Text style={[styles.placeIcon, { fontSize: 18 }]}>📍</Text>
          <View style={styles.placeInfo}>
            <Text style={[styles.placeLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
              DESTINATION
            </Text>
            <Text style={[styles.placeName, { color: colors.ink, ...typography.bodyStrong }]}>
              {language === 'hi' ? destPlace.nameHindi : destPlace.name}
            </Text>
          </View>
        </View>

        {/* Quick Saved Places Chips */}
        <View style={[styles.savedChipsRow, { marginTop: spacing.sm }]}>
          {SAVED_PLACES.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.placeChip,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: destPlace.id === place.id ? colors.primary : colors.hairline,
                  borderRadius: rounded.pill,
                  paddingHorizontal: spacing.sm,
                  minHeight: accessibility.minTouchTarget,
                  borderWidth: 1,
                },
              ]}
              onPress={() => setDestPlace(place)}
              accessibilityRole="button"
              accessibilityLabel={`Select destination ${place.name}`}
            >
              <Text style={[styles.placeChipText, { color: colors.ink, ...typography.finePrint }]}>
                {place.icon} {place.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Journey Status HUD or Route Start Card */}
      {activeJourney ? (
        <View
          style={[
            styles.activeHudCard,
            {
              backgroundColor: colors.canvas,
              borderColor:
                engineState.state === 'deviated'
                  ? colors.safetyDanger
                  : engineState.state === 'in_cooldown'
                  ? colors.safetyCaution
                  : colors.safetySafe,
              borderWidth: 2,
              borderRadius: rounded.lg,
              marginHorizontal: spacing.md,
              marginBottom: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          {/* Tracking Status Pill */}
          <View style={styles.hudTopRow}>
            <View
              style={[
                styles.trackingPill,
                {
                  backgroundColor:
                    engineState.state === 'deviated'
                      ? colors.safetyDangerBackground
                      : colors.safetySafeBackground,
                  borderRadius: rounded.pill,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                },
              ]}
            >
              <Text
                style={[
                  styles.trackingPillText,
                  {
                    color:
                      engineState.state === 'deviated' ? colors.safetyDanger : colors.safetySafe,
                    ...typography.microLegal,
                    fontWeight: '700',
                  },
                ]}
              >
                ● ACTIVE JOURNEY TRACKING
              </Text>
            </View>

            <Text style={[styles.statusTime, { color: colors.inkMuted80, ...typography.microLegal }]}>
              Started {new Date(activeJourney.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {/* Corridor info */}
          <Text style={[styles.activeCorridorTitle, { color: colors.ink, ...typography.tagline, marginTop: 6 }]}>
            {selectedCorridor?.title}
          </Text>
          <Text style={[styles.activeCorridorSub, { color: colors.inkMuted80, ...typography.caption, marginTop: 2 }]}>
            Monitoring 90m corridor deviation buffer. Background location active.
          </Text>

          {/* Metrics Row */}
          <View style={[styles.hudMetricsRow, { marginVertical: spacing.sm }]}>
            <Text style={[styles.hudMetric, { color: colors.ink, ...typography.captionStrong }]}>
              📏 {(selectedCorridor ? selectedCorridor.distanceMeters / 1000 : 1.4).toFixed(1)} km
            </Text>
            <Text style={[styles.hudMetric, { color: colors.ink, ...typography.captionStrong }]}>
              ⏱️ {selectedCorridor ? Math.round(selectedCorridor.etaSeconds / 60) : 18} min
            </Text>
            <Text style={[styles.hudMetric, { color: colors.safetySafe, ...typography.captionStrong }]}>
              💡 {selectedCorridor?.lightingPercent}% Lit
            </Text>
            <Text style={[styles.hudMetric, { color: colors.primary, ...typography.captionStrong }]}>
              📹 {selectedCorridor?.cctvPercent}% CCTV
            </Text>
          </View>

          {/* End Journey Button */}
          <TouchableOpacity
            style={[
              styles.endJourneyBtn,
              {
                backgroundColor: colors.safetySafe,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.xs,
              },
            ]}
            onPress={() => endJourney('completed')}
            accessibilityRole="button"
            accessibilityLabel="Mark journey as completed"
          >
            <Text style={[styles.endJourneyBtnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
              ✓ Complete Journey Safe
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.startCard,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderRadius: rounded.lg,
              marginHorizontal: spacing.md,
              marginBottom: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.startHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.startRouteTitle, { color: colors.ink, ...typography.bodyStrong }]}>
                {selectedCorridor?.title || 'Barakhamba Boulevard Corridor'}
              </Text>
              <Text style={[styles.startRouteSub, { color: colors.inkMuted80, ...typography.caption, marginTop: 2 }]}>
                Ranked: {selectedCorridor?.rankingRationale}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.compareBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.sm,
                  borderWidth: 1,
                  marginLeft: 8,
                },
              ]}
              onPress={() => setIsCompareModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Compare route options"
            >
              <Text style={[styles.compareBtnText, { color: colors.primary, ...typography.captionStrong }]}>
                Compare Routes →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Primary Start Journey CTA */}
          <TouchableOpacity
            style={[
              styles.startMainBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.md,
              },
            ]}
            onPress={handleStartFromHeader}
            accessibilityRole="button"
            accessibilityLabel="Start active journey along corridor"
          >
            <Text style={[styles.startMainBtnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
              Start Safe Journey (Background Tracking)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Dev Simulation Harness */}
      <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.md }}>
        <DeviationSimulationHarness
          engineState={engineState}
          onSimulateDeviationFix={simulateDeviationFix}
          onSimulateGpsLoss={simulateGpsLoss}
          onSimulateReturnOnRoute={simulateReturnOnRoute}
        />
      </View>

      {/* Background Tracking Persistent Notice */}
      <View
        style={[
          styles.persistentNotice,
          {
            backgroundColor: colors.surfacePearl,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            marginHorizontal: spacing.md,
            marginBottom: spacing.xxl,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.noticeTitle, { color: colors.ink, ...typography.captionStrong }]}>
          🔒 Background Location Notice (DPDP Act 2023)
        </Text>
        <Text style={[styles.noticeText, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 4 }]}>
          Background GPS tracking is {backgroundTrackingActive ? 'ACTIVE' : 'INACTIVE'}. It runs strictly during an active journey to detect corridor departures, stops automatically upon journey completion, and purges coordinate records after 30 days.
        </Text>
      </View>

      {/* Compare Routes Modal */}
      <CompareRoutesModal
        visible={isCompareModalVisible}
        corridors={corridors}
        selectedRouteId={selectedCorridor?.id || 'cp_mh_safest'}
        onSelectRoute={(id) => selectCorridor(id)}
        onConfirmStart={handleStartFromHeader}
        onClose={() => setIsCompareModalVisible(false)}
      />

      {/* Deviation Alert Modal */}
      <DeviationAlertModal
        visible={isDeviationAlertVisible}
        distanceMeters={lastDeviationDistance}
        onImSafe={handleImSafeCooldown}
        onRecalculate={handleRecalculate}
        onShareLocation={handleShareCircleFromModal}
        onActivateSos={handleActivateSosFromModal}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tripCard: {
    borderWidth: 1,
  },
  tripHeader: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  placeIcon: {
    marginRight: 10,
  },
  placeInfo: {
    flex: 1,
  },
  placeLabel: {},
  placeName: {},
  tripDivider: {
    height: StyleSheet.hairlineWidth,
  },
  savedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  placeChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeChipText: {},
  activeHudCard: {},
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingPill: {},
  trackingPillText: {},
  statusTime: {},
  activeCorridorTitle: {},
  activeCorridorSub: {
    lineHeight: 18,
  },
  hudMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  hudMetric: {},
  endJourneyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endJourneyBtnText: {
    textAlign: 'center',
  },
  startCard: {
    borderWidth: 1,
  },
  startHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  startRouteTitle: {},
  startRouteSub: {
    lineHeight: 18,
  },
  compareBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnText: {},
  startMainBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startMainBtnText: {
    textAlign: 'center',
  },
  persistentNotice: {
    borderWidth: 1,
  },
  noticeTitle: {},
  noticeText: {
    lineHeight: 18,
  },
});
