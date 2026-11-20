import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme';
import { EmergencyContact } from '../types/safety';

export interface ContactVerificationModalProps {
  visible: boolean;
  contact: EmergencyContact | null;
  onVerify: (otp: string) => Promise<boolean>;
  onResendOtp: () => Promise<string>;
  onClose: () => void;
}

export const ContactVerificationModal: React.FC<ContactVerificationModalProps> = ({
  visible,
  contact,
  onVerify,
  onResendOtp,
  onClose,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [sentCode, setSentCode] = useState<string | null>(null);

  if (!visible || !contact) return null;

  const handleSendOrResend = async () => {
    try {
      const code = await onResendOtp();
      setSentCode(code);
      setError(null);
    } catch {
      setError('Failed to transmit SMS OTP. Check network connection.');
    }
  };

  const handleSubmit = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your contact.');
      return;
    }

    const success = await onVerify(otp);
    if (success) {
      setOtp('');
      setError(null);
      onClose();
    } else {
      setError('Invalid OTP code. Please re-enter or request a new OTP.');
    }
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
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.ink, ...typography.tagline }]}>
              Verify {contact.name}
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close verification modal">
              <Text style={{ color: colors.inkMuted80, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: colors.inkMuted80, ...typography.caption, marginTop: spacing.xs, marginBottom: spacing.md },
            ]}
          >
            Pursuant to DPDP Act 2023, emergency contacts must verify consent before receiving live journey tracking.
          </Text>

          {/* Phone info */}
          <View
            style={[
              styles.phoneInfo,
              {
                backgroundColor: colors.canvasParchment,
                borderRadius: rounded.md,
                padding: spacing.sm,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text style={{ color: colors.inkMuted48, ...typography.microLegal }}>RECIPIENT NUMBER</Text>
            <Text style={{ color: colors.ink, ...typography.bodyStrong }}>{contact.phone}</Text>
            {sentCode && (
              <Text style={{ color: colors.safetySafe, ...typography.microLegal, marginTop: 4 }}>
                ℹ️ Simulated DLT SMS Sent. OTP: {sentCode}
              </Text>
            )}
          </View>

          {/* OTP Input */}
          <TextInput
            style={[
              styles.otpInput,
              {
                backgroundColor: colors.surfacePearl,
                borderColor: error ? colors.safetyDanger : colors.hairline,
                borderWidth: 1,
                borderRadius: rounded.md,
                color: colors.ink,
                minHeight: accessibility.minTouchTarget,
                paddingHorizontal: spacing.md,
                ...typography.tagline,
                textAlign: 'center',
                letterSpacing: 6,
              },
            ]}
            placeholder="000000"
            placeholderTextColor={colors.inkMuted48}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(val) => {
              setOtp(val);
              setError(null);
            }}
          />

          {error && (
            <Text
              style={[
                styles.errorText,
                { color: colors.safetyDanger, ...typography.finePrint, marginTop: spacing.xs },
              ]}
            >
              {error}
            </Text>
          )}

          {/* Actions */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.md,
              },
            ]}
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Submit 6-digit OTP code"
          >
            <Text style={{ color: colors.onPrimary, ...typography.bodyStrong }}>
              Confirm & Verify Contact
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.resendBtn,
              {
                marginTop: spacing.sm,
                alignItems: 'center',
              },
            ]}
            onPress={handleSendOrResend}
            accessibilityRole="button"
            accessibilityLabel="Resend verification SMS OTP"
          >
            <Text style={{ color: colors.primary, ...typography.captionStrong }}>
              Send / Resend 6-Digit SMS OTP
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  title: {},
  subtitle: {
    lineHeight: 18,
  },
  phoneInfo: {},
  otpInput: {
    marginVertical: 4,
  },
  errorText: {},
  verifyBtn: {
    width: '100%',
  },
  resendBtn: {
    paddingVertical: 8,
  },
});
