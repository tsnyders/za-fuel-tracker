import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { usePriceHistory, useFuelTypeHistory } from '../hooks/useFuelPrices';
import PriceChart from '../components/PriceChart';
import LoadingState from '../components/LoadingState';
import ErrorState   from '../components/ErrorState';
import { FUEL_TYPES, FUEL_LABELS } from '../types/fuel';
import type { FuelType } from '../types/fuel';
import { Colors, FuelColors, Typography, Spacing, Radius, MIN_TOUCH_TARGET } from '../theme/oneUI';

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<FuelType>('95_ULP');

  const historyQuery = usePriceHistory();
  const fuelSeries = useFuelTypeHistory(selected);

  if (historyQuery.isLoading) return <LoadingState message="Loading price history…" />;
  if (historyQuery.error) {
    return (
      <ErrorState error={historyQuery.error} onRetry={historyQuery.refetch} />
    );
  }

  const chartWidth = width - Spacing.md * 2;
  const accentColor = FuelColors[selected] ?? Colors.primary;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={historyQuery.isFetching && !historyQuery.isLoading}
          onRefresh={historyQuery.refetch}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Price History</Text>
        <Text style={styles.subtitle}>January 2024 – Present</Text>
      </View>

      {/* Fuel type selector — horizontal chip row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {FUEL_TYPES.map((ft: FuelType) => {
          const isActive = ft === selected;
          const chipColor = FuelColors[ft] ?? Colors.primary;
          return (
            <TouchableOpacity
              key={ft}
              style={[
                styles.chip,
                isActive
                  ? { backgroundColor: chipColor, borderColor: chipColor }
                  : { backgroundColor: Colors.surface, borderColor: Colors.outlineVariant },
              ]}
              onPress={() => setSelected(ft)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Show ${FUEL_LABELS[ft]} history`}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? Colors.onPrimary : Colors.onSurface },
                ]}
              >
                {FUEL_LABELS[ft]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Chart card */}
      <View style={styles.chartCard}>
        <Text style={[styles.chartTitle, { color: accentColor }]}>
          {FUEL_LABELS[selected]}
        </Text>
        <Text style={styles.chartSubtitle}>Retail price per litre (R)</Text>

        {fuelSeries.data.length > 0 ? (
          <PriceChart
            data={fuelSeries.data}
            color={accentColor}
            width={chartWidth - Spacing.md * 2}
            height={220}
          />
        ) : (
          <Text style={styles.noData}>No historical data available</Text>
        )}
      </View>

      {/* Summary stats */}
      {fuelSeries.data.length > 0 && (
        <View style={styles.statsRow}>
          <StatBox
            label="Lowest"
            value={`R${(Math.min(...fuelSeries.data.map(d => d.price)) / 100).toFixed(2)}`}
          />
          <StatBox
            label="Highest"
            value={`R${(Math.max(...fuelSeries.data.map(d => d.price)) / 100).toFixed(2)}`}
          />
          <StatBox
            label="Months"
            value={String(fuelSeries.data.length)}
          />
        </View>
      )}
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={statStyles.box}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    elevation: 1,
  },
  value: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
});

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  header: {
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
  chipScroll: {
    flexGrow: 0,
  },
  chipRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  chipText: {
    ...Typography.labelLarge,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    elevation: 2,
    gap: Spacing.sm,
  },
  chartTitle: {
    ...Typography.titleLarge,
  },
  chartSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.xs,
  },
  noData: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
