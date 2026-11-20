import { IJourneyService } from '../interfaces';
import { CorridorRoute, Journey, LatLng } from '../../types/safety';

export class MockJourneyService implements IJourneyService {
  private activeJourney: Journey | null = null;

  private sampleCorridors: CorridorRoute[] = [
    {
      id: 'route_safest_01',
      title: 'Barakhamba - Mandi House Boulevard',
      tag: 'safest',
      distanceMeters: 1450,
      etaSeconds: 1080,
      lightingPercent: 94,
      cctvPercent: 88,
      safeHavensCount: 4,
      rankingRationale: 'Continuous street lighting, 2 metro police booths, and 24/7 footfall along Barakhamba Rd.',
      coordinates: [
        { latitude: 28.6328, longitude: 77.2197 }, // Rajiv Chowk Gate 3
        { latitude: 28.6301, longitude: 77.2252 }, // Barakhamba Crossing
        { latitude: 28.6258, longitude: 77.2345 }, // Mandi House Metro
      ],
    },
    {
      id: 'route_well_lit_02',
      title: 'Janpath - Tolstoy Marg Corridor',
      tag: 'well_lit',
      distanceMeters: 1620,
      etaSeconds: 1200,
      lightingPercent: 98,
      cctvPercent: 75,
      safeHavensCount: 3,
      rankingRationale: 'High-density NDMC LED installations with wide sidewalks and active hotel security presence.',
      coordinates: [
        { latitude: 28.6328, longitude: 77.2197 },
        { latitude: 28.6247, longitude: 77.2185 },
        { latitude: 28.6258, longitude: 77.2345 },
      ],
    },
    {
      id: 'route_quickest_03',
      title: 'Radial Alley - Feroze Shah Cut',
      tag: 'quickest',
      distanceMeters: 1100,
      etaSeconds: 780,
      lightingPercent: 62,
      cctvPercent: 40,
      safeHavensCount: 1,
      rankingRationale: 'Shortest path, but traverses 2 dim alleyways with isolated foot traffic.',
      coordinates: [
        { latitude: 28.6328, longitude: 77.2197 },
        { latitude: 28.6285, longitude: 77.2285 },
        { latitude: 28.6258, longitude: 77.2345 },
      ],
    },
  ];

  async getActiveJourney(): Promise<Journey | null> {
    return this.activeJourney;
  }

  async startJourney(origin: LatLng, destination: LatLng, routeId?: string): Promise<Journey> {
    const selected = this.sampleCorridors.find((c) => c.id === routeId) || this.sampleCorridors[0];
    const polyline = JSON.stringify(selected?.coordinates || [origin, destination]);

    this.activeJourney = {
      id: `journey_${Date.now()}`,
      userId: 'demo_user_delhi_01',
      origin: { ...origin, name: 'Current Location' },
      destination: { ...destination, name: 'Destination' },
      routePolyline: polyline,
      status: 'active',
      currentLocation: origin,
      deviationState: 'on_route',
      startedAt: Date.now(),
    };

    return this.activeJourney;
  }

  async updateLocation(journeyId: string, location: LatLng): Promise<Journey> {
    if (!this.activeJourney || this.activeJourney.id !== journeyId) {
      throw new Error('Journey not active');
    }
    this.activeJourney.currentLocation = location;
    return this.activeJourney;
  }

  async endJourney(journeyId: string, reason: 'completed' | 'cancelled'): Promise<void> {
    if (this.activeJourney && this.activeJourney.id === journeyId) {
      this.activeJourney.status = reason;
      this.activeJourney.endedAt = Date.now();
      this.activeJourney = null;
    }
  }

  async getCorridorRoutes(): Promise<CorridorRoute[]> {
    return [...this.sampleCorridors];
  }
}
