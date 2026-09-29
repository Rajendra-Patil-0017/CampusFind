import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface SnackbarProps {
  visible: boolean;
  message: string;
  actionText?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
  type?: 'default' | 'success' | 'error';
}

export function Snackbar({
  visible,
  message,
  actionText,
  onAction,
  onDismiss,
  duration = 4500,
  type = 'default',
}: SnackbarProps) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(40));

  const handleDismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 40,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  }, [opacity, translateY, onDismiss]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      opacity.setValue(0);
      translateY.setValue(40);
    }
  }, [visible, duration, handleDismiss, opacity, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.text,
            borderColor: theme.borderStrong,
          },
          Shadows.card,
        ]}>
        {type === 'success' && (
          <Ionicons name="checkmark-circle" size={18} color="#79BEB5" style={styles.icon} />
        )}
        {type === 'error' && (
          <Ionicons name="alert-circle" size={18} color="#F87171" style={styles.icon} />
        )}

        <ThemedText style={[styles.message, { color: theme.background }]}>
          {message}
        </ThemedText>

        {actionText && onAction && (
          <Pressable
            onPress={() => {
              onAction();
              handleDismiss();
            }}
            hitSlop={8}
            style={styles.actionBtn}>
            <ThemedText style={[styles.actionText, { color: theme.accent }]}>
              {actionText}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 84,
    left: Spacing.four,
    right: Spacing.four,
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxWidth: 500,
    width: '100%',
  },
  icon: {
    marginRight: Spacing.two,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  actionBtn: {
    marginLeft: Spacing.three,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionText: {
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
