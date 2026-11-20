import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafetyRiskResult } from '../engines/safetyRiskEngine';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface ZoneExplanationModalProps {
  visible: boolean;
  zoneName: string;
  result: SafetyRiskResult;
  onClose: () => void;
}

export const ZoneExplanationModal: React.FC<ZoneExplanationModalProps> = ({
  visible,
  zoneName,
  result,
  onClose,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  let levelColor = colors.safetySafe;
  let levelBadge = t.safetyLevels.safe;
  let levelBg = colors.safetySafeBackground;

  if (result.level === 'danger') {
    levelColor = colors.safetyDanger;
    levelBadge = t.safetyLevels.danger;
    levelBg = colors.safetyDangerBackground;
  } else if (result.level === 'caution') {
    levelColor = colors.safetyCaution;
    levelBadge = t.safetyLevels.caution;
    levelBg = colors.safetyCautionBackground;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.hairline, padding: spacing.md }]}>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.zoneName, { color: colors.ink, ...typography.tagline }]}>
              {zoneName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.inkMuted80, ...typography.finePrint }]}>
              Explainable Risk Score Breakdown (No Profiling)
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.closeBtn,
              {
                backgroundColor: colors.surfacePearl,
                borderRadius: rounded.full,
                minHeight: accessibility.minTouchTarget,
                minWidth: accessibility.minTouchTarget,
              },
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t.common.close}
          >
            <Text style={[styles.closeBtnText, { color: colors.ink, ...typography.captionStrong }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
          {/* Large Score Summary Card */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <View style={styles.scoreRow}>
              <View style={[styles.scorePill, { backgroundColor: levelBg, borderRadius: rounded.pill }]}>
                <Text style={[styles.scoreNumber, { color: levelColor, ...typography.heroDisplay }]}>
                  {result.score}
                </Text>
                <Text style={[styles.scoreLevel, { color: levelColor, ...typography.captionStrong }]}>
                  {levelBadge}
                </Text>
              </View>

              <View style={styles.summaryTextWrap}>
                <Text style={[styles.summaryTitle, { color: colors.ink, ...typography.bodyStrong }]}>
                  Dynamic Safety Score
                </Text>
                <Text style={[styles.summaryDesc, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 4 }]}>
                  Calculated from lighting, CCTV surveillance, active time-band modifiers, and community hazards.
                </Text>
              </View>
            </View>
          </View>

          {/* Itemized Adjustment List */}
          <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.captionStrong, marginBottom: spacing.xs }]}>
            Point-by-Point Calculation
          </Text>

          {result.explanation.map((item, idx) => {
            const isPositive = item.delta > 0;
            const isNeutral = item.delta === 0;

            let badgeColor = isPositive ? colors.safetySafe : colors.safetyDanger;
            let badgeBg = isPositive ? colors.safetySafeBackground : colors.safetyDangerBackground;

            if (isNeutral || item.factor === 'base') {
              badgeColor = colors.ink;
              badgeBg = colors.surfacePearl;
            }

            return (
              <View
                key={idx}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.hairline,
                    borderRadius: rounded.md,
                    padding: spacing.md,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                <View style={styles.itemHeader}>
                  <Text style={[styles.itemFactor, { color: colors.ink, ...typography.bodyStrong }]}>
                    {item.factor === 'base'
                      ? 'Base Score'
                      : item.factor === 'lighting'
                      ? '💡 Lighting Conditions'
                      : item.factor === 'cctv'
                      ? '📹 CCTV Coverage'
                      : item.factor === 'time_of_day'
                      ? '🕒 Time of Day'
                      : item.factor === 'safe_havens'
                      ? '🛡️ Safe Havens Proximity'
                      : '⚠️ Hazard Incidents'}
                  </Text>

                  <View style={[styles.deltaBadge, { backgroundColor: badgeBg, borderRadius: rounded.pill }]}>
                    <Text style={[styles.deltaText, { color: badgeColor, ...typography.captionStrong }]}>
                      {isPositive ? `+${item.delta}` : item.delta} pts
                    </Text>
                  </View>
                </View>

                <Text style={[styles.itemDesc, { color: colors.inkMuted80, ...typography.caption, marginTop: 4 }]}>
                  {item.description}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flex: 1,
  },
  zoneName: {},
  headerSubtitle: {
    marginTop: 2,
  },
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
  },
  content: {
    paddingBottom: 40,
  },
  summaryCard: {
    borderWidth: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scorePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 100,
  },
  scoreNumber: {
    lineHeight: 58,
  },
  scoreLevel: {
    textTransform: 'uppercase',
  },
  summaryTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  summaryTitle: {},
  summaryDesc: {
    lineHeight: 16,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemCard: {
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemFactor: {
    flex: 1,
  },
  deltaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  deltaText: {},
  itemDesc: {
    lineHeight: 18,
  },
});
