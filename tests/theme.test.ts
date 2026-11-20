import {
  accessibility,
  darkColors,
  lightColors,
  rounded,
  shadows,
  spacing,
  typography,
} from '../src/theme/tokens';

describe('Phase 1 — Design System & Theme Tokens', () => {
  it('enforces Action Blue as primary interactive color', () => {
    expect(lightColors.primary).toBe('#0066cc');
    expect(darkColors.primary).toBe('#2997ff'); // Sky Link on dark
  });

  it('preserves fixed safety state semantics across light and dark modes', () => {
    // Safety colors must stay fixed as non-negotiable rule
    expect(lightColors.safetySafe).toBe('#34c759');
    expect(darkColors.safetySafe).toBe('#34c759');

    expect(lightColors.safetyCaution).toBe('#ff9500');
    expect(darkColors.safetyCaution).toBe('#ff9500');

    expect(lightColors.safetyDanger).toBe('#ff3b30');
    expect(darkColors.safetyDanger).toBe('#ff3b30');
  });

  it('enforces Parchment (#f5f5f7) in light and OLED (#000000) in dark', () => {
    expect(lightColors.canvasParchment).toBe('#f5f5f7');
    expect(darkColors.canvasParchment).toBe('#000000');
  });

  it('restricts drop shadow exclusively to the SOS card signature shadow', () => {
    expect(shadows.none.elevation).toBe(0);
    expect(shadows.none.shadowOpacity).toBe(0);

    expect(shadows.sosCardSignature.shadowOpacity).toBe(0.22);
    expect(shadows.sosCardSignature.shadowColor).toBe('#000000');
    expect(shadows.sosCardSignature.shadowOffset).toEqual({ width: 3, height: 5 });
  });

  it('strictly enforces minimum 48dp touch target across all interactive targets', () => {
    expect(accessibility.minTouchTarget).toBeGreaterThanOrEqual(48);
  });

  it('follows Apple typography ladder without font weight 500', () => {
    expect(typography.body.fontWeight).toBe('400');
    expect(typography.bodyStrong.fontWeight).toBe('600');
    expect(typography.buttonLarge.fontWeight).toBe('300');
    expect(typography.displayLg.fontWeight).toBe('600');
    expect(typography.heroDisplay.letterSpacing).toBe(-0.28);
  });

  it('defines correct border radius scale including pill', () => {
    expect(rounded.sm).toBe(8);
    expect(rounded.md).toBe(11);
    expect(rounded.lg).toBe(18);
    expect(rounded.pill).toBe(9999);
  });

  it('defines base spacing scale', () => {
    expect(spacing.xs).toBe(8);
    expect(spacing.sm).toBe(12);
    expect(spacing.md).toBe(17);
    expect(spacing.lg).toBe(24);
  });
});
