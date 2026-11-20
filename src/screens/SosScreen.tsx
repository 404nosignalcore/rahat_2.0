import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CountdownOption, useSOS } from '../context/SOSProvider';
import { communitySosEngine } from '../engines/communitySosService';
import { useI18n } from '../i18n';
import { ResponderAlertModal } from '../modals/ResponderAlertModal';
import { ResponderDashboardModal } from '../modals/ResponderDashboardModal';
import { SafeCodeCancelModal } from '../modals/SafeCodeCancelModal';
import { useTheme } from '../theme';
import {
  CommunitySosSession,
  CoordsSource,
  DeliveryStatus,
  Responder,
} from '../types/safety';

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

  // Community Rescue Network State
  const [activeSession, setActiveSession] = useState<CommunitySosSession | null>(null);
  const [isResponderAlertVisible, setIsResponderAlertVisible] = useState<boolean>(false);
  const [isResponderDashboardVisible, setIsResponderDashboardVisible] = useState<boolean>(false);
  const [isSafeCodeModalVisible, setIsSafeCodeModalVisible] = useState<boolean>(false);
  const [simulateRaceLost, setSimulateRaceLost] = useState<boolean>(false);

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

  // Rescue Network Simulation Handlers
  const handleSimulateIncomingAlert = () => {
    const session: CommunitySosSession = {
      id: `sim_session_${Date.now()}`,
      alertId: activeAlert?.id || 'alert_delhi_101',
      victimUid: 'user_pooja_cp',
      victimFirstName: 'Pooja',
      location: { latitude: 28.6328, longitude: 77.2197 },
      wave: 1,
      status: 'searching',
      createdAt: Date.now(),
    };
    setActiveSession(session);
    setSimulateRaceLost(false);
    setIsResponderAlertVisible(true);
  };

  const handleAcceptMission = () => {
    if (!activeSession) return;

    const mockResponder: Responder = {
      uid: 'resp_priya_01',
      firstName: 'Priya',
      onDuty: true,
      geohash: 'ttnfu',
      credentials: ['First Aid Certified', 'Self-Defense Coach'],
      verificationStatus: 'verified',
      updatedAt: Date.now(),
    };

    const res = communitySosEngine.attemptAcceptance(
      activeSession,
      mockResponder,
      { latitude: 28.6301, longitude: 77.2252 }
    );

    if (res.success && res.session) {
      setActiveSession(res.session);
      setIsResponderAlertVisible(false);
      setIsResponderDashboardVisible(true);
    } else {
      setSimulateRaceLost(true);
    }
  };

  const handleDeclineMission = () => {
    setIsResponderAlertVisible(false);
    setSimulateRaceLost(false);
  };

  const handleSafeCodeSuccess = (isDuress: boolean) => {
    setIsSafeCodeModalVisible(false);
    if (isDuress) {
      // Covert duress handling (Section 6 & 8.3)
      Alert.alert(
        'Alert Canceled',
        'Your alert has been marked as resolved.',
        [
          {
            text: 'OK',
            onPress: () => {
              cancelAlert();
            },
          },
        ]
      );
    } else {
      Alert.alert('Safe-Code Verified', 'Emergency broadcast canceled safely.');
      cancelAlert();
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
                onPress={() => setIsSafeCodeModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Cancel active SOS alert with safe-code"
              >
                <Text style={[styles.cancelActiveText, { color: colors.ink, ...typography.bodyStrong }]}>
                  Cancel with Safe-Code
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

      {/* Community First Responder Rescue Network (Section 6 & 8.3) */}
      <View
        style={[
          styles.communityCard,
          {
            backgroundColor: colors.canvas,
            borderColor: colors.hairline,
            borderRadius: rounded.lg,
            marginHorizontal: spacing.md,
            marginBottom: spacing.md,
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

        {/* Wave Expansion Info */}
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

        {/* Victim View: Responder Assigned Card (Section 6 & 8.3) */}
        {activeSession && activeSession.status === 'accepted' && activeSession.responderInfo && (
          <View
            style={[
              styles.assignedResponderBox,
              {
                backgroundColor: colors.canvasParchment,
                borderColor: colors.safetySafe,
                borderWidth: 1,
                borderRadius: rounded.md,
                padding: spacing.sm,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                {/* FIRST NAME ONLY per non-negotiables */}
                <Text style={{ color: colors.ink, ...typography.bodyStrong }}>
                  🛡️ {activeSession.responderInfo.firstName} is coming to help
                </Text>
                <Text style={{ color: colors.inkMuted80, ...typography.finePrint, marginTop: 2 }}>
                  Credentials: {activeSession.responderInfo.credentials.join(' • ')}
                </Text>
                <Text style={{ color: colors.primary, ...typography.microLegal, marginTop: 2 }}>
                  Distance: {activeSession.responderInfo.distanceMeters}m • Walking ETA ~{Math.round(activeSession.responderInfo.etaSeconds / 60)} min
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: rounded.pill,
                }}
                onPress={() => handleDial('112')}
                accessibilityRole="button"
                accessibilityLabel="Call responder coordinator"
              >
                <Text style={{ color: colors.onPrimary, ...typography.captionStrong }}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Dev Rescue Network Simulation Controls */}
        <View style={{ marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.dividerSoft, paddingTop: spacing.sm }}>
          <Text style={{ color: colors.inkMuted48, ...typography.microLegal, marginBottom: 4 }}>
            DEV / DEMO RESCUE NETWORK SIMULATOR
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.surfacePearl,
                borderColor: colors.hairline,
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: rounded.pill,
                flex: 1,
                alignItems: 'center',
              }}
              onPress={handleSimulateIncomingAlert}
            >
              <Text style={{ color: colors.ink, fontSize: 11, fontWeight: '600' }}>
                Simulate Responder Alert
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: colors.surfacePearl,
                borderColor: colors.hairline,
                borderWidth: 1,
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: rounded.pill,
                flex: 1,
                alignItems: 'center',
              }}
              onPress={() => {
                const session: CommunitySosSession = {
                  id: `race_${Date.now()}`,
                  alertId: 'alert_delhi_101',
                  victimUid: 'user_01',
                  victimFirstName: 'Pooja',
                  location: { latitude: 28.6328, longitude: 77.2197 },
                  wave: 1,
                  status: 'accepted',
                  createdAt: Date.now(),
                };
                setActiveSession(session);
                setSimulateRaceLost(true);
                setIsResponderAlertVisible(true);
              }}
            >
              <Text style={{ color: colors.ink, fontSize: 11, fontWeight: '600' }}>
                Simulate Race Lost
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <View style={[styles.auditCard, { marginHorizontal: spacing.md, marginBottom: spacing.xxl }]}>
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

      {/* Responder Modals */}
      <ResponderAlertModal
        visible={isResponderAlertVisible}
        session={activeSession}
        alreadyAccepted={simulateRaceLost}
        onAccept={handleAcceptMission}
        onDecline={handleDeclineMission}
      />

      <ResponderDashboardModal
        visible={isResponderDashboardVisible}
        session={activeSession}
        onArrived={() => {
          Alert.alert('Arrived on Scene', 'Victim notified of your arrival. Please stay in safe contact.');
        }}
        onClose={() => setIsResponderDashboardVisible(false)}
        onReportSuspicious={() => {
          Alert.alert('Report Registered', 'Incident logged with community safety coordinator.');
          setIsResponderDashboardVisible(false);
        }}
      />

      <SafeCodeCancelModal
        visible={isSafeCodeModalVisible}
        onCancelSuccess={handleSafeCodeSuccess}
        onDismiss={() => setIsSafeCodeModalVisible(false)}
      />
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
  assignedResponderBox: {},
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
});
