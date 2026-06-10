import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors, Spacing, Typography } from '../theme/oneUI';

/**
 * Persistent offline banner — displayed at the top of the app whenever
 * the device has no network connectivity.
 *
 * Placement: outside NavigationContainer in App.tsx so it overlays
 * every screen without being re-rendered on navigation events.
 *
 * Trinity test coverage:
 *   - Disable WiFi + mobile data → banner appears
 *   - Re-enable network → banner disappears
 *   - Navigate between tabs while offline → banner persists, no redundant API calls
 */
export default function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const insets    = useSafeAreaInsets();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOffline ? 0 : -80,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  }, [isOffline, slideAnim]);

  // Render always so the slide-out animation plays when coming back online
  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: Math.max(insets.top, Spacing.sm) },
        { transform: [{ translateY: slideAnim }] },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel="No internet connection. Showing cached fuel prices."
      pointerEvents={isOffline ? 'auto' : 'none'}
    >
      <Text style={styles.icon}>📶</Text>
      <View style={styles.textGroup}>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>Showing cached prices — refresh when back online</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
    // Absolute positioning so it doesn't push content down
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 10,
  },
  icon: {
    fontSize: 18,
  },
  textGroup: {
    gap: 2,
    flex: 1,
  },
  title: {
    ...Typography.labelLarge,
    color: Colors.onError,
  },
  subtitle: {
    ...Typography.labelMedium,
    color: Colors.onError,
    opacity: 0.85,
  },
});
