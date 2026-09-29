/**
 * CampusFind Database TypeScript Definitions
 * Schema representation for Supabase PostgreSQL tables:
 * - public.profiles
 * - public.lost_found_items
 * - public.item_contact_details
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
      lost_found_items: {
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
          image_path?: string | null;
          is_sample?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lost_found_items_owner_id_fkey';
            columns: ['owner_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      item_contact_details: {
        Row: {
          item_id: string;
          contact_name: string;
          contact_info: string;
          updated_at: string;
        };
        Insert: {
          item_id: string;
          contact_name: string;
          contact_info: string;
          updated_at?: string;
        };
        Update: {
          item_id?: string;
          contact_name?: string;
          contact_info?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'item_contact_details_item_id_fkey';
            columns: ['item_id'];
            referencedRelation: 'lost_found_items';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
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

export type LostFoundItemRow = Database['public']['Tables']['lost_found_items']['Row'];
export type LostFoundItemInsert = Database['public']['Tables']['lost_found_items']['Insert'];
export type LostFoundItemUpdate = Database['public']['Tables']['lost_found_items']['Update'];

export type ItemContactDetailsRow = Database['public']['Tables']['item_contact_details']['Row'];
export type ItemContactDetailsInsert = Database['public']['Tables']['item_contact_details']['Insert'];
export type ItemContactDetailsUpdate = Database['public']['Tables']['item_contact_details']['Update'];
