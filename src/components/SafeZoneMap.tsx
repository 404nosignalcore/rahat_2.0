import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DELHI_NCR_ZONES, DelhiZone } from '../data/delhiZones';
import { calculateDynamicZoneScore } from '../engines/safetyRiskEngine';
import { SafetyReport } from '../types/safety';
import { useTheme } from '../theme';

export interface SafeZoneMapProps {
  selectedZoneId: string;
  selectedHour: number;
  reports: SafetyReport[];
  onSelectZone: (zone: DelhiZone) => void;
}

export const SafeZoneMap: React.FC<SafeZoneMapProps> = ({
  selectedZoneId,
  selectedHour,
  reports,
  onSelectZone,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();

  return (
    <View
      style={[
        styles.mapCard,
        {
          backgroundColor: colors.surfacePearl,
          borderColor: colors.hairline,
          borderRadius: rounded.lg,
          padding: spacing.md,
        },
      ]}
    >
      <View style={styles.mapHeader}>
        <Text style={[styles.mapTitle, { color: colors.ink, ...typography.captionStrong }]}>
          🗺️ Delhi NCR Safety Zones ({DELHI_NCR_ZONES.length} Monitored Corridors)
        </Text>
        <Text style={[styles.mapSubtitle, { color: colors.inkMuted80, ...typography.finePrint }]}>
          Color-coded polygons dynamically scored at {String(selectedHour).padStart(2, '0')}:00 hrs
        </Text>
      </View>

      {/* Zone polygon tiles representing geographical corridors */}
      <View style={[styles.zonesGrid, { marginTop: spacing.sm }]}>
        {DELHI_NCR_ZONES.map((zone) => {
          // Filter incidents in this zone
          const zoneIncidents = reports
            .filter((r) => r.areaTag.toLowerCase().includes(zone.areaTag.toLowerCase()))
            .map((r) => ({
              category: r.category,
              severity: r.severity,
              verificationStatus: r.verificationStatus,
            }));

          const scoreRes = calculateDynamicZoneScore({
            lightingPercent: zone.lightingPercent,
            cctvPercent: zone.cctvPercent,
            footfallPercent: zone.footfallPercent,
            hour: selectedHour,
            incidents: zoneIncidents,
            safeHavensCount: zone.safeHavensCount,
          });

          const isSelected = selectedZoneId === zone.id;

          let polygonColor = colors.safetySafe;
          let polygonBg = colors.safetySafeBackground;

          if (scoreRes.level === 'danger') {
            polygonColor = colors.safetyDanger;
            polygonBg = colors.safetyDangerBackground;
          } else if (scoreRes.level === 'caution') {
            polygonColor = colors.safetyCaution;
            polygonBg = colors.safetyCautionBackground;
          }

          return (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.zoneTile,
                {
                  backgroundColor: isSelected ? colors.canvas : polygonBg,
                  borderColor: isSelected ? colors.primary : polygonColor,
                  borderWidth: isSelected ? 2 : 1,
                  borderRadius: rounded.md,
                  minHeight: accessibility.minTouchTarget,
                  padding: spacing.sm,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={() => onSelectZone(zone)}
              accessibilityRole="button"
              accessibilityLabel={`Select zone ${zone.name}. Dynamic score: ${scoreRes.score}, level: ${scoreRes.level}`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.tileHeader}>
                <View style={styles.tileTitleWrap}>
                  <Text style={[styles.zoneName, { color: colors.ink, ...typography.bodyStrong }]}>
                    {zone.name}
                  </Text>
                  <Text style={[styles.zoneGeohash, { color: colors.inkMuted48, ...typography.microLegal }]}>
                    Geohash: {zone.geohash} · {zone.safeHavensCount} Safe Havens
                  </Text>
                </View>

                {/* Score badge */}
                <View style={[styles.scoreBadge, { backgroundColor: polygonBg, borderColor: polygonColor, borderRadius: rounded.pill }]}>
                  <Text style={[styles.scoreBadgeText, { color: polygonColor, ...typography.captionStrong }]}>
                    {scoreRes.score} ({scoreRes.level.toUpperCase()})
                  </Text>
                </View>
              </View>

              <Text style={[styles.zoneMetrics, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 4 }]}>
                💡 Lighting: {zone.lightingPercent}% · 📹 CCTV: {zone.cctvPercent}% · ⚠️ {zoneIncidents.length} hazard reports
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapCard: {
    borderWidth: 1,
  },
  mapHeader: {
    marginBottom: 4,
  },
  mapTitle: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mapSubtitle: {
    marginTop: 2,
  },
  zonesGrid: {},
  zoneTile: {},
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  zoneName: {},
  zoneGeohash: {
    marginTop: 2,
  },
  scoreBadge: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  scoreBadgeText: {
    fontWeight: '700',
  },
  zoneMetrics: {
    lineHeight: 16,
  },
});
