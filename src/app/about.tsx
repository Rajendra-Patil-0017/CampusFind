import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { APP_CONFIG } from '@/constants/config';
import { BorderRadius, MaxContentWidth, ScreenPadding, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        <ScreenHeader title="About CampusFind" showBack />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
        {/* Brand Banner */}
        <View
          style={[
            styles.brandCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <View
            style={[
              styles.logoBox,
              { backgroundColor: theme.primaryLight, borderColor: theme.primary },
            ]}>
            <Ionicons name="school-outline" size={32} color={theme.primary} />
          </View>
          <ThemedText style={styles.appName}>{APP_CONFIG.name}</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.teal }]}>
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
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <ThemedText style={styles.sectionTitle}>Purpose & Mission</ThemedText>
          <ThemedText style={[styles.bodyText, { color: theme.text }]}>
            CampusFind is an offline-first lost-and-found noticeboard built specifically
            for colleges and universities. It replaces paper flyers and fragmented social
            media posts with a clean, searchable campus registry where students and staff can
            quickly report, locate, and return misplaced belongings.
          </ThemedText>
        </View>

        {/* Safety Guidelines */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <ThemedText style={styles.sectionTitle}>Campus Safety Tips</ThemedText>

          <View style={styles.safetyRow}>
            <Ionicons name="location-outline" size={18} color={theme.teal} style={styles.safetyIcon} />
            <View style={styles.safetyCol}>
              <ThemedText style={styles.safetyHeading}>Public Handover Locations</ThemedText>
              <ThemedText style={[styles.safetyDesc, { color: theme.textSecondary }]}>
                Arrange meetups in well-lit, high-traffic campus spaces such as the Student
                Center foyer, Library front desk, or Campus Dining commons.
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.safetyRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.teal} style={styles.safetyIcon} />
            <View style={styles.safetyCol}>
              <ThemedText style={styles.safetyHeading}>Verify Ownership</ThemedText>
              <ThemedText style={[styles.safetyDesc, { color: theme.textSecondary }]}>
                Ask claimants to describe distinctive features (e.g., lock screen wallpaper,
                stickers, unique case scratches) or present valid student ID before handing over valuables.
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.safetyRow}>
            <Ionicons name="shield-outline" size={18} color={theme.teal} style={styles.safetyIcon} />
            <View style={styles.safetyCol}>
              <ThemedText style={styles.safetyHeading}>Official Department Desks</ThemedText>
              <ThemedText style={[styles.safetyDesc, { color: theme.textSecondary }]}>
                For items like official IDs, credit cards, or master keys, hand them over to
                Campus Security or Student Services for official custody.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Data Architecture Note */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.subtle,
          ]}>
          <ThemedText style={styles.sectionTitle}>Privacy & Offline Storage</ThemedText>
          <ThemedText style={[styles.bodyText, { color: theme.textSecondary }]}>
            CampusFind operates 100% offline on your device using AsyncStorage. No user
            accounts or tracking telemetry are collected. You retain complete ownership of
            your data and can export or reset your local database at any time from the Profile tab.
          </ThemedText>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 60,
  },
  brandCard: {
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  version: {
    fontSize: 12,
    marginTop: 6,
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  safetyIcon: {
    marginTop: 2,
    marginRight: Spacing.three,
  },
  safetyCol: {
    flex: 1,
  },
  safetyHeading: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  safetyDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
});
