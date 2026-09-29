import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from './themed-text';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { APP_CONFIG } from '@/constants/config';
import { BorderRadius, Fonts, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export type DesktopNavRoute = 'bulletin' | 'add' | 'my-reports' | 'safety' | 'profile';

interface DesktopSidebarProps {
  activeRoute: DesktopNavRoute;
}

export function DesktopSidebar({ activeRoute }: DesktopSidebarProps) {
  const theme = useTheme();
  const { user, profile } = useAuth();

  const navItems: { route: DesktopNavRoute; label: string; icon: keyof typeof Ionicons.glyphMap; path: string }[] = [
    { route: 'bulletin', label: 'Campus Bulletin', icon: 'newspaper-outline', path: '/(tabs)' },
    { route: 'my-reports', label: 'My Reports', icon: 'file-tray-full-outline', path: '/(tabs)/my-posts' },
    { route: 'safety', label: 'Campus Safety & FAQ', icon: 'shield-checkmark-outline', path: '/about' },
    { route: 'profile', label: 'Profile & Settings', icon: 'person-outline', path: '/(tabs)/profile' },
  ];

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.card, borderRightColor: theme.border }]}>
      {/* Brand Masthead */}
      <View style={styles.brandHeader}>
        <View style={[styles.logoIcon, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
          <Ionicons name="school" size={22} color={theme.primary} />
        </View>
        <View style={styles.brandTextCol}>
          <ThemedText style={[styles.brandTitle, { color: theme.text }]}>CampusFind</ThemedText>
          <ThemedText style={[styles.brandTagline, { color: theme.textSecondary }]}>
            {APP_CONFIG.tagline}
          </ThemedText>
        </View>
      </View>

      {/* Prominent Report Button */}
      <View style={styles.reportBtnWrapper}>
        <Pressable
          onPress={() => router.push('/(tabs)/add')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.reportButton,
            {
              backgroundColor: activeRoute === 'add' ? theme.primaryDark : theme.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <ThemedText style={styles.reportButtonText}>Report an Item</ThemedText>
        </Pressable>
      </View>

      {/* Navigation Links */}
      <View style={styles.navList}>
        <ThemedText style={[styles.navSectionLabel, { color: theme.textMuted }]}>
          NAVIGATION
        </ThemedText>
        {navItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => router.push(item.path as any)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.navItem,
                {
                  backgroundColor: isActive ? theme.primaryLight : pressed ? theme.elevatedSurface : 'transparent',
                },
              ]}>
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive ? theme.primary : theme.textSecondary}
                style={styles.navIcon}
              />
              <ThemedText
                style={[
                  styles.navLabel,
                  {
                    color: isActive ? theme.primary : theme.text,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}>
                {item.label}
              </ThemedText>
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Campus Safe Exchange Info Card */}
      <View style={[styles.infoCard, { backgroundColor: theme.elevatedSurface, borderColor: theme.border }]}>
        <View style={styles.infoCardHeader}>
          <Ionicons name="shield-checkmark" size={15} color={theme.primary} />
          <ThemedText style={[styles.infoCardTitle, { color: theme.primary }]}>Safe Exchange</ThemedText>
        </View>
        <ThemedText style={[styles.infoCardText, { color: theme.textSecondary }]}>
          Security Desks & Student Center foyer are 24/7 staff-monitored zones.
        </ThemedText>
      </View>

      {/* User Profile Footer */}
      <View style={[styles.userFooter, { borderTopColor: theme.border }]}>
        {user ? (
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.userProfileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}>
              <Ionicons name="person" size={16} color={theme.primary} />
            </View>
            <View style={styles.userTextCol}>
              <ThemedText style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                {profile?.fullName || user.email?.split('@')[0] || 'Campus Member'}
              </ThemedText>
              <ThemedText style={[styles.userSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {user.email}
              </ThemedText>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/(auth)/login' as any)}
            style={[styles.signInPromptRow, { backgroundColor: theme.elevatedSurface, borderColor: theme.border }]}>
            <Ionicons name="log-in-outline" size={16} color={theme.primary} />
            <ThemedText style={[styles.signInPromptText, { color: theme.primary }]}>
              Sign In to Cloud
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    height: '100%',
    borderRightWidth: 1,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three,
    justifyContent: 'space-between',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.four,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: Typography.xs,
    fontStyle: 'italic',
    marginTop: 1,
  },
  reportBtnWrapper: {
    marginBottom: Spacing.four,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  navList: {
    flex: 1,
    gap: 4,
  },
  navSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.two,
    marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.two,
    borderRadius: BorderRadius.md,
    position: 'relative',
  },
  navIcon: {
    marginRight: 10,
  },
  navLabel: {
    fontSize: 13,
    flex: 1,
  },
  activeIndicator: {
    width: 4,
    height: 16,
    borderRadius: BorderRadius.full,
    position: 'absolute',
    right: 8,
  },
  infoCard: {
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoCardText: {
    fontSize: 11,
    lineHeight: 15,
  },
  userFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTextCol: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
  },
  userSub: {
    fontSize: 11,
    marginTop: 1,
  },
  signInPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  signInPromptText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
