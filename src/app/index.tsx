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
  const [scaleAnim] = useState(() => new Animated.Value(0.92));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    let isMounted = true;
    const prepareApp = async () => {
      try {
        await StorageService.getItems();
      } catch (e) {
        console.warn('Splash prepare error:', e);
      }

      setTimeout(() => {
        if (isMounted) {
          pulseLoop.stop();
          router.replace('/(tabs)' as any);
        }
      }, 1100);
    };

    prepareApp();

    return () => {
      isMounted = false;
      pulseLoop.stop();
    };
  }, [fadeAnim, scaleAnim, pulseAnim]);

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
        <Animated.View
          style={[
            styles.emblem,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderStrong,
              transform: [{ scale: pulseAnim }],
            },
          ]}>
          <View style={[styles.innerBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="search" size={36} color="#FFFFFF" />
          </View>
        </Animated.View>

        <ThemedText style={styles.appName}>{APP_CONFIG.name}</ThemedText>
        <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
          {APP_CONFIG.tagline}
        </ThemedText>
        <ThemedText style={[styles.registrySubtitle, { color: theme.textMuted }]}>
          Campus Lost & Found Registry
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
    width: 88,
    height: 88,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  innerBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 15,
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
