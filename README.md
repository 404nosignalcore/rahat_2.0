# Rahat (राहत) — Personal Safety & Community Network

> "A step towards freedom. A movement towards safety."  
> "आज़ादी की ओर एक कदम। सुरक्षा की ओर एक आंदोलन।"

**Launch Geography:** Delhi NCR (Connaught Place, Janpath, Mandi House, Hauz Khas, Saket, Cyber City Gurgaon).  
**Positioning Notice:** Rahat complements official emergency services (112, 1091, 1930). It never replaces them, and all emergency views make this distinction plain.

---

## 1. Principles & Design Architecture

1. **Prevention over reaction:** Explainable dynamic safety scores, well-lit corridors, and community hazard alerts before danger occurs.
2. **No crime profiling:** Risk calculations strictly use lighting quality, CCTV density, verified safe havens, time-of-day modifiers, and community-corroborated hazards. Never demographics, income, religion, or caste.
3. **Privacy first (DPDP Act 2023):** Location is read only with explicit granular consent and exclusively during active journeys or active SOS broadcasts. Public profile and private PII are isolated.
4. **Truth in dispatch:** Honest per-contact delivery auditing: `pending` | `sent` | `failed` | `offline_fallback_prepared` | `user_sent_via_sms`. Demo and fallback GPS coordinates are visibly badged.
5. **No false alarms:** Route deviations never auto-escalate to SOS or police.
6. **No automatic calls to 112/100/1091:** Pre-fills the native phone dialer for the user to tap call.
7. **Apple Museum-Gallery Aesthetic (`DESIGN.md`):**
   - Parchment Light (`#f5f5f7`) & OLED Dark (`#000000`).
   - Single Action Blue (`#0066cc`) interactive accent on light canvas; Sky Link Blue (`#2997ff`) on dark.
   - Fixed safety semantics (Safe `#34c759`, Caution `#ff9500`, Danger `#ff3b30`).
   - Strictly flat UI chrome; the single signature drop-shadow is reserved for the SOS card.
   - Minimum 48dp touch targets on all interactive elements.

---

## 2. Project Structure

```text
rahat/
├── App.tsx                      # Root entry point with Provider composition
├── index.ts                    # Expo registration entry point
├── app.json                    # Expo dev-client manifest
├── package.json                # React Native + Expo dependencies
├── tsconfig.json               # TypeScript strict: true config
├── jest.config.js              # Unit test runner config
├── firebase-blueprint.json     # Firestore collection schema & data dictionary
├── DESIGN.md                   # Apple design reference (Step 0)
├── src/
│   ├── types/safety.ts         # Shared safety interfaces & enums
│   ├── theme/                  # tokens.ts, ThemeProvider.tsx, useTheme.ts
│   ├── i18n/                   # en.ts, hi.ts, useI18n.tsx (100% key parity)
│   ├── services/
│   │   ├── interfaces.ts       # Service contracts
│   │   ├── index.ts            # SERVICE_MODE switch ('firebase' | 'mock')
│   │   └── mock/               # In-memory Delhi NCR mock implementations
│   ├── context/                # Auth, Reports, Journey, SOS, SafeWalkContext
│   ├── components/             # TopBar.tsx, StatusBanner.tsx
│   ├── modals/                 # SafeHeroesModal.tsx, AuthConsentModal.tsx
│   ├── screens/                # SafeZone, Route, SOS, Connect, Profile
│   └── navigation/             # RootNavigator.tsx (Bottom tabs)
└── tests/                      # Jest unit test suite
```

---

## 3. Development Commands

### Type Checking
```bash
npm run type-check
```

### Running Unit Tests (70 tests across 7 suites)
```bash
npm test
```

### Starting the Expo App
```bash
npm start
```

---

## 4. Phase 2 & 3 Delivery Highlights

