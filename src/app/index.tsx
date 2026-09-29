import React, { useEffect, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { APP_CONFIG } from '@/constants/config';
import { StorageService } from '@/services/storage';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const theme = useTheme();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.95));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    let isMounted = true;
    const prepareApp = async () => {
      try {
        await StorageService.getItems();
      } catch (e) {
        console.warn('Splash prepare error:', e);
      }

      setTimeout(() => {
        if (isMounted) {
          router.replace('/(tabs)' as any);
        }
      }, 950);
    };

    prepareApp();

    return () => {
      isMounted = false;
    };
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <View
          style={[
            styles.emblem,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderStrong,
            },
          ]}>
          <View style={[styles.innerBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="search" size={32} color="#FFFFFF" />
          </View>
        </View>

        <ThemedText style={styles.appName}>{APP_CONFIG.name}</ThemedText>
        <ThemedText style={[styles.tagline, { color: theme.teal }]}>
          {APP_CONFIG.tagline}
        </ThemedText>
        <ThemedText style={[styles.registrySubtitle, { color: theme.textSecondary }]}>
          Campus Noticeboard & Registry
        </ThemedText>
      </Animated.View>

      <View style={styles.footer}>
        <ThemedText style={[styles.footerText, { color: theme.textMuted }]}>
          Offline Local Storage • v{APP_CONFIG.version}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    alignItems: 'center',
  },
  emblem: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  innerBadge: {
    width: 58,
    height: 58,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  registrySubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.six,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
