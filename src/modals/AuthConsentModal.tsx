import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface AuthConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss?: () => void;
}

export const AuthConsentModal: React.FC<AuthConsentModalProps> = ({
  visible,
  onAccept,
  onDismiss,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onDismiss}>
      <View style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.lg }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.ink, ...typography.displayMd }]}>
              {t.authConsent.title}
            </Text>
            <Text style={[styles.tagline, { color: colors.primary, ...typography.tagline }]}>
              {t.authConsent.tagline}
            </Text>
          </View>

          {/* Core DPDP Pillars */}
          <View
            style={[
              styles.pillarCard,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text style={[styles.pillarHeader, { color: colors.ink, ...typography.bodyStrong }]}>
              📍 {t.authConsent.point1}
            </Text>
            <Text style={[styles.pillarHeader, { color: colors.ink, ...typography.bodyStrong, marginTop: spacing.sm }]}>
              🚫 {t.authConsent.point2}
            </Text>
            <Text style={[styles.pillarHeader, { color: colors.ink, ...typography.bodyStrong, marginTop: spacing.sm }]}>
              🔒 {t.authConsent.point3}
            </Text>
            <Text style={[styles.pillarHeader, { color: colors.ink, ...typography.bodyStrong, marginTop: spacing.sm }]}>
              🗑️ {t.authConsent.point4}
            </Text>
          </View>

          {/* Retention & Grievance info */}
          <View
            style={[
              styles.legalBox,
              {
                backgroundColor: colors.surfacePearl,
                borderColor: colors.hairline,
                borderRadius: rounded.md,
                padding: spacing.md,
                marginBottom: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.legalText, { color: colors.inkMuted80, ...typography.caption }]}>
              • Retention Period: Journey location breadcrumbs are automatically purged after 30 days. Emergency SOS records are archived for 12 months unless erased sooner.
            </Text>
            <Text style={[styles.legalText, { color: colors.inkMuted80, ...typography.caption, marginTop: 4 }]}>
              • Data Protection Grievance Officer: grievance@rahat.app (Response within 72 hours under DPDP Act 2023).
            </Text>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[
              styles.acceptButton,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                paddingHorizontal: spacing.lg,
              },
            ]}
            onPress={onAccept}
            accessibilityRole="button"
            accessibilityLabel={t.authConsent.acceptAndProceed}
          >
            <Text style={[styles.acceptButtonText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
              {t.authConsent.acceptAndProceed}
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
  content: {
    paddingVertical: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  tagline: {
    lineHeight: 26,
  },
  pillarCard: {
    borderWidth: 1,
  },
  pillarHeader: {
    lineHeight: 22,
  },
  legalBox: {
    borderWidth: 1,
  },
  legalText: {
    lineHeight: 18,
  },
  acceptButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    textAlign: 'center',
  },
});
