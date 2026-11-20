import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSOS } from '../context/SOSProvider';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export const SosScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, shadows, accessibility } = useTheme();
  const { t } = useI18n();
  const {
    activeAlert,
    countdownSeconds,
    startCountdown,
    cancelCountdown,
    sendImmediately,
    cancelAlert,
    triggerOfflineFallback,
  } = useSOS();

  const handleDial = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  const isCountingDown = countdownSeconds !== null;
  const isAlertActive = Boolean(activeAlert);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* Signature SOS Card (Single Shadowed Element) */}
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
            : 'Hold button or tap to initiate 5-second cancelable distress countdown.'}
        </Text>

        {/* SOS Action Button */}
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

            <TouchableOpacity
              style={[
                styles.cancelActiveButton,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.lg,
                  marginTop: spacing.md,
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
              },
            ]}
            onPress={() => startCountdown(5)}
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

      {/* Official Emergency Dialers (Direct Pre-fill) */}
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

      {/* Per-Contact Delivery Status Audit */}
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

            {/* Warning for coords */}
            <Text style={[styles.coordsNotice, { color: colors.safetyCaution, ...typography.finePrint, marginTop: 4 }]}>
              📍 GPS Source: {activeAlert.coordsSource.toUpperCase()} (Delhi NCR Test Geohash)
            </Text>

            {/* Delivery list */}
            {activeAlert.contactDeliveries.map((receipt) => (
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
                      backgroundColor:
                        receipt.status === 'sent'
                          ? colors.safetySafeBackground
                          : colors.surfacePearl,
                      borderRadius: rounded.sm,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: receipt.status === 'sent' ? colors.safetySafe : colors.ink,
                        ...typography.microLegal,
                      },
                    ]}
                  >
                    {receipt.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}

            {/* Offline fallback button simulation */}
            <TouchableOpacity
              style={[
                styles.offlineFallbackBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  marginTop: spacing.md,
                },
              ]}
              onPress={triggerOfflineFallback}
              accessibilityRole="button"
              accessibilityLabel="Simulate offline SMS fallback"
            >
              <Text style={[styles.offlineFallbackText, { color: colors.primary, ...typography.captionStrong }]}>
                Simulate Offline SMS Fallback
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
    width: '100%',
  },
  cancelActiveText: {
    textAlign: 'center',
  },
  triggerSosButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonText: {
    fontWeight: '800',
  },
  sosButtonSub: {
    marginTop: 2,
  },
  dialerSection: {},
  dialerHeader: {
    textTransform: 'uppercase',
  },
  dialerRow: {
    flexDirection: 'row',
  },
  dialerBtn: {
    borderWidth: 1,
    alignItems: 'center',
  },
  dialerNumber: {
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
  coordsNotice: {
    marginBottom: 6,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptLeft: {
    flex: 1,
    paddingRight: 8,
  },
  receiptName: {},
  receiptDetail: {
    marginTop: 2,
  },
  statusPill: {},
  statusPillText: {
    fontWeight: '700',
  },
  offlineFallbackBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineFallbackText: {
    textAlign: 'center',
  },
  communityCard: {
    borderWidth: 1,
  },
  communityTitle: {},
  communityDesc: {
    lineHeight: 18,
  },
  wavesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  waveItem: {},
});
