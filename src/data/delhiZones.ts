import { LatLng } from '../types/safety';

export interface DelhiZone {
  id: string;
  name: string;
  nameHindi: string;
  areaTag: string;
  geohash: string;
  lightingPercent: number;
  cctvPercent: number;
  footfallPercent: number;
  safeHavensCount: number;
  polygon: LatLng[];
  center: LatLng;
}

export const DELHI_NCR_ZONES: DelhiZone[] = [
  {
    id: 'zone_cp_janpath',
    name: 'Connaught Place & Janpath',
    nameHindi: 'कनॉट प्लेस एवं जनपथ',
    areaTag: 'Connaught Place / Janpath',
    geohash: 'ttnfuh',
    lightingPercent: 94,
    cctvPercent: 88,
    footfallPercent: 90,
    safeHavensCount: 5,
    center: { latitude: 28.6304, longitude: 77.2177 },
    polygon: [
      { latitude: 28.6355, longitude: 77.2140 },
      { latitude: 28.6360, longitude: 77.2225 },
      { latitude: 28.6270, longitude: 77.2250 },
      { latitude: 28.6245, longitude: 77.2160 },
      { latitude: 28.6280, longitude: 77.2120 },
    ],
  },
  {
    id: 'zone_mandi_house',
    name: 'Mandi House Cultural Corridor',
    nameHindi: 'मंडी हाउस सांस्कृतिक गलियारा',
    areaTag: 'Mandi House',
    geohash: 'ttnfvn',
    lightingPercent: 88,
    cctvPercent: 78,
    footfallPercent: 70,
    safeHavensCount: 3,
    center: { latitude: 28.6258, longitude: 77.2345 },
    polygon: [
      { latitude: 28.6295, longitude: 77.2300 },
      { latitude: 28.6310, longitude: 77.2385 },
      { latitude: 28.6235, longitude: 77.2410 },
      { latitude: 28.6210, longitude: 77.2325 },
    ],
  },
  {
    id: 'zone_hauz_khas',
    name: 'Hauz Khas Village & Deer Park',
    nameHindi: 'हौज़ खास विलेज एवं डियर पार्क',
    areaTag: 'Hauz Khas Village',
    geohash: 'ttng5k',
    lightingPercent: 58,
    cctvPercent: 45,
    footfallPercent: 50,
    safeHavensCount: 2,
    center: { latitude: 28.5529, longitude: 77.1937 },
    polygon: [
      { latitude: 28.5575, longitude: 77.1880 },
      { latitude: 28.5585, longitude: 77.1990 },
      { latitude: 28.5480, longitude: 77.2010 },
      { latitude: 28.5460, longitude: 77.1910 },
    ],
  },
  {
    id: 'zone_saket_metro',
    name: 'Saket District Centre & Metro',
    nameHindi: 'साकेत डिस्ट्रिक्ट सेंटर एवं मेट्रो',
    areaTag: 'Saket Metro Corridor',
    geohash: 'ttng49',
    lightingPercent: 72,
    cctvPercent: 65,
    footfallPercent: 75,
    safeHavensCount: 3,
    center: { latitude: 28.5208, longitude: 77.2014 },
    polygon: [
      { latitude: 28.5255, longitude: 77.1960 },
      { latitude: 28.5265, longitude: 77.2080 },
      { latitude: 28.5160, longitude: 77.2090 },
      { latitude: 28.5140, longitude: 77.1980 },
    ],
  },
  {
    id: 'zone_cyber_city',
    name: 'Cyber City & DLF Phase 2 (Gurgaon)',
    nameHindi: 'साइबर सिटी एवं डीएलएफ फेज २ (गुरुग्राम)',
    areaTag: 'Cyber City Gurgaon',
    geohash: 'ttng92',
    lightingPercent: 92,
    cctvPercent: 90,
    footfallPercent: 82,
    safeHavensCount: 4,
    center: { latitude: 28.4952, longitude: 77.0892 },
    polygon: [
      { latitude: 28.5020, longitude: 77.0830 },
      { latitude: 28.5035, longitude: 77.0960 },
      { latitude: 28.4890, longitude: 77.0970 },
      { latitude: 28.4870, longitude: 77.0850 },
    ],
  },
];
