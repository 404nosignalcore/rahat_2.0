import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';
import { SERVICE_MODE } from '../services';
import { useTheme } from '../theme';

export interface StatusBannerProps {
  isOffline?: boolean;
  isGpsSearching?: boolean;
  hasActiveAlert?: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  isOffline = false,
  isGpsSearching = false,
  hasActiveAlert = false,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // If dismissed or nothing to show and not in mock mode, return null
  if (isDismissed) return null;

  const isDemo = SERVICE_MODE === 'mock';
  const shouldShow = isOffline || isGpsSearching || hasActiveAlert || isDemo;
  if (!shouldShow) return null;

  let message = t.statusBanner.demoMode;
  let bg = colors.surfacePearl;
  let textColor = colors.ink;
  let borderColor = colors.hairline;

  if (hasActiveAlert) {
    message = t.statusBanner.activeAlert;
    bg = colors.safetyDangerBackground;
    textColor = colors.safetyDanger;
    borderColor = colors.safetyDanger;
  } else if (isOffline) {
    message = t.statusBanner.offline;
    bg = colors.safetyCautionBackground;
    textColor = colors.safetyCaution;
    borderColor = colors.safetyCaution;
  } else if (isGpsSearching) {
    message = t.statusBanner.gpsSearching;
    bg = colors.surfacePearl;
    textColor = colors.inkMuted80;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderBottomColor: borderColor,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
      ]}
      accessibilityRole="alert"
    >
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: textColor, ...typography.caption }]}>
          {message}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.dismissButton,
          {
            borderRadius: rounded.pill,
            minHeight: accessibility.minTouchTarget,
            minWidth: accessibility.minTouchTarget,
          },
        ]}
        onPress={() => setIsDismissed(true)}
        accessibilityLabel={t.common.dismiss}
        accessibilityRole="button"
      >
        <Text style={[styles.dismissText, { color: colors.primary, ...typography.captionStrong }]}>
          {t.common.dismiss}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  text: {
    flexWrap: 'wrap',
  },
  dismissButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dismissText: {
    textAlign: 'center',
  },
});
