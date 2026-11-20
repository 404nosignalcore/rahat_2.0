import { ISafeHavenService } from '../interfaces';
import { LatLng, SafeHaven } from '../../types/safety';

export class MockSafeHavenService implements ISafeHavenService {
  private havens: SafeHaven[] = [
    {
      id: 'haven_ps_cp',
      name: 'Parliament Street Police Station',
      type: 'police_station',
      latitude: 28.6254,
      longitude: 77.2152,
      phone: '01123361100',
      open24x7: true,
      source: 'Delhi Police Official Directory (delhipolice.gov.in)',
      lastVerifiedAt: '2026-11-01',
    },
    {
      id: 'haven_pink_cp',
      name: 'Delhi Police Pink Booth — Janpath Radial',
      type: 'pink_booth',
      latitude: 28.6288,
      longitude: 77.2195,
      phone: '1091',
      open24x7: true,
      source: 'Delhi Police Women Safety Initiative',
      lastVerifiedAt: '2026-11-01',
    },
    {
      id: 'haven_er_aiims',
      name: 'AIIMS Jai Prakash Narayan Apex Trauma Centre',
      type: 'hospital_er',
      latitude: 28.5672,
      longitude: 77.2078,
      phone: '01126188000',
      open24x7: true,
      source: 'AIIMS New Delhi Emergency Directory (aiims.edu)',
      lastVerifiedAt: '2026-11-01',
    },
    {
      id: 'haven_sakhi_safdarjung',
      name: 'One Stop Centre (Sakhi) — Safdarjung Hospital',
      type: 'sakhi_centre',
      latitude: 28.5694,
      longitude: 77.2052,
      phone: '181',
      open24x7: true,
      source: 'Ministry of Women and Child Development (wcd.nic.in)',
      lastVerifiedAt: '2026-11-01',
    },
    {
      id: 'haven_dmrc_rajivchowk',
      name: 'DMRC Central Help Desk & CISF Security — Rajiv Chowk',
      type: 'metro_help_desk',
      latitude: 28.6328,
      longitude: 77.2197,
      phone: '011155370',
      open24x7: true,
      source: 'Delhi Metro Rail Corporation Official Registry',
      lastVerifiedAt: '2026-11-01',
    },
    {
      id: 'haven_pharm_apollo_cp',
      name: 'Apollo Pharmacy 24/7 — Connaught Place',
      type: 'pharmacy_24x7',
      latitude: 28.6315,
      longitude: 77.2178,
      phone: '01123714455',
      open24x7: true,
      source: 'Apollo Pharmacies 24x7 Verified Delhi Outlets',
      lastVerifiedAt: '2026-11-01',
    },
    {
      id: 'haven_pink_hauzkhas',
      name: 'Hauz Khas Pink Police Booth',
      type: 'pink_booth',
      latitude: 28.5532,
      longitude: 77.1945,
      phone: '01126510078',
      open24x7: true,
      source: 'Delhi Police South District Safety Beat',
      lastVerifiedAt: '2026-11-01',
    },
  ];

  async getSafeHavens(): Promise<SafeHaven[]> {
    return [...this.havens];
  }

  async getHavensNear(location: LatLng, _maxDistanceMeters: number = 5000): Promise<SafeHaven[]> {
    // Return all sorted with mock distances
    return this.havens.map((h) => {
      const dLat = (h.latitude - location.latitude) * 111000;
      const dLng = (h.longitude - location.longitude) * 111000;
      const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
      return { ...h, distanceMeters: dist };
    }).sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }
}
