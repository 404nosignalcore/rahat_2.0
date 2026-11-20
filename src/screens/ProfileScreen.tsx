import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { useI18n } from '../i18n';
import { wearableService } from '../services';
import { useTheme } from '../theme';
import { WearableTelemetry } from '../types/safety';

export const ProfileScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility, isDark, toggleTheme } = useTheme();
  const { t } = useI18n();
  const { user, privateInfo, contacts, updateConsents, showConsentModal } = useAuth();
  const [telemetry, setTelemetry] = useState<WearableTelemetry | null>(null);

  useEffect(() => {
    wearableService.getTelemetry().then(setTelemetry).catch(() => {});
  }, []);

  const handleSimulateWearableSos = async () => {
    await wearableService.simulateSosPress();
    Alert.alert('Wearable Trigger Simulated', 'Distress signal received from simulated smart ring.');
  };

  const handleDeleteAccountPrompt = () => {
    Alert.alert(
      t.profile.deleteAccount,
      t.profile.deleteDisclaimer,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Erased', 'Your profile and private location records have been permanently purged pursuant to DPDP Act 2023.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* User Identity Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.canvas,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            margin: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.userName, { color: colors.ink, ...typography.tagline }]}>
          {user?.displayName || 'Priya Sharma'}
        </Text>
        <Text style={[styles.userContact, { color: colors.inkMuted80, ...typography.caption }]}>
          {privateInfo?.phone || '+91 98111 22233'} · {privateInfo?.email || 'priya.sharma@example.com'}
        </Text>
        <Text style={[styles.dpdpBadge, { color: colors.safetySafe, ...typography.finePrint, marginTop: 4 }]}>
          ✓ DPDP Act 2023 Privacy Consent Active
        </Text>
      </View>

      {/* Emergency Contacts Section */}
      <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          {t.profile.emergencyContacts} ({contacts.length})
        </Text>

        {contacts.map((contact) => (
          <View
            key={contact.id}
            style={[
              styles.contactItem,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.md,
                padding: spacing.md,
                marginBottom: spacing.xs,
              },
            ]}
          >
            <View style={styles.contactItemLeft}>
              <Text style={[styles.contactName, { color: colors.ink, ...typography.bodyStrong }]}>
                {contact.name}
              </Text>
              <Text style={[styles.contactPhone, { color: colors.inkMuted80, ...typography.caption }]}>
                {contact.phone} · {contact.relationship}
              </Text>
              <Text
                style={[
                  styles.contactStatus,
                  {
                    color: contact.verificationStatus === 'verified' ? colors.safetySafe : colors.safetyCaution,
                    ...typography.finePrint,
                    marginTop: 2,
                  },
                ]}
              >
                {contact.verificationStatus === 'verified'
                  ? `✓ ${t.profile.contactVerified}`
                  : `⚠️ ${t.profile.contactUnverified}`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* DPDP Act 2023 Privacy Controls */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          {t.profile.privacySettings}
        </Text>

        <View
          style={[
            styles.settingsBox,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderRadius: rounded.lg,
              padding: spacing.md,
            },
          ]}
        >
          {/* Foreground location switch */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: colors.ink, ...typography.caption }]}>
              {t.profile.foregroundLocation}
            </Text>
            <TouchableOpacity
              style={[
                styles.togglePill,
                {
                  backgroundColor: privateInfo?.consents.foregroundLocation ? colors.safetySafe : colors.surfacePearl,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.sm,
                },
              ]}
              onPress={() => updateConsents({ foregroundLocation: !privateInfo?.consents.foregroundLocation })}
              accessibilityRole="switch"
              accessibilityState={{ checked: Boolean(privateInfo?.consents.foregroundLocation) }}
            >
              <Text
                style={[
                  styles.togglePillText,
                  {
                    color: privateInfo?.consents.foregroundLocation ? colors.onPrimary : colors.ink,
                    ...typography.finePrint,
                  },
                ]}
              >
                {privateInfo?.consents.foregroundLocation ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Background location switch */}
          <View style={[styles.switchRow, { marginTop: spacing.xs }]}>
            <Text style={[styles.switchLabel, { color: colors.ink, ...typography.caption }]}>
              {t.profile.backgroundLocation}
            </Text>
            <TouchableOpacity
              style={[
                styles.togglePill,
                {
                  backgroundColor: privateInfo?.consents.backgroundLocation ? colors.safetySafe : colors.surfacePearl,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.sm,
                },
              ]}
              onPress={() => updateConsents({ backgroundLocation: !privateInfo?.consents.backgroundLocation })}
              accessibilityRole="switch"
              accessibilityState={{ checked: Boolean(privateInfo?.consents.backgroundLocation) }}
            >
              <Text
                style={[
                  styles.togglePillText,
                  {
                    color: privateInfo?.consents.backgroundLocation ? colors.onPrimary : colors.ink,
                    ...typography.finePrint,
                  },
                ]}
              >
                {privateInfo?.consents.backgroundLocation ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* View DPDP consent details */}
          <TouchableOpacity
            style={[
              styles.viewConsentBtn,
              {
                backgroundColor: colors.surfacePearl,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.md,
              },
            ]}
            onPress={showConsentModal}
            accessibilityRole="button"
          >
            <Text style={[styles.viewConsentText, { color: colors.primary, ...typography.captionStrong }]}>
              Review DPDP Privacy Terms & Consent
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Appearance Mode */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          Visual Appearance
        </Text>
        <TouchableOpacity
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderRadius: rounded.lg,
              padding: spacing.md,
              minHeight: accessibility.minTouchTarget,
              borderWidth: 1,
            },
          ]}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel={`Toggle theme mode. Current theme is ${isDark ? 'OLED Dark' : 'Parchment Light'}`}
        >
          <Text style={[styles.themeToggleText, { color: colors.ink, ...typography.bodyStrong }]}>
            Current: {isDark ? '🌙 OLED Dark (#000000)' : '☀️ Parchment Light (#f5f5f7)'}
          </Text>
          <Text style={[styles.themeToggleSub, { color: colors.primary, ...typography.caption, marginTop: 2 }]}>
            Tap to switch theme
          </Text>
        </TouchableOpacity>
      </View>

      {/* Connected Wearable Companion */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          {t.profile.wearables}
        </Text>
        <View
          style={[
            styles.wearableCard,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderRadius: rounded.lg,
              padding: spacing.md,
              borderWidth: 1,
            },
          ]}
        >
          <Text style={[styles.wearableName, { color: colors.ink, ...typography.bodyStrong }]}>
            💍 {telemetry?.name || 'Rahat Smart Ring'}
          </Text>
          <Text style={[styles.wearableDetail, { color: colors.inkMuted80, ...typography.caption, marginTop: 2 }]}>
            Battery: {telemetry?.batteryPercent}% · Firmware: {telemetry?.firmwareVersion} · State: {telemetry?.isConnected ? 'Connected' : 'Disconnected'}
          </Text>

          <TouchableOpacity
            style={[
              styles.wearableSimBtn,
              {
                backgroundColor: colors.surfacePearl,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.sm,
              },
            ]}
            onPress={handleSimulateWearableSos}
            accessibilityRole="button"
            accessibilityLabel="Simulate wearable SOS button press"
          >
            <Text style={[styles.wearableSimText, { color: colors.safetyDanger, ...typography.captionStrong }]}>
              Simulate Wearable SOS Press
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Account (DPDP Act 2023 Right to Erasure) */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.xxl }]}>
        <TouchableOpacity
          style={[
            styles.deleteBtn,
            {
              backgroundColor: colors.safetyDangerBackground,
              borderColor: colors.safetyDanger,
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
              borderWidth: 1,
              paddingHorizontal: spacing.lg,
            },
          ]}
          onPress={handleDeleteAccountPrompt}
          accessibilityRole="button"
          accessibilityLabel={t.profile.deleteAccount}
        >
          <Text style={[styles.deleteBtnText, { color: colors.safetyDanger, ...typography.bodyStrong }]}>
            🗑️ {t.profile.deleteAccount}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCard: {
    borderWidth: 1,
  },
  userName: {
    marginBottom: 2,
  },
  userContact: {
    lineHeight: 18,
  },
  dpdpBadge: {
    fontWeight: '600',
  },
  section: {},
  sectionTitle: {},
  contactItem: {
    borderWidth: 1,
  },
  contactItemLeft: {},
  contactName: {},
  contactPhone: {
    marginTop: 2,
  },
  contactStatus: {
    fontWeight: '600',
  },
  settingsBox: {
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
  },
  togglePill: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  togglePillText: {
    fontWeight: '700',
  },
  viewConsentBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewConsentText: {
    textAlign: 'center',
  },
  themeToggleBtn: {
    justifyContent: 'center',
  },
  themeToggleText: {},
  themeToggleSub: {},
  wearableCard: {},
  wearableName: {},
  wearableDetail: {},
  wearableSimBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wearableSimText: {
    textAlign: 'center',
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    textAlign: 'center',
  },
});
