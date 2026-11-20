import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export const ZoneLegend: React.FC = () => {
  const { colors, typography, rounded, spacing } = useTheme();
  const { t } = useI18n();

  const items = [
    {
      level: 'safe',
      label: t.safetyLevels.safe,
      range: '≥ 75',
      icon: '🟢',
      color: colors.safetySafe,
      bg: colors.safetySafeBackground,
      desc: t.safetyLevels.safeDescription,
    },
    {
      level: 'caution',
      label: t.safetyLevels.caution,
      range: '45–74',
      icon: '🟡',
      color: colors.safetyCaution,
      bg: colors.safetyCautionBackground,
      desc: t.safetyLevels.cautionDescription,
    },
    {
      level: 'danger',
      label: t.safetyLevels.danger,
      range: '< 45',
      icon: '🔴',
      color: colors.safetyDanger,
      bg: colors.safetyDangerBackground,
      desc: t.safetyLevels.dangerDescription,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.canvas,
          borderColor: colors.hairline,
          borderRadius: rounded.lg,
          padding: spacing.md,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel="Safety score legend"
    >
      <Text style={[styles.title, { color: colors.ink, ...typography.captionStrong, marginBottom: spacing.xs }]}>
        Safety Score Categories (Explainable Scale 5–98)
      </Text>

      <View style={styles.legendRow}>
        {items.map((item) => (
          <View
            key={item.level}
            style={[
              styles.legendPill,
              {
                backgroundColor: item.bg,
                borderColor: item.color,
                borderRadius: rounded.pill,
                paddingHorizontal: spacing.sm,
                paddingVertical: 4,
              },
            ]}
          >
            <Text style={[styles.legendText, { color: item.color, ...typography.microLegal }]}>
              {item.icon} {item.label} ({item.range})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendPill: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontWeight: '700',
  },
});
