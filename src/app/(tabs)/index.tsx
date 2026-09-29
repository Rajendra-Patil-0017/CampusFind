import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { SearchBar } from '@/components/SearchBar';
import { FilterChip } from '@/components/FilterChip';
import { CategoryPicker } from '@/components/CategoryPicker';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { DesktopHeader } from '@/components/DesktopHeader';
import { useTheme } from '@/hooks/use-theme';
import { StorageService } from '@/services/storage';
import { FilterState, ItemSortOption, LostFoundItem } from '@/types/item';
import { applyFiltersAndSort } from '@/utils/filters';
import { BorderRadius, Fonts, MaxContentWidth, ScreenPadding, Shadows, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 880;
  const isTablet = width >= 600 && width < 880;

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sortModalVisible, setSortModalVisible] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [hideResolved, setHideResolved] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    status: 'active',
    searchQuery: '',
    sortBy: 'newest',
  });

  const loadItems = useCallback(async () => {
    try {
      const data = await StorageService.getItems();
      setItems(data);
    } catch (e) {
      console.warn('Failed to load items:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    let result = applyFiltersAndSort(items, filters);
    if (selectedLocation !== 'all') {
      result = result.filter((item) =>
        item.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    if (hideResolved) {
      result = result.filter((item) => item.status !== 'resolved');
    }
    return result;
  }, [items, filters, selectedLocation, hideResolved]);

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'active' ||
    selectedLocation !== 'all' ||
    hideResolved ||
    filters.searchQuery.trim().length > 0;

  const resetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      status: 'active',
      searchQuery: '',
      sortBy: 'newest',
    });
    setSelectedLocation('all');
    setHideResolved(false);
  };

  const lostCount = items.filter((i) => i.type === 'lost' && i.status === 'active').length;
  const foundCount = items.filter((i) => i.type === 'found' && i.status === 'active').length;
  const resolvedCount = items.filter((i) => i.status === 'resolved').length;

  const sortLabels: Record<ItemSortOption, string> = {
    newest: 'Newest First',
    oldest: 'Oldest First',
    updated: 'Recently Updated',
  };

  const numColumns = isDesktop ? (viewMode === 'grid' ? 3 : 1) : isTablet ? (viewMode === 'grid' ? 2 : 1) : 1;

  const renderContent = () => (
    <View style={styles.responsiveContainer}>
      {/* Scrollable Feed with Academic Layout */}
      <FlatList
        key={numColumns} // Force remount on column change
        numColumns={numColumns}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          <View style={numColumns > 1 ? { flex: 1 / numColumns, paddingHorizontal: 6 } : undefined}>
            <ItemCard
              item={item}
              onPress={(selected) => router.push(`/item/${selected.id}` as any)}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.feedHeaderContent}>
            {/* 1. Academic Masthead Banner */}
            <View style={[styles.mastheadBanner, { borderBottomColor: theme.border }]}>
              <View style={styles.mastheadLeft}>
                <ThemedText style={[styles.eyebrowText, { color: theme.textSecondary }]}>
                  OFFICIAL UNIVERSITY STUDENT DISPATCH • LIVE GAZETTE
                </ThemedText>
                <ThemedText style={[styles.bulletinTitle, { color: theme.text }]}>
                  Campus Bulletin
                </ThemedText>
                <ThemedText style={[styles.bulletinSubtitle, { color: theme.textSecondary }]}>
                  Find It. Report It. Return It.
                </ThemedText>
              </View>

              {/* Summary Stats Badges */}
              <View style={styles.statsSummaryRow}>
                <Pressable
                  onPress={() => setFilters((prev) => ({ ...prev, type: 'lost', status: 'active' }))}
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: filters.type === 'lost' ? theme.lostBg : theme.card,
                      borderColor: filters.type === 'lost' ? theme.lost : theme.border,
                    },
                    Shadows.subtle,
                  ]}>
                  <Ionicons name="alert-circle" size={14} color={theme.lost} />
                  <ThemedText style={[styles.statPillCount, { color: theme.lost }]}>{lostCount}</ThemedText>
                  <ThemedText style={[styles.statPillLabel, { color: theme.textSecondary }]}>Lost</ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setFilters((prev) => ({ ...prev, type: 'found', status: 'active' }))}
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: filters.type === 'found' ? theme.foundBg : theme.card,
                      borderColor: filters.type === 'found' ? theme.found : theme.border,
                    },
                    Shadows.subtle,
                  ]}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.found} />
                  <ThemedText style={[styles.statPillCount, { color: theme.found }]}>{foundCount}</ThemedText>
                  <ThemedText style={[styles.statPillLabel, { color: theme.textSecondary }]}>Found</ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setFilters((prev) => ({ ...prev, status: 'resolved' }))}
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: filters.status === 'resolved' ? theme.resolvedBg : theme.card,
                      borderColor: filters.status === 'resolved' ? theme.resolved : theme.border,
                    },
                    Shadows.subtle,
                  ]}>
                  <Ionicons name="archive" size={14} color={theme.resolved} />
                  <ThemedText style={[styles.statPillCount, { color: theme.resolved }]}>{resolvedCount}</ThemedText>
                  <ThemedText style={[styles.statPillLabel, { color: theme.textSecondary }]}>Restored</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* 2. Official Campus Safe Exchange Protocol Notice */}
            <View
              style={[
                styles.safetyNoticePanel,
                { backgroundColor: theme.elevatedSurface, borderColor: theme.border },
                Shadows.subtle,
              ]}>
              <View style={[styles.safetyNoticeIconBox, { backgroundColor: theme.primary }]}>
                <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.safetyNoticeContent}>
                <ThemedText style={[styles.safetyNoticeTag, { color: theme.primary }]}>
                  CAMPUS SAFETY NOTICE
                </ThemedText>
                <ThemedText style={[styles.safetyNoticeHeading, { color: theme.text }]}>
                  Official Campus Safe Exchange Protocol
                </ThemedText>
                <ThemedText style={[styles.safetyNoticeDesc, { color: theme.textSecondary }]}>
                  Security Desks & Student Center foyer are designated 24/7 exchange zones for in-person handoffs.
                </ThemedText>
              </View>
              <Pressable
                onPress={() => router.push('/about')}
                style={[styles.safetyActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <ThemedText style={[styles.safetyActionText, { color: theme.primary }]}>View Protocol</ThemedText>
                <Ionicons name="arrow-forward" size={12} color={theme.primary} />
              </Pressable>
            </View>

            {/* 3. Search and Filter Toolbar */}
            <View
              style={[
                styles.toolbarCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.subtle,
              ]}>
              {/* Row 1: Search Bar + View Mode */}
              <View style={styles.searchRow}>
                <View style={styles.searchFlex}>
                  <SearchBar
                    value={filters.searchQuery}
                    onChangeText={(text) => setFilters((prev) => ({ ...prev, searchQuery: text }))}
                    onClear={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                    showFilterButton={false}
                    placeholder="Search by keywords, location, or item name..."
                  />
                </View>

                {/* Grid / List View Toggle on wide screens */}
                {isDesktop && (
                  <View style={[styles.viewToggleGroup, { borderColor: theme.border }]}>
                    <Pressable
                      onPress={() => setViewMode('grid')}
                      style={[
                        styles.viewToggleBtn,
                        { backgroundColor: viewMode === 'grid' ? theme.primary : 'transparent' },
                      ]}>
                      <Ionicons
                        name="grid-outline"
                        size={16}
                        color={viewMode === 'grid' ? '#FFFFFF' : theme.textSecondary}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => setViewMode('list')}
                      style={[
                        styles.viewToggleBtn,
                        { backgroundColor: viewMode === 'list' ? theme.primary : 'transparent' },
                      ]}>
                      <Ionicons
                        name="list-outline"
                        size={16}
                        color={viewMode === 'list' ? '#FFFFFF' : theme.textSecondary}
                      />
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Row 2: Status Filters */}
              <View style={styles.statusToolbarRow}>
                <ThemedText style={[styles.filterRowTitle, { color: theme.textSecondary }]}>
                  STATUS:
                </ThemedText>
                <View style={styles.statusChipsWrap}>
                  <FilterChip
                    label="All Notices"
                    selected={filters.type === 'all' && filters.status === 'active'}
                    onPress={() => setFilters((prev) => ({ ...prev, type: 'all', status: 'active' }))}
                  />
                  <FilterChip
                    label="Missing / Lost"
                    icon="alert-circle-outline"
                    selected={filters.type === 'lost' && filters.status === 'active'}
                    count={lostCount}
                    tint="lost"
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        type: prev.type === 'lost' && prev.status === 'active' ? 'all' : 'lost',
                        status: 'active',
                      }))
                    }
                  />
                  <FilterChip
                    label="Turned In / Found"
                    icon="checkmark-circle-outline"
                    selected={filters.type === 'found' && filters.status === 'active'}
                    count={foundCount}
                    tint="found"
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        type: prev.type === 'found' && prev.status === 'active' ? 'all' : 'found',
                        status: 'active',
                      }))
                    }
                  />
                  <FilterChip
                    label="Returned to Owner"
                    icon="archive-outline"
                    selected={filters.status === 'resolved'}
                    count={resolvedCount}
                    onPress={() =>
                      setFilters((prev) => ({
                        ...prev,
                        status: prev.status === 'resolved' ? 'active' : 'resolved',
                      }))
                    }
                  />
                </View>
              </View>

              {/* Row 3: Category Filter Horizontal Scroll */}
              <View style={styles.categoryToolbarRow}>
                <ThemedText style={[styles.filterRowTitle, { color: theme.textSecondary, paddingLeft: 4 }]}>
                  CATEGORY:
                </ThemedText>
                <CategoryPicker
                  horizontal
                  includeAll
                  selectedCategory={filters.category}
                  onSelectCategory={(category) => setFilters((prev) => ({ ...prev, category }))}
                />
              </View>
            </View>

            {/* 4. Meta Bar with Results Count & Sort Selection */}
            <View style={styles.metaRow}>
              <View style={styles.resultsBadge}>
                <ThemedText style={[styles.resultsCount, { color: theme.text }]}>
                  {filteredItems.length} {filteredItems.length === 1 ? 'Notice' : 'Notices'} Listed
                </ThemedText>
                {filters.category !== 'all' && (
                  <ThemedText style={[styles.filterTag, { color: theme.primary }]}>
                    • {filters.category}
                  </ThemedText>
                )}
              </View>

              <View style={styles.metaActionsRight}>
                {/* Hide Restored Checkbox */}
                <Pressable
                  onPress={() => setHideResolved((prev) => !prev)}
                  style={styles.hideResolvedBtn}>
                  <Ionicons
                    name={hideResolved ? 'checkbox' : 'square-outline'}
                    size={15}
                    color={hideResolved ? theme.primary : theme.textSecondary}
                  />
                  <ThemedText style={[styles.hideResolvedText, { color: theme.textSecondary }]}>
                    Hide Restored
                  </ThemedText>
                </Pressable>

                {/* Sort Dropdown Button */}
                <Pressable
                  onPress={() => setSortModalVisible(true)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort notices, currently ${sortLabels[filters.sortBy]}`}
                  style={[styles.sortButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <ThemedText style={[styles.sortText, { color: theme.primary }]}>
                    Sort: {sortLabels[filters.sortBy]}
                  </ThemedText>
                  <Ionicons name="chevron-down" size={13} color={theme.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <LoadingState message="Loading campus bulletin..." />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No Notices Found"
              description={
                hasActiveFilters
                  ? 'No notices match your current filters or search keywords.'
                  : 'There are no active lost or found posts on campus right now.'
              }
              actionTitle={hasActiveFilters ? 'Clear Filters' : 'Report an Item'}
              actionIcon={hasActiveFilters ? 'refresh-outline' : 'add'}
              onAction={hasActiveFilters ? resetFilters : () => router.push('/(tabs)/add')}
            />
          )
        }
        ListFooterComponent={
          filteredItems.length > 0 ? (
            <View style={[styles.footerPagination, { borderTopColor: theme.border }]}>
              <ThemedText style={[styles.footerStatsText, { color: theme.textMuted }]}>
                Showing {filteredItems.length} of {items.length} total campus notices
              </ThemedText>
            </View>
          ) : null
        }
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}>
      {isDesktop ? (
        <View style={styles.desktopLayoutRow}>
          {/* Desktop Left Sidebar */}
          <DesktopSidebar activeRoute="bulletin" />

          {/* Desktop Main Content Column */}
          <View style={styles.desktopMainCol}>
            <DesktopHeader />
            <View style={styles.desktopContentArea}>{renderContent()}</View>
          </View>
        </View>
      ) : (
        renderContent()
      )}

      {/* Sort & Filter Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)} />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.card,
            ]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Sort & Filter</ThemedText>
              <Pressable
                onPress={() => setSortModalVisible(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close sort options">
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ThemedText style={[styles.modalSectionLabel, { color: theme.textSecondary }]}>
              SORT ORDER
            </ThemedText>
            {(['newest', 'oldest', 'updated'] as ItemSortOption[]).map((option) => {
              const isSelected = filters.sortBy === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    setFilters((prev) => ({ ...prev, sortBy: option }));
                    setSortModalVisible(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  style={[
                    styles.sortOption,
                    {
                      backgroundColor: isSelected ? theme.primaryLight : 'transparent',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.sortOptionLabel,
                      {
                        color: isSelected ? theme.primary : theme.text,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {sortLabels[option]}
                  </ThemedText>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={theme.primary} />
                  )}
                </Pressable>
              );
            })}

            <ThemedText
              style={[
                styles.modalSectionLabel,
                { color: theme.textSecondary, marginTop: Spacing.four },
              ]}>
              STATUS FILTER
            </ThemedText>
            <View style={styles.statusOptionRow}>
              <Pressable
                onPress={() => {
                  setFilters((prev) => ({ ...prev, status: 'active' }));
                  setSortModalVisible(false);
                }}
                style={[
                  styles.statusOptionBtn,
                  {
                    backgroundColor:
                      filters.status === 'active' ? theme.primary : theme.elevatedSurface,
                    borderColor:
                      filters.status === 'active' ? theme.primary : theme.border,
                  },
                ]}>
                <ThemedText
                  style={{
                    color: filters.status === 'active' ? '#FFFFFF' : theme.text,
                    fontWeight: '600',
                    fontSize: Typography.sm,
                  }}>
                  Active Notices
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={() => {
                  setFilters((prev) => ({ ...prev, status: 'resolved' }));
                  setSortModalVisible(false);
                }}
                style={[
                  styles.statusOptionBtn,
                  {
                    backgroundColor:
                      filters.status === 'resolved' ? theme.resolved : theme.elevatedSurface,
                    borderColor:
                      filters.status === 'resolved' ? theme.resolved : theme.border,
                  },
                ]}>
                <ThemedText
                  style={{
                    color: filters.status === 'resolved' ? '#FFFFFF' : theme.text,
                    fontWeight: '600',
                    fontSize: Typography.sm,
                  }}>
                  Resolved Archive
                </ThemedText>
              </Pressable>
            </View>

            {hasActiveFilters && (
              <PrimaryButton
                title="Reset All Filters"
                variant="secondary"
                size="sm"
                onPress={() => {
                  resetFilters();
                  setSortModalVisible(false);
                }}
                style={{ marginTop: Spacing.four }}
              />
            )}
          </View>
        </View>
      </Modal>
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
  columnWrapper: {
    justifyContent: 'space-between',
  },
  feedHeaderContent: {
    paddingTop: Spacing.two,
  },
  mastheadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  mastheadLeft: {
    flex: 1,
    minWidth: 260,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: Fonts.mono,
  },
  bulletinTitle: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  bulletinSubtitle: {
    fontSize: Typography.sm,
    marginTop: 2,
    fontStyle: 'italic',
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 5,
  },
  statPillCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  statPillLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  safetyNoticePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: ScreenPadding,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.three,
    marginBottom: Spacing.three,
    flexWrap: 'wrap',
  },
  safetyNoticeIconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyNoticeContent: {
    flex: 1,
    minWidth: 200,
  },
  safetyNoticeTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  safetyNoticeHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  safetyNoticeDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  safetyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
  },
  safetyActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toolbarCard: {
    marginHorizontal: ScreenPadding,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.three,
    gap: Spacing.two + 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  searchFlex: {
    flex: 1,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusToolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterRowTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginRight: 4,
  },
  statusChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  categoryToolbarRow: {
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ScreenPadding,
    marginBottom: Spacing.three,
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  resultsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultsCount: {
    fontSize: Typography.xs,
    fontWeight: '700',
  },
  filterTag: {
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  metaActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hideResolvedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hideResolvedText: {
    fontSize: Typography.xs,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
  },
  sortText: {
    fontSize: Typography.xs,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: 120,
  },
  footerPagination: {
    paddingVertical: Spacing.four,
    borderTopWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  footerStatsText: {
    fontSize: Typography.xs,
    fontFamily: Fonts.mono,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(24, 32, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontFamily: Fonts.serif,
    fontSize: Typography.lg,
    fontWeight: '700',
  },
  modalSectionLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    marginBottom: 4,
  },
  sortOptionLabel: {
    fontSize: Typography.base,
  },
  statusOptionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statusOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
