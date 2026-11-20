import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface DeviationAlertModalProps {
  visible: boolean;
  distanceMeters?: number;
  onImSafe: () => void;
  onRecalculate: () => void;
  onShareLocation: () => void;
  onActivateSos: () => void;
}

export const DeviationAlertModal: React.FC<DeviationAlertModalProps> = ({
  visible,
  distanceMeters = 110,
  onImSafe,
  onRecalculate,
  onShareLocation,
  onActivateSos,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onImSafe}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.safetyCaution,
              borderRadius: rounded.lg,
              padding: spacing.lg,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.alertIcon, { fontSize: 36 }]}>⚠️</Text>
            <Text style={[styles.title, { color: colors.safetyCaution, ...typography.displayMd, marginTop: 4 }]}>
              {t.routes.deviationTitle}
            </Text>
            <Text style={[styles.body, { color: colors.ink, ...typography.body, marginTop: spacing.xs }]}>
              You have left the planned safe corridor by {Math.round(distanceMeters)} meters (buffer: 90m).
            </Text>
            <Text style={[styles.subBody, { color: colors.inkMuted80, ...typography.caption, marginTop: 4 }]}>
              A deviation never calls 112 or activates SOS automatically. Please confirm your status:
            </Text>
          </View>

          {/* 4 Action Buttons */}
          <View style={[styles.buttonStack, { marginTop: spacing.md }]}>
            {/* Button 1: I'm Safe (120s cooldown) */}
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.safetySafe,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={onImSafe}
              accessibilityRole="button"
              accessibilityLabel="Confirm I am safe with 120 second pause"
            >
              <Text style={[styles.btnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
                ✓ {t.routes.imSafeButton}
              </Text>
            </TouchableOpacity>

            {/* Button 2: Recalculate Route */}
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={onRecalculate}
              accessibilityRole="button"
              accessibilityLabel="Recalculate route to destination"
            >
              <Text style={[styles.btnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
                🔄 {t.routes.recalculateButton}
              </Text>
            </TouchableOpacity>

            {/* Button 3: Share my location (to SafeCircle) */}
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  borderWidth: 1,
                  marginBottom: spacing.xs,
                },
              ]}
              onPress={onShareLocation}
              accessibilityRole="button"
              accessibilityLabel="Share current location to SafeCircle"
            >
              <Text style={[styles.btnText, { color: colors.primary, ...typography.bodyStrong }]}>
                👥 {t.routes.shareCircleButton}
              </Text>
            </TouchableOpacity>

            {/* Button 4: Activate SOS */}
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.safetyDangerBackground,
                  borderColor: colors.safetyDanger,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  borderWidth: 1,
                },
              ]}
              onPress={onActivateSos}
              accessibilityRole="button"
              accessibilityLabel="Activate emergency SOS"
            >
              <Text style={[styles.btnText, { color: colors.safetyDanger, ...typography.bodyStrong }]}>
                🚨 {t.routes.activateSosButton}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 2,
  },
  header: {
    alignItems: 'center',
  },
  alertIcon: {},
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    lineHeight: 22,
  },
  subBody: {
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonStack: {},
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnText: {
    textAlign: 'center',
  },
});
