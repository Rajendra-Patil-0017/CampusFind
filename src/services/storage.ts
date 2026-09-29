import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';
import { LostFoundItem } from '@/types/item';
import { ItemsService } from './items';

export const SAMPLE_ITEMS: LostFoundItem[] = [
  {
    id: 'sample-item-1',
    type: 'lost',
    status: 'active',
    name: 'Matte Black Leather Wallet',
    description: 'Contains student ID (Raj M.), library card, and transit pass. Lost near Central Library 2nd floor study area.',
    category: 'Wallet',
    location: 'Central Library, 2nd Floor',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    contactName: 'Raj Mishra',
    contactInfo: 'raj.mishra@campus.edu',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ownerId: APP_CONFIG.sampleOwnerId,
    isSample: true,
  },
  {
    id: 'sample-item-2',
    type: 'found',
    status: 'active',
    name: 'Silver MacBook Pro 14" Charger',
    description: 'Found plugged into wall socket at Cafeteria seating booth #4. MagSafe 3 cable attached.',
    category: 'Electronics',
    location: 'Campus Dining Commons (Cafeteria)',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    contactName: 'Elena Rostova',
    contactInfo: '+1 (555) 234-8901',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    ownerId: APP_CONFIG.sampleOwnerId,
    isSample: true,
  },
  {
    id: 'sample-item-3',
    type: 'found',
    status: 'active',
    name: 'University Student ID Card',
    description: 'Belongs to Alex Johnson (Computer Science dept). Handed over to Student Services front desk.',
    category: 'ID Card',
    location: 'Engineering Building A, Room 102',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    contactName: 'Student Services Desk',
    contactInfo: 'services@campus.edu',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ownerId: APP_CONFIG.sampleOwnerId,
    isSample: true,
  },
  {
    id: 'sample-item-4',
    type: 'lost',
    status: 'active',
    name: 'Sony WH-1000XM4 Wireless Headphones',
    description: 'Black over-ear headphones inside a dark grey travel case. Left in lecture hall 305 after physics.',
    category: 'Electronics',
    location: 'Physics Hall 305',
    date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    contactName: 'Sarah Chen',
    contactInfo: 'schen99@campus.edu',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    ownerId: APP_CONFIG.sampleOwnerId,
    isSample: true,
  },
  {
    id: 'sample-item-5',
    type: 'found',
    status: 'resolved',
    name: 'Blue HydroFlask Water Bottle (32oz)',
    description: 'Found with stickers (NASA, GitHub, React). Returned to rightful owner.',
    category: 'Accessories',
    location: 'Gymnasium & Sports Complex',
    date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    contactName: 'Gym Staff (Kevin)',
    contactInfo: 'gymdesk@campus.edu',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    ownerId: APP_CONFIG.sampleOwnerId,
    isSample: true,
  },
];

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