1. **`src/utils/geo.ts`**:
   - Spherical Haversine distance with antimeridian crossing safety.
   - Initial bearings formulation.
   - Point to segment cross-track distance with spherical along-track projection clamping to avoid infinite great-circle overshoot.
   - Point to polyline distance with single-point and zero-length segment resilience.
2. **`src/engines/safetyRiskEngine.ts`**:
   - Zero crime profiling: uses strictly lighting %, CCTV %, footfall %, safe havens, and verified incidents.
   - Time bands: Day (+5), Evening (-12), Early Morning (-5).
   - Graded Night penalty: strictly from -20 to -32 based on visibility & footfall.
   - Incident weights: Unverified / Under Review (0.5x), Community Corroborated (1.0x), Authorized Verified (1.5x), capped at -30 pts.
   - Clamped between 5 and 98, with strict boundary testing (44 danger, 45 caution, 74 caution, 75 safe).
3. **`src/engines/deviationEngine.ts`**:
   - 90m corridor deviation buffer.
   - Requires 3 consecutive fixes outside the buffer to fire an alert.
   - Inaccurate fixes (`accuracy > 75m`) are ignored without incrementing or resetting the counter.
   - Resets counter immediately upon return within the 90m buffer.
   - Active cooldown suppresses alert while maintaining counter so it immediately re-fires if user stays off route after cooldown.
   - Invariant: Never automatically triggers an SOS or calls police (action is strictly `'prompt_safety_check'` or `'none'`).
4. **Phase 3 SafeZone & Reports**:
   - Delhi NCR monitored zone corridors (`DELHI_NCR_ZONES`: Connaught Place, Mandi House, Hauz Khas, Saket, Gurgaon Cyber City).
   - Dynamic 24-hour time slider driving live zone scores.
   - Full point-by-point explainability modal (`ZoneExplanationModal`).
   - Hazard creation modal (`CreateReportModal`) with category picker, 1–5 severity rating, and privacy PII regex moderation guard.
   - Verification status transitions: flips to `community_corroborated` at $\ge 3$ distinct user confirmations; flags auto-transition to `under_review` at $\ge 3$ flags, and auto-hide at $\ge 5$ flags.
   - Threaded comments discussion and corroborations counter.
   - Dual-mode reports service: `MockReportsService` (in-memory) and `FirebaseReportsService` (Firestore ready).

---

## 5. Cellular SMS in India (DLT Compliance Note)

Under Telecom Regulatory Authority of India (TRAI) regulations, commercial or bulk emergency SMS traffic requires:
- Principal Entity registration on DLT platforms (e.g., Vilpower, Jio, Airtel, Smartping).
- Pre-approved Header / Sender IDs (e.g., `RAHAT-ALERT`).
- Registered and approved content templates with variable placeholders (`{#var#}`).
The server-side `SmsProvider` interface is designed to accept compliant DLT gateways (such as MSG91 or Twilio India) once live keys are provisioned.

---

## 5. Not Real Yet (Phase 1 Simulation Audit)

As required by the build phase specification, the following services and pipelines are currently mocked in-memory for Phase 1:

| Component | Status in Phase 1 | Real Implementation Phase |
|---|---|---|
| **Firebase Auth & Firestore** | Simulated via in-memory `mockAuthService` and `mockReportsService` | Phase 4 (Firebase Backend Core) |
| **Cloud Functions & Wave Escalation** | Simulated locally with timers and state transitions | Phase 6 & Phase 7 |
| **Cellular SMS Gateway** | Simulated via `MockSmsProvider` returning simulated DLT receipt IDs | Phase 6 (SOS Dispatch Cloud Function) |
| **GPS / Location Tracking** | Sample Delhi NCR coordinates and corridors | Phase 5 (Route tab + Expo Location) |
| **BLE Wearable Companion** | Simulated peripheral telemetry (`MockWearableService`) | Phase 8 (Connect + Profile) |
| **Official Helplines (112, 1091)** | Pre-fills native phone dialer via `tel:` URL scheme | Live & Real (Verified as of 2026-11-01) |
