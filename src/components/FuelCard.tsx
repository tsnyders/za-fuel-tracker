import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Colors,
  FuelColors,
  Typography,
  Spacing,
  Radius,
  Elevation,
  MIN_TOUCH_TARGET,
} from '../theme/oneUI';
import { formatPrice, formatDelta } from '../api/fuelApi';
import { FUEL_LABELS, FUEL_DESCRIPTIONS } from '../types/fuel';
import type { FuelType } from '../types/fuel';

interface FuelCardProps {
  fuelType: FuelType;
  priceInCents: number;
  previousPriceInCents?: number;
  onPress?: () => void;
}

export default function FuelCard({
  fuelType,
  priceInCents,
  previousPriceInCents,
  onPress,
}: FuelCardProps) {
  const accentColor = FuelColors[fuelType] ?? Colors.primary;
  const hasDelta = previousPriceInCents !== undefined && previousPriceInCents > 0;
  const delta = hasDelta ? priceInCents - previousPriceInCents! : 0;
  const deltaLabel = hasDelta ? formatDelta(delta) : null;
  const deltaColor = delta > 0 ? Colors.error : delta < 0 ? Colors.success : Colors.onSurfaceVariant;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${FUEL_LABELS[fuelType]}, ${formatPrice(priceInCents)} per litre`}
      disabled={!onPress}
    >
      {/* Accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
          <Text style={styles.label}>{FUEL_LABELS[fuelType]}</Text>
          {onPress && <Text style={styles.chevron}>›</Text>}
        </View>

        {/* Price */}
        <Text style={styles.price}>{formatPrice(priceInCents)}</Text>
        <Text style={styles.unit}>per litre</Text>

        {/* Delta from previous month */}
        {deltaLabel && (
          <View style={styles.deltaRow}>
            <Text style={[styles.delta, { color: deltaColor }]}>
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '━'} {deltaLabel} vs last month
            </Text>
          </View>
        )}

        {/* Description */}
        <Text style={styles.description} numberOfLines={1}>
          {FUEL_DESCRIPTIONS[fuelType]}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    elevation: Elevation.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
    minHeight: MIN_TOUCH_TARGET * 2,
  },
  accentStrip: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    flex: 1,
  },
  chevron: {
    ...Typography.titleLarge,
    color: Colors.outline,
    lineHeight: 22,
  },
  price: {
    ...Typography.headlineLarge,
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  unit: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: -Spacing.xs,
  },
  deltaRow: {
    marginTop: Spacing.xs,
  },
  delta: {
    ...Typography.labelMedium,
  },
  description: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.xs,
  },
});
