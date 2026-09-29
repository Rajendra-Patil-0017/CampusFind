import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading posts...' }: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      {message ? (
        <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
          {message}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.seven,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});
