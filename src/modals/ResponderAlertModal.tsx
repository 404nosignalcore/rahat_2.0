import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { CommunitySosSession } from '../types/safety';

export interface ResponderAlertModalProps {
  visible: boolean;
  session: CommunitySosSession | null;
  onAccept: () => void;
  onDecline: () => void;
  alreadyAccepted?: boolean;
}

export const ResponderAlertModal: React.FC<ResponderAlertModalProps> = ({
  visible,
  session,
  onAccept,
  onDecline,
  alreadyAccepted = false,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const [countdown, setCountdown] = useState<number>(30);

  useEffect(() => {
    if (!visible) {
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onDecline]);

  if (!visible || !session) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.canvas,
              borderColor: colors.safetyDanger,
              borderRadius: rounded.lg,
              padding: spacing.lg,
            },
          ]}
        >
          {alreadyAccepted ? (
            <View style={styles.dismissedContainer}>
              <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>🤝</Text>
              <Text style={[styles.title, { color: colors.ink, ...typography.tagline, textAlign: 'center' }]}>
                Responder Assigned
              </Text>
              <Text
                style={[
                  styles.desc,
                  { color: colors.inkMuted80, ...typography.caption, textAlign: 'center', marginVertical: spacing.sm },
                ]}
              >
                Another nearby verified responder has already accepted this rescue call. Thank you for standing by and keeping Delhi safe!
              </Text>
              <TouchableOpacity
                style={[
                  styles.dismissBtn,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    marginTop: spacing.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={onDecline}
                accessibilityRole="button"
                accessibilityLabel="Dismiss alert"
              >
                <Text style={{ color: colors.ink, ...typography.bodyStrong }}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Emergency Banner */}
              <View
                style={[
                  styles.alertBadge,
                  {
                    backgroundColor: colors.safetyDangerBackground,
                    borderRadius: rounded.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 4,
                    alignSelf: 'center',
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                <Text style={{ color: colors.safetyDanger, ...typography.microLegal, fontWeight: '700' }}>
                  🚨 COMMUNITY RESCUE ALERT ({countdown}s)
                </Text>
              </View>

              <Text style={[styles.title, { color: colors.ink, ...typography.tagline, textAlign: 'center' }]}>
                {session.victimFirstName} needs assistance
              </Text>
              <Text
                style={[
                  styles.desc,
                  { color: colors.inkMuted80, ...typography.caption, textAlign: 'center', marginBottom: spacing.md },
                ]}
              >
                Emergency distress signal triggered near your location (Wave {session.wave} broadcast).
              </Text>

              {/* Distance & ETA Details */}
              <View
                style={[
                  styles.infoRow,
                  {
                    backgroundColor: colors.canvasParchment,
                    borderRadius: rounded.md,
                    padding: spacing.sm,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                <View style={styles.infoCol}>
                  <Text style={{ color: colors.inkMuted48, ...typography.microLegal }}>DISTANCE</Text>
                  <Text style={{ color: colors.ink, ...typography.bodyStrong, fontSize: 18 }}>~320 m</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={{ color: colors.inkMuted48, ...typography.microLegal }}>WALKING ETA</Text>
                  <Text style={{ color: colors.primary, ...typography.bodyStrong, fontSize: 18 }}>~4 min</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={{ color: colors.inkMuted48, ...typography.microLegal }}>WAVE TIER</Text>
                  <Text style={{ color: colors.ink, ...typography.bodyStrong, fontSize: 18 }}>Tier {session.wave}</Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  {
                    backgroundColor: colors.safetySafe,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.xs,
                  },
                ]}
                onPress={onAccept}
                accessibilityRole="button"
                accessibilityLabel="Accept emergency rescue dispatch"
              >
                <Text style={{ color: colors.onPrimary, ...typography.bodyStrong }}>
                  ✓ Accept Rescue Mission
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.declineBtn,
                  {
                    backgroundColor: colors.surfacePearl,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                onPress={onDecline}
                accessibilityRole="button"
                accessibilityLabel="Decline emergency rescue dispatch"
              >
                <Text style={{ color: colors.inkMuted80, ...typography.body }}>
                  Cannot Respond Right Now
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    borderWidth: 2,
  },
  title: {},
  desc: {},
  alertBadge: {},
  dismissedContainer: {
    alignItems: 'center',
  },
  dismissBtn: {
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoCol: {
    alignItems: 'center',
  },
  acceptBtn: {
    width: '100%',
  },
  declineBtn: {
    width: '100%',
  },
});
