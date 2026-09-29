import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-publishable-key')
);

// Fallback placeholder URL to prevent client crash during local demo without env
const validSupabaseUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validSupabaseKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

const isServer = typeof window === 'undefined';

// Safe storage adapter preventing SSR crashes when window is not defined
const SafeSupabaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (isServer) return null;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (isServer) return;
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore storage errors on SSR
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (isServer) return;
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore storage errors on SSR
    }
  },
};

export const supabase = createClient(validSupabaseUrl, validSupabaseKey, {
  auth: {
    storage: SafeSupabaseStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: Platform.OS === 'web' && !isServer,
  },
});
