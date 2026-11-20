import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CreateReportInput } from '../services';
import { IncidentCategory, LatLng } from '../types/safety';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface CreateReportModalProps {
  visible: boolean;
  defaultLocation: LatLng;
  defaultAreaTag: string;
  onClose: () => void;
  onSubmit: (input: CreateReportInput) => Promise<unknown>;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  visible,
  defaultLocation,
  defaultAreaTag,
  onClose,
  onSubmit,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  const [category, setCategory] = useState<IncidentCategory>('poor_lighting');
  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [areaTag, setAreaTag] = useState<string>(defaultAreaTag);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const categories: { key: IncidentCategory; label: string }[] = [
    { key: 'poor_lighting', label: t.categories.poor_lighting },
    { key: 'secluded_area', label: t.categories.secluded_area },
    { key: 'harassment', label: t.categories.harassment },
    { key: 'verbal_abuse', label: t.categories.verbal_abuse },
    { key: 'stalking', label: t.categories.stalking },
    { key: 'suspicious_activity', label: t.categories.suspicious_activity },
    { key: 'unsafe_transport', label: t.categories.unsafe_transport },
    { key: 'physical_assault', label: t.categories.physical_assault },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a brief summary of the safety hazard.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide location details of the hazard.');
      return;
    }

    // Client-side moderation check: block phone numbers or PII
    const phoneRegex = /(\+91[\-\s]?)?[6789]\d{9}/g;
    if (phoneRegex.test(title) || phoneRegex.test(description)) {
      Alert.alert(
        'Privacy Moderation Rule',
        'Safety reports cannot include phone numbers, personal names, or private identifying details. Please report the environmental hazard itself.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        category,
        severity,
        title: title.trim().slice(0, 120),
        description: description.trim().slice(0, 1000),
        location: defaultLocation,
        areaTag: areaTag.trim() || defaultAreaTag,
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      Alert.alert('Submission Error', (err as Error).message || 'Unable to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.hairline, padding: spacing.md }]}>
          <Text style={[styles.headerTitle, { color: colors.ink, ...typography.tagline }]}>
            Report a Safety Hazard
          </Text>
          <TouchableOpacity
            style={[
              styles.closeBtn,
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
            <Text style={[styles.closeBtnText, { color: colors.ink, ...typography.captionStrong }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { padding: spacing.md }]}>
          {/* Statutory and Verification Notice */}
          <View
            style={[
              styles.noticeCard,
              {
                backgroundColor: colors.safetyCautionBackground,
                borderColor: colors.safetyCaution,
                borderRadius: rounded.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text style={[styles.noticeText, { color: colors.ink, ...typography.caption }]}>
              🛡️ Unverified reports carry a 0.5x weight in dynamic risk calculations until corroborated by ≥ 3 community members.
            </Text>
            <Text style={[styles.noticeText, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 4 }]}>
              Do not name or describe individuals. Focus strictly on lighting, infrastructure, and hazard locations.
            </Text>
          </View>

          {/* Category Selector */}
          <Text style={[styles.fieldLabel, { color: colors.ink, ...typography.captionStrong, marginBottom: spacing.xs }]}>
            Hazard Category:
          </Text>
          <View style={styles.categoryGrid}>
            {categories.map((item) => {
              const isSelected = category === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.canvas,
                      borderColor: isSelected ? colors.primaryFocus : colors.hairline,
                      borderRadius: rounded.pill,
                      minHeight: accessibility.minTouchTarget,
                      paddingHorizontal: spacing.sm,
                    },
                  ]}
                  onPress={() => setCategory(item.key)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: isSelected ? colors.onPrimary : colors.ink,
                        ...typography.caption,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Severity Selector (1 to 5) */}
          <Text style={[styles.fieldLabel, { color: colors.ink, ...typography.captionStrong, marginTop: spacing.md, marginBottom: spacing.xs }]}>
            Severity Level ({severity} of 5):
          </Text>
          <View style={styles.severityRow}>
            {([1, 2, 3, 4, 5] as const).map((lvl) => {
              const isSelected = severity === lvl;
              let btnBg = colors.surfacePearl;
              if (isSelected) {
                btnBg = lvl >= 4 ? colors.safetyDanger : lvl === 3 ? colors.safetyCaution : colors.safetySafe;
              }

              return (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.severityBtn,
                    {
                      backgroundColor: btnBg,
                      borderRadius: rounded.pill,
                      minHeight: accessibility.minTouchTarget,
                      borderColor: isSelected ? colors.ink : colors.hairline,
                    },
                  ]}
                  onPress={() => setSeverity(lvl)}
                  accessibilityRole="radio"
                  accessibilityLabel={`Severity level ${lvl}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.severityText,
                      {
                        color: isSelected ? colors.onPrimary : colors.ink,
                        ...typography.bodyStrong,
                      },
                    ]}
                  >
                    {lvl}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Title Input */}
          <Text style={[styles.fieldLabel, { color: colors.ink, ...typography.captionStrong, marginTop: spacing.md, marginBottom: 4 }]}>
            Summary / Headline (max 120 chars):
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                color: colors.ink,
                borderRadius: rounded.md,
                padding: spacing.md,
                minHeight: accessibility.minTouchTarget,
              },
            ]}
            placeholder="e.g. Broken streetlights near Gate 2 pedestrian walkway"
            placeholderTextColor={colors.inkMuted48}
            maxLength={120}
            value={title}
            onChangeText={setTitle}
          />

          {/* Description Input */}
          <Text style={[styles.fieldLabel, { color: colors.ink, ...typography.captionStrong, marginTop: spacing.md, marginBottom: 4 }]}>
            Detailed Hazard Description (max 1000 chars):
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                color: colors.ink,
                borderRadius: rounded.md,
                padding: spacing.md,
              },
            ]}
            placeholder="Describe the physical hazard, surrounding landmarks, and lighting conditions..."
            placeholderTextColor={colors.inkMuted48}
            multiline
            numberOfLines={4}
            maxLength={1000}
            value={description}
            onChangeText={setDescription}
          />

          {/* Area Tag Input */}
          <Text style={[styles.fieldLabel, { color: colors.ink, ...typography.captionStrong, marginTop: spacing.md, marginBottom: 4 }]}>
            Area Tag:
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                color: colors.ink,
                borderRadius: rounded.md,
                padding: spacing.md,
                minHeight: accessibility.minTouchTarget,
              },
            ]}
            value={areaTag}
            onChangeText={setAreaTag}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: rounded.pill,
                minHeight: accessibility.minTouchTarget,
                marginTop: spacing.lg,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Submit safety hazard report"
          >
            <Text style={[styles.submitBtnText, { color: colors.onPrimary, ...typography.bodyStrong }]}>
              {isSubmitting ? 'Submitting...' : 'Submit Hazard Report'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {},
  closeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
  },
  content: {
    paddingBottom: 40,
  },
  noticeCard: {
    borderWidth: 1,
  },
  noticeText: {
    lineHeight: 18,
  },
  fieldLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  categoryChipText: {},
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityBtn: {
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  severityText: {},
  input: {
    borderWidth: 1,
  },
  textArea: {
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    textAlign: 'center',
  },
});
