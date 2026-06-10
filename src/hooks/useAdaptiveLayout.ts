import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '../theme/oneUI';

export interface AdaptiveLayout {
  width: number;
  height: number;
  /** true when width < 600dp (phone portrait / small landscape) */
  isPhone: boolean;
  /** true when 600dp ≤ width < 960dp (tablets in portrait, large phones landscape) */
  isSmallTablet: boolean;
  /** true when width ≥ 960dp (large tablets, Samsung DeX, landscape 12″+) */
  isLargeTablet: boolean;
  /** 1 / 2 / 3 — column count for the fuel card grid */
  columns: number;
}

/**
 * Reactive Samsung One UI breakpoint hook.
 *
 * Uses useWindowDimensions() so values update automatically on:
 *   - Screen rotation
 *   - Samsung foldable fold / unfold
 *   - Samsung DeX window resize
 *
 * ⚠  Do NOT use module-level Dimensions.get() for layout logic —
 *    it is a static snapshot captured at import time.
 */
export function useAdaptiveLayout(): AdaptiveLayout {
  const { width, height } = useWindowDimensions();

  const isPhone       = width < Breakpoints.smallTablet;
  const isSmallTablet = width >= Breakpoints.smallTablet && width < Breakpoints.largeTablet;
  const isLargeTablet = width >= Breakpoints.largeTablet;
  const columns       = isLargeTablet ? 3 : isSmallTablet ? 2 : 1;

  return { width, height, isPhone, isSmallTablet, isLargeTablet, columns };
}
