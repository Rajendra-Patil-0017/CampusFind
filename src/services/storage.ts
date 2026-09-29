import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';
import { LostFoundItem } from '@/types/item';
import { ItemsService } from './items';
import { SAMPLE_ITEMS } from './mock-data';

export { SAMPLE_ITEMS };

export function generateItemId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `item-${timestamp}-${randomStr}`;
}

export const StorageService = {
  getItems: ItemsService.getItems.bind(ItemsService),
  getItemById: ItemsService.getItemById.bind(ItemsService),
  createItem: (itemData: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>, userId?: string) =>
    ItemsService.createItem(itemData, userId || APP_CONFIG.localUserId),
  updateItem: (id: string, updates: Partial<LostFoundItem>, userId?: string) =>
    ItemsService.updateItem(id, updates, userId),
  deleteItem: ItemsService.deleteItem.bind(ItemsService),
  migrateLocalReportsToSupabase: ItemsService.migrateLocalReportsToSupabase.bind(ItemsService),

  async exportData(): Promise<string> {
    const items = await this.getItems();
    const exportPayload = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      appName: APP_CONFIG.name,
      totalCount: items.length,
      items,
    };
    return JSON.stringify(exportPayload, null, 2);
  },

  async resetToSamples(): Promise<LostFoundItem[]> {
    await AsyncStorage.setItem(
      APP_CONFIG.storageKeyItems,
      JSON.stringify(SAMPLE_ITEMS)
    );
    await AsyncStorage.setItem(APP_CONFIG.storageKeyInitialized, 'true');
    return SAMPLE_ITEMS;
  },
};
