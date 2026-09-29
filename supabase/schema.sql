-- ==============================================================================
-- CampusFind: Complete Unified Production Database Schema & Security Setup
-- File: supabase/schema.sql
-- Description: Run this entire script in your Supabase SQL Editor.
--              It sets up all tables, triggers, indexes, RLS policies, views,
--              and photo storage bucket policies in a single execution.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Extends Supabase Auth users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0 AND char_length(full_name) <= 100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies on profiles
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Strict Profiles Policies (Owner-Only)
CREATE POLICY "Users can read their own profile" 
    ON public.profiles 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Automatic profile generation trigger on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(
            NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
            split_part(NEW.email, '@', 1)
        ),
        NULLIF(trim(NEW.raw_user_meta_data->>'avatar_url'), '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Safe public profiles view (exposing only safe name and avatar for display)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    avatar_url,
    created_at
FROM public.profiles;

-- ------------------------------------------------------------------------------
-- 3. Canonical 'items' Table (Lost & Found Notices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved')) DEFAULT 'active',
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 120),
    description TEXT NOT NULL CHECK (char_length(trim(description)) > 0 AND char_length(description) <= 2000),
    category TEXT NOT NULL CHECK (char_length(trim(category)) > 0 AND char_length(category) <= 50),
    location TEXT NOT NULL CHECK (char_length(trim(location)) > 0 AND char_length(location) <= 120),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    contact_name TEXT NOT NULL CHECK (char_length(trim(contact_name)) > 0 AND char_length(contact_name) <= 100),
    contact_info TEXT NOT NULL CHECK (char_length(trim(contact_info)) > 0 AND char_length(contact_info) <= 120),
    image_path TEXT,
    is_sample BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance and search indexes
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items (owner_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items (type);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items (status);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_feed ON public.items (status, type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_search ON public.items 
    USING gin (to_tsvector('english', name || ' ' || description || ' ' || location));

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trigger_items_updated_at ON public.items;
CREATE TRIGGER trigger_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 4. Row Level Security on 'items' Table
-- ------------------------------------------------------------------------------
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies on items
DROP POLICY IF EXISTS "Public items can be viewed by all users" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can create items with their own owner_id" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

-- 4.1 Public Bulletin Read: Anyone (including visitors) can view active and resolved posts
CREATE POLICY "Public items can be viewed by all users" 
    ON public.items 
    FOR SELECT 
    USING (true);

-- 4.2 Authenticated Insert: Authenticated users can insert posts only with their own owner_id
CREATE POLICY "Authenticated users can create items with their own owner_id" 
    ON public.items 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- 4.3 Owner Update: Users can only update their own posts and cannot change owner_id
CREATE POLICY "Users can update their own items" 
    ON public.items 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 4.4 Owner Delete: Users can only delete their own posts
CREATE POLICY "Users can delete their own items" 
    ON public.items 
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = owner_id);

-- Compatibility view for queries referencing 'lost_found_items'
CREATE OR REPLACE VIEW public.lost_found_items AS
SELECT * FROM public.items;

-- ------------------------------------------------------------------------------
-- 5. Supabase Storage Bucket & Policies for Item Photos
-- ------------------------------------------------------------------------------
-- Create 'item-photos' public storage bucket if not already present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'item-photos',
    'item-photos',
    true,
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg'];

-- Drop existing storage policies
DROP POLICY IF EXISTS "Item photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload item photos to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own item photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own item photos" ON storage.objects;

-- 5.1 Public read for item photos
CREATE POLICY "Item photos are publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'item-photos');

-- 5.2 Authenticated upload strictly to the user's dedicated folder
CREATE POLICY "Authenticated users can upload item photos to their own folder" 
    ON storage.objects 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        bucket_id = 'item-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 5.3 Owner update of their own storage photos
CREATE POLICY "Users can update their own item photos" 
    ON storage.objects 
    FOR UPDATE 
    TO authenticated
    USING (
        bucket_id = 'item-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 5.4 Owner deletion of their own storage photos
CREATE POLICY "Users can delete their own item photos" 
    ON storage.objects 
    FOR DELETE 
    TO authenticated
    USING (
        bucket_id = 'item-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
