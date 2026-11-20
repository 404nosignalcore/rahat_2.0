import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CreateReportModal } from '../components/CreateReportModal';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { SafeZoneMap } from '../components/SafeZoneMap';
import { TimeSlider } from '../components/TimeSlider';
import { ZoneExplanationModal } from '../components/ZoneExplanationModal';
import { ZoneLegend } from '../components/ZoneLegend';
import { useReports } from '../context/ReportsProvider';
import { DELHI_NCR_ZONES, DelhiZone } from '../data/delhiZones';
import { calculateDynamicZoneScore } from '../engines/safetyRiskEngine';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { SafetyReport } from '../types/safety';

export const SafeZoneScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t, language } = useI18n();
  const { reports, createReport, corroborateReport, flagReport } = useReports();

  const [selectedZone, setSelectedZone] = useState<DelhiZone>(DELHI_NCR_ZONES[0]!);
  const [selectedHour, setSelectedHour] = useState<number>(20); // 8:00 PM default
  const [isExplanationVisible, setIsExplanationVisible] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<SafetyReport | null>(null);

  // Filter incidents matching selected zone
  const zoneIncidents = reports.filter((r) =>
    r.areaTag.toLowerCase().includes(selectedZone.areaTag.toLowerCase())
  );

  const scoreResult = calculateDynamicZoneScore({
    lightingPercent: selectedZone.lightingPercent,
    cctvPercent: selectedZone.cctvPercent,
    footfallPercent: selectedZone.footfallPercent,
    hour: selectedHour,
    incidents: zoneIncidents.map((r) => ({
      category: r.category,
      severity: r.severity,
      verificationStatus: r.verificationStatus,
    })),
    safeHavensCount: selectedZone.safeHavensCount,
  });

  let scoreColor = colors.safetySafe;
  let scoreBadge = t.safetyLevels.safe;
  let scoreBg = colors.safetySafeBackground;

  if (scoreResult.level === 'danger') {
    scoreColor = colors.safetyDanger;
    scoreBadge = t.safetyLevels.danger;
    scoreBg = colors.safetyDangerBackground;
  } else if (scoreResult.level === 'caution') {
    scoreColor = colors.safetyCaution;
    scoreBadge = t.safetyLevels.caution;
    scoreBg = colors.safetyCautionBackground;
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* Active Zone Score Hero Card */}
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
        <View style={styles.zoneHeader}>
          <View style={styles.zoneTitleWrap}>
            <Text style={[styles.zoneTitle, { color: colors.ink, ...typography.tagline }]}>
              {language === 'hi' ? selectedZone.nameHindi : selectedZone.name}
            </Text>
            <Text style={[styles.zoneSubtitle, { color: colors.inkMuted80, ...typography.caption }]}>
              {selectedZone.areaTag} · Geohash: {selectedZone.geohash}
            </Text>
          </View>

          {/* Tap to inspect explanation button */}
          <TouchableOpacity
            style={[
              styles.explainBtn,
              {
                backgroundColor: colors.surfacePearl,
                borderColor: colors.hairline,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                paddingHorizontal: spacing.sm,
              },
            ]}
            onPress={() => setIsExplanationVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="View point-by-point score explanation"
          >
            <Text style={[styles.explainBtnText, { color: colors.primary, ...typography.captionStrong }]}>
              Why {scoreResult.score}? ℹ️
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Score Display Row */}
        <TouchableOpacity
          style={[styles.scoreRow, { marginTop: spacing.xs }]}
          onPress={() => setIsExplanationVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Dynamic score ${scoreResult.score}. Level ${scoreBadge}. Tap for breakdown.`}
        >
          <View style={[styles.scoreBadge, { backgroundColor: scoreBg, borderColor: scoreColor, borderRadius: rounded.pill }]}>
            <Text style={[styles.scoreValue, { color: scoreColor, ...typography.displayLg }]}>
              {scoreResult.score}
            </Text>
            <Text style={[styles.scoreStatus, { color: scoreColor, ...typography.captionStrong }]}>
              {scoreBadge}
            </Text>
          </View>

          <View style={styles.scoreSummaryWrap}>
            <Text style={[styles.scoreSummaryTitle, { color: colors.ink, ...typography.bodyStrong }]}>
              Dynamic Risk Score (Scale 5–98)
            </Text>
            <Text style={[styles.scoreSummaryDesc, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 2 }]}>
              • Lighting: {selectedZone.lightingPercent}% · CCTV: {selectedZone.cctvPercent}%
            </Text>
            <Text style={[styles.scoreSummaryDesc, { color: colors.inkMuted80, ...typography.finePrint }]}>
              • Safe Havens: {selectedZone.safeHavensCount} verified points
            </Text>
            <Text style={[styles.tapHint, { color: colors.primary, ...typography.microLegal, marginTop: 4 }]}>
              Tap score for complete itemized breakdown →
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 24-Hour Time Slider */}
      <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <TimeSlider
          selectedHour={selectedHour}
          onHourChange={setSelectedHour}
          lightingPercent={selectedZone.lightingPercent}
          footfallPercent={selectedZone.footfallPercent}
        />
      </View>

      {/* Delhi NCR Zone Map Polygons */}
      <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <SafeZoneMap
          selectedZoneId={selectedZone.id}
          selectedHour={selectedHour}
          reports={reports}
          onSelectZone={(z) => setSelectedZone(z)}
        />
      </View>

      {/* Accessible Score Legend */}
      <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.md }}>
        <ZoneLegend />
      </View>

      {/* Community Hazard Reports Feed */}
      <View style={[styles.reportsSection, { paddingHorizontal: spacing.md }]}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.tagline }]}>
              Community Reports ({reports.length})
            </Text>
            <Text style={[styles.unverifiedNotice, { color: colors.inkMuted48, ...typography.finePrint, marginTop: 2 }]}>
              Unverified: 0.5x weight · Corroborated (≥3): full weight
            </Text>
          </View>

          {/* Report Hazard Action Button */}
          <TouchableOpacity
            style={[
              styles.reportNewBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                paddingHorizontal: spacing.md,
              },
            ]}
            onPress={() => setIsCreateModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Report new safety hazard"
          >
            <Text style={[styles.reportNewText, { color: colors.onPrimary, ...typography.captionStrong }]}>
              + Report Hazard
            </Text>
          </TouchableOpacity>
        </View>

        {reports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={[
              styles.reportItem,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                padding: spacing.md,
                marginTop: spacing.sm,
              },
            ]}
            onPress={() => setSelectedReport(report)}
            accessibilityRole="button"
            accessibilityLabel={`Inspect report ${report.title}`}
          >
            <View style={styles.reportHeader}>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      report.severity >= 4 ? colors.safetyDangerBackground : colors.surfacePearl,
                    borderRadius: rounded.sm,
                    paddingHorizontal: 8,
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
            <Text style={[styles.reportDesc, { color: colors.inkMuted80, ...typography.caption, marginTop: 4 }]} numberOfLines={2}>
              {report.description}
            </Text>

            {/* Quick action bar */}
            <View style={[styles.reportQuickRow, { marginTop: spacing.sm }]}>
              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.sm,
                  },
                ]}
                onPress={() => corroborateReport(report.id)}
                accessibilityRole="button"
                accessibilityLabel="Confirm I was here"
              >
                <Text style={[styles.quickActionText, { color: colors.primary, ...typography.captionStrong }]}>
                  ✓ I Was Here ({report.corroborationCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.sm,
                    marginLeft: spacing.xs,
                  },
                ]}
                onPress={() => flagReport(report.id, 'outdated')}
                accessibilityRole="button"
                accessibilityLabel="Flag report as outdated"
              >
                <Text style={[styles.quickActionText, { color: colors.inkMuted48, ...typography.caption }]}>
                  Flag Outdated ({report.flagCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionBtn,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.sm,
                    marginLeft: spacing.xs,
                  },
                ]}
                onPress={() => setSelectedReport(report)}
                accessibilityRole="button"
                accessibilityLabel="Open discussion comments"
              >
                <Text style={[styles.quickActionText, { color: colors.inkMuted80, ...typography.caption }]}>
                  💬 Details
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      <ZoneExplanationModal
        visible={isExplanationVisible}
        zoneName={language === 'hi' ? selectedZone.nameHindi : selectedZone.name}
        result={scoreResult}
        onClose={() => setIsExplanationVisible(false)}
      />

      <CreateReportModal
        visible={isCreateModalVisible}
        defaultLocation={selectedZone.center}
        defaultAreaTag={selectedZone.areaTag}
        onClose={() => setIsCreateModalVisible(false)}
        onSubmit={createReport}
      />

      <ReportDetailModal
        visible={Boolean(selectedReport)}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onCorroborate={corroborateReport}
        onFlag={flagReport}
        onAddComment={async () => {}}
      />
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
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  zoneTitleWrap: {
    flex: 1,
  },
  zoneTitle: {},
  zoneSubtitle: {
    marginTop: 2,
  },
  explainBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  explainBtnText: {},
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 100,
    borderWidth: 1,
  },
  scoreValue: {
    lineHeight: 46,
  },
  scoreStatus: {
    textTransform: 'uppercase',
  },
  scoreSummaryWrap: {
    flex: 1,
    marginLeft: 14,
  },
  scoreSummaryTitle: {},
  scoreSummaryDesc: {
    lineHeight: 16,
  },
  tapHint: {
    fontWeight: '600',
  },
  reportsSection: {
    paddingBottom: 48,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  unverifiedNotice: {},
  reportNewBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportNewText: {},
  reportItem: {
    borderWidth: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {},
  categoryText: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeText: {
    fontWeight: '700',
  },
  reportTitle: {
    lineHeight: 20,
  },
  reportDesc: {
    lineHeight: 18,
  },
  reportQuickRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {},
});
