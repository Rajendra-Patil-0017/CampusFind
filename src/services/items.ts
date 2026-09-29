import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '@/constants/config';
import { LostFoundItem } from '@/types/item';
import { isSupabaseConfigured, supabase } from './supabase';
import { PhotoStorageService } from './storage-supabase';
import { SAMPLE_ITEMS } from './storage';

// Database row interface matching PostgreSQL schema
export interface SupabaseItemRow {
  id: string;
  owner_id: string;
  type: 'lost' | 'found';
  status: 'active' | 'resolved';
  name: string;
  description: string;
  category: string;
  location: string;
  date: string;
  contact_name: string;
  contact_info: string;
  image_path: string | null;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
}

function mapRowToItem(row: SupabaseItemRow): LostFoundItem {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    name: row.name,
    description: row.description,
    category: row.category,
    location: row.location,
    date: row.date,
    contactName: row.contact_name,
    contactInfo: row.contact_info,
    imageUri: row.image_path || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerId: row.owner_id,
    isSample: row.is_sample,
  };
}

export const ItemsService = {
  /**
   * Fetches all items from Supabase with offline caching in AsyncStorage
   */
  async getItems(): Promise<LostFoundItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map(mapRowToItem);
          // Cache items locally for offline resilience
          await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase getItems network error, reading local cache:', e);
      }
    }

    // Fallback: Read from local AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(APP_CONFIG.storageKeyItems);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('AsyncStorage getItems error:', e);
    }

    return SAMPLE_ITEMS;
  },

  /**
   * Fetches a single item by ID
   */
  async getItemById(id: string): Promise<LostFoundItem | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return mapRowToItem(data);
        }
      } catch (e) {
        console.warn('Supabase getItemById error, falling back to cache:', e);
      }
    }

    const all = await this.getItems();
    return all.find((item) => item.id === id) || null;
  },

  /**
   * Creates a new report in Supabase and handles photo upload
   */
  async createItem(
    itemData: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<LostFoundItem> {
    let uploadedImageUrl = itemData.imageUri;

    // Upload photo to Supabase Storage if an image URI is provided
    if (itemData.imageUri && isSupabaseConfigured && !itemData.imageUri.startsWith('http')) {
      const uploaded = await PhotoStorageService.uploadItemPhoto(itemData.imageUri, userId);
      if (uploaded) {
        uploadedImageUrl = uploaded;
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('items')
          .insert({
            owner_id: userId,
            type: itemData.type,
            status: itemData.status || 'active',
            name: itemData.name,
            description: itemData.description,
            category: itemData.category,
            location: itemData.location,
            date: itemData.date,
            contact_name: itemData.contactName,
            contact_info: itemData.contactInfo,
            image_path: uploadedImageUrl || null,
            is_sample: false,
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        const newItem = mapRowToItem(data);
        // Refresh local cache
        const current = await this.getItems();
        await AsyncStorage.setItem(
          APP_CONFIG.storageKeyItems,
          JSON.stringify([newItem, ...current.filter((i) => i.id !== newItem.id)])
        );
        return newItem;
      } catch (e: any) {
        console.warn('Failed to insert item into Supabase:', e);
        throw e;
      }
    }

    // Local-only creation fallback
    const newItem: LostFoundItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      imageUri: uploadedImageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: userId || APP_CONFIG.localUserId,
      isSample: false,
    };

    const current = await this.getItems();
    const updated = [newItem, ...current];
    await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(updated));
    return newItem;
  },

  /**
   * Updates an existing report in Supabase
   */
  async updateItem(
    id: string,
    updates: Partial<LostFoundItem>,
    userId?: string
  ): Promise<LostFoundItem | null> {
    let finalImageUrl = updates.imageUri;

    // Handle new photo upload if changed to a local URI
    if (updates.imageUri && userId && !updates.imageUri.startsWith('http') && isSupabaseConfigured) {
      const uploaded = await PhotoStorageService.uploadItemPhoto(updates.imageUri, userId);
      if (uploaded) {
        finalImageUrl = uploaded;
      }
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {};
        if (updates.type) payload.type = updates.type;
        if (updates.status) payload.status = updates.status;
        if (updates.name) payload.name = updates.name;
        if (updates.description) payload.description = updates.description;
        if (updates.category) payload.category = updates.category;
        if (updates.location) payload.location = updates.location;
        if (updates.date) payload.date = updates.date;
        if (updates.contactName) payload.contact_name = updates.contactName;
        if (updates.contactInfo) payload.contact_info = updates.contactInfo;
        if (updates.imageUri !== undefined) payload.image_path = finalImageUrl || null;

        const { data, error } = await supabase
          .from('items')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        const updatedItem = mapRowToItem(data);
        // Update local cache
        const all = await this.getItems();
        const updatedList = all.map((i) => (i.id === id ? updatedItem : i));
        await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(updatedList));
        return updatedItem;
      } catch (e) {
        console.warn('Supabase updateItem error:', e);
        throw e;
      }
    }

    // Local-only update fallback
    const all = await this.getItems();
    const existingIndex = all.findIndex((i) => i.id === id);
    if (existingIndex === -1) return null;

    const updatedItem: LostFoundItem = {
      ...all[existingIndex],
      ...updates,
      imageUri: finalImageUrl,
      updatedAt: new Date().toISOString(),
    };

    all[existingIndex] = updatedItem;
    await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(all));
    return updatedItem;
  },

  /**
   * Deletes a report from Supabase (and removes associated photo if present)
   */
  async deleteItem(id: string): Promise<boolean> {
    const existing = await this.getItemById(id);

    if (isSupabaseConfigured) {
      try {
        if (existing?.imageUri) {
          await PhotoStorageService.deleteItemPhoto(existing.imageUri);
        }

        const { error } = await supabase.from('items').delete().eq('id', id);
        if (error) {
          throw new Error(error.message);
        }
      } catch (e) {
        console.warn('Supabase deleteItem error:', e);
        throw e;
      }
    }

    // Update local cache
    const current = await this.getItems();
    const filtered = current.filter((i) => i.id !== id);
    await AsyncStorage.setItem(APP_CONFIG.storageKeyItems, JSON.stringify(filtered));
    return true;
  },

  /**
   * Phase 7: One-time migration of local reports created by current user
   */
  async migrateLocalReportsToSupabase(userId: string): Promise<{
    migratedCount: number;
    failedCount: number;
    skippedCount: number;
  }> {
    if (!isSupabaseConfigured || !userId) {
      return { migratedCount: 0, failedCount: 0, skippedCount: 0 };
    }

    const localItems = await this.getItems();
    const userLocalItems = localItems.filter(
      (item) => !item.isSample && (item.ownerId === APP_CONFIG.localUserId || item.ownerId === userId)
    );

    if (userLocalItems.length === 0) {
      return { migratedCount: 0, failedCount: 0, skippedCount: 0 };
    }

    let migratedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const item of userLocalItems) {
      try {
        // Check if item with exact name, date, and description already exists in Supabase
        const { data: existing } = await supabase
          .from('items')
          .select('id')
          .eq('owner_id', userId)
          .eq('name', item.name)
          .eq('description', item.description)
          .maybeSingle();

        if (existing) {
          skippedCount++;
          continue;
        }

        let imageUrl = item.imageUri;
        if (item.imageUri && !item.imageUri.startsWith('http')) {
          const uploaded = await PhotoStorageService.uploadItemPhoto(item.imageUri, userId);
          if (uploaded) imageUrl = uploaded;
        }

        const { error } = await supabase.from('items').insert({
          owner_id: userId,
          type: item.type,
          status: item.status,
          name: item.name,
          description: item.description,
          category: item.category,
          location: item.location,
          date: item.date,
          contact_name: item.contactName,
          contact_info: item.contactInfo,
          image_path: imageUrl || null,
          is_sample: false,
        });

        if (error) {
          failedCount++;
        } else {
          migratedCount++;
        }
      } catch (e) {
        console.warn('Migration error for item:', item.name, e);
        failedCount++;
      }
    }

    // Refresh items
    await this.getItems();

    return { migratedCount, failedCount, skippedCount };
  },
};

// Aliased export to preserve backwards compatibility across existing screen imports
export const StorageService = ItemsService;
