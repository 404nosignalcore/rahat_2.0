import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../i18n';
import { SafeHeroesModal } from '../modals/SafeHeroesModal';
import { useTheme } from '../theme';

export const TopBar: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { language, toggleLanguage, t } = useI18n();
  const [isSafeHeroesVisible, setIsSafeHeroesVisible] = useState<boolean>(false);

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.canvas,
            borderBottomColor: colors.hairline,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
          },
        ]}
      >
        {/* Brand / Logo */}
        <View style={styles.brandContainer}>
          <Text style={[styles.brandTitle, { color: colors.ink, ...typography.tagline }]}>
            {t.common.appName}
          </Text>
        </View>

        {/* Action Controls */}
        <View style={styles.actionsContainer}>
          {/* Language Toggle EN <-> HI */}
          <TouchableOpacity
            style={[
              styles.actionPill,
              {
                backgroundColor: colors.surfacePearl,
                borderColor: colors.hairline,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                minWidth: accessibility.minTouchTarget,
                paddingHorizontal: spacing.sm,
              },
            ]}
            onPress={toggleLanguage}
            accessibilityRole="button"
            accessibilityLabel={`Switch language to ${language === 'en' ? 'Hindi' : 'English'}`}
          >
            <Text style={[styles.actionText, { color: colors.primary, ...typography.captionStrong }]}>
              {language === 'en' ? 'हिं (HI)' : 'EN (अंग्रेज़ी)'}
            </Text>
          </TouchableOpacity>

          {/* SafeHeroes Emergency Button */}
          <TouchableOpacity
            style={[
              styles.actionPill,
              {
                backgroundColor: colors.safetyDangerBackground,
                borderColor: colors.safetyDanger,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                paddingHorizontal: spacing.sm,
                marginLeft: spacing.xs,
              },
            ]}
            onPress={() => setIsSafeHeroesVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open Emergency Helplines (112, 1091)"
          >
            <Text style={[styles.actionText, { color: colors.safetyDanger, ...typography.captionStrong }]}>
              🛡️ SafeHeroes
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <SafeHeroesModal visible={isSafeHeroesVisible} onClose={() => setIsSafeHeroesVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandContainer: {
    flex: 1,
  },
  brandTitle: {
    letterSpacing: -0.2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionText: {
    textAlign: 'center',
  },
});
