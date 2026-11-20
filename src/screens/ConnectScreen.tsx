import React, { useEffect, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { circleService, forumService, safeHavenService } from '../services';
import { ForumPost, SafeCircle, SafeHaven } from '../types/safety';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

export const ConnectScreen: React.FC = () => {
  const { colors, typography, rounded, spacing, accessibility } = useTheme();
  const { t } = useI18n();

  const [activeSegment, setActiveSegment] = useState<'circle' | 'havens' | 'forum'>('havens');
  const [circles, setCircles] = useState<SafeCircle[]>([]);
  const [havens, setHavens] = useState<SafeHaven[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const c = await circleService.getCircles();
        setCircles(c);
        const h = await safeHavenService.getHavensNear({ latitude: 28.6289, longitude: 77.2195 });
        setHavens(h);
        const f = await forumService.getPosts();
        setPosts(f);
      } catch {
        // Safe fallback
      }
    };
    load();
  }, []);

  const handleDial = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleToggleShare = async (circleId: string, current: boolean) => {
    await circleService.setShareLocation(circleId, !current);
    const updated = await circleService.getCircles();
    setCircles(updated);
  };

  const handleUpvote = async (postId: string) => {
    await forumService.upvotePost(postId);
    const updated = await forumService.getPosts();
    setPosts(updated);
  };

  const handleBlockUser = async (uid: string) => {
    await forumService.blockUser(uid);
    const updated = await forumService.getPosts();
    setPosts(updated);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.canvasParchment }]}>
      {/* 3-Way Segment Bar */}
      <View
        style={[
          styles.segmentContainer,
          {
            backgroundColor: colors.surfacePearl,
            borderRadius: rounded.pill,
            margin: spacing.md,
            padding: 3,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.segmentTab,
            {
              backgroundColor: activeSegment === 'havens' ? colors.canvas : 'transparent',
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
            },
          ]}
          onPress={() => setActiveSegment('havens')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'havens' }}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: activeSegment === 'havens' ? colors.primary : colors.inkMuted80,
                ...typography.captionStrong,
              },
            ]}
          >
            🛡️ {t.connect.safeHavens}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentTab,
            {
              backgroundColor: activeSegment === 'circle' ? colors.canvas : 'transparent',
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
            },
          ]}
          onPress={() => setActiveSegment('circle')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'circle' }}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: activeSegment === 'circle' ? colors.primary : colors.inkMuted80,
                ...typography.captionStrong,
              },
            ]}
          >
            👥 {t.connect.safeCircle}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentTab,
            {
              backgroundColor: activeSegment === 'forum' ? colors.canvas : 'transparent',
              borderRadius: rounded.pill,
              minHeight: accessibility.minTouchTarget,
            },
          ]}
          onPress={() => setActiveSegment('forum')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeSegment === 'forum' }}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color: activeSegment === 'forum' ? colors.primary : colors.inkMuted80,
                ...typography.captionStrong,
              },
            ]}
          >
            💬 {t.connect.safetyForum}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Segment 1: Safe Havens Directory */}
      {activeSegment === 'havens' && (
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.tagline, marginBottom: spacing.xs }]}>
            {t.connect.verifiedHavens}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted80, ...typography.finePrint, marginBottom: spacing.md }]}>
            Verified 24/7 emergency shelters, pink police booths, and hospital emergency wards.
          </Text>

          {havens.map((haven) => (
            <View
              key={haven.id}
              style={[
                styles.havenCard,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.hairline,
                  borderRadius: rounded.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.havenHeader}>
                <Text style={[styles.havenName, { color: colors.ink, ...typography.bodyStrong }]}>
                  {haven.name}
                </Text>
                <View
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: colors.safetySafeBackground,
                      borderRadius: rounded.sm,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text style={[styles.typePillText, { color: colors.safetySafe, ...typography.microLegal }]}>
                    {haven.type.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.havenDistance, { color: colors.inkMuted80, ...typography.caption, marginVertical: 2 }]}>
                📍 Distance: {haven.distanceMeters ? `${haven.distanceMeters} m` : 'Near you'} · {haven.open24x7 ? 'Open 24/7' : 'Day only'}
              </Text>
              <Text style={[styles.havenSource, { color: colors.inkMuted48, ...typography.finePrint }]}>
                Source: {haven.source} (Verified: {haven.lastVerifiedAt})
              </Text>

              <View style={[styles.havenActions, { marginTop: spacing.sm }]}>
                <TouchableOpacity
                  style={[
                    styles.havenBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: rounded.pill,
                      minHeight: accessibility.minTouchTarget,
                      paddingHorizontal: spacing.md,
                      marginRight: spacing.xs,
                    },
                  ]}
                  onPress={() => handleDial(haven.phone)}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${haven.name}`}
                >
                  <Text style={[styles.havenBtnText, { color: colors.onPrimary, ...typography.captionStrong }]}>
                    📞 Call {haven.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Segment 2: SafeCircle */}
      {activeSegment === 'circle' && (
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.tagline, marginBottom: spacing.xs }]}>
            My SafeCircles
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted80, ...typography.finePrint, marginBottom: spacing.md }]}>
            Location sharing requires explicit per-circle consent and is never active silently.
          </Text>

          {circles.map((circle) => {
            const myMembership = circle.members['demo_user_delhi_01'];
            const isSharing = Boolean(myMembership?.shareLocation);

            return (
              <View
                key={circle.id}
                style={[
                  styles.circleCard,
                  {
                    backgroundColor: colors.canvas,
                    borderColor: colors.hairline,
                    borderRadius: rounded.lg,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                <Text style={[styles.circleName, { color: colors.ink, ...typography.bodyStrong }]}>
                  {circle.name}
                </Text>

                {/* Consent Toggle */}
                <TouchableOpacity
                  style={[
                    styles.toggleRow,
                    {
                      backgroundColor: isSharing ? colors.safetySafeBackground : colors.surfacePearl,
                      borderColor: isSharing ? colors.safetySafe : colors.hairline,
                      borderRadius: rounded.md,
                      padding: spacing.sm,
                      marginVertical: spacing.sm,
                      minHeight: accessibility.minTouchTarget,
                    },
                  ]}
                  onPress={() => handleToggleShare(circle.id, isSharing)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSharing }}
                >
                  <Text style={[styles.toggleText, { color: colors.ink, ...typography.captionStrong, flex: 1 }]}>
                    {t.connect.shareLocationToggle}
                  </Text>
                  <Text style={[styles.toggleState, { color: isSharing ? colors.safetySafe : colors.inkMuted48, ...typography.captionStrong }]}>
                    {isSharing ? 'ENABLED ✓' : 'PAUSED'}
                  </Text>
                </TouchableOpacity>

                {/* Members list */}
                <Text style={[styles.membersHeader, { color: colors.inkMuted80, ...typography.finePrint, marginTop: 4 }]}>
                  Circle Members:
                </Text>
                {Object.values(circle.members).map((member) => (
                  <View key={member.uid} style={styles.memberRow}>
                    <Text style={[styles.memberName, { color: colors.ink, ...typography.caption }]}>
                      • {member.displayName} ({member.role})
                    </Text>
                    <Text style={[styles.memberSharing, { color: member.shareLocation ? colors.safetySafe : colors.inkMuted48, ...typography.finePrint }]}>
                      {member.shareLocation ? 'Sharing Live' : 'Location Hidden'}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      )}

      {/* Segment 3: Safety Forum */}
      {activeSegment === 'forum' && (
        <View style={[styles.section, { paddingHorizontal: spacing.md, paddingBottom: 40 }]}>
          <Text style={[styles.sectionTitle, { color: colors.ink, ...typography.tagline, marginBottom: spacing.xs }]}>
            Corridor Safety Forum
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.inkMuted80, ...typography.finePrint, marginBottom: spacing.md }]}>
            Coarse area updates only. Moderation blocks personal phone numbers and names.
          </Text>

          {posts.map((post) => (
            <View
              key={post.id}
              style={[
                styles.postCard,
                {
                  backgroundColor: colors.canvas,
                  borderColor: colors.hairline,
                  borderRadius: rounded.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={styles.postHeader}>
                <View
                  style={[
                    styles.areaTagPill,
                    {
                      backgroundColor: colors.surfacePearl,
                      borderRadius: rounded.sm,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text style={[styles.areaTagText, { color: colors.primary, ...typography.microLegal }]}>
                    📍 {post.areaTag}
                  </Text>
                </View>
                <Text style={[styles.topicText, { color: colors.inkMuted80, ...typography.microLegal }]}>
                  {post.topic}
                </Text>
              </View>

              <Text style={[styles.postBody, { color: colors.ink, ...typography.body, marginVertical: spacing.xs }]}>
                {post.body}
              </Text>

              <View style={[styles.postFooter, { marginTop: spacing.xs }]}>
                <TouchableOpacity
                  style={[
                    styles.upvoteBtn,
                    {
                      backgroundColor: colors.surfacePearl,
                      borderRadius: rounded.pill,
                      minHeight: accessibility.minTouchTarget,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                  onPress={() => handleUpvote(post.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Upvote post. Current upvotes: ${post.upvotes}`}
                >
                  <Text style={[styles.upvoteText, { color: colors.primary, ...typography.captionStrong }]}>
                    ▲ Helpful ({post.upvotes})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.blockBtn,
                    {
                      backgroundColor: colors.surfacePearl,
                      borderRadius: rounded.pill,
                      minHeight: accessibility.minTouchTarget,
                      paddingHorizontal: spacing.md,
                      marginLeft: spacing.xs,
                    },
                  ]}
                  onPress={() => handleBlockUser(post.authorUid)}
                  accessibilityRole="button"
                  accessibilityLabel="Block author"
                >
                  <Text style={[styles.blockText, { color: colors.inkMuted48, ...typography.finePrint }]}>
                    Block Author
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    textAlign: 'center',
  },
  section: {
    paddingBottom: 40,
  },
  sectionTitle: {
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    lineHeight: 16,
  },
  havenCard: {
    borderWidth: 1,
  },
  havenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  havenName: {
    flex: 1,
  },
  typePill: {
    marginLeft: 8,
  },
  typePillText: {
    fontWeight: '700',
  },
  havenDistance: {
    lineHeight: 18,
  },
  havenSource: {
    fontStyle: 'italic',
  },
  havenActions: {
    flexDirection: 'row',
  },
  havenBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  havenBtnText: {
    textAlign: 'center',
  },
  circleCard: {
    borderWidth: 1,
  },
  circleName: {},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleText: {},
  toggleState: {},
  membersHeader: {
    marginBottom: 4,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  memberName: {},
  memberSharing: {},
  postCard: {
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaTagPill: {},
  areaTagText: {
    fontWeight: '700',
  },
  topicText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  postBody: {
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upvoteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  upvoteText: {},
  blockBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: {},
});
