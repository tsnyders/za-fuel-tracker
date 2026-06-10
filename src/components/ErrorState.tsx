import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, MIN_TOUCH_TARGET } from '../theme/oneUI';
import { ApiError } from '../api/client';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError || error.isTimeout) {
      return 'No connection. Check your internet and try again.';
    }
    if (error.isServerError) {
      return 'The price server is temporarily unavailable. Try again shortly.';
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}

function isOfflineError(error: unknown): boolean {
  return error instanceof ApiError && (error.isNetworkError || error.isTimeout);
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const offline = isOfflineError(error);

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.icon}>{offline ? '📶' : '⚠️'}</Text>
      <Text style={styles.title}>{offline ? 'No Internet' : 'Something went wrong'}</Text>
      <Text style={styles.message}>{errorMessage(error)}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    gap: Spacing.sm,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.onBackground,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
  },
});
