import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useTheme } from '@/hooks/use-theme';
import { APP_CONFIG } from '@/constants/config';
import { BorderRadius, Fonts, MaxContentWidth, ScreenPadding, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I claim a found item?',
    answer: 'Contact the person who posted the found notice using the contact button on the item page. Be prepared to provide distinctive details or proof of ownership before meeting at a campus safe exchange zone.',
  },
  {
    question: 'Where are the designated Campus Safe Exchange Zones?',
    answer: 'The Main Security Desk, Student Center Foyer, and Central Library Circulation Desk are designated 24/7 safe exchange locations with staff presence.',
  },
  {
    question: 'What should I do if I find a student ID card, wallet, or key ring?',
    answer: 'For official campus IDs, credit cards, or key sets, we recommend surrendering them directly to Campus Safety / Security Desk so staff can notify the registered student via the registrar database.',
  },
  {
    question: 'How do I mark my notice as resolved once returned?',
    answer: 'Go to the "My Reports" tab, find your item, and tap "Mark Resolved" to archive the notice from active campus searches.',
  },
  {
    question: 'Does CampusFind store my information on external servers?',
    answer: 'No. CampusFind operates 100% offline on your device using local storage. No tracking data is sent to external servers.',
  },
];

export default function AboutScreen() {
  const theme = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      <View style={styles.responsiveContainer}>
        <ScreenHeader title="Safety & FAQ" showBack />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {/* Academic Crest Banner */}
          <View
            style={[
              styles.brandCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.card,
            ]}>
            <View
              style={[
                styles.logoBox,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}>
              <Ionicons name="school" size={32} color={theme.primary} />
            </View>
            <ThemedText style={[styles.appName, { color: theme.text }]}>{APP_CONFIG.name}</ThemedText>
            <ThemedText style={[styles.tagline, { color: theme.teal }]}>
              {APP_CONFIG.tagline}
            </ThemedText>
            <ThemedText style={[styles.version, { color: theme.textMuted }]}>
              Academic Heritage Edition • v{APP_CONFIG.version}
            </ThemedText>
          </View>

          {/* Campus Safety Protocol Guide */}
          <ThemedText style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            CAMPUS SAFETY PROTOCOLS
          </ThemedText>

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.subtle,
            ]}>
            {/* Safe Exchange Zones */}
            <View style={styles.safetyRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
              </View>
              <View style={styles.safetyCol}>
                <ThemedText style={[styles.safetyHeading, { color: theme.text }]}>
                  Designated Safe Exchange Zones
                </ThemedText>
                <ThemedText style={[styles.safetyDesc, { color: theme.textSecondary }]}>
                  Conduct all handoffs in well-lit, staffed campus zones: Student Center Foyer, Central Library Desk, or Security Station.
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Ownership Verification */}
            <View style={styles.safetyRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.lostBg }]}>
                <Ionicons name="checkmark-circle" size={18} color={theme.lost} />
              </View>
              <View style={styles.safetyCol}>
                <ThemedText style={[styles.safetyHeading, { color: theme.text }]}>
                  Verify Ownership Before Handoff
                </ThemedText>
                <ThemedText style={[styles.safetyDesc, { color: theme.textSecondary }]}>
                  Ask claimants to identify unique stickers, device lock-screens, serial markers, or present their student ID before returning valuable electronics.
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Handling IDs & Valuables */}
            <View style={styles.safetyRow}>
              <View style={[styles.iconCircle, { backgroundColor: theme.accentLight }]}>
                <Ionicons name="card" size={18} color={theme.teal} />
              </View>
              <View style={styles.safetyCol}>
                <ThemedText style={[styles.safetyHeading, { color: theme.text }]}>
                  Handling Found IDs, Wallets & Keys
                </ThemedText>
                <ThemedText style={[styles.safetyDesc, { color: theme.textSecondary }]}>
                  Found Student IDs, government cards, and master keys should be turned in immediately to Campus Security for official holding.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Frequently Asked Questions */}
          <ThemedText style={[styles.sectionHeader, { color: theme.textSecondary, marginTop: Spacing.four }]}>
            FREQUENTLY ASKED QUESTIONS
          </ThemedText>

          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item, index) => {
              const isExpanded = expandedIndex === index;
              return (
                <Pressable
                  key={index}
                  onPress={() => setExpandedIndex(isExpanded ? null : index)}
                  style={[
                    styles.faqCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    Shadows.subtle,
                  ]}>
                  <View style={styles.faqHeader}>
                    <ThemedText style={[styles.faqQuestion, { color: theme.text }]}>
                      {item.question}
                    </ThemedText>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={theme.primary}
                    />
                  </View>
                  {isExpanded && (
                    <ThemedText style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                      {item.answer}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Offline Architecture Note */}
          <View
            style={[
              styles.offlineCard,
              { backgroundColor: theme.elevatedSurface, borderColor: theme.border },
            ]}>
            <Ionicons name="lock-closed" size={16} color={theme.primary} />
            <ThemedText style={[styles.offlineText, { color: theme.textSecondary }]}>
              CampusFind operates offline on your device. Manage or export your local backups from the Profile & Tools tab.
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
    paddingBottom: 80,
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
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: Typography.sm,
    fontStyle: 'italic',
    marginTop: 2,
  },
  version: {
    fontSize: Typography.xs,
    marginTop: 6,
    fontFamily: Fonts.mono,
  },
  sectionHeader: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.two,
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
    marginTop: 2,
  },
  safetyCol: {
    flex: 1,
  },
  safetyHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  safetyDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.three,
  },
  faqList: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  faqCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.three + 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: '#E7E2D6',
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.two,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  offlineText: {
    flex: 1,
    fontSize: Typography.xs,
    lineHeight: 16,
  },
});
