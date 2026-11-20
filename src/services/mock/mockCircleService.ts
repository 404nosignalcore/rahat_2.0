import { ICircleService } from '../interfaces';
import { SafeCircle } from '../../types/safety';

export class MockCircleService implements ICircleService {
  private circles: SafeCircle[] = [
    {
      id: 'circle_family_01',
      ownerUid: 'demo_user_delhi_01',
      name: 'Family & Home',
      sharingEnabled: true,
      createdAt: Date.now() - 86400000 * 40,
      members: {
        demo_user_delhi_01: {
          uid: 'demo_user_delhi_01',
          displayName: 'Priya Sharma (You)',
          shareLocation: true,
          role: 'owner',
          joinedAt: Date.now() - 86400000 * 40,
        },
        user_aarti_02: {
          uid: 'user_aarti_02',
          displayName: 'Aarti Sharma',
          shareLocation: true,
          role: 'member',
          joinedAt: Date.now() - 86400000 * 35,
          lastKnownLocation: { latitude: 28.6289, longitude: 77.2195 },
        },
      },
    },
  ];

  async getCircles(): Promise<SafeCircle[]> {
    return [...this.circles];
  }

  async setShareLocation(circleId: string, shareLocation: boolean): Promise<void> {
    const circle = this.circles.find((c) => c.id === circleId);
    if (circle && circle.members['demo_user_delhi_01']) {
      circle.members['demo_user_delhi_01'].shareLocation = shareLocation;
    }
  }

  async createCircle(name: string): Promise<SafeCircle> {
    const newCircle: SafeCircle = {
      id: `circle_${Date.now()}`,
      ownerUid: 'demo_user_delhi_01',
      name: name.trim(),
      sharingEnabled: true,
      createdAt: Date.now(),
      members: {
        demo_user_delhi_01: {
          uid: 'demo_user_delhi_01',
          displayName: 'Priya Sharma (You)',
          shareLocation: true,
          role: 'owner',
          joinedAt: Date.now(),
        },
      },
    };
    this.circles.push(newCircle);
    return newCircle;
  }
}
