import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { APP_CONFIG } from '@/constants/config';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <ScreenHeader title="About CampusFind" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Brand Banner */}
        <View
          style={[
            styles.brandCard,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <View
            style={[
              styles.logoBox,
              { backgroundColor: theme.primaryLight, borderColor: theme.primary },
            ]}>
            <Ionicons name="school-outline" size={32} color={theme.primary} />
          </View>
          <ThemedText style={styles.appName}>{APP_CONFIG.name}</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.primary }]}>
            {APP_CONFIG.tagline}
          </ThemedText>
          <ThemedText style={[styles.version, { color: theme.textMuted }]}>
            Version {APP_CONFIG.version} (Expo SDK 57)
          </ThemedText>
        </View>

        {/* Mission & Purpose */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <ThemedText style={styles.sectionTitle}>Purpose & Mission</ThemedText>
          <ThemedText style={[styles.bodyText, { color: theme.text }]}>
            CampusFind is an offline-first lost-and-found bulletin built specifically
            for colleges and universities. It replaces scattered physical paper flyers
            and lost item chaos with a unified, real-time campus registry where students
            and staff can record, search, and safely recover misplaced items.
          </ThemedText>
        </View>

        {/* Core Capabilities */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <ThemedText style={styles.sectionTitle}>Key Capabilities</ThemedText>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.found} />
            <ThemedText style={[styles.featureText, { color: theme.text }]}>
              <ThemedText style={styles.boldText}>Fast Intake: </ThemedText>
              Report lost and found items with precise campus coordinates and optional photos.
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.found} />
            <ThemedText style={[styles.featureText, { color: theme.text }]}>
              <ThemedText style={styles.boldText}>Multi-Filter Bulletin: </ThemedText>
              Instantly search across categories, statuses, and locations in real time.
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.found} />
            <ThemedText style={[styles.featureText, { color: theme.text }]}>
              <ThemedText style={styles.boldText}>Local Persistence: </ThemedText>
              100% offline data integrity with JSON export and recovery tools.
            </ThemedText>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={theme.found} />
            <ThemedText style={[styles.featureText, { color: theme.text }]}>
              <ThemedText style={styles.boldText}>Direct Handover: </ThemedText>
              One-tap communication and native OS sharing to reunite items faster.
            </ThemedText>
          </View>
        </View>

        {/* Tech Stack */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <ThemedText style={styles.sectionTitle}>Technology Stack</ThemedText>

          <View style={styles.techBadgeRow}>
            {['Expo SDK 57', 'React Native 0.86', 'TypeScript', 'Expo Router', 'AsyncStorage', 'Reanimated'].map((t) => (
              <View
                key={t}
                style={[
                  styles.techBadge,
                  { backgroundColor: theme.background, borderColor: theme.borderStrong },
                ]}>
                <ThemedText style={[styles.techBadgeText, { color: theme.text }]}>
                  {t}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Safe Campus Guidelines */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <ThemedText style={styles.sectionTitle}>Safe Recovery Protocols</ThemedText>
          <ThemedText style={[styles.bodyText, { color: theme.textSecondary }]}>
            • Arrange high-value handovers at public campus locations (e.g., Campus Safety desk or Student Union).
            {'\n'}• Verify unique identifiers (wallpaper, serial suffix, sticker details) before releasing property.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.seven,
  },
  brandCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xs,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  version: {
    fontSize: 11,
    marginTop: 4,
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 4,
  },
  featureText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  techBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  techBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  techBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
