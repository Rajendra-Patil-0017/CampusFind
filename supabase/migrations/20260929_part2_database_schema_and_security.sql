-- ==============================================================================
-- CampusFind Part 2: Database Schema & Security Migration
-- Migration: 20260929_part2_database_schema_and_security
-- Description: Establishes profiles, lost_found_items, and private item_contact_details
--              tables with strict Row Level Security (RLS), constraints, indexes, and triggers.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. Profiles Table (Extends Supabase Auth users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0 AND char_length(full_name) <= 100),
    avatar_url TEXT CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Authenticated users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Profiles Policies
CREATE POLICY "Authenticated users can read profiles" 
    ON public.profiles 
    FOR SELECT 
    TO authenticated
    USING (true);

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

-- ------------------------------------------------------------------------------
-- 3. Lost & Found Items Table (Public Bulletin Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lost_found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved')) DEFAULT 'active',
    name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 120),
    description TEXT NOT NULL CHECK (char_length(trim(description)) > 0 AND char_length(description) <= 2000),
    category TEXT NOT NULL CHECK (char_length(trim(category)) > 0 AND char_length(category) <= 50),
    location TEXT NOT NULL CHECK (char_length(trim(location)) > 0 AND char_length(location) <= 120),
    date TIMESTAMPTZ NOT NULL DEFAULT now(),
    image_path TEXT CHECK (image_path IS NULL OR char_length(image_path) <= 1000),
    is_sample BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on lost_found_items
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Authenticated users can view bulletin items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Authenticated users can create items with their own owner_id" ON public.lost_found_items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.lost_found_items;

-- Lost & Found Items Policies
CREATE POLICY "Authenticated users can view bulletin items" 
    ON public.lost_found_items 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can create items with their own owner_id" 
    ON public.lost_found_items 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own items" 
    ON public.lost_found_items 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own items" 
    ON public.lost_found_items 
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- 4. Private Contact Details Table (Owner-Isolated Contact Information)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.item_contact_details (
    item_id UUID PRIMARY KEY REFERENCES public.lost_found_items(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL CHECK (char_length(trim(contact_name)) > 0 AND char_length(contact_name) <= 100),
    contact_info TEXT NOT NULL CHECK (char_length(trim(contact_info)) > 0 AND char_length(contact_info) <= 120),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on item_contact_details
ALTER TABLE public.item_contact_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Owners can view their item contact details" ON public.item_contact_details;
DROP POLICY IF EXISTS "Owners can insert their item contact details" ON public.item_contact_details;
DROP POLICY IF EXISTS "Owners can update their item contact details" ON public.item_contact_details;
DROP POLICY IF EXISTS "Owners can delete their item contact details" ON public.item_contact_details;

-- Item Contact Details Policies (Owner-Only)
CREATE POLICY "Owners can view their item contact details" 
    ON public.item_contact_details 
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lost_found_items 
            WHERE lost_found_items.id = item_contact_details.item_id 
              AND lost_found_items.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can insert their item contact details" 
    ON public.item_contact_details 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lost_found_items 
            WHERE lost_found_items.id = item_contact_details.item_id 
              AND lost_found_items.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their item contact details" 
    ON public.item_contact_details 
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lost_found_items 
            WHERE lost_found_items.id = item_contact_details.item_id 
              AND lost_found_items.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lost_found_items 
            WHERE lost_found_items.id = item_contact_details.item_id 
              AND lost_found_items.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete their item contact details" 
    ON public.item_contact_details 
    FOR DELETE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.lost_found_items 
            WHERE lost_found_items.id = item_contact_details.item_id 
              AND lost_found_items.owner_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 5. Indexes for Performance & Search Optimization
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lost_found_items_owner_id ON public.lost_found_items (owner_id);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_type ON public.lost_found_items (type);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_status ON public.lost_found_items (status);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_category ON public.lost_found_items (category);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_created_at ON public.lost_found_items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_feed ON public.lost_found_items (status, type, created_at DESC);

-- Full-text search index for keyword lookup across item name, description, and campus location
CREATE INDEX IF NOT EXISTS idx_lost_found_items_search ON public.lost_found_items 
    USING gin (to_tsvector('english', name || ' ' || description || ' ' || location));

-- ------------------------------------------------------------------------------
-- 6. Functions & Triggers
-- ------------------------------------------------------------------------------

-- 6.1 Generic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Apply updated_at trigger to lost_found_items
DROP TRIGGER IF EXISTS trigger_lost_found_items_updated_at ON public.lost_found_items;
CREATE TRIGGER trigger_lost_found_items_updated_at
    BEFORE UPDATE ON public.lost_found_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Apply updated_at trigger to item_contact_details
DROP TRIGGER IF EXISTS trigger_item_contact_details_updated_at ON public.item_contact_details;
CREATE TRIGGER trigger_item_contact_details_updated_at
    BEFORE UPDATE ON public.item_contact_details
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6.2 Secure trigger for automatic profile generation on Supabase Auth signup
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

-- ------------------------------------------------------------------------------
-- 7. Backwards Compatibility View (Optional for legacy queries)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.items AS
SELECT 
    i.id,
    i.owner_id,
    i.type,
    i.status,
    i.name,
    i.description,
    i.category,
    i.location,
    i.date,
    COALESCE(c.contact_name, '') AS contact_name,
    COALESCE(c.contact_info, '') AS contact_info,
    i.image_path,
    i.is_sample,
    i.created_at,
    i.updated_at
FROM public.lost_found_items i
LEFT JOIN public.item_contact_details c ON i.id = c.item_id;
