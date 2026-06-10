import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineBanner from './src/components/OfflineBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prices update monthly — cache stays warm for 1 hour, data valid for 24 hours.
      // React Query will NOT re-fetch on tab switch within the staleTime window.
      staleTime:  60 * 60 * 1000,
      gcTime:     24 * 60 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
  },
});

export default function App() {
  return (
    // SafeAreaProvider must wrap NavigationContainer — required by React Navigation 6
    // and used by OfflineBanner (useSafeAreaInsets) to sit below the status bar.
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={styles.root}>
          <AppNavigator />
          {/* Positioned absolute — does not push content down; z-index 999 */}
          <OfflineBanner />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
