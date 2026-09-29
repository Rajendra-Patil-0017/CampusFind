import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { ThemedText } from '@/components/themed-text';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Snackbar } from '@/components/Snackbar';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/context/auth';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { APP_CONFIG } from '@/constants/config';
import { LostFoundItem } from '@/types/item';
import { BorderRadius, Fonts, MaxContentWidth, ScreenPadding, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 880;
  const { user, profile, signOut, isConfigured } = useAuth();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
  const [migrateModalVisible, setMigrateModalVisible] = useState<boolean>(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState<boolean>(false);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await StorageService.getItems();
      setItems(data);
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const currentUserId = user?.id || APP_CONFIG.localUserId;
  const myPosts = items.filter(
    (i) => i.ownerId === currentUserId || (!user && i.ownerId === APP_CONFIG.localUserId)
  );
  const activeLost = items.filter((i) => i.type === 'lost' && i.status === 'active').length;
  const activeFound = items.filter((i) => i.type === 'found' && i.status === 'active').length;
  const resolvedTotal = items.filter((i) => i.status === 'resolved').length;

  const handleExportData = async () => {
    try {
      const json = await StorageService.exportData();

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campusfind-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setSnackbarMessage('Backup exported successfully.');
        setSnackbarVisible(true);
        return;
      }

      const file = new File(Paths.document, 'campusfind-backup.json');
      if (file.exists) {
        file.delete();
      }
      file.create();
      file.write(json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export CampusFind Backup',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Export Complete', `Backup created at ${file.uri}`);
      }
    } catch (e: any) {
      console.warn('Export error:', e);
      Alert.alert('Export Failed', e?.message || 'Could not export backup.');
    }
  };

  const handleResetToSamples = async () => {
    await StorageService.resetToSamples();
    setResetModalVisible(false);
    loadStats();
    setSnackbarMessage('Restored default demo notices.');
    setSnackbarVisible(true);
  };

  const handleMigrateReports = async () => {
    if (!user) {
      setMigrateModalVisible(false);
      router.push('/(auth)/login' as any);
      return;
    }

    setIsMigrating(true);
    try {
      const results = await StorageService.migrateLocalReportsToSupabase(user.id);
      setMigrateModalVisible(false);
      loadStats();
      setSnackbarMessage(
        `Migration complete: ${results.migratedCount} uploaded, ${results.skippedCount} existing, ${results.failedCount} failed.`
      );
      setSnackbarVisible(true);
    } catch (e: any) {
      Alert.alert('Migration Error', e?.message || 'Failed to transfer reports to cloud.');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSignOutModalVisible(false);
    loadStats();
    setSnackbarMessage('Signed out successfully.');
    setSnackbarVisible(true);
  };

  const renderContent = () => (
    <View style={styles.responsiveContainer}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Profile & Tools</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Account overview and local data management
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* User Account / Profile Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
            Shadows.subtle,
          ]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.border,
              },
            ]}>
            <Ionicons name="school" size={26} color={theme.primary} />
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>
              {profile?.fullName || (user ? user.email?.split('@')[0] : 'Campus Guest')}
            </ThemedText>
            <ThemedText style={[styles.userRole, { color: theme.textSecondary }]}>
              {user ? user.email : 'Local Guest Mode (Offline Only)'}
            </ThemedText>
            <View style={styles.offlineBadge}>
              <View
                style={[
                  styles.offlineDot,
                  { backgroundColor: user ? theme.found : theme.teal },
                ]}
              />
              <ThemedText style={[styles.offlineText, { color: theme.textSecondary }]}>
                {user ? 'Cloud Database Connected' : 'Offline Local Storage Active'}
              </ThemedText>
            </View>
          </View>

          {user ? (
            <Pressable
              onPress={() => setSignOutModalVisible(true)}
              style={[styles.signOutSmallBtn, { borderColor: theme.border, backgroundColor: theme.elevatedSurface }]}>
              <Ionicons name="log-out-outline" size={16} color={theme.danger} />
              <ThemedText style={[styles.signOutSmallText, { color: theme.danger }]}>
                Sign Out
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/(auth)/login' as any)}
              style={[styles.signInSmallBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="log-in-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.signInSmallText}>Sign In</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Phase 7 Cloud Migration Banner (if user is logged in or wants to sync) */}
        {user && (
          <View
            style={[
              styles.migrationBanner,
              { backgroundColor: theme.primaryLight, borderColor: theme.border },
              Shadows.subtle,
            ]}>
            <View style={styles.migrationIcon}>
              <Ionicons name="cloud-upload" size={22} color={theme.primary} />
            </View>
            <View style={styles.migrationContent}>
              <ThemedText style={[styles.migrationTitle, { color: theme.text }]}>
                Sync Local Reports to Cloud
              </ThemedText>
              <ThemedText style={[styles.migrationDesc, { color: theme.textSecondary }]}>
                Transfer any reports created locally on this device to your Supabase cloud account.
              </ThemedText>
            </View>
            <PrimaryButton
              title="Sync Now"
              size="sm"
              icon="sync-outline"
              loading={isMigrating}
              onPress={() => setMigrateModalVisible(true)}
            />
          </View>
        )}

        {/* Campus Activity Stats */}
        <ThemedText style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          CAMPUS DIRECTORY OVERVIEW
        </ThemedText>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <ThemedText style={[styles.statValue, { color: theme.primary }]}>
              {myPosts.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              My Reports
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <ThemedText style={[styles.statValue, { color: theme.lost }]}>
              {activeLost}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Lost
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <ThemedText style={[styles.statValue, { color: theme.teal }]}>
              {activeFound}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Found
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}>
            <ThemedText style={[styles.statValue, { color: theme.resolved }]}>
              {resolvedTotal}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Resolved
            </ThemedText>
          </View>
        </View>

        {/* Data & Storage Settings */}
        <ThemedText
          style={[
            styles.sectionHeading,
            { color: theme.textSecondary, marginTop: Spacing.four },
          ]}>
          DATA PERSISTENCE & BACKUP
        </ThemedText>

        <View
          style={[
            styles.actionGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Pressable
            onPress={handleExportData}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: pressed ? theme.background : 'transparent' },
            ]}>
            <View style={[styles.actionIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="download-outline" size={18} color={theme.primary} />
            </View>
            <View style={styles.actionItemTextCol}>
              <ThemedText style={styles.actionItemTitle}>Export JSON Backup</ThemedText>
              <ThemedText style={[styles.actionItemDesc, { color: theme.textSecondary }]}>
                Share or save your offline reports to a local JSON file
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => setResetModalVisible(true)}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: pressed ? theme.background : 'transparent' },
            ]}>
            <View style={[styles.actionIconCircle, { backgroundColor: theme.lostBg }]}>
              <Ionicons name="refresh-outline" size={18} color={theme.lost} />
            </View>
            <View style={styles.actionItemTextCol}>
              <ThemedText style={styles.actionItemTitle}>Restore Demo Notices</ThemedText>
              <ThemedText style={[styles.actionItemDesc, { color: theme.textSecondary }]}>
                Reset registry to default campus sample records
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>
        </View>

        {/* Information & Safety */}
        <ThemedText
          style={[
            styles.sectionHeading,
            { color: theme.textSecondary, marginTop: Spacing.four },
          ]}>
          COMMUNITY & SAFETY
        </ThemedText>

        <View
          style={[
            styles.actionGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Pressable
            onPress={() => router.push('/about')}
            style={({ pressed }) => [
              styles.actionItem,
              { backgroundColor: pressed ? theme.background : 'transparent' },
            ]}>
            <View style={[styles.actionIconCircle, { backgroundColor: theme.accentLight }]}>
              <Ionicons name="information-circle-outline" size={18} color={theme.teal} />
            </View>
            <View style={styles.actionItemTextCol}>
              <ThemedText style={styles.actionItemTitle}>About CampusFind</ThemedText>
              <ThemedText style={[styles.actionItemDesc, { color: theme.textSecondary }]}>
                Mission, architecture, and version details
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>
        </View>

        <View style={styles.footerNote}>
          <ThemedText style={[styles.footerText, { color: theme.textMuted }]}>
            CampusFind v{APP_CONFIG.version} • {isConfigured ? 'Supabase Backend Connected' : 'Offline Local Storage'}
          </ThemedText>
        </View>
      </ScrollView>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        visible={resetModalVisible}
        title="Reset Sample Data?"
        message="This will reset the local database to include the initial campus sample records. Any reports you have created will be replaced."
        confirmText="Reset"
        cancelText="Cancel"
        isDestructive
        icon="refresh-outline"
        onConfirm={handleResetToSamples}
        onCancel={() => setResetModalVisible(false)}
      />

      {/* Migration Confirmation Dialog */}
      <ConfirmDialog
        visible={migrateModalVisible}
        title="Upload Local Reports to Cloud?"
        message="This will scan your device for locally created lost and found reports and upload them to your Supabase account. Existing cloud reports will not be duplicated."
        confirmText="Upload & Sync"
        cancelText="Cancel"
        icon="cloud-upload-outline"
        onConfirm={handleMigrateReports}
        onCancel={() => setMigrateModalVisible(false)}
      />

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        visible={signOutModalVisible}
        title="Sign Out?"
        message="Are you sure you want to sign out? You can continue using the application in guest mode."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive
        icon="log-out-outline"
        onConfirm={handleSignOut}
        onCancel={() => setSignOutModalVisible(false)}
      />

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        onDismiss={() => setSnackbarVisible(false)}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      {isDesktop ? (
        <View style={styles.desktopLayoutRow}>
          <DesktopSidebar activeRoute="profile" />
          <View style={styles.desktopMainCol}>
            <DesktopHeader />
            <View style={styles.desktopContentArea}>{renderContent()}</View>
          </View>
        </View>
      ) : (
        renderContent()
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  desktopLayoutRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  desktopMainCol: {
    flex: 1,
    height: '100%',
  },
  desktopContentArea: {
    flex: 1,
  },
  responsiveContainer: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 12,
    marginTop: 2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
  },
  offlineDot: {
    width: 7,
    height: 7,
    borderRadius: 9999,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '500',
  },
  signInSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  signInSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  signOutSmallText: {
    fontSize: 12,
    fontWeight: '700',
  },
  migrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
    gap: 12,
  },
  migrationIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  migrationContent: {
    flex: 1,
  },
  migrationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  migrationDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: Spacing.two,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  actionGroup: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three + 2,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  actionItemTextCol: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionItemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    marginLeft: 56,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  footerText: {
    fontSize: 12,
  },
});
