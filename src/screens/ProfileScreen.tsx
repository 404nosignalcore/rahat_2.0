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
import { communitySosEngine } from '../engines/communitySosService';
import { useI18n } from '../i18n';
import { ContactVerificationModal } from '../modals/ContactVerificationModal';
import { wearableService } from '../services';
import { useTheme } from '../theme';
import { EmergencyContact, WearableTelemetry } from '../types/safety';

export const ProfileScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useI18n();
  const {
    user,
    privateInfo,
    contacts,
    updateConsents,
    showConsentModal,
    sendContactOtp,
    verifyContactOtp,
    deleteAccount,
    exportUserDataJson,
  } = useAuth();

  const [telemetry, setTelemetry] = useState<WearableTelemetry | null>(null);
  const [selectedContactToVerify, setSelectedContactToVerify] = useState<EmergencyContact | null>(null);
  const [safeCode, setSafeCode] = useState<string>(communitySosEngine.getSafeCode());

  useEffect(() => {
    wearableService.getTelemetry().then(setTelemetry).catch(() => {});
  }, []);

  const handleSimulateWearableSos = async () => {
    await wearableService.simulateSosPress();
    Alert.alert('Wearable Trigger Simulated', 'Distress signal received from simulated smart ring.');
  };

  const handleExportData = async () => {
    try {
      const json = await exportUserDataJson();
      Alert.alert(
        'DPDP Data Portability Export',
        `Your encrypted data archive:\n\n${json.substring(0, 300)}...\n\n(Full JSON archive ready for export)`,
        [{ text: 'Close' }]
      );
    } catch {
      Alert.alert('Export Failed', 'Unable to generate JSON archive.');
    }
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
          onPress: async () => {
            await deleteAccount();
            Alert.alert(
              'Account Permanently Erased',
              'Your profile and private location records have been permanently purged pursuant to DPDP Act 2023.'
            );
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

      {/* Language Preference Bar */}
      <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          Language / भाषा
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: language === 'en' ? colors.primary : colors.canvas,
              borderColor: colors.hairline,
              borderWidth: 1,
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setLanguage('en')}
            accessibilityRole="button"
            accessibilityLabel="Switch to English"
          >
            <Text style={{ color: language === 'en' ? colors.onPrimary : colors.ink, ...typography.captionStrong }}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: language === 'hi' ? colors.primary : colors.canvas,
              borderColor: colors.hairline,
              borderWidth: 1,
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setLanguage('hi')}
            accessibilityRole="button"
            accessibilityLabel="Switch to Hindi"
          >
            <Text style={{ color: language === 'hi' ? colors.onPrimary : colors.ink, ...typography.captionStrong }}>
              हिन्दी (Hindi)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Emergency Contacts Section (Section 6 & Verification Flow) */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
          <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong }]}>
            {t.profile.emergencyContacts} ({contacts.length})
          </Text>
          <Text style={{ color: colors.inkMuted48, ...typography.microLegal }}>
            MAX 5 CONTACTS
          </Text>
        </View>

        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={[
              styles.contactItem,
              {
                backgroundColor: colors.canvas,
                borderColor: contact.verificationStatus === 'verified' ? colors.hairline : colors.safetyCaution,
                borderRadius: rounded.md,
                borderWidth: 1,
                padding: spacing.md,
                marginBottom: spacing.xs,
              },
            ]}
            onPress={() => {
              if (contact.verificationStatus !== 'verified') {
                setSelectedContactToVerify(contact);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`Emergency contact ${contact.name}, ${contact.verificationStatus}`}
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
                  : `⚠️ ${t.profile.contactUnverified} (Tap to verify via OTP)`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Safe-Code & Duress-Code Configuration (Section 6 & 8.3) */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          Safe-Code & Duress Protection
        </Text>
        <View
          style={[
            styles.safeCodeBox,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderRadius: rounded.lg,
              borderWidth: 1,
              padding: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.ink, ...typography.bodyStrong }}>
                Personal Safe-Code: <Text style={{ color: colors.primary }}>{safeCode}</Text>
              </Text>
              <Text style={{ color: colors.inkMuted80, ...typography.caption, marginTop: 2 }}>
                Used to cancel an active distress signal.
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surfacePearl,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: rounded.pill,
              }}
              onPress={() => {
                const newCode = safeCode === '1234' ? '2468' : '1234';
                communitySosEngine.setSafeCode(newCode);
                setSafeCode(newCode);
              }}
            >
              <Text style={{ color: colors.primary, ...typography.finePrint }}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.dividerSoft, paddingTop: spacing.xs }}>
            <Text style={{ color: colors.safetyCaution, ...typography.captionStrong }}>
              🛡️ Anti-Coercion Duress Code: {communitySosEngine.getDuressCode()}
            </Text>
            <Text style={{ color: colors.inkMuted80, ...typography.microLegal, marginTop: 2 }}>
              If forced to cancel under threat, entering the duress code quietly notifies official ERSS (112) police while showing the app as canceled to the coercer.
            </Text>
          </View>
        </View>
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
                alignItems: 'center',
                justifyContent: 'center',
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

      {/* Connected Wearable Companion (Section 6) */}
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
            Battery: {telemetry?.batteryPercent}% · Firmware: {telemetry?.firmwareVersion} · State: {telemetry?.isConnected ? 'Connected via BLE' : 'Disconnected'}
          </Text>

          <TouchableOpacity
            style={[
              styles.wearableSimBtn,
              {
                backgroundColor: colors.surfacePearl,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.sm,
                alignItems: 'center',
                justifyContent: 'center',
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

      {/* Data Export & Account Deletion (DPDP Act 2023) */}
      <View style={[styles.section, { paddingHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.xxl }]}>
        <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.bodyStrong, marginBottom: spacing.xs }]}>
          Data Management & Rights
        </Text>

        <TouchableOpacity
          style={[
            styles.exportBtn,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.hairline,
              borderWidth: 1,
              borderRadius: rounded.lg,
              padding: spacing.md,
              minHeight: accessibility.minTouchTarget,
              marginBottom: spacing.xs,
            },
          ]}
          onPress={handleExportData}
          accessibilityRole="button"
          accessibilityLabel="Export my data as JSON"
        >
          <Text style={{ color: colors.primary, ...typography.bodyStrong }}>
            📦 Export My Data (JSON)
          </Text>
          <Text style={{ color: colors.inkMuted80, ...typography.finePrint, marginTop: 2 }}>
            Download complete archive of profile, contacts, and telemetry pursuant to DPDP Act 2023.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteAccountBtn,
            {
              backgroundColor: colors.safetyDangerBackground,
              borderColor: colors.safetyDanger,
              borderRadius: rounded.lg,
              padding: spacing.md,
              minHeight: accessibility.minTouchTarget,
              borderWidth: 1,
            },
          ]}
          onPress={handleDeleteAccountPrompt}
          accessibilityRole="button"
          accessibilityLabel={t.profile.deleteAccount}
        >
          <Text style={[styles.deleteAccountTitle, { color: colors.safetyDanger, ...typography.bodyStrong }]}>
            {t.profile.deleteAccount}
          </Text>
          <Text style={[styles.deleteAccountDisclaimer, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 2 }]}>
            {t.profile.deleteDisclaimer}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact Verification OTP Modal */}
      <ContactVerificationModal
        visible={Boolean(selectedContactToVerify)}
        contact={selectedContactToVerify}
        onVerify={async (otp) => {
          if (!selectedContactToVerify) return false;
          return verifyContactOtp(selectedContactToVerify.id, otp);
        }}
        onResendOtp={async () => {
          if (!selectedContactToVerify) return '123456';
          return sendContactOtp(selectedContactToVerify.id);
        }}
        onClose={() => setSelectedContactToVerify(null)}
      />
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
  userName: {},
  userContact: {
    marginTop: 2,
  },
  dpdpBadge: {},
  section: {},
  sectionTitle: {},
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactItemLeft: {
    flex: 1,
  },
  contactName: {},
  contactPhone: {
    marginTop: 2,
  },
  contactStatus: {},
  safeCodeBox: {},
  settingsBox: {
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    flex: 1,
  },
  togglePill: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
  },
  togglePillText: {
    fontWeight: '700',
  },
  viewConsentBtn: {},
  viewConsentText: {
    textAlign: 'center',
  },
  themeToggleBtn: {},
  themeToggleText: {},
  themeToggleSub: {},
  wearableCard: {},
  wearableName: {},
  wearableDetail: {},
  wearableSimBtn: {},
  wearableSimText: {
    textAlign: 'center',
  },
  exportBtn: {},
  deleteAccountBtn: {},
  deleteAccountTitle: {},
  deleteAccountDisclaimer: {
    lineHeight: 16,
  },
});
