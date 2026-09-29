-- ==============================================================================
-- CampusFind Security Audit Fixes & Policy Hardening Migration
-- Version: 20260929_security_audit_fixes
-- Description: 
--   1. Restricts profiles table RLS to owner-only read (fixing broad public access).
--   2. Enforces canonical table 'items' with strict RLS on CRUD operations.
--   3. Provides backwards-compatible 'lost_found_items' view.
--   4. Hardens Supabase Storage 'item-photos' bucket owner folder isolation.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Profiles Privacy Hardening
-- ------------------------------------------------------------------------------
-- Drop all existing broad SELECT policies on profiles
DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Ensure RLS is active on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own private profile record
CREATE POLICY "Users can read their own profile" 
    ON public.profiles 
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- Policy: Users can only insert their own profile record matching auth.uid()
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Policy: Users can only update their own profile record (cannot chown)
CREATE POLICY "Users can update their own profile" 
    ON public.profiles 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create a safe public profiles view (exposing only non-sensitive public name and avatar)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    avatar_url,
    created_at
FROM public.profiles;

-- ------------------------------------------------------------------------------
-- 2. Canonical 'items' Table RLS Hardening
-- ------------------------------------------------------------------------------
-- Drop existing policies on items to ensure clean re-application
DROP POLICY IF EXISTS "Public items can be viewed by all users" ON public.items;
DROP POLICY IF EXISTS "Authenticated users can create items with their own owner_id" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 2.1 Public Bulletin Read: All users (including anonymous visitors) can view lost & found notices
CREATE POLICY "Public items can be viewed by all users" 
    ON public.items 
    FOR SELECT 
    USING (true);

-- 2.2 Authenticated Create: Users can insert items only with their own authenticated owner_id
CREATE POLICY "Authenticated users can create items with their own owner_id" 
    ON public.items 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- 2.3 Owner Update: Users can only update reports they own, and cannot change owner_id to another user
CREATE POLICY "Users can update their own items" 
    ON public.items 
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 2.4 Owner Delete: Users can only delete reports they own
CREATE POLICY "Users can delete their own items" 
    ON public.items 
    FOR DELETE 
    TO authenticated
    USING (auth.uid() = owner_id);

-- ------------------------------------------------------------------------------
-- 3. Compatibility View: 'lost_found_items'
-- ------------------------------------------------------------------------------
-- Ensure queries expecting 'lost_found_items' seamlessly resolve to canonical 'items'
CREATE OR REPLACE VIEW public.lost_found_items AS
SELECT * FROM public.items;

-- ------------------------------------------------------------------------------
-- 4. Storage Bucket & Policy Hardening for 'item-photos'
-- ------------------------------------------------------------------------------
-- Drop existing storage policies
DROP POLICY IF EXISTS "Item photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload item photos to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own item photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own item photos" ON storage.objects;

-- 4.1 Public read for item photos
CREATE POLICY "Item photos are publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'item-photos');

-- 4.2 Authenticated upload strictly to the user's dedicated folder
CREATE POLICY "Authenticated users can upload item photos to their own folder" 
    ON storage.objects 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        bucket_id = 'item-photos' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- 4.3 Owner update of their own storage photos
CREATE POLICY "Users can update their own item photos" 
    ON storage.objects 
    FOR UPDATE 
    TO authenticated
    USING (
        bucket_id = 'item-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 4.4 Owner deletion of their own storage photos
CREATE POLICY "Users can delete their own item photos" 
    ON storage.objects 
    FOR DELETE 
    TO authenticated
    USING (
        bucket_id = 'item-photos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
