import React from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface SafeHeroesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SafeHeroesModal: React.FC<SafeHeroesModalProps> = ({ visible, onClose }) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  const handleDial = (phoneNumber: string) => {
    // Opens the native phone dialer with number prefilled; user initiates the call
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      // In case dialer cannot be opened (e.g. simulator)
    });
  };

  const contactsList = [
    t.safeHeroes.contacts.erss112,
    t.safeHeroes.contacts.women1091,
    t.safeHeroes.contacts.ncw7827,
    t.safeHeroes.contacts.cyber1930,
    t.safeHeroes.contacts.delhiSpecialCell,
    t.safeHeroes.contacts.sakhiCentre,
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.canvasParchment }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.hairline, padding: spacing.md }]}>
          <View style={styles.headerTitleWrap}>
            <Text style={[styles.title, { color: colors.ink, ...typography.tagline }]}>
              {t.safeHeroes.title}
            </Text>
            <Text style={[styles.prefillNotice, { color: colors.inkMuted48, ...typography.finePrint }]}>
              {t.safeHeroes.callPrefillNotice}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                backgroundColor: colors.surfacePearl,
                borderRadius: rounded.full,
                minHeight: accessibility.minTouchTarget,
                minWidth: accessibility.minTouchTarget,
              },
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t.common.close}
          >
            <Text style={[styles.closeText, { color: colors.ink, ...typography.captionStrong }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
          {/* Statutory Disclaimer Alert */}
          <View
            style={[
              styles.disclaimerCard,
              {
                backgroundColor: colors.safetyCautionBackground,
                borderColor: colors.safetyCaution,
                borderRadius: rounded.lg,
                padding: spacing.md,
                marginBottom: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.disclaimerText, { color: colors.ink, ...typography.caption }]}>
              {t.safeHeroes.statutoryDisclaimer}
            </Text>
          </View>

          {/* Emergency contacts list */}
          {contactsList.map((item, index) => (
            <View
              key={index}
              style={[
                styles.contactCard,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.hairline,
                  borderRadius: rounded.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.cardInfo}>
                <Text style={[styles.contactName, { color: colors.ink, ...typography.bodyStrong }]}>
                  {item.name}
                </Text>
                <Text style={[styles.contactDescription, { color: colors.inkMuted80, ...typography.caption }]}>
                  {item.description}
                </Text>
                <Text style={[styles.verifiedDate, { color: colors.inkMuted48, ...typography.finePrint }]}>
                  {t.safeHeroes.lastVerifiedPrefix} {item.lastVerified}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.callButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                  },
                ]}
                onPress={() => handleDial(item.number)}
                accessibilityRole="button"
                accessibilityLabel={`${t.common.call} ${item.name} ${item.number}`}
              >
                <Text style={[styles.callButtonText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
                  {t.common.call} {item.number}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  prefillNotice: {
    lineHeight: 14,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
  },
  content: {
    paddingBottom: 40,
  },
  disclaimerCard: {
    borderWidth: 1,
  },
  disclaimerText: {
    lineHeight: 20,
  },
  contactCard: {
    borderWidth: 1,
  },
  cardInfo: {
    marginBottom: 12,
  },
  contactName: {
    marginBottom: 4,
  },
  contactDescription: {
    marginBottom: 6,
    lineHeight: 18,
  },
  verifiedDate: {
    fontStyle: 'italic',
  },
  callButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    textAlign: 'center',
  },
});
