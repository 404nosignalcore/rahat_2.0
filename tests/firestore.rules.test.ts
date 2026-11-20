import * as fs from 'fs';
import * as path from 'path';

describe('Phase 4 — Firestore Security Rules Invariants & Negative Cases (Section 7.2)', () => {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  let rulesContent: string;

  beforeAll(() => {
    rulesContent = fs.readFileSync(rulesPath, 'utf8');
  });

  describe('Rule Syntax & Architectural Constraints', () => {
    it('uses rules_version = "2" and matches Cloud Firestore', () => {
      expect(rulesContent).toContain("rules_version = '2'");
      expect(rulesContent).toContain('service cloud.firestore');
    });

    it('enforces default deny on all unmatched collections', () => {
      expect(rulesContent).toMatch(/match\s*\/\{document=\*\*\s*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/);
    });

    it('defines helper functions for authentication, ownership, roles, and schema validation', () => {
      expect(rulesContent).toContain('function isSignedIn()');
      expect(rulesContent).toContain('function isOwner(uid)');
      expect(rulesContent).toContain('function hasRole(role)');
      expect(rulesContent).toContain('function isValidCategory(cat)');
      expect(rulesContent).toContain('function isValidSeverity(sev)');
    });
  });

  describe('User Profiles & Private PII Invariants', () => {
    it('allows public profile read only for signed-in users and write only for owner', () => {
      const userBlockMatch = rulesContent.match(/match\s*\/users\/\{uid\}\s*\{([\s\S]*?)\n\s*match/);
      expect(userBlockMatch).toBeTruthy();
      const userBlock = userBlockMatch![1]!;

      expect(userBlock).toContain('allow read: if isSignedIn();');
      expect(userBlock).toContain('allow write: if isOwner(uid);');
    });

    it('strictly isolates private/info to the owner only (denies other users)', () => {
      const privateBlock = rulesContent.match(/match\s*\/private\/info\s*\{([\s\S]*?)\}/);
      expect(privateBlock).toBeTruthy();
      expect(privateBlock![1]).toContain('allow read, write: if isOwner(uid);');
    });

    it('prevents clients from setting emergency contacts verificationStatus to verified', () => {
      const contactBlock = rulesContent.match(/match\s*\/emergency_contacts\/\{contactId\}\s*\{([\s\S]*?)\}/);
      expect(contactBlock).toBeTruthy();
      const code = contactBlock![1]!;

      // On create, verificationStatus must be unverified
      expect(code).toContain("request.resource.data.verificationStatus == 'unverified'");
      // On update, client cannot write verified
      expect(code).toContain("request.resource.data.verificationStatus != 'verified'");
    });
  });

  describe('Safety Reports Security & Integrity Invariants', () => {
    it('allows public read of non-hidden reports', () => {
      const reportsBlock = rulesContent.match(/match\s*\/safety_reports\/\{reportId\}\s*\{([\s\S]*?)\n\s*match/);
      expect(reportsBlock).toBeTruthy();
      const code = reportsBlock![1]!;

      expect(code).toContain('allow read: if resource.data.hidden == false');
    });

    it('requires authorUid to match auth.uid, valid category, title <= 120, desc <= 1000, severity 1-5, and unverified status on create', () => {
      const reportsBlock = rulesContent.match(/match\s*\/safety_reports\/\{reportId\}\s*\{([\s\S]*?)\n\s*match/);
      expect(reportsBlock).toBeTruthy();
      const code = reportsBlock![1]!;

      expect(code).toContain('request.auth.uid == request.resource.data.authorUid');
      expect(code).toContain('isValidCategory(request.resource.data.category)');
      expect(code).toContain('isValidSeverity(request.resource.data.severity)');
      expect(code).toContain('request.resource.data.title.size() <= 120');
      expect(code).toContain('request.resource.data.description.size() <= 1000');
      expect(code).toContain("request.resource.data.verificationStatus == 'unverified'");
      expect(code).toContain('request.resource.data.corroborationCount == 0');
      expect(code).toContain('request.resource.data.flagCount == 0');
      expect(code).toContain('request.resource.data.hidden == false');
    });

    it('prevents clients from directly updating verificationStatus to authorized_verified or community_corroborated', () => {
      const reportsBlock = rulesContent.match(/match\s*\/safety_reports\/\{reportId\}\s*\{([\s\S]*?)\n\s*match/);
      expect(reportsBlock).toBeTruthy();
      const code = reportsBlock![1]!;

      expect(code).toContain("request.resource.data.verificationStatus == resource.data.verificationStatus");
    });

    it('restricts corroborations to one document per user under own UID', () => {
      const corrobBlock = rulesContent.match(/match\s*\/corroborations\/\{userId\}\s*\{([\s\S]*?)\}/);
      expect(corrobBlock).toBeTruthy();
      const code = corrobBlock![1]!;

      expect(code).toContain('allow create, delete: if isOwner(userId);');
    });

    it('restricts flags to one document per user under own UID', () => {
      const flagsBlock = rulesContent.match(/match\s*\/flags\/\{userId\}\s*\{([\s\S]*?)\}/);
      expect(flagsBlock).toBeTruthy();
      const code = flagsBlock![1]!;

      expect(code).toContain('allow create: if isOwner(userId);');
    });
  });

  describe('Emergency Alerts Invariants (Truth in Dispatch & Immutability)', () => {
    it('prevents users from editing an alert after status leaves countdown', () => {
      const alertBlock = rulesContent.match(/match\s*\/emergency_alerts\/\{alertId\}\s*\{([\s\S]*?)\}/);
      expect(alertBlock).toBeTruthy();
      const code = alertBlock![1]!;

      expect(code).toContain('isOwner(resource.data.userId)');
      expect(code).toContain("resource.data.status == 'countdown'");
    });

    it('requires creator to be signed-in and match userId', () => {
      const alertBlock = rulesContent.match(/match\s*\/emergency_alerts\/\{alertId\}\s*\{([\s\S]*?)\}/);
      expect(alertBlock).toBeTruthy();
      const code = alertBlock![1]!;

      expect(code).toContain('request.resource.data.userId == request.auth.uid');
    });
  });

  describe('Safe Circles & Location Sharing Consent Invariants', () => {
    it('allows location reading only if the user is a circle member and shareLocation is true', () => {
      const journeysBlock = rulesContent.match(/match\s*\/journeys\/\{journeyId\}\s*\{([\s\S]*?)\}/);
      expect(journeysBlock).toBeTruthy();
      const code = journeysBlock![1]!;

      expect(code).toContain('isOwner(resource.data.userId)');
      expect(code).toContain('shareLocation == true');
    });

    it('allows circle members to manage their individual location sharing consent', () => {
      const memberBlock = rulesContent.match(/match\s*\/members\/\{memberUid\}\s*\{([\s\S]*?)\}/);
      expect(memberBlock).toBeTruthy();
      const code = memberBlock![1]!;

      expect(code).toContain('allow create, update: if isOwner(memberUid)');
    });
  });

  describe('Community SOS & Responders Rules', () => {
    it('restricts community_sos document creation and wave updates to admin/cloud functions', () => {
      const sosBlock = rulesContent.match(/match\s*\/community_sos\/\{sosId\}\s*\{([\s\S]*?)\n\s*match/);
      expect(sosBlock).toBeTruthy();
      const code = sosBlock![1]!;

      expect(code).toContain("allow write: if hasRole('admin');");
    });

    it('prevents responders from self-verifying credentials', () => {
      const responderBlock = rulesContent.match(/match\s*\/responders\/\{uid\}\s*\{([\s\S]*?)\}/);
      expect(responderBlock).toBeTruthy();
      const code = responderBlock![1]!;

      expect(code).toContain("request.resource.data.verificationStatus != 'verified'");
    });
  });
});
