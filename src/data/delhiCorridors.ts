import { CorridorRoute, LatLng } from '../types/safety';

export interface SavedPlace {
  id: string;
  name: string;
  nameHindi: string;
  address: string;
  location: LatLng;
  icon: string;
}

export const SAVED_PLACES: SavedPlace[] = [
  {
    id: 'place_home',
    name: 'Home (Saket)',
    nameHindi: 'घर (साकेत)',
    address: 'Block J, Saket, New Delhi',
    location: { latitude: 28.5208, longitude: 77.2014 },
    icon: '🏠',
  },
  {
    id: 'place_work_cp',
    name: 'Office (Connaught Place)',
    nameHindi: 'कार्यालय (कनॉट प्लेस)',
    address: 'Barakhamba Road, Connaught Place, New Delhi',
    location: { latitude: 28.6301, longitude: 77.2252 },
    icon: '🏢',
  },
  {
    id: 'place_metro_rajiv',
    name: 'Rajiv Chowk Metro (Gate 3)',
    nameHindi: 'राजीव चौक मेट्रो (गेट ३)',
    address: 'Radial Road 3, Connaught Place',
    location: { latitude: 28.6328, longitude: 77.2197 },
    icon: '🚇',
  },
  {
    id: 'place_cyber_hub',
    name: 'Cyber Hub (Gurgaon)',
    nameHindi: 'साइबर हब (गुरुग्राम)',
    address: 'DLF Cyber City, Phase 2, Gurugram',
    location: { latitude: 28.4952, longitude: 77.0892 },
    icon: '🏬',
  },
];

export const DELHI_CORRIDORS: Record<string, CorridorRoute[]> = {
  'cp_to_mandi_house': [
    {
      id: 'cp_mh_safest',
      title: 'Barakhamba Boulevard Corridor',
      tag: 'safest',
      distanceMeters: 1450,
      etaSeconds: 1080,
      lightingPercent: 94,
      cctvPercent: 88,
      safeHavensCount: 4,
      rankingRationale: 'Continuous NDMC street lighting, 2 metro police booths, active corporate security, and 24/7 footfall along Barakhamba Rd.',
      coordinates: [
        { latitude: 28.6328, longitude: 77.2197 },
        { latitude: 28.6301, longitude: 77.2252 },
        { latitude: 28.6258, longitude: 77.2345 },
      ],
    },
    {
      id: 'cp_mh_well_lit',
      title: 'Janpath - Tolstoy Marg Route',
      tag: 'well_lit',
      distanceMeters: 1620,
      etaSeconds: 1200,
      lightingPercent: 98,
      cctvPercent: 76,
      safeHavensCount: 3,
      rankingRationale: 'Highest lux level with wide pedestrian sidewalks and constant hotel security presence.',
      coordinates: [
        { latitude: 28.6328, longitude: 77.2197 },
        { latitude: 28.6247, longitude: 77.2185 },
        { latitude: 28.6258, longitude: 77.2345 },
      ],
    },
    {
      id: 'cp_mh_quickest',
      title: 'Feroze Shah Direct Cut',
      tag: 'quickest',
      distanceMeters: 1100,
      etaSeconds: 780,
      lightingPercent: 64,
      cctvPercent: 42,
      safeHavensCount: 1,
      rankingRationale: 'Shortest walking distance, but cuts through 2 dimly lit residential alleys with sparse evening pedestrian traffic.',
      coordinates: [
        { latitude: 28.6328, longitude: 77.2197 },
        { latitude: 28.6285, longitude: 77.2285 },
        { latitude: 28.6258, longitude: 77.2345 },
      ],
    },
  ],
  'hauz_khas_corridor': [
    {
      id: 'hk_safest',
      title: 'Aurobindo Marg Main Avenue',
      tag: 'safest',
      distanceMeters: 1250,
      etaSeconds: 960,
      lightingPercent: 90,
      cctvPercent: 82,
      safeHavensCount: 3,
      rankingRationale: 'Main thoroughfare with Delhi Police Pink Booth, verified 24/7 pharmacy, and bus transit presence.',
      coordinates: [
        { latitude: 28.5430, longitude: 77.2060 },
        { latitude: 28.5480, longitude: 77.2010 },
        { latitude: 28.5529, longitude: 77.1937 },
      ],
    },
    {
      id: 'hk_quickest',
      title: 'Deer Park Perimeter Cut',
      tag: 'quickest',
      distanceMeters: 850,
      etaSeconds: 620,
      lightingPercent: 45,
      cctvPercent: 20,
      safeHavensCount: 0,
      rankingRationale: 'Extremely secluded pathway along park boundary. Not recommended after 7:30 PM.',
      coordinates: [
        { latitude: 28.5430, longitude: 77.2060 },
        { latitude: 28.5500, longitude: 77.1980 },
        { latitude: 28.5529, longitude: 77.1937 },
      ],
    },
  ],
};
