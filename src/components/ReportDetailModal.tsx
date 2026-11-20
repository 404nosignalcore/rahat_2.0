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
import { ReportComment, SafetyReport } from '../types/safety';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export interface ReportDetailModalProps {
  visible: boolean;
  report: SafetyReport | null;
  onClose: () => void;
  onCorroborate: (reportId: string) => Promise<void>;
  onFlag: (reportId: string, reason: string) => Promise<void>;
  onAddComment: (reportId: string, body: string) => Promise<void>;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  visible,
  report,
  onClose,
  onCorroborate,
  onFlag,
  onAddComment,
}) => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<ReportComment[]>([
    {
      id: 'comm_01',
      authorUid: 'user_cp_community',
      body: 'Verified around 9:30 PM yesterday. Pedestrian path was indeed dark.',
      createdAt: Date.now() - 3600000 * 2,
    },
  ]);
  const [hasCorroborated, setHasCorroborated] = useState<boolean>(false);

  if (!report) return null;

  const handleCorroborate = async () => {
    if (hasCorroborated) {
      Alert.alert('Notice', 'You have already corroborated this report.');
      return;
    }
    await onCorroborate(report.id);
    setHasCorroborated(true);
    Alert.alert('Corroborated', 'Thank you. Community corroborations increase report weight in the safety engine.');
  };

  const handleFlagOutdated = async () => {
    await onFlag(report.id, 'outdated');
    Alert.alert('Flagged', 'Report flagged as outdated. Reports with multiple flags enter review.');
  };

  const handleReportAbuse = async () => {
    await onFlag(report.id, 'abuse');
    Alert.alert('Reported', 'Thank you for keeping the community safe. Abuse reports are queued for admin review.');
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    // Check PII in comments
    const phoneRegex = /(\+91[\-\s]?)?[6789]\d{9}/g;
    if (phoneRegex.test(commentText)) {
      Alert.alert('Moderation', 'Comments cannot include phone numbers or private identifying details.');
      return;
    }

    const newComment: ReportComment = {
      id: `comm_${Date.now()}`,
      authorUid: 'demo_user_delhi_01',
      body: commentText.trim(),
      createdAt: Date.now(),
    };

    setComments((prev) => [...prev, newComment]);
    await onAddComment(report.id, commentText.trim());
    setCommentText('');
  };

  let badgeColor = colors.primary;
  let badgeBg = colors.surfacePearl;

  if (report.verificationStatus === 'authorized_verified') {
    badgeColor = colors.safetySafe;
    badgeBg = colors.safetySafeBackground;
  } else if (report.verificationStatus === 'community_corroborated') {
    badgeColor = colors.primary;
    badgeBg = colors.surfacePearl;
  } else if (report.verificationStatus === 'under_review') {
    badgeColor = colors.safetyCaution;
    badgeBg = colors.safetyCautionBackground;
  } else {
    badgeColor = colors.inkMuted80;
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.hairline, padding: spacing.md }]}>
          <Text style={[styles.headerCategory, { color: colors.primary, ...typography.captionStrong }]}>
            {t.categories[report.category] || report.category}
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
          {/* Title & Badge */}
          <Text style={[styles.title, { color: colors.ink, ...typography.displayMd }]}>
            {report.title}
          </Text>

          <View style={[styles.badgeRow, { marginVertical: spacing.sm }]}>
            <View
              style={[
                styles.badgePill,
                {
                  backgroundColor: badgeBg,
                  borderColor: badgeColor,
                  borderRadius: rounded.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: badgeColor, ...typography.captionStrong }]}>
                {t.verificationBadges[report.verificationStatus]}
              </Text>
            </View>

            <Text style={[styles.areaTagText, { color: colors.inkMuted80, ...typography.caption, marginLeft: 8 }]}>
              📍 {report.areaTag}
            </Text>
          </View>

          {/* Verification Status Explanation Card */}
          <View
            style={[
              styles.weightCard,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.hairline,
                borderRadius: rounded.md,
                padding: spacing.md,
                marginBottom: spacing.md,
              },
            ]}
          >
            <Text style={[styles.weightText, { color: colors.ink, ...typography.caption }]}>
              {report.verificationStatus === 'unverified'
                ? 'ℹ️ Unverified Hazard: Applies a 0.5x score modifier in the safety risk engine until 3 distinct users corroborate it.'
                : report.verificationStatus === 'community_corroborated'
                ? '✓ Corroborated by ≥ 3 community members: Applies full 1.0x score modifier.'
                : '🛡️ Authorized Verification (Admin/NGO verified): Applies full 1.5x score impact.'}
            </Text>
          </View>

          {/* Description */}
          <Text style={[styles.descTitle, { color: colors.ink, ...typography.captionStrong }]}>
            Hazard Details:
          </Text>
          <Text style={[styles.descBody, { color: colors.ink, ...typography.body, marginVertical: spacing.xs }]}>
            {report.description}
          </Text>

          {/* Primary Action Buttons */}
          <View style={[styles.actionRow, { marginVertical: spacing.md }]}>
            <TouchableOpacity
              style={[
                styles.corroborateBtn,
                {
                  backgroundColor: hasCorroborated ? colors.safetySafeBackground : colors.primary,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.lg,
                  flex: 1,
                  marginRight: spacing.xs,
                },
              ]}
              onPress={handleCorroborate}
              accessibilityRole="button"
              accessibilityLabel="Confirm I was here"
            >
              <Text
                style={[
                  styles.corroborateBtnText,
                  {
                    color: hasCorroborated ? colors.safetySafe : colors.onPrimary,
                    ...typography.bodyStrong,
                  },
                ]}
              >
                {hasCorroborated ? '✓ Corroborated' : `I Was Here (${report.corroborationCount})`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.flagBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.md,
                  borderWidth: 1,
                  marginRight: spacing.xs,
                },
              ]}
              onPress={handleFlagOutdated}
              accessibilityRole="button"
              accessibilityLabel="Flag as outdated"
            >
              <Text style={[styles.flagBtnText, { color: colors.inkMuted80, ...typography.caption }]}>
                Flag Outdated ({report.flagCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.abuseBtn,
                {
                  backgroundColor: colors.surfacePearl,
                  borderColor: colors.hairline,
                  borderRadius: rounded.pill,
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.md,
                  borderWidth: 1,
                },
              ]}
              onPress={handleReportAbuse}
              accessibilityRole="button"
              accessibilityLabel="Report abuse"
            >
              <Text style={[styles.abuseBtnText, { color: colors.safetyDanger, ...typography.caption }]}>
                Report Abuse
              </Text>
            </TouchableOpacity>
          </View>

          {/* Threaded Comments Section */}
          <View style={[styles.commentsSection, { marginTop: spacing.md }]}>
            <Text style={[styles.commentsTitle, { color: colors.ink, ...typography.tagline, marginBottom: spacing.xs }]}>
              Threaded Comments ({comments.length})
            </Text>

            {comments.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.commentBox,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.hairline,
                    borderRadius: rounded.md,
                    padding: spacing.md,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                <Text style={[styles.commentBody, { color: colors.ink, ...typography.caption }]}>
                  {c.body}
                </Text>
                <Text style={[styles.commentTime, { color: colors.inkMuted48, ...typography.finePrint, marginTop: 4 }]}>
                  Posted by verified member · {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            ))}

            {/* Add Comment Input */}
            <View style={[styles.addCommentRow, { marginTop: spacing.sm }]}>
              <TextInput
                style={[
                  styles.commentInput,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.hairline,
                    color: colors.ink,
                    borderRadius: rounded.pill,
                    paddingHorizontal: spacing.md,
                    minHeight: accessibility.minTouchTarget,
                    flex: 1,
                    marginRight: spacing.xs,
                  },
                ]}
                placeholder="Add corroborating detail (no names)..."
                placeholderTextColor={colors.inkMuted48}
                value={commentText}
                onChangeText={setCommentText}
              />

              <TouchableOpacity
                style={[
                  styles.sendCommentBtn,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: rounded.pill,
                    minHeight: accessibility.minTouchTarget,
                    paddingHorizontal: spacing.md,
                  },
                ]}
                onPress={handleSendComment}
                accessibilityRole="button"
                accessibilityLabel="Post comment"
              >
                <Text style={[styles.sendCommentText, { color: colors.onPrimary, ...typography.captionStrong }]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  headerCategory: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
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
  title: {
    lineHeight: 38,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    borderWidth: 1,
  },
  badgeText: {},
  areaTagText: {},
  weightCard: {
    borderWidth: 1,
  },
  weightText: {
    lineHeight: 18,
  },
  descTitle: {
    textTransform: 'uppercase',
  },
  descBody: {
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corroborateBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  corroborateBtnText: {
    textAlign: 'center',
  },
  flagBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagBtnText: {},
  abuseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  abuseBtnText: {},
  commentsSection: {},
  commentsTitle: {
    letterSpacing: -0.2,
  },
  commentBox: {
    borderWidth: 1,
  },
  commentBody: {
    lineHeight: 18,
  },
  commentTime: {},
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    borderWidth: 1,
  },
  sendCommentBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentText: {},
});
