import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CorridorRoute } from '../types/safety';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface CompareRoutesModalProps {
  visible: boolean;
  corridors: CorridorRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  onConfirmStart: () => void;
  onClose: () => void;
}

export const CompareRoutesModal: React.FC<CompareRoutesModalProps> = ({
  visible,
  corridors,
  selectedRouteId,
  onSelectRoute,
  onConfirmStart,
  onClose,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  const [activeSelection, setActiveSelection] = useState<string>(selectedRouteId);

  const handleSelect = (id: string) => {
    setActiveSelection(id);
    onSelectRoute(id);
  };

  const handleStart = () => {
    onConfirmStart();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.hairline, padding: spacing.md }]}>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: colors.ink, ...typography.tagline }]}>
              {t.routes.title}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.inkMuted80, ...typography.finePrint }]}>
              Compare routes ranked by lighting, CCTV, and verified safe havens.
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
          {corridors.map((route) => {
            const isSelected = activeSelection === route.id;
            const isSafest = route.tag === 'safest';
            const isWellLit = route.tag === 'well_lit';

            let tagLabel = t.routes.safestRoute;
            let tagColor = colors.safetySafe;
            let tagBg = colors.safetySafeBackground;

            if (isWellLit) {
              tagLabel = t.routes.wellLitRoute;
              tagColor = colors.primary;
              tagBg = colors.surfacePearl;
            } else if (route.tag === 'quickest') {
              tagLabel = t.routes.quickestRoute;
              tagColor = colors.inkMuted80;
              tagBg = colors.surfacePearl;
            }

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
                    marginBottom: spacing.md,
                  },
                ]}
                onPress={() => handleSelect(route.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Header row */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.titleWrap}>
                    <Text style={[styles.routeTitle, { color: colors.ink, ...typography.bodyStrong }]}>
                      {route.title}
                    </Text>
                    <View style={[styles.tagPill, { backgroundColor: tagBg, borderColor: tagColor, borderRadius: rounded.pill }]}>
                      <Text style={[styles.tagPillText, { color: tagColor, ...typography.microLegal }]}>
                        {isSafest ? '★ ' : ''}
                        {tagLabel}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.hairline,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                        borderRadius: rounded.full,
                      },
                    ]}
                  >
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.onPrimary, borderRadius: rounded.full }]} />}
                  </View>
                </View>

                {/* Key Metrics */}
                <View style={[styles.metricsGrid, { marginVertical: spacing.sm }]}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
                      DISTANCE
                    </Text>
                    <Text style={[styles.metricVal, { color: colors.ink, ...typography.captionStrong }]}>
                      {(route.distanceMeters / 1000).toFixed(1)} km
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
                      EST. TIME
                    </Text>
                    <Text style={[styles.metricVal, { color: colors.ink, ...typography.captionStrong }]}>
                      {Math.round(route.etaSeconds / 60)} min
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
                      LIGHTING
                    </Text>
                    <Text style={[styles.metricVal, { color: route.lightingPercent >= 80 ? colors.safetySafe : colors.safetyCaution, ...typography.captionStrong }]}>
                      {route.lightingPercent}%
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
                      CCTV DENSITY
                    </Text>
                    <Text style={[styles.metricVal, { color: colors.ink, ...typography.captionStrong }]}>
                      {route.cctvPercent}%
                    </Text>
                  </View>
                </View>

                {/* Safe Havens count badge */}
                <View style={[styles.safeHavensPill, { backgroundColor: colors.surfacePearl, borderRadius: rounded.sm }]}>
                  <Text style={[styles.safeHavensText, { color: colors.inkMuted80, ...typography.microLegal }]}>
                    🛡️ {route.safeHavensCount} verified safe havens within 100m of this route
                  </Text>
                </View>

                {/* Ranking Rationale */}
                <Text style={[styles.rationaleLabel, { color: colors.inkMuted80, ...typography.finePrint, marginTop: spacing.sm }]}>
                  <Text style={{ fontWeight: '700' }}>Why ranked: </Text>
                  {route.rankingRationale}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Confirm & Start Journey Button */}
          <TouchableOpacity
            style={[
              styles.startBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.md,
              },
            ]}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Start active journey along selected route"
          >
            <Text style={[styles.startBtnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
              Select & Start Journey
            </Text>
          </TouchableOpacity>
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
  headerTitle: {},
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
  routeCard: {},
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeTitle: {},
  tagPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagPillText: {
    fontWeight: '700',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioDot: {
    width: 10,
    height: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {},
  metricVal: {
    marginTop: 2,
  },
  safeHavensPill: {
    padding: 6,
  },
  safeHavensText: {},
  rationaleLabel: {
    lineHeight: 18,
  },
  startBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    textAlign: 'center',
  },
});
