import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { isSupabaseConfigured, supabase } from './supabase';

const BUCKET_NAME = 'item-photos';

export const PhotoStorageService = {
  /**
   * Uploads an image file to Supabase Storage bucket 'item-photos'
   * @param localUri Local image URI from expo-image-picker
   * @param userId The authenticated user ID (used as folder prefix for RLS)
   * @returns Public URL string or undefined if failed
   */
  async uploadItemPhoto(localUri: string, userId: string): Promise<string | undefined> {
    if (!isSupabaseConfigured || !localUri || !userId) {
      return localUri; // Fallback to local URI if Supabase not configured
    }

    try {
      const fileExt = localUri.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
      const filePath = `${userId}/${fileName}`;
      const contentType = `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`;

      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, blob, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.warn('Web storage upload error:', uploadError);
          return undefined;
        }
      } else {
        // Native upload using base64 arraybuffer conversion
        const base64 = await FileSystem.readAsStringAsync(localUri, {
          encoding: 'base64' as any,
        });

        // Convert base64 to Uint8Array for binary upload
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, byteArray, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.warn('Native storage upload error:', uploadError);
          return undefined;
        }
      }

      // Get public URL
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.warn('Failed to upload photo to Supabase storage:', err);
      return undefined;
    }
  },

  /**
   * Deletes a photo from Supabase Storage by public URL or storage path
   */
  async deleteItemPhoto(photoUrl: string): Promise<void> {
    if (!isSupabaseConfigured || !photoUrl || !photoUrl.includes(BUCKET_NAME)) {
      return;
    }

    try {
      // Extract the path after /item-photos/
      const parts = photoUrl.split(`${BUCKET_NAME}/`);
      if (parts.length > 1) {
        const filePath = decodeURIComponent(parts[1].split('?')[0]);
        await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      }
    } catch (err) {
      console.warn('Failed to delete photo from storage:', err);
    }
  },
};
