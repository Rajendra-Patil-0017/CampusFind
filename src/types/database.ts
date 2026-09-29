/**
 * CampusFind Database TypeScript Definitions
 * Canonical schema representation for Supabase PostgreSQL tables:
 * - public.items (Primary Canonical Table for Lost & Found Reports)
 * - public.profiles (User Profiles matching Supabase Auth users)
 * - public.lost_found_items (Compatibility View)
 * - public.public_profiles (Safe Public View)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
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
        };
        Insert: {
          id?: string;
          owner_id: string;
          type: 'lost' | 'found';
          status?: 'active' | 'resolved';
          name: string;
          description: string;
          category: string;
          location: string;
          date?: string;
          contact_name: string;
          contact_info: string;
          image_path?: string | null;
          is_sample?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          type?: 'lost' | 'found';
          status?: 'active' | 'resolved';
          name?: string;
          description?: string;
          category?: string;
          location?: string;
          date?: string;
          contact_name?: string;
          contact_info?: string;
          image_path?: string | null;
          is_sample?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'items_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      lost_found_items: {
        Row: Database['public']['Tables']['items']['Row'];
      };
      public_profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type ItemRow = Database['public']['Tables']['items']['Row'];
export type ItemInsert = Database['public']['Tables']['items']['Insert'];
export type ItemUpdate = Database['public']['Tables']['items']['Update'];
