import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useJourney } from '../context/JourneyProvider';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export const RouteScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();
  const {
    corridors,
    activeJourney,
    startJourney,
    endJourney,
    isDeviationAlertVisible,
    dismissDeviationAlert,
    triggerSimulatedDeviation,
  } = useJourney();

  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    corridors[0]?.id || 'route_safest_01'
  );

  const selectedCorridor = corridors.find((c) => c.id === selectedRouteId) || corridors[0];

  const handleStart = async () => {
    if (selectedCorridor) {
      await startJourney(
        selectedCorridor.coordinates[0] || { latitude: 28.6328, longitude: 77.2197 },
        selectedCorridor.coordinates[selectedCorridor.coordinates.length - 1] || { latitude: 28.6258, longitude: 77.2345 },
        selectedCorridor.id
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* Route Corridor Header */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.canvas,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            margin: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.ink, ...typography.tagline }]}>
          {t.routes.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted80, ...typography.caption }]}>
          Corridor: Rajiv Chowk Metro (Gate 3) ➔ Mandi House Metro
        </Text>

        {activeJourney ? (
          <View
            style={[
              styles.activeJourneyBox,
              {
                backgroundColor: colors.safetySafeBackground,
                borderColor: colors.safetySafe,
                borderRadius: rounded.md,
                padding: spacing.sm,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text style={[styles.activeStatus, { color: colors.safetySafe, ...typography.captionStrong }]}>
              ● Active Journey in Progress (Background tracking enabled)
            </Text>
            <Text style={[styles.activeStatusSub, { color: colors.ink, ...typography.finePrint }]}>
              Monitoring deviations outside 90m corridor buffer.
            </Text>

            <View style={[styles.activeActionsRow, { marginTop: spacing.sm }]}>
              <TouchableOpacity
                style={[
                  styles.endButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                  },
                ]}
                onPress={() => endJourney('completed')}
                accessibilityRole="button"
                accessibilityLabel="End journey as completed"
              >
                <Text style={[styles.endButtonText, { color: colors.onPrimary, ...typography.captionStrong }]}>
                  End Journey
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.simButton,
                  {
                    backgroundColor: colors.safetyCautionBackground,
                    borderColor: colors.safetyCaution,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                    marginLeft: spacing.xs,
                  },
                ]}
                onPress={triggerSimulatedDeviation}
                accessibilityRole="button"
                accessibilityLabel="Simulate 90 meter route deviation"
              >
                <Text style={[styles.simButtonText, { color: colors.safetyCaution, ...typography.captionStrong }]}>
                  Simulate 90m Deviation
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.md,
              },
            ]}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Start Safe Journey"
          >
            <Text style={[styles.startButtonText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
              Start Safe Journey
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Route Options Comparison Cards */}
      <View style={[styles.routesList, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.listHeader, { color: colors.ink, ...typography.tagline, marginBottom: spacing.sm }]}>
          Compare Corridor Options
        </Text>

        {corridors.map((route) => {
          const isSelected = selectedRouteId === route.id;
          return (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                {
                  backgroundColor: colors.canvas,
                  borderColor: isSelected ? colors.primary : colors.hairline,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: rounded.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
              onPress={() => setSelectedRouteId(route.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.cardTopRow}>
                <Text style={[styles.routeTitle, { color: colors.ink, ...typography.bodyStrong }]}>
                  {route.title}
                </Text>
                <View
                  style={[
                    styles.tagPill,
                    {
                      backgroundColor:
                        route.tag === 'safest'
                          ? colors.safetySafeBackground
                          : colors.surfacePearl,
                      borderRadius: rounded.sm,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText,
                      {
                        color: route.tag === 'safest' ? colors.safetySafe : colors.ink,
                        ...typography.microLegal,
                      },
                    ]}
                  >
                    {route.tag === 'safest' ? '★ ' : ''}
                    {route.tag.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Metrics grid */}
              <View style={[styles.metricsRow, { marginVertical: spacing.xs }]}>
                <Text style={[styles.metricText, { color: colors.inkMuted80, ...typography.caption }]}>
                  📏 {(route.distanceMeters / 1000).toFixed(1)} km · ⏱️ {Math.round(route.etaSeconds / 60)} min
                </Text>
                <Text style={[styles.metricText, { color: colors.inkMuted80, ...typography.caption }]}>
                  💡 Lighting: {route.lightingPercent}% · 📹 CCTV: {route.cctvPercent}%
                </Text>
              </View>

              <Text style={[styles.rationaleText, { color: colors.inkMuted80, ...typography.finePrint }]}>
                Why ranked: {route.rankingRationale}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Deviation Alert Modal */}
      <Modal
        visible={isDeviationAlertVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissDeviationAlert}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.deviationModalContent,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.safetyCaution,
                borderRadius: rounded.lg,
                padding: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.deviationTitle, { color: colors.safetyCaution, ...typography.displayMd }]}>
              ⚠️ {t.routes.deviationTitle}
            </Text>
            <Text style={[styles.deviationBody, { color: colors.ink, ...typography.body, marginVertical: spacing.sm }]}>
              {t.routes.deviationBody}
            </Text>

            <TouchableOpacity
              style={[
                styles.modalBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  marginTop: spacing.xs,
                },
              ]}
              onPress={dismissDeviationAlert}
              accessibilityRole="button"
            >
              <Text style={[styles.modalBtnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
                {t.routes.imSafeButton}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  marginTop: spacing.xs,
                },
              ]}
              onPress={dismissDeviationAlert}
              accessibilityRole="button"
            >
              <Text style={[styles.modalBtnText, { color: colors.ink, ...typography.bodyStrong }]}>
                {t.routes.recalculateButton}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    borderWidth: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 8,
  },
  activeJourneyBox: {
    borderWidth: 1,
  },
  activeStatus: {
    marginBottom: 2,
  },
  activeStatusSub: {
    marginBottom: 6,
  },
  activeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  endButtonText: {
    textAlign: 'center',
  },
  simButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  simButtonText: {
    textAlign: 'center',
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    textAlign: 'center',
  },
  routesList: {
    paddingBottom: 40,
  },
  listHeader: {
    letterSpacing: -0.2,
  },
  routeCard: {},
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeTitle: {
    flex: 1,
  },
  tagPill: {
    marginLeft: 8,
  },
  tagText: {
    fontWeight: '700',
  },
  metricsRow: {
    gap: 2,
  },
  metricText: {
    lineHeight: 18,
  },
  rationaleText: {
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deviationModalContent: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 2,
  },
  deviationTitle: {
    textAlign: 'center',
  },
  deviationBody: {
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    textAlign: 'center',
  },
});
