import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCurrentPrices, usePriceHistory } from '../hooks/useFuelPrices';
import { useAdaptiveLayout } from '../hooks/useAdaptiveLayout';
import FuelCard   from '../components/FuelCard';
import LoadingState from '../components/LoadingState';
import ErrorState   from '../components/ErrorState';
import { FUEL_TYPES } from '../types/fuel';
import type { FuelType, RootStackParamList } from '../types/fuel';
import { Colors, Spacing, Typography } from '../theme/oneUI';

type HomeNav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { width, columns } = useAdaptiveLayout();

  const current = useCurrentPrices();
  const history = usePriceHistory();

  const isLoading = current.isLoading;
  const error = current.error;

  // Previous month prices for delta calculation
  const prevSnapshot = history.data && history.data.length >= 2
    ? history.data[history.data.length - 2]
    : undefined;

  if (isLoading) return <LoadingState />;
  if (error || !current.data) {
    return <ErrorState error={error ?? new Error('No data')} onRetry={current.refetch} />;
  }

  const currentMonth = current.data;

  // Format effective date for the header
  const headerDate = new Date(currentMonth.effectiveDate).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const cardWidth = columns === 1
    ? undefined
    : (width - Spacing.md * 2 - Spacing.md * (columns - 1)) / columns;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={current.isFetching && !current.isLoading}
          onRefresh={current.refetch}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fuel Prices</Text>
        <Text style={styles.subtitle}>Effective {headerDate}</Text>
      </View>

      {/* Fuel card grid */}
      <View style={[styles.grid, columns > 1 && styles.gridRow]}>
        {FUEL_TYPES.map((ft: FuelType) => (
          <View
            key={ft}
            style={[
              styles.cardWrapper,
              cardWidth !== undefined && { width: cardWidth },
            ]}
          >
            <FuelCard
              fuelType={ft}
              priceInCents={currentMonth.prices[ft]}
              previousPriceInCents={prevSnapshot?.prices[ft]}
              onPress={() => navigation.navigate('Detail', { fuelType: ft })}
            />
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Prices published by the South African Department of Energy.
        Updated monthly on the first Wednesday.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  title: {
    ...Typography.headlineMedium,
    color: Colors.onBackground,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
  grid: {
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardWrapper: {
    flex: 1,
  },
  footer: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
});
