import { en } from '../src/i18n/en';
import { hi } from '../src/i18n/hi';

describe('Phase 1 — Localization (English & Hindi) Parity & Integrity', () => {
  // Recursively inspect key equivalence
  const checkKeyEquivalence = (obj1: Record<string, unknown>, obj2: Record<string, unknown>, path = '') => {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();

    expect(keys2).toEqual(keys1);

    for (const key of keys1) {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1[key];
      const val2 = obj2[key];

      expect(val2).toBeDefined();

      if (typeof val1 === 'object' && val1 !== null) {
        expect(typeof val2).toBe('object');
        checkKeyEquivalence(
          val1 as Record<string, unknown>,
          val2 as Record<string, unknown>,
          currentPath
        );
      } else {
        expect(typeof val2).toBe(typeof val1);
        expect(String(val2).trim().length).toBeGreaterThan(0);
      }
    }
  };

  it('guarantees 100% exact key parity between English and Hindi translation dictionaries', () => {
    checkKeyEquivalence(en as unknown as Record<string, unknown>, hi as unknown as Record<string, unknown>);
  });

  it('provides all official Delhi emergency helplines in SafeHeroes with verification dates', () => {
    const helplines = [
      en.safeHeroes.contacts.erss112,
      en.safeHeroes.contacts.women1091,
      en.safeHeroes.contacts.ncw7827,
      en.safeHeroes.contacts.cyber1930,
      en.safeHeroes.contacts.delhiSpecialCell,
      en.safeHeroes.contacts.sakhiCentre,
    ];

    for (const h of helplines) {
      expect(h.number.length).toBeGreaterThanOrEqual(3);
      expect(h.lastVerified).toBe('2026-11-01');
      expect(h.name.length).toBeGreaterThan(0);
    }
  });

  it('contains the non-negotiable statutory disclaimer in both languages', () => {
    expect(en.safeHeroes.statutoryDisclaimer).toContain('112');
    expect(hi.safeHeroes.statutoryDisclaimer).toContain('112');
    expect(en.common.positioningDisclaimer).toContain('complements official emergency services');
    expect(hi.common.positioningDisclaimer).toContain('आधिकारिक आपातकालीन सेवाओं');
  });

  it('contains DPDP Act 2023 alignment notices in both languages', () => {
    expect(en.authConsent.title).toContain('Privacy');
    expect(hi.authConsent.title).toContain('गोपनीयता');
    expect(en.profile.deleteDisclaimer).toContain('DPDP Act 2023');
    expect(hi.profile.deleteDisclaimer).toContain('DPDP अधिनियम 2023');
  });
});
