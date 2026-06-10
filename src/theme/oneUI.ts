// ─── Breakpoints (Samsung One UI large-screen definitions) ────────────────────
// ⚠  Do NOT derive isPhone / isSmallTablet / isLargeTablet at module scope using
//    Dimensions.get() — that value is a static snapshot and will NOT update on
//    rotation, fold/unfold, or Samsung DeX window resize.
//    Use the reactive useAdaptiveLayout() hook from src/hooks/useAdaptiveLayout.ts.

export const Breakpoints = {
  smallTablet: 600,   // dp — phone landscape / small tablet portrait
  largeTablet: 960,   // dp — large tablet landscape / Samsung DeX default
} as const;

/**
 * Pure helper — pass the reactive width from useWindowDimensions() or
 * useAdaptiveLayout() rather than a static Dimensions.get() value.
 */
export function gridColumns(width: number): number {
  if (width >= Breakpoints.largeTablet) return 3;
  if (width >= Breakpoints.smallTablet) return 2;
  return 1;
}

// ─── Colour tokens — One UI 6.x light theme ──────────────────────────────────
export const Colors = {
  primary:          '#0381F7',  // Samsung One UI blue
  primaryContainer: '#D8E4FF',
  onPrimary:        '#FFFFFF',
  onPrimaryContainer: '#001A42',

  secondary:        '#575E71',
  onSecondary:      '#FFFFFF',

  background:       '#F4F4F4',
  onBackground:     '#1A1B1F',

  surface:          '#FFFFFF',
  onSurface:        '#1A1B1F',
  surfaceVariant:   '#E1E2EC',
  onSurfaceVariant: '#44464F',

  outline:          '#75767F',
  outlineVariant:   '#C5C6D0',

  error:            '#BA1A1A',
  onError:          '#FFFFFF',

  success:          '#1B7F3E',
  warning:          '#B95000',

  // Per-fuel-type accent colours (accessible, distinct)
  fuel95:           '#1B7F3E',
  fuel93:           '#0381F7',
  dieselInland:     '#B95000',
  dieselCoastal:    '#7B2D8B',

  divider:          '#E0E0E0',
} as const;

export const FuelColors: Record<string, string> = {
  '95_ULP':        Colors.fuel95,
  '93_ULP':        Colors.fuel93,
  'DIESEL_INLAND': Colors.dieselInland,
  'DIESEL_COASTAL':Colors.dieselCoastal,
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ─── Corner radius — One UI uses more generous rounding than base MD3 ─────────
export const Radius = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  full: 9999,
} as const;

// ─── Elevation (Android shadow via elevation prop) ────────────────────────────
export const Elevation = {
  card:   2,
  modal:  8,
  fab:    6,
} as const;

// ─── Typography — One UI typescale (Samsung Sans equivalent via system font) ──
export const Typography = {
  displayLarge:  { fontSize: 57, lineHeight: 64, fontWeight: '400' as const },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' as const },
  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '400' as const },
  headlineMedium:{ fontSize: 28, lineHeight: 36, fontWeight: '400' as const },
  titleLarge:    { fontSize: 22, lineHeight: 28, fontWeight: '500' as const },
  titleMedium:   { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  bodyLarge:     { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium:    { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelLarge:    { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  labelMedium:   { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

// ─── Touch target minimum (One UI / WCAG accessibility) ───────────────────────
export const MIN_TOUCH_TARGET = 48;
