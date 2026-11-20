import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CountdownOption, useSOS } from '../context/SOSProvider';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { CoordsSource, DeliveryStatus } from '../types/safety';

export const SosScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, shadows, accessibility } = useTheme();
  const { t } = useI18n();
  const {
    activeAlert,
    countdownSeconds,
    countdownDuration,
    coordsSource,
    setCountdownDuration,
    setCoordsSource,
    startCountdown,
    cancelCountdown,
    sendImmediately,
    cancelAlert,
    resolveAlert,
    triggerOfflineFallback,
    sendOfflineSmsToContacts,
  } = useSOS();

  const handleDial = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  const isCountingDown = countdownSeconds !== null;
  const isAlertActive = Boolean(activeAlert);

  const getStatusBadgeStyle = (status: DeliveryStatus) => {
    switch (status) {
      case 'sent':
      case 'user_sent_via_sms':
        return {
          bg: colors.safetySafeBackground,
          text: colors.safetySafe,
          label: status === 'user_sent_via_sms' ? 'USER SENT SMS' : 'SENT',
        };
      case 'pending':
        return {
          bg: colors.safetyCautionBackground,
          text: colors.safetyCaution,
          label: 'PENDING',
        };
      case 'offline_fallback_prepared':
        return {
          bg: colors.safetyCautionBackground,
          text: colors.safetyCaution,
          label: 'OFFLINE SMS READY',
        };
      case 'failed':
      default:
        return {
          bg: colors.safetyDangerBackground,
          text: colors.safetyDanger,
          label: 'FAILED',
        };
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* Signature SOS Card (The Single Drop-Shadowed Element in Apple Museum Design) */}
      <View
        style={[
          styles.sosCard,
          {
            backgroundColor: colors.canvas,
            borderColor: isAlertActive ? colors.safetyDanger : colors.hairline,
            borderRadius: rounded.lg,
            margin: spacing.md,
            padding: spacing.lg,
            ...shadows.sosCardSignature,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.ink, ...typography.tagline, textAlign: 'center' }]}>
          {t.sos.title}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            { color: colors.inkMuted80, ...typography.caption, textAlign: 'center', marginBottom: spacing.md },
          ]}
        >
          {isAlertActive
            ? 'Distress broadcast active. Trusted contacts and community responders notified.'
            : 'Hold button or tap to initiate cancelable distress countdown.'}
        </Text>

        {/* Countdown Duration Selector (3s / 5s / 10s) */}
        {!isAlertActive && !isCountingDown && (
          <View style={[styles.durationSelectorRow, { marginBottom: spacing.md }]}>
            <Text style={[styles.durationLabel, { color: colors.inkMuted48, ...typography.microLegal }]}>
              COUNTDOWN:
            </Text>
            {([3, 5, 10] as CountdownOption[]).map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.durationPill,
                  {
                    backgroundColor:
                      countdownDuration === sec ? colors.primary : colors.surfacePearl,
                    borderColor: countdownDuration === sec ? colors.primary : colors.hairline,
                    borderRadius: rounded.pill,
                    borderWidth: 1,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 4,
                    marginHorizontal: 3,
                    minHeight: 32,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setCountdownDuration(sec)}
                accessibilityRole="button"
                accessibilityLabel={`Set countdown to ${sec} seconds`}
              >
                <Text
                  style={[
                    styles.durationText,
                    {
                      color: countdownDuration === sec ? colors.onPrimary : colors.ink,
                      ...typography.microLegal,
                    },
                  ]}
                >
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SOS Action State: Countdown vs Active vs Ready */}
        {isCountingDown ? (
          <View style={styles.countdownContainer}>
            <View
              style={[
                styles.countdownCircle,
                {
                  borderColor: colors.safetyDanger,
                  backgroundColor: colors.safetyDangerBackground,
                  borderRadius: rounded.full,
                },
              ]}
            >
              <Text style={[styles.countdownNumber, { color: colors.safetyDanger, ...typography.heroDisplay }]}>
                {countdownSeconds}
              </Text>
              <Text style={[styles.countdownLabel, { color: colors.safetyDanger, ...typography.captionStrong }]}>
                Seconds
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.lg,
                  marginTop: spacing.md,
                },
              ]}
              onPress={cancelCountdown}
              accessibilityRole="button"
              accessibilityLabel={t.sos.cancelPrompt}
            >
              <Text style={[styles.cancelText, { color: colors.ink, ...typography.bodyStrong }]}>
                ✕ {t.sos.cancelPrompt}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendNowButton,
                {
                  backgroundColor: colors.safetyDanger,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.lg,
                  marginTop: spacing.xs,
                },
              ]}
              onPress={sendImmediately}
              accessibilityRole="button"
              accessibilityLabel={t.sos.sendImmediately}
            >
              <Text style={[styles.sendNowText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
                ⚡ {t.sos.sendImmediately}
              </Text>
            </TouchableOpacity>
          </View>
        ) : isAlertActive ? (
          <View style={styles.activeAlertContainer}>
            <View
              style={[
                styles.activeAlertPill,
                {
                  backgroundColor: colors.safetyDangerBackground,
                  borderRadius: rounded.pill,
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <Text style={[styles.activeAlertText, { color: colors.safetyDanger, ...typography.bodyStrong }]}>
                🚨 SOS BROADCAST ACTIVE
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
              <TouchableOpacity
                style={[
                  styles.cancelActiveButton,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderColor: colors.hairline,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                    flex: 1,
                    marginRight: 4,
                  },
                ]}
                onPress={cancelAlert}
                accessibilityRole="button"
                accessibilityLabel="Cancel active SOS alert"
              >
                <Text style={[styles.cancelActiveText, { color: colors.ink, ...typography.bodyStrong }]}>
                  Cancel Alert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelActiveButton,
                  {
                    backgroundColor: colors.safetySafeBackground,
                    borderColor: colors.safetySafe,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                    flex: 1,
                    marginLeft: 4,
                  },
                ]}
                onPress={resolveAlert}
                accessibilityRole="button"
                accessibilityLabel="Mark alert safe and resolved"
              >
                <Text style={[styles.cancelActiveText, { color: colors.safetySafe, ...typography.bodyStrong }]}>
                  I Am Safe ✓
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.triggerSosButton,
              {
                backgroundColor: colors.safetyDanger,
                borderRadius: rounded.full,
                minHeight: 120,
                width: 120,
                alignSelf: 'center',
                marginVertical: spacing.md,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            onPress={() => startCountdown(countdownDuration)}
            accessibilityRole="button"
            accessibilityLabel={t.sos.triggerButton}
          >
            <Text style={[styles.sosButtonText, { color: colors.onPrimary, ...typography.tagline }]}>
              SOS
            </Text>
            <Text style={[styles.sosButtonSub, { color: colors.onPrimary, ...typography.finePrint }]}>
              Tap to Alert
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* GPS Coordinate Source Warning (Section 6 Requirement) */}
      <View
        style={[
          styles.coordsWarningBox,
          {
            backgroundColor:
              coordsSource === 'gps' ? colors.canvas : colors.safetyCautionBackground,
            borderColor: coordsSource === 'gps' ? colors.hairline : colors.safetyCaution,
            borderRadius: rounded.lg,
            borderWidth: 1,
            marginHorizontal: spacing.md,
            marginBottom: spacing.md,
            padding: spacing.md,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={[
              styles.coordsWarningTitle,
              {
                color: coordsSource === 'gps' ? colors.ink : colors.safetyCaution,
                ...typography.captionStrong,
              },
            ]}
          >
            {coordsSource === 'gps'
              ? '📍 Live GPS Fix Active (Accurate)'
              : coordsSource === 'stale'
              ? '⚠️ Warning: Using Stale Coordinates'
              : 'ℹ️ Demo Simulated Coordinates'}
          </Text>

          {/* Dev Coordinate Source Switcher */}
          <View style={{ flexDirection: 'row' }}>
            {(['gps', 'stale', 'demo'] as CoordsSource[]).map((src) => (
              <TouchableOpacity
                key={src}
                onPress={() => setCoordsSource(src)}
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: rounded.sm,
                  backgroundColor: coordsSource === src ? colors.primary : colors.surfacePearl,
                  marginLeft: 3,
                }}
              >
                <Text
                  style={{
                    color: coordsSource === src ? colors.onPrimary : colors.ink,
                    fontSize: 10,
                    fontWeight: '600',
                  }}
                >
                  {src.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {coordsSource !== 'gps' && (
          <Text
            style={[
              styles.coordsWarningDesc,
              { color: colors.inkMuted80, ...typography.microLegal, marginTop: 4 },
            ]}
          >
            Coordinates transmitted to responders may not reflect your exact real-time physical position.
          </Text>
        )}
      </View>

      {/* Official Emergency Dialers (Prefills Dialer Directly - Never Auto-calls) */}
      <View style={[styles.dialerSection, { paddingHorizontal: spacing.md, marginBottom: spacing.md }]}>
        <Text style={[styles.dialerHeader, { color: colors.ink, ...typography.captionStrong, marginBottom: spacing.xs }]}>
          Official Emergency Hotlines (Opens Dialer Directly)
        </Text>
        <View style={styles.dialerRow}>
          <TouchableOpacity
            style={[
              styles.dialerBtn,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                minHeight: accessibility.minTouchTarget,
                padding: spacing.md,
                flex: 1,
                marginRight: spacing.xs,
              },
            ]}
            onPress={() => handleDial('112')}
            accessibilityRole="button"
            accessibilityLabel="Dial 112"
          >
            <Text style={[styles.dialerNumber, { color: colors.primary, ...typography.tagline }]}>
              📞 112
            </Text>
            <Text style={[styles.dialerLabel, { color: colors.inkMuted80, ...typography.finePrint }]}>
              ERSS Police / Ambulance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dialerBtn,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                minHeight: accessibility.minTouchTarget,
                padding: spacing.md,
                flex: 1,
                marginLeft: spacing.xs,
              },
            ]}
            onPress={() => handleDial('1091')}
            accessibilityRole="button"
            accessibilityLabel="Dial 1091"
          >
            <Text style={[styles.dialerNumber, { color: colors.primary, ...typography.tagline }]}>
              📞 1091
            </Text>
            <Text style={[styles.dialerLabel, { color: colors.inkMuted80, ...typography.finePrint }]}>
              Delhi Women Distress
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Per-Contact Delivery Status Audit (Truth in Dispatch) */}
      {isAlertActive && activeAlert && (
        <View style={[styles.auditCard, { marginHorizontal: spacing.md, marginBottom: spacing.md }]}>
          <View
            style={[
              styles.auditBox,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.lg,
                padding: spacing.md,
              },
            ]}
          >
            <Text style={[styles.auditTitle, { color: colors.ink, ...typography.bodyStrong }]}>
              {t.sos.deliveryStatusTitle}
            </Text>
            <Text style={[styles.auditSubtitle, { color: colors.inkMuted80, ...typography.microLegal, marginBottom: spacing.xs }]}>
              Truth in Dispatch: live delivery receipts per contact
            </Text>

            {/* Delivery list */}
            {activeAlert.contactDeliveries.map((receipt) => {
              const badge = getStatusBadgeStyle(receipt.status);
              return (
                <View
                  key={receipt.contactId}
                  style={[
                    styles.receiptRow,
                    {
                      borderTopColor: colors.dividerSoft,
                      borderTopWidth: StyleSheet.hairlineWidth,
                      paddingVertical: spacing.xs,
                      marginTop: spacing.xs,
                    },
                  ]}
                >
                  <View style={styles.receiptLeft}>
                    <Text style={[styles.receiptName, { color: colors.ink, ...typography.bodyStrong }]}>
                      {receipt.contactName} ({receipt.channel.toUpperCase()})
                    </Text>
                    <Text style={[styles.receiptDetail, { color: colors.inkMuted80, ...typography.finePrint }]}>
                      {receipt.detail || receipt.phone}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: badge.bg,
                        borderRadius: rounded.sm,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: badge.text,
                          ...typography.microLegal,
                        },
                      ]}
                    >
                      {badge.label}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Real Offline SMS Fallback Action */}
            <TouchableOpacity
              style={[
                styles.offlineFallbackBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderWidth: 1,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  marginTop: spacing.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
              onPress={sendOfflineSmsToContacts}
              accessibilityRole="button"
              accessibilityLabel="Open native SMS with emergency coordinates link"
            >
              <Text style={[styles.offlineFallbackText, { color: colors.primary, ...typography.captionStrong }]}>
                💬 Send Native SMS with Maps Link
              </Text>
            </TouchableOpacity>

            {/* Simulator Button */}
            <TouchableOpacity
              style={[
                styles.offlineSimBtn,
                {
                  marginTop: spacing.xs,
                  alignItems: 'center',
                  paddingVertical: 6,
                },
              ]}
              onPress={triggerOfflineFallback}
            >
              <Text style={{ color: colors.inkMuted48, fontSize: 11 }}>
                (Simulate Offline Fallback Transition)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Community First Responder Rescue Network */}
      <View
        style={[
          styles.communityCard,
          {
            backgroundColor: colors.canvas,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            marginHorizontal: spacing.md,
            marginBottom: spacing.xxl,
            padding: spacing.md,
          },
        ]}
      >
        <Text style={[styles.communityTitle, { color: colors.ink, ...typography.tagline }]}>
          {t.sos.communityRescueTitle}
        </Text>
        <Text style={[styles.communityDesc, { color: colors.inkMuted80, ...typography.caption, marginTop: 2 }]}>
          Vetted volunteers within radius: campus guards, certified self-defense coaches, NGO volunteers.
        </Text>

        <View style={[styles.wavesRow, { marginTop: spacing.sm }]}>
          <Text style={[styles.waveItem, { color: colors.primary, ...typography.captionStrong }]}>
            Wave 1: ≤ 500m
          </Text>
          <Text style={[styles.waveItem, { color: colors.inkMuted80, ...typography.caption }]}>
            → Wave 2: 1000m (60s)
          </Text>
          <Text style={[styles.waveItem, { color: colors.inkMuted80, ...typography.caption }]}>
            → Wave 3: 2000m
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sosCard: {
    borderWidth: 1,
    alignItems: 'center',
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardSubtitle: {
    lineHeight: 18,
  },
  durationSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationLabel: {
    marginRight: 6,
    letterSpacing: 0.5,
  },
  durationPill: {
    alignItems: 'center',
  },
  durationText: {
    fontWeight: '700',
  },
  countdownContainer: {
    alignItems: 'center',
    width: '100%',
  },
  countdownCircle: {
    width: 140,
    height: 140,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  countdownNumber: {
    fontWeight: '700',
  },
  countdownLabel: {
    textTransform: 'uppercase',
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    width: '100%',
  },
  cancelText: {
    textAlign: 'center',
  },
  sendNowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  sendNowText: {
    textAlign: 'center',
  },
  activeAlertContainer: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  activeAlertPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeAlertText: {
    fontWeight: '700',
  },
  cancelActiveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelActiveText: {
    textAlign: 'center',
  },
  triggerSosButton: {
    elevation: 4,
  },
  sosButtonText: {
    fontWeight: '800',
    fontSize: 28,
  },
  sosButtonSub: {
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordsWarningBox: {
    borderWidth: 1,
  },
  coordsWarningTitle: {
    fontWeight: '600',
  },
  coordsWarningDesc: {
    lineHeight: 16,
  },
  dialerSection: {},
  dialerHeader: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dialerRow: {
    flexDirection: 'row',
  },
  dialerBtn: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialerNumber: {
    fontWeight: '700',
    marginBottom: 2,
  },
  dialerLabel: {
    textAlign: 'center',
  },
  auditCard: {},
  auditBox: {
    borderWidth: 1,
  },
  auditTitle: {
    marginBottom: 2,
  },
  auditSubtitle: {
    marginBottom: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptLeft: {
    flex: 1,
  },
  receiptName: {},
  receiptDetail: {
    marginTop: 2,
  },
  statusPill: {},
  statusPillText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  offlineFallbackBtn: {
    width: '100%',
  },
  offlineFallbackText: {
    fontWeight: '600',
  },
  offlineSimBtn: {
    width: '100%',
  },
  communityCard: {
    borderWidth: 1,
  },
  communityTitle: {
    marginBottom: 2,
  },
  communityDesc: {
    lineHeight: 18,
  },
  wavesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  waveItem: {},
});
