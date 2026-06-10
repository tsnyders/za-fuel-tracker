'use client';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme/oneUI';

/**
 * Shown on DetailScreen and HomeScreen when data comes from the OpenVan.camp
 * fallback. Required by the CC BY 4.0 licence — do not remove.
 */
export default function FallbackAttribution() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={styles.text}>
        <Text style={styles.title}>Using fallback data source</Text>
        <Text style={styles.body}>
          Primary SA Fuel Price API unavailable. Prices sourced from{' '}
          <Text style={styles.link}>OpenVan.camp</Text> (CC BY 4.0).
          Inland/coastal and 95/93 ULP distinctions are unavailable — both
          grades show the same national average.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 16,
    marginTop: 1,
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    ...Typography.labelLarge,
    color: Colors.onPrimaryContainer,
  },
  body: {
    ...Typography.bodyMedium,
    color: Colors.onPrimaryContainer,
  },
  link: {
    fontWeight: '600',
  },
});
