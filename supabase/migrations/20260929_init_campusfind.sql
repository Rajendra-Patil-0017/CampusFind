-- ==============================================================================
-- CampusFind Production Database Schema & Security Migration
-- Version: 20260929_init_campusfind
-- ==============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Extends Supabase Auth users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by everyone" 
    ON public.profiles 
    FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. Items Table (Lost & Found Notices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved')) DEFAULT 'active',
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
    description TEXT NOT NULL CHECK (char_length(trim(description)) > 0),
    category TEXT NOT NULL CHECK (char_length(trim(category)) > 0),
    location TEXT NOT NULL CHECK (char_length(trim(location)) > 0),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    contact_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    image_path TEXT,
    is_sample BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance and search indexes
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items (status);
CREATE INDEX IF NOT EXISTS idx_items_type ON public.items (type);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items (category);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON public.items (owner_id);

-- Full-text search index on item name and description
CREATE INDEX IF NOT EXISTS idx_items_fts ON public.items 
    USING gin (to_tsvector('english', name || ' ' || description || ' ' || location));

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_items_updated_at ON public.items;
CREATE TRIGGER set_items_updated_at
    BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. Row Level Security Policies on Items
-- ------------------------------------------------------------------------------
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 4.1 Anyone (including guests) can read active and resolved notices for the campus bulletin
CREATE POLICY "Public items can be viewed by all users" 
    ON public.items 
    FOR SELECT 
    USING (true);

-- 4.2 Authenticated users can insert items only where owner_id matches their own auth.uid()
CREATE POLICY "Authenticated users can create items with their own owner_id" 
    ON public.items 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

-- 4.3 Users can update only the reports they own, and cannot change ownership
CREATE POLICY "Users can update their own items" 
    ON public.items 
    FOR UPDATE 
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 4.4 Users can delete only reports they own
CREATE POLICY "Users can delete their own items" 
    ON public.items 
    FOR DELETE 
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- 5. Supabase Storage Bucket & Policies for Item Photos
-- ------------------------------------------------------------------------------
-- Insert bucket record if it doesn't exist
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

-- Storage RLS Policies
CREATE POLICY "Item photos are publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'item-photos');

CREATE POLICY "Authenticated users can upload item photos to their own folder" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (
        bucket_id = 'item-photos' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own item photos" 
    ON storage.objects 
    FOR UPDATE 
    USING (
        bucket_id = 'item-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own item photos" 
    ON storage.objects 
    FOR DELETE 
    USING (
        bucket_id = 'item-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
