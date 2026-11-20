import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DeviationEngineState } from '../engines/deviationEngine';
import { useTheme } from '../theme';

export interface DeviationSimulationHarnessProps {
  engineState: DeviationEngineState;
  onSimulateDeviationFix: () => void;
  onSimulateGpsLoss: () => void;
  onSimulateReturnOnRoute: () => void;
}

export const DeviationSimulationHarness: React.FC<DeviationSimulationHarnessProps> = ({
  engineState,
  onSimulateDeviationFix,
  onSimulateGpsLoss,
  onSimulateReturnOnRoute,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();

  let stateBadgeColor = colors.safetySafe;
  let stateBg = colors.safetySafeBackground;

  if (engineState.state === 'deviated') {
    stateBadgeColor = colors.safetyDanger;
    stateBg = colors.safetyDangerBackground;
  } else if (engineState.state === 'in_cooldown') {
    stateBadgeColor = colors.safetyCaution;
    stateBg = colors.safetyCautionBackground;
  }

  const isCooldown =
    engineState.cooldownUntilTimestamp !== null &&
    Date.now() < engineState.cooldownUntilTimestamp;

  const secondsRemaining = isCooldown
    ? Math.max(0, Math.round(((engineState.cooldownUntilTimestamp ?? 0) - Date.now()) / 1000))
    : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfacePearl,
          borderColor: colors.hairline,
          borderRadius: rounded.lg,
          padding: spacing.md,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.ink, ...typography.captionStrong }]}>
            🛠️ Dev Simulation Harness (Route & GPS)
          </Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted80, ...typography.finePrint }]}>
            Inject synthesized GPS fixes to verify 90m boundary, consecutive fixes, and cooldown.
          </Text>
        </View>

        <View style={[styles.statePill, { backgroundColor: stateBg, borderColor: stateBadgeColor, borderRadius: rounded.pill }]}>
          <Text style={[styles.statePillText, { color: stateBadgeColor, ...typography.microLegal }]}>
            {engineState.state.toUpperCase()} ({engineState.consecutiveDeviations}/3 fixes)
          </Text>
        </View>
      </View>

      {/* Diagnostics row */}
      <View style={[styles.diagRow, { marginVertical: spacing.xs }]}>
        <Text style={[styles.diagText, { color: colors.inkMuted80, ...typography.finePrint }]}>
          • Last Deviation: {engineState.lastDeviationDistanceMeters ? `${Math.round(engineState.lastDeviationDistanceMeters)}m` : 'None'}
        </Text>
        {isCooldown && (
          <Text style={[styles.diagText, { color: colors.safetyCaution, ...typography.finePrint, fontWeight: '700' }]}>
            • Cooldown Active: {secondsRemaining}s remaining
          </Text>
        )}
      </View>

      {/* Action Buttons Grid */}
      <View style={[styles.actionsRow, { marginTop: spacing.xs }]}>
        {/* Simulate 90m deviation */}
        <TouchableOpacity
          style={[
            styles.simBtn,
            {
              backgroundColor: colors.safetyCautionBackground,
              borderColor: colors.safetyCaution,
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
              paddingHorizontal: spacing.sm,
              flex: 1,
              marginRight: 4,
            },
          ]}
          onPress={onSimulateDeviationFix}
          accessibilityRole="button"
          accessibilityLabel="Simulate 90 meter route deviation fix"
        >
          <Text style={[styles.simBtnText, { color: colors.safetyCaution, ...typography.microLegal, fontWeight: '700' }]}>
            + 90m Fix ({engineState.consecutiveDeviations}/3)
          </Text>
        </TouchableOpacity>

        {/* Simulate GPS loss */}
        <TouchableOpacity
          style={[
            styles.simBtn,
            {
              backgroundColor: colors.surfacePearl,
              borderColor: colors.hairline,
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
              paddingHorizontal: spacing.sm,
              flex: 1,
              marginHorizontal: 4,
            },
          ]}
          onPress={onSimulateGpsLoss}
          accessibilityRole="button"
          accessibilityLabel="Simulate GPS loss accuracy greater than 75m"
        >
          <Text style={[styles.simBtnText, { color: colors.ink, ...typography.microLegal }]}>
            {'📡 GPS Loss (>75m)'}
          </Text>
        </TouchableOpacity>

        {/* Simulate return on route */}
        <TouchableOpacity
          style={[
            styles.simBtn,
            {
              backgroundColor: colors.safetySafeBackground,
              borderColor: colors.safetySafe,
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
              paddingHorizontal: spacing.sm,
              flex: 1,
              marginLeft: 4,
            },
          ]}
          onPress={onSimulateReturnOnRoute}
          accessibilityRole="button"
          accessibilityLabel="Simulate return inside 90 meter corridor"
        >
          <Text style={[styles.simBtnText, { color: colors.safetySafe, ...typography.microLegal, fontWeight: '700' }]}>
            ✓ Return to Route
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: 2,
  },
  statePill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statePillText: {
    fontWeight: '700',
  },
  diagRow: {},
  diagText: {
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simBtn: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simBtnText: {
    textAlign: 'center',
  },
});
