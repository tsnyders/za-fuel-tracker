import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCurrentPrices } from '../hooks/useFuelPrices';
import { useFuelTypeHistory } from '../hooks/useFuelPrices';
import { useAdaptiveLayout } from '../hooks/useAdaptiveLayout';
import PriceChart from '../components/PriceChart';
import LoadingState from '../components/LoadingState';
import ErrorState   from '../components/ErrorState';
import FallbackAttribution from '../components/FallbackAttribution';
import { FUEL_LABELS, FUEL_DESCRIPTIONS } from '../types/fuel';
import type { RootStackParamList } from '../types/fuel';
import {
  Colors, FuelColors, Typography, Spacing, Radius, Elevation,
} from '../theme/oneUI';
import { formatPrice, formatDelta, priceDelta } from '../api/fuelApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { fuelType } = route.params;
  const { width, isSmallTablet, isLargeTablet } = useAdaptiveLayout();

  const currentQuery = useCurrentPrices();
  const historyQuery = useFuelTypeHistory(fuelType);

  const isLoading = currentQuery.isLoading || historyQuery.isLoading;
  const error = currentQuery.error ?? historyQuery.error;

  const accentColor = FuelColors[fuelType] ?? Colors.primary;

  // Update the header title
  React.useLayoutEffect(() => {
    navigation.setOptions({ title: FUEL_LABELS[fuelType] });
  }, [navigation, fuelType]);

  if (isLoading) return <LoadingState />;
  if (error || !currentQuery.data) {
    return (
      <ErrorState
        error={error ?? new Error('No data')}
        onRetry={() => {
          currentQuery.refetch();
          historyQuery.refetch();
        }}
      />
    );
  }

  const currentPrice = currentQuery.data.prices[fuelType];
  const history = historyQuery.data;
  const prevPrice = history.length >= 2 ? history[history.length - 2].price : undefined;
  const delta = prevPrice !== undefined ? priceDelta(currentPrice, prevPrice) : null;

  // Tablet: side-by-side layout (chart on left, stats on right)
  const isWide = isSmallTablet || isLargeTablet;

  // Phone:  screenW - contentPad(×2) - cardPad(×2) = W - 64
  // Tablet: ((screenW - contentPad(×2) - gap) / 2) - cardPad(×2)
  //         = ((W - 48) / 2) - 32
  // The chart SVG must fit inside the card without overflowing its padding.
  const chartWidth = isWide
    ? (width - Spacing.md * 3) / 2 - Spacing.md * 2
    : width - Spacing.md * 4;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={currentQuery.isFetching && !currentQuery.isLoading}
          onRefresh={() => { currentQuery.refetch(); historyQuery.refetch(); }}
          colors={[accentColor]}
        />
      }
    >
      {/* Hero price card */}
      <View style={[styles.heroCard, { borderTopColor: accentColor }]}>
        <Text style={styles.heroLabel}>{FUEL_LABELS[fuelType]}</Text>
        <Text style={[styles.heroPrice, { color: accentColor }]}>
          {formatPrice(currentPrice)}
        </Text>
        <Text style={styles.heroUnit}>per litre</Text>

        {delta !== null && (
          <View style={styles.deltaRow}>
            <Text
              style={[
                styles.delta,
                { color: delta > 0 ? Colors.error : delta < 0 ? Colors.success : Colors.onSurfaceVariant },
              ]}
            >
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '━'} {formatDelta(delta)} vs previous month
            </Text>
          </View>
        )}

        <Text style={styles.description}>{FUEL_DESCRIPTIONS[fuelType]}</Text>
        <Text style={styles.effectiveDate}>
          Effective {new Date(currentQuery.data.effectiveDate).toLocaleDateString('en-ZA', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>
      </View>

      {/* Fallback attribution — CC BY 4.0 required when OpenVan.camp is active */}
      {currentQuery.data.isFallback && <FallbackAttribution />}

      {/* Tablet: split layout; phone: stacked */}
      <View style={[styles.body, isWide && styles.bodyWide]}>
        {/* Chart */}
        <View style={[styles.chartCard, isWide && styles.chartCardWide]}>
          <Text style={styles.sectionTitle}>Price Over Time</Text>
          <Text style={styles.sectionSub}>Retail price per litre (R)</Text>
          {history.length > 0 ? (
            <PriceChart
              data={history}
              color={accentColor}
              width={chartWidth}
              height={200}
            />
          ) : (
            <Text style={styles.noData}>No historical data</Text>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, isWide && styles.statsCardWide]}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          {history.length > 0 && (
            <>
              <StatRow
                label="Current"
                value={formatPrice(currentPrice)}
                accent={accentColor}
              />
              <StatRow
                label="12-Month Low"
                value={formatPrice(Math.min(...history.map(d => d.price)))}
              />
              <StatRow
                label="12-Month High"
                value={formatPrice(Math.max(...history.map(d => d.price)))}
              />
              <StatRow
                label="Average"
                value={formatPrice(
                  Math.round(history.reduce((s, d) => s + d.price, 0) / history.length)
                )}
              />
              <StatRow
                label="Data points"
                value={`${history.length} months`}
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={statRowStyles.row}>
      <Text style={statRowStyles.label}>{label}</Text>
      <Text style={[statRowStyles.value, accent ? { color: accent } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

const statRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  label: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  value: {
    ...Typography.bodyLarge,
    color: Colors.onSurface,
    fontWeight: '500',
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
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderTopWidth: 4,
    padding: Spacing.lg,
    elevation: Elevation.card,
    gap: Spacing.xs,
  },
  heroLabel: {
    ...Typography.titleMedium,
    color: Colors.onSurfaceVariant,
  },
  heroPrice: {
    ...Typography.displayMedium,
    fontWeight: '300',
    lineHeight: 52,
  },
  heroUnit: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.xs,
  },
  deltaRow: {
    marginTop: Spacing.xs,
  },
  delta: {
    ...Typography.labelLarge,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
  },
  effectiveDate: {
    ...Typography.labelMedium,
    color: Colors.outline,
    marginTop: Spacing.xs,
  },
  body: {
    gap: Spacing.md,
  },
  bodyWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    elevation: Elevation.card,
    gap: Spacing.sm,
  },
  chartCardWide: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    elevation: Elevation.card,
  },
  statsCardWide: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  sectionSub: {
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
});
