import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme';

export interface TimeSliderProps {
  selectedHour: number;
  onHourChange: (hour: number) => void;
  lightingPercent?: number;
  footfallPercent?: number;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  selectedHour,
  onHourChange,
  lightingPercent = 70,
  footfallPercent = 70,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();

  // Determine current active band details
  let bandName = 'Daytime';
  let bandDelta = '+5 pts';
  let bandHours = '08:00 – 18:00';

  if (selectedHour >= 8 && selectedHour < 18) {
    bandName = 'Daytime Activity';
    bandDelta = '+5 pts';
    bandHours = '08:00 – 18:00';
  } else if (selectedHour >= 18 && selectedHour < 23) {
    bandName = 'Evening Transit';
    bandDelta = '−12 pts';
    bandHours = '18:00 – 23:00';
  } else if (selectedHour >= 5 && selectedHour < 8) {
    bandName = 'Early Morning';
    bandDelta = '−5 pts';
    bandHours = '05:00 – 08:00';
  } else {
    // Night: graded between -20 and -32
    const safetyCondition = (lightingPercent * 0.5 + footfallPercent * 0.5) / 100;
    const nightDelta = Math.round(-20 - (1 - safetyCondition) * 12);
    bandName = 'Late Night (Graded)';
    bandDelta = `${nightDelta} pts`;
    bandHours = '23:00 – 05:00';
  }

  const presetHours = [
    { label: '02:00', hour: 2, tag: 'Night' },
    { label: '06:00', hour: 6, tag: 'Morning' },
    { label: '10:00', hour: 10, tag: 'Day' },
    { label: '14:00', hour: 14, tag: 'Day' },
    { label: '19:00', hour: 19, tag: 'Evening' },
    { label: '23:00', hour: 23, tag: 'Night' },
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
    >
      <View style={styles.topRow}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: colors.ink, ...typography.captionStrong }]}>
            24-Hour Time Simulation
          </Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted80, ...typography.finePrint }]}>
            {bandName} ({bandHours}) · Modifier: {bandDelta}
          </Text>
        </View>

        <View style={[styles.clockBadge, { backgroundColor: colors.surfacePearl, borderRadius: rounded.pill }]}>
          <Text style={[styles.clockText, { color: colors.primary, ...typography.bodyStrong }]}>
            🕒 {String(selectedHour).padStart(2, '0')}:00
          </Text>
        </View>
      </View>

      {/* Preset Pills */}
      <View style={[styles.presetsRow, { marginTop: spacing.sm }]}>
        {presetHours.map((item) => {
          const isSelected = selectedHour === item.hour;
          return (
            <TouchableOpacity
              key={item.hour}
              style={[
                styles.presetPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surfacePearl,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.sm,
                  borderColor: isSelected ? colors.primaryFocus : colors.hairline,
                  borderWidth: 1,
                },
              ]}
              onPress={() => onHourChange(item.hour)}
              accessibilityRole="button"
              accessibilityLabel={`Set time to ${item.label}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color: isSelected ? colors.onPrimary : colors.ink,
                    ...typography.finePrint,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  subtitle: {
    marginTop: 2,
  },
  clockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clockText: {},
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetPill: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  presetText: {
    textAlign: 'center',
  },
});
