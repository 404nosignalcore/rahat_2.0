import { IForumService } from '../interfaces';
import { ForumPost } from '../../types/safety';

export class MockForumService implements IForumService {
  private posts: ForumPost[] = [
    {
      id: 'post_01',
      areaTag: 'Janpath / Mandi House corridor',
      topic: 'Lighting Alerts',
      body: 'NDMC maintenance crew repaired high-mast lights along Tolstoy Marg today. Sidewalk is now brightly lit.',
      authorUid: 'user_delhi_22',
      upvotes: 14,
      hidden: false,
      createdAt: Date.now() - 3600000 * 4,
    },
    {
      id: 'post_02',
      areaTag: 'Cyber City / DLF Phase 2',
      topic: 'Safe Tips',
      body: 'Rapid Metro concourse has active female CISF marshals stationed near Gate 2 until midnight.',
      authorUid: 'user_gurgaon_55',
      upvotes: 27,
      hidden: false,
      createdAt: Date.now() - 3600000 * 12,
    },
    {
      id: 'post_03',
      areaTag: 'Hauz Khas / Green Park Metro',
      topic: 'Suspicious Activity',
      body: 'Unlicensed e-rickshaw drivers crowding the narrow lane near the exit gate. Recommend using main road exit.',
      authorUid: 'user_south_19',
      upvotes: 9,
      hidden: false,
      createdAt: Date.now() - 3600000 * 20,
    },
  ];

  private blockedUids = new Set<string>();

  async getPosts(areaTag?: string): Promise<ForumPost[]> {
    return this.posts.filter((p) => {
      if (p.hidden || this.blockedUids.has(p.authorUid)) return false;
      if (areaTag && !p.areaTag.toLowerCase().includes(areaTag.toLowerCase())) return false;
      return true;
    });
  }

  async createPost(areaTag: string, topic: ForumPost['topic'], body: string): Promise<ForumPost> {
    const newPost: ForumPost = {
      id: `post_${Date.now()}`,
      areaTag: areaTag.trim(),
      topic,
      body: body.trim(),
      authorUid: 'demo_user_delhi_01',
      upvotes: 0,
      hidden: false,
      createdAt: Date.now(),
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  async upvotePost(postId: string): Promise<void> {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.upvotes += 1;
    }
  }

  async blockUser(blockedUid: string): Promise<void> {
    this.blockedUids.add(blockedUid);
  }
}
