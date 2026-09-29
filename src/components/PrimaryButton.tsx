import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: PrimaryButtonProps) {
  const theme = useTheme();

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled || loading) {
      return theme.border;
    }
    if (variant === 'primary') {
      return pressed ? theme.primaryDark : theme.primary;
    }
    if (variant === 'secondary') {
      return pressed ? theme.border : theme.card;
    }
    if (variant === 'danger') {
      return pressed ? '#A82525' : theme.danger;
    }
    if (variant === 'outline' || variant === 'ghost') {
      return pressed ? theme.primaryLight : 'transparent';
    }
    return theme.primary;
  };

  const getTextColor = () => {
    if (disabled || loading) {
      return theme.textMuted;
    }
    if (variant === 'primary' || variant === 'danger') {
      return '#FFFFFF';
    }
    if (variant === 'outline') {
      return theme.primary;
    }
    if (variant === 'secondary') {
      return theme.text;
    }
    return theme.text;
  };

  const getBorderColor = () => {
    if (disabled || loading) {
      return 'transparent';
    }
    if (variant === 'outline') {
      return theme.primary;
    }
    if (variant === 'secondary') {
      return theme.borderStrong;
    }
    return 'transparent';
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 36, borderRadius: BorderRadius.sm },
    md: { paddingVertical: 12, paddingHorizontal: 18, minHeight: 48, borderRadius: BorderRadius.md },
    lg: { paddingVertical: 14, paddingHorizontal: 22, minHeight: 52, borderRadius: BorderRadius.lg },
  }[size];

  const fontSizeStyles = {
    sm: { fontSize: 13 },
    md: { fontSize: 15 },
    lg: { fontSize: 16 },
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        sizeStyles,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          opacity: pressed && !disabled && !loading ? 0.92 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <ThemedText
            style={[
              styles.text,
              fontSizeStyles,
              { color: getTextColor() },
            ]}>
            {title}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.two,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
