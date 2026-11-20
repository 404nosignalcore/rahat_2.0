import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { communitySosEngine } from '../engines/communitySosService';
import { useTheme } from '../theme';

export interface SafeCodeCancelModalProps {
  visible: boolean;
  onCancelSuccess: (isDuress: boolean) => void;
  onDismiss: () => void;
}

export const SafeCodeCancelModal: React.FC<SafeCodeCancelModalProps> = ({
  visible,
  onCancelSuccess,
  onDismiss,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!visible) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setErrorMessage(null);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMessage(null);
    }
  };

  const verifyPin = (candidate: string) => {
    const result = communitySosEngine.verifyCancellationCode(candidate);
    if (result.canceled) {
      onCancelSuccess(result.isDuressAlarm);
      setPin('');
      setErrorMessage(null);
    } else {
      setErrorMessage('Incorrect PIN. Please re-enter your 4-digit Safe Code.');
      setPin('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
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
              Enter Safe-Code to Cancel
            </Text>
            <TouchableOpacity onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss safe-code entry">
              <Text style={{ color: colors.inkMuted80, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.subtitle,
              { color: colors.inkMuted80, ...typography.caption, marginTop: spacing.xs, marginBottom: spacing.md },
            ]}
          >
            Entering your personal safe-code verifies you are not under coercion.
          </Text>

          {/* PIN Dots Display */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = idx < pin.length;
              return (
                <View
                  key={idx}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: isFilled ? colors.primary : colors.surfacePearl,
                      borderColor: isFilled ? colors.primary : colors.hairline,
                      borderRadius: rounded.full,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Error Message */}
          {errorMessage && (
            <Text
              style={[
                styles.errorText,
                { color: colors.safetyDanger, ...typography.finePrint, textAlign: 'center', marginVertical: spacing.xs },
              ]}
            >
              {errorMessage}
            </Text>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['', '0', '⌫'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((digit, cIdx) => {
                  if (digit === '') {
                    return <View key={cIdx} style={styles.keyEmpty} />;
                  }
                  const isBackspace = digit === '⌫';
                  return (
                    <TouchableOpacity
                      key={cIdx}
                      style={[
                        styles.keyBtn,
                        {
                          backgroundColor: colors.surfacePearl,
                          borderColor: colors.hairline,
                          borderRadius: rounded.full,
                          minHeight: accessibility.minTouchTarget,
                        },
                      ]}
                      onPress={isBackspace ? handleBackspace : () => handleKeyPress(digit)}
                      accessibilityRole="button"
                      accessibilityLabel={isBackspace ? 'Delete digit' : `Digit ${digit}`}
                    >
                      <Text style={[styles.keyText, { color: colors.ink, ...typography.tagline }]}>
                        {digit}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Discreet Legal Notice */}
          <Text
            style={[
              styles.notice,
              { color: colors.inkMuted48, ...typography.microLegal, textAlign: 'center', marginTop: spacing.md },
            ]}
          >
            Safe-code protected under DPDP Act 2023. Coercion detection active.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderWidth: 1,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {},
  subtitle: {
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderWidth: 1,
  },
  errorText: {},
  keypad: {
    width: '100%',
    maxWidth: 280,
    marginTop: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  keyBtn: {
    width: 64,
    height: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 64,
    height: 64,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
  },
  notice: {},
});
