import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';
import { LostFoundItem } from '@/types/item';

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
  async getItems(): Promise<LostFoundItem[]> {
    try {
      const initialized = await AsyncStorage.getItem(APP_CONFIG.storageKeyInitialized);
      if (!initialized) {
        await AsyncStorage.setItem(
          APP_CONFIG.storageKeyItems,
          JSON.stringify(SAMPLE_ITEMS)
        );
        await AsyncStorage.setItem(APP_CONFIG.storageKeyInitialized, 'true');
        return SAMPLE_ITEMS;
      }

      const json = await AsyncStorage.getItem(APP_CONFIG.storageKeyItems);
      if (!json) {
        return [];
      }

      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch (error) {
      console.warn('StorageService.getItems error:', error);
      return [];
    }
  },

  async getItemById(id: string): Promise<LostFoundItem | null> {
    try {
      const items = await this.getItems();
      return items.find((item) => item.id === id) || null;
    } catch (error) {
      console.warn(`StorageService.getItemById(${id}) error:`, error);
      return null;
    }
  },

  async saveItems(items: LostFoundItem[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(items));
      return true;
    } catch (error) {
      console.warn('StorageService.saveItems error:', error);
      return false;
    }
  },

  async createItem(
    itemData: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'status'> &
      Partial<Pick<LostFoundItem, 'ownerId' | 'status'>>
  ): Promise<LostFoundItem> {
    const now = new Date().toISOString();
    const newItem: LostFoundItem = {
      ...itemData,
      id: generateItemId(),
      status: itemData.status || 'active',
      ownerId: itemData.ownerId || APP_CONFIG.localUserId,
      createdAt: now,
      updatedAt: now,
      isSample: false,
    };

    const items = await this.getItems();
    const updatedItems = [newItem, ...items];
    await this.saveItems(updatedItems);
    return newItem;
  },

  async updateItem(id: string, updates: Partial<LostFoundItem>): Promise<LostFoundItem | null> {
    try {
      const items = await this.getItems();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }

      const updatedItem: LostFoundItem = {
        ...items[index],
        ...updates,
        id: items[index].id, // preserve id
        createdAt: items[index].createdAt, // preserve createdAt
        updatedAt: new Date().toISOString(),
      };

      items[index] = updatedItem;
      await this.saveItems(items);
      return updatedItem;
    } catch (error) {
      console.warn(`StorageService.updateItem(${id}) error:`, error);
      return null;
    }
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      const items = await this.getItems();
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) {
        return false;
      }
      return await this.saveItems(filtered);
    } catch (error) {
      console.warn(`StorageService.deleteItem(${id}) error:`, error);
      return false;
    }
  },

  async exportData(): Promise<string> {
    const items = await this.getItems();
    return JSON.stringify(
      {
        appName: APP_CONFIG.name,
        version: APP_CONFIG.version,
        exportDate: new Date().toISOString(),
        itemsCount: items.length,
        items,
      },
      null,
      2
    );
  },

  async importData(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      const itemsToImport = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(itemsToImport)) {
        return { success: false, count: 0, error: 'Invalid backup file format' };
      }

      // Validate basic structure of imported items
      const validItems: LostFoundItem[] = [];
      for (const item of itemsToImport) {
        if (
          item &&
          typeof item.id === 'string' &&
          (item.type === 'lost' || item.type === 'found') &&
          typeof item.name === 'string' &&
          typeof item.description === 'string' &&
          typeof item.category === 'string' &&
          typeof item.location === 'string'
        ) {
          validItems.push({
            id: item.id || generateItemId(),
            type: item.type,
            status: item.status === 'resolved' ? 'resolved' : 'active',
            name: item.name,
            description: item.description,
            category: item.category,
            location: item.location,
            date: item.date || new Date().toISOString(),
            contactName: item.contactName || 'Anonymous',
            contactInfo: item.contactInfo || 'Not specified',
            imageUri: item.imageUri,
            createdAt: item.createdAt || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
            ownerId: item.ownerId || APP_CONFIG.localUserId,
            isSample: !!item.isSample,
          });
        }
      }

      if (validItems.length === 0) {
        return { success: false, count: 0, error: 'No valid items found in backup file' };
      }

      // Merge avoiding duplicates by id
      const currentItems = await this.getItems();
      const currentMap = new Map(currentItems.map((item) => [item.id, item]));
      for (const validItem of validItems) {
        currentMap.set(validItem.id, validItem);
      }

      const mergedList = Array.from(currentMap.values());
      await this.saveItems(mergedList);
      return { success: true, count: validItems.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Failed to parse JSON backup' };
    }
  },

  async resetToSamples(): Promise<void> {
    await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(SAMPLE_ITEMS));
    await AsyncStorage.setItem(APP_CONFIG.storageKeyInitialized, 'true');
  },
};
