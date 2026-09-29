import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { ThemedText } from '@/components/themed-text';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Snackbar } from '@/components/Snackbar';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { APP_CONFIG } from '@/constants/config';
import { LostFoundItem } from '@/types/item';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const theme = useTheme();

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [resetModalVisible, setResetModalVisible] = useState<boolean>(false);
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

  const myPosts = items.filter((i) => i.ownerId === APP_CONFIG.localUserId);
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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Account & Storage</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Campus Member Ledger & Local Database Controls
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* User Badge Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.borderStrong,
            },
            Shadows.tag,
          ]}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.borderStrong,
              },
            ]}>
            <Ionicons name="school" size={26} color={theme.primary} />
          </View>
          <View style={styles.userInfo}>
            <ThemedText style={styles.userName}>Campus Member</ThemedText>
            <ThemedText style={[styles.userRole, { color: theme.textSecondary }]}>
              Device ID: {APP_CONFIG.localUserId}
            </ThemedText>
            <View style={styles.offlineBadge}>
              <View style={[styles.offlineDot, { backgroundColor: theme.found }]} />
              <ThemedText style={[styles.offlineText, { color: theme.foundText }]}>
                100% Offline Storage
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Overview Stats */}
        <ThemedText style={styles.sectionHeader}>Campus Activity</ThemedText>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
              Shadows.tag,
            ]}>
            <ThemedText style={[styles.statNumber, { color: theme.primary }]}>
              {myPosts.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              My Reports
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
              Shadows.tag,
            ]}>
            <ThemedText style={[styles.statNumber, { color: theme.lost }]}>
              {activeLost}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Lost
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
              Shadows.tag,
            ]}>
            <ThemedText style={[styles.statNumber, { color: theme.found }]}>
              {activeFound}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Active Found
            </ThemedText>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.card, borderColor: theme.borderStrong },
              Shadows.tag,
            ]}>
            <ThemedText style={[styles.statNumber, { color: theme.resolved }]}>
              {resolvedTotal}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Resolved
            </ThemedText>
          </View>
        </View>

        {/* Management Actions */}
        <ThemedText style={styles.sectionHeader}>Quick Management</ThemedText>
        <View
          style={[
            styles.menuList,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <Pressable
            onPress={() => router.push('/(tabs)/my-posts')}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? theme.inputBg : 'transparent' },
            ]}>
            <View style={[styles.menuIconCircle, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="file-tray-full" size={16} color={theme.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <ThemedText style={styles.menuTitle}>My Reports</ThemedText>
              <ThemedText style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                Manage your {myPosts.length} submitted notices
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/(tabs)/add')}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? theme.inputBg : 'transparent' },
            ]}>
            <View style={[styles.menuIconCircle, { backgroundColor: theme.foundBg }]}>
              <Ionicons name="add-circle" size={16} color={theme.found} />
            </View>
            <View style={styles.menuTextContainer}>
              <ThemedText style={styles.menuTitle}>Post a New Notice</ThemedText>
              <ThemedText style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                Report a lost or found item on campus
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={handleExportData}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? theme.inputBg : 'transparent' },
            ]}>
            <View style={[styles.menuIconCircle, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="download" size={16} color={theme.text} />
            </View>
            <View style={styles.menuTextContainer}>
              <ThemedText style={styles.menuTitle}>Export Database (JSON Backup)</ThemedText>
              <ThemedText style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                Export local items to save or share offline
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Pressable
            onPress={() => router.push('/about')}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? theme.inputBg : 'transparent' },
            ]}>
            <View style={[styles.menuIconCircle, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="information-circle" size={16} color={theme.text} />
            </View>
            <View style={styles.menuTextContainer}>
              <ThemedText style={styles.menuTitle}>About CampusFind</ThemedText>
              <ThemedText style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                Platform architecture, version, and campus guidelines
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>
        </View>

        {/* Data Maintenance */}
        <ThemedText style={styles.sectionHeader}>Database Maintenance</ThemedText>
        <View
          style={[
            styles.menuList,
            { backgroundColor: theme.card, borderColor: theme.borderStrong },
            Shadows.tag,
          ]}>
          <Pressable
            onPress={() => setResetModalVisible(true)}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: pressed ? theme.inputBg : 'transparent' },
            ]}>
            <View style={[styles.menuIconCircle, { backgroundColor: theme.lostBg }]}>
              <Ionicons name="refresh" size={16} color={theme.lost} />
            </View>
            <View style={styles.menuTextContainer}>
              <ThemedText style={[styles.menuTitle, { color: theme.lost }]}>
                Reset to Sample Notices
              </ThemedText>
              <ThemedText style={[styles.menuSubtitle, { color: theme.textSecondary }]}>
                Restores standard campus demonstration data
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </Pressable>
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: theme.textMuted }]}>
            CampusFind v{APP_CONFIG.version} • Offline-First Native Architecture
          </ThemedText>
        </View>
      </ScrollView>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        visible={resetModalVisible}
        title="Reset to Sample Notices?"
        message="This replaces the current local database with standard campus demo notices."
        confirmText="Reset Database"
        cancelText="Cancel"
        isDestructive
        icon="refresh-circle-outline"
        onConfirm={handleResetToSamples}
        onCancel={() => setResetModalVisible(false)}
      />

      {/* Toast Feedback */}
      <Snackbar
        visible={snackbarVisible}
        message={snackbarMessage}
        type="success"
        onDismiss={() => setSnackbarVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.seven,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  userRole: {
    fontSize: 11,
    marginTop: 1,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  offlineText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginVertical: Spacing.two,
    paddingLeft: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.three,
  },
  statCard: {
    width: '48.5%',
    padding: Spacing.three,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  menuList: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.three,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
