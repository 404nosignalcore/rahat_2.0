import React from 'react';
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { CommunitySosSession } from '../types/safety';

export interface ResponderDashboardModalProps {
  visible: boolean;
  session: CommunitySosSession | null;
  onArrived: () => void;
  onClose: () => void;
  onReportSuspicious: () => void;
}

export const ResponderDashboardModal: React.FC<ResponderDashboardModalProps> = ({
  visible,
  session,
  onArrived,
  onClose,
  onReportSuspicious,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();

  if (!visible || !session) return null;

  const handleDial = () => {
    // In production, dials via masked proxy or emergency coordinator
    Linking.openURL('tel:112').catch(() => {});
  };

  const handleOpenNavigation = () => {
    const lat = session.location.latitude;
    const lng = session.location.longitude;
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderRadius: rounded.lg,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Active Mission Header */}
          <View style={styles.headerRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.safetySafeBackground,
                  borderRadius: rounded.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 3,
                },
              ]}
            >
              <Text style={{ color: colors.safetySafe, ...typography.microLegal, fontWeight: '700' }}>
                ACTIVE RESCUE MISSION
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close mission dashboard">
              <Text style={{ color: colors.inkMuted80, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.ink, ...typography.tagline, marginTop: spacing.xs }]}>
            En Route to {session.victimFirstName}
          </Text>
          <Text style={[styles.sub, { color: colors.inkMuted80, ...typography.caption }]}>
            Approx. 320 meters away • Walking ETA ~4 mins
          </Text>

          {/* Guidelines Box */}
          <View
            style={[
              styles.guidelineBox,
              {
                backgroundColor: colors.canvasParchment,
                borderRadius: rounded.md,
                padding: spacing.sm,
                marginVertical: spacing.md,
              },
            ]}
          >
            <Text style={{ color: colors.ink, ...typography.captionStrong }}>
              🛡️ Responder Protocol
            </Text>
            <Text style={{ color: colors.inkMuted80, ...typography.finePrint, marginTop: 2 }}>
              1. Stay on well-lit main corridors.
              {'\n'}2. Identify yourself calmly: &quot;I am a Rahat Community Responder.&quot;
              {'\n'}3. Dial 112 immediately if a physical confrontation is observed.
            </Text>
          </View>

          {/* Navigation & Action Buttons */}
          <TouchableOpacity
            style={[
              styles.navBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
              },
            ]}
            onPress={handleOpenNavigation}
            accessibilityRole="button"
            accessibilityLabel="Open walking navigation in Google Maps"
          >
            <Text style={{ color: colors.onPrimary, ...typography.bodyStrong }}>
              🗺️ Open Turn-by-Turn Maps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.arrivedBtn,
              {
                backgroundColor: colors.safetySafe,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xs,
              },
            ]}
            onPress={onArrived}
            accessibilityRole="button"
            accessibilityLabel="Mark arrived at victim location"
          >
            <Text style={{ color: colors.onPrimary, ...typography.bodyStrong }}>
              ✓ I Have Arrived on Scene
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              style={[
                styles.halfBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderWidth: 1,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              onPress={handleDial}
              accessibilityRole="button"
              accessibilityLabel="Call ERSS 112"
            >
              <Text style={{ color: colors.primary, ...typography.captionStrong }}>
                📞 Dial 112
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.halfBtn,
                {
                  backgroundColor: colors.safetyCautionBackground,
                  borderColor: colors.safetyCaution,
                  borderWidth: 1,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              onPress={onReportSuspicious}
              accessibilityRole="button"
              accessibilityLabel="Report suspicious responder or false alarm"
            >
              <Text style={{ color: colors.safetyCaution, ...typography.captionStrong }}>
                ⚠️ Report Incident
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  card: {
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {},
  title: {},
  sub: {},
  guidelineBox: {},
  navBtn: {
    width: '100%',
  },
  arrivedBtn: {
    width: '100%',
  },
  halfBtn: {},
});
