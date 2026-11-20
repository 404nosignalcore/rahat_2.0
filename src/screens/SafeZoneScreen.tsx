import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useReports } from '../context/ReportsProvider';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export const SafeZoneScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();
  const { reports, corroborateReport, flagReport } = useReports();
  const [selectedHour, setSelectedHour] = useState<number>(20); // 8:00 PM evening default

  // Calculate dynamic time band modifier
  let timeBandLabel = 'Evening (18:00–23:00) −12 pts';
  let timeDelta = -12;
  if (selectedHour >= 8 && selectedHour < 18) {
    timeBandLabel = 'Day (08:00–18:00) +5 pts';
    timeDelta = 5;
  } else if (selectedHour >= 23 || selectedHour < 5) {
    timeBandLabel = 'Night (23:00–05:00) −25 pts';
    timeDelta = -25;
  } else if (selectedHour >= 5 && selectedHour < 8) {
    timeBandLabel = 'Early Morning (05:00–08:00) −5 pts';
    timeDelta = -5;
  }

  // Base score 82 for Connaught Place / Janpath corridor
  const dynamicScore = Math.max(5, Math.min(98, 82 + timeDelta));

  let scoreColor = colors.safetySafe;
  let scoreBadge = t.safetyLevels.safe;
  let scoreBg = colors.safetySafeBackground;

  if (dynamicScore < 45) {
    scoreColor = colors.safetyDanger;
    scoreBadge = t.safetyLevels.danger;
    scoreBg = colors.safetyDangerBackground;
  } else if (dynamicScore < 75) {
    scoreColor = colors.safetyCaution;
    scoreBadge = t.safetyLevels.caution;
    scoreBg = colors.safetyCautionBackground;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* Active Zone Card */}
      <View
        style={[
          styles.zoneCard,
          {
            backgroundColor: colors.canvas,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            margin: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.zoneTitle, { color: colors.ink, ...typography.tagline }]}>
          Connaught Place & Janpath Corridor
        </Text>
        <Text style={[styles.zoneSubtitle, { color: colors.inkMuted80, ...typography.caption }]}>
          Central Delhi Beat · Geohash: ttnfuh · Monitored Sector
        </Text>

        {/* Dynamic Score Display */}
        <View style={styles.scoreRow}>
          <View style={[styles.scoreBadge, { backgroundColor: scoreBg, borderRadius: rounded.pill }]}>
            <Text style={[styles.scoreValue, { color: scoreColor, ...typography.displayLg }]}>
              {dynamicScore}
            </Text>
            <Text style={[styles.scoreStatus, { color: scoreColor, ...typography.captionStrong }]}>
              {scoreBadge}
            </Text>
          </View>

          <View style={styles.scoreExplainWrap}>
            <Text style={[styles.explainHeader, { color: colors.ink, ...typography.captionStrong }]}>
              Score Calculation:
            </Text>
            <Text style={[styles.explainItem, { color: colors.inkMuted80, ...typography.finePrint }]}>
              • Base Infrastructure (Lighting 92%, CCTV 85%): +82
            </Text>
            <Text style={[styles.explainItem, { color: colors.inkMuted80, ...typography.finePrint }]}>
              • Time of Day ({timeBandLabel}): {timeDelta > 0 ? `+${timeDelta}` : timeDelta}
            </Text>
            <Text style={[styles.explainItem, { color: colors.inkMuted80, ...typography.finePrint }]}>
              • Safe Havens: 4 verified points within 400m
            </Text>
          </View>
        </View>

        {/* 24-Hour Time Slider Simulation */}
        <View style={[styles.timeSliderContainer, { marginTop: spacing.md }]}>
          <Text style={[styles.timeSliderLabel, { color: colors.ink, ...typography.captionStrong }]}>
            Simulate Time of Day: {String(selectedHour).padStart(2, '0')}:00 hrs
          </Text>
          <View style={styles.timeButtonsRow}>
            {[8, 14, 19, 23, 2, 6].map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.hourPill,
                  {
                    backgroundColor: selectedHour === hour ? colors.primary : colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.sm,
                  },
                ]}
                onPress={() => setSelectedHour(hour)}
                accessibilityRole="button"
                accessibilityLabel={`Set simulated time to ${hour} hours`}
              >
                <Text
                  style={[
                    styles.hourPillText,
                    {
                      color: selectedHour === hour ? colors.onPrimary : colors.ink,
                      ...typography.finePrint,
                    },
                  ]}
                >
                  {String(hour).padStart(2, '0')}:00
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Community Hazard Reports Feed */}
      <View style={[styles.reportsSection, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.tagline, marginBottom: spacing.sm }]}>
          Community Safety Reports ({reports.length})
        </Text>
        <Text style={[styles.unverifiedNotice, { color: colors.inkMuted48, ...typography.finePrint, marginBottom: spacing.md }]}>
          Notice: Unverified community reports carry a 0.5x score penalty. Reports corroborated by ≥ 3 users carry full weight.
        </Text>

        {reports.map((report) => (
          <View
            key={report.id}
            style={[
              styles.reportItem,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                padding: spacing.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            <View style={styles.reportHeader}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      report.severity >= 4 ? colors.safetyDangerBackground : colors.surfacePearl,
                    borderRadius: rounded.sm,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: report.severity >= 4 ? colors.safetyDanger : colors.ink,
                      ...typography.microLegal,
                    },
                  ]}
                >
                  {t.categories[report.category] || report.category} · Severity {report.severity}/5
                </Text>
              </View>

              <Text style={[styles.badgeText, { color: colors.primary, ...typography.microLegal }]}>
                {t.verificationBadges[report.verificationStatus]}
              </Text>
            </View>

            <Text style={[styles.reportTitle, { color: colors.ink, ...typography.bodyStrong, marginTop: 6 }]}>
              {report.title}
            </Text>
            <Text style={[styles.reportDesc, { color: colors.inkMuted80, ...typography.caption, marginTop: 4 }]}>
              {report.description}
            </Text>

            {/* Action buttons */}
            <View style={[styles.reportActions, { marginTop: spacing.sm }]}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                  },
                ]}
                onPress={() => corroborateReport(report.id)}
                accessibilityRole="button"
                accessibilityLabel="Confirm I was here"
              >
                <Text style={[styles.actionBtnText, { color: colors.primary, ...typography.captionStrong }]}>
                  ✓ I Was Here ({report.corroborationCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                    marginLeft: spacing.xs,
                  },
                ]}
                onPress={() => flagReport(report.id, 'outdated')}
                accessibilityRole="button"
                accessibilityLabel="Flag report as outdated"
              >
                <Text style={[styles.actionBtnText, { color: colors.inkMuted48, ...typography.caption }]}>
                  Flag ({report.flagCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  zoneCard: {
    borderWidth: 1,
  },
  zoneTitle: {
    marginBottom: 2,
  },
  zoneSubtitle: {
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 90,
  },
  scoreValue: {
    fontWeight: '700',
  },
  scoreStatus: {
    marginTop: 2,
  },
  scoreExplainWrap: {
    flex: 1,
    marginLeft: 14,
  },
  explainHeader: {
    marginBottom: 2,
  },
  explainItem: {
    lineHeight: 16,
  },
  timeSliderContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  timeSliderLabel: {
    marginBottom: 8,
  },
  timeButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hourPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourPillText: {
    fontWeight: '600',
  },
  reportsSection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  unverifiedNotice: {
    lineHeight: 16,
  },
  reportItem: {
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badgeText: {
    fontWeight: '600',
  },
  reportTitle: {
    lineHeight: 20,
  },
  reportDesc: {
    lineHeight: 18,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    textAlign: 'center',
  },
});
