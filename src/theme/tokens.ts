/**
 * Rahat Design Tokens
 * Source of truth: DESIGN.md (Apple museum-gallery aesthetic)
 * Reconciled with fixed safety semantics (Safe, Caution, Danger) and 48dp touch targets.
 */

export interface ColorPalette {
  primary: string;
  primaryFocus: string;
  primaryOnDark: string;
  ink: string;
  body: string;
  bodyOnDark: string;
  bodyMuted: string;
  inkMuted80: string;
  inkMuted48: string;
  dividerSoft: string;
  hairline: string;
  canvas: string;
  canvasParchment: string;
  surfacePearl: string;
  surfaceTile1: string;
  surfaceTile2: string;
  surfaceTile3: string;
  surfaceBlack: string;
  surfaceChipTranslucent: string;
  onPrimary: string;
  onDark: string;

  // Fixed safety state semantics (Fixed colors across light/dark)
  safetySafe: string;
  safetyCaution: string;
  safetyDanger: string;
  safetySafeBackground: string;
  safetyCautionBackground: string;
  safetyDangerBackground: string;
}

export const lightColors: ColorPalette = {
  primary: '#0066cc',
  primaryFocus: '#0071e3',
  primaryOnDark: '#2997ff',
  ink: '#1d1d1f',
  body: '#1d1d1f',
  bodyOnDark: '#ffffff',
  bodyMuted: '#cccccc',
  inkMuted80: '#333333',
  inkMuted48: '#7a7a7a',
  dividerSoft: '#f0f0f0',
  hairline: '#e0e0e0',
  canvas: '#ffffff',
  canvasParchment: '#f5f5f7',
  surfacePearl: '#fafafc',
  surfaceTile1: '#272729',
  surfaceTile2: '#2a2a2c',
  surfaceTile3: '#252527',
  surfaceBlack: '#000000',
  surfaceChipTranslucent: 'rgba(210, 210, 215, 0.64)',
  onPrimary: '#ffffff',
  onDark: '#ffffff',

  safetySafe: '#34c759',
  safetyCaution: '#ff9500',
  safetyDanger: '#ff3b30',
  safetySafeBackground: 'rgba(52, 199, 89, 0.12)',
  safetyCautionBackground: 'rgba(255, 149, 0, 0.12)',
  safetyDangerBackground: 'rgba(255, 59, 48, 0.12)',
};

export const darkColors: ColorPalette = {
  primary: '#2997ff', // Sky Link on dark
  primaryFocus: '#0071e3',
  primaryOnDark: '#2997ff',
  ink: '#ffffff',
  body: '#ffffff',
  bodyOnDark: '#ffffff',
  bodyMuted: '#86868b',
  inkMuted80: '#d2d2d7',
  inkMuted48: '#86868b',
  dividerSoft: '#333336',
  hairline: '#424245',
  canvas: '#161617',
  canvasParchment: '#000000', // OLED Pure Black
  surfacePearl: '#1d1d1f',
  surfaceTile1: '#272729',
  surfaceTile2: '#2a2a2c',
  surfaceTile3: '#252527',
  surfaceBlack: '#000000',
  surfaceChipTranslucent: 'rgba(50, 50, 54, 0.64)',
  onPrimary: '#ffffff',
  onDark: '#ffffff',

  safetySafe: '#34c759',
  safetyCaution: '#ff9500',
  safetyDanger: '#ff3b30',
  safetySafeBackground: 'rgba(52, 199, 89, 0.20)',
  safetyCautionBackground: 'rgba(255, 149, 0, 0.20)',
  safetyDangerBackground: 'rgba(255, 59, 48, 0.20)',
};

export const typography = {
  heroDisplay: {
    fontSize: 56,
    fontWeight: '600' as const,
    letterSpacing: -0.28,
    lineHeight: 60,
  },
  displayLg: {
    fontSize: 40,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  displayMd: {
    fontSize: 34,
    fontWeight: '600' as const,
    letterSpacing: -0.374,
    lineHeight: 40,
  },
  lead: {
    fontSize: 28,
    fontWeight: '400' as const,
    letterSpacing: 0.196,
    lineHeight: 32,
  },
  tagline: {
    fontSize: 21,
    fontWeight: '600' as const,
    letterSpacing: 0.231,
    lineHeight: 25,
  },
  bodyStrong: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.374,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.374,
    lineHeight: 24,
  },
  captionStrong: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: -0.224,
    lineHeight: 18,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: -0.224,
    lineHeight: 18,
  },
  buttonLarge: {
    fontSize: 18,
    fontWeight: '300' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  buttonUtility: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: -0.224,
    lineHeight: 18,
  },
  finePrint: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: -0.12,
    lineHeight: 15,
  },
  microLegal: {
    fontSize: 10,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 13,
  },
};

export const rounded = {
  none: 0,
  xs: 5,
  sm: 8,
  md: 11,
  lg: 18,
  pill: 9999,
  full: 9999,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 17,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 80,
};

/**
 * Single signature soft drop-shadow. Used ONLY on the SOS card.
 * Zero shadows elsewhere in the system.
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sosCardSignature: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 8,
  },
};

export const accessibility = {
  minTouchTarget: 48,
};
