# CampusFind Database & Security Architecture

This directory contains the PostgreSQL migrations, Row Level Security (RLS) policies, and test suites for **CampusFind**.

---

## 1. Canonical Database Architecture

The application standardizes on **`public.items`** as the canonical lost & found notices table, with **`public.profiles`** for user profile records.

```
 ┌──────────────────────┐
 │     auth.users       │
 └──────────┬───────────┘
            │ 1:1 (ON DELETE CASCADE)
            ├─────────────────────────────────────────┐
            │                                         │ 1:N (ON DELETE CASCADE)
 ┌──────────▼───────────┐                  ┌──────────▼───────────┐
 │   public.profiles    │                  │     public.items     │
 │ - id (UUID, PK)      │                  │ - id (UUID, PK)      │
 │ - full_name          │                  │ - owner_id (UUID, FK)│
 │ - avatar_url         │                  │ - type (lost/found)  │
 │ - created_at         │                  │ - status (active/res)│
 │ - updated_at         │                  │ - name, description  │
 └──────────┬───────────┘                  │ - category, location │
            │ (Safe Public View)           │ - date, image_path   │
 ┌──────────▼───────────┐                  │ - contact_name       │
 │public.public_profiles│                  │ - contact_info       │
 └──────────────────────┘                  │ - is_sample          │
                                           └──────────────────────┘
```

### Tables
1. **`public.profiles`**:
   - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
   - `full_name TEXT NOT NULL`
   - `avatar_url TEXT`
   - `created_at` / `updated_at` `TIMESTAMPTZ`
2. **`public.items`**:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
   - `type TEXT NOT NULL CHECK (type IN ('lost', 'found'))`
   - `status TEXT NOT NULL CHECK (status IN ('active', 'resolved')) DEFAULT 'active'`
   - `name TEXT NOT NULL CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 120)`
   - `description TEXT NOT NULL CHECK (char_length(trim(description)) > 0 AND char_length(description) <= 2000)`
   - `category TEXT NOT NULL CHECK (char_length(trim(category)) > 0 AND char_length(category) <= 50)`
   - `location TEXT NOT NULL CHECK (char_length(trim(location)) > 0 AND char_length(location) <= 120)`
   - `date TIMESTAMPTZ NOT NULL DEFAULT now()`
   - `contact_name TEXT NOT NULL`
   - `contact_info TEXT NOT NULL`
   - `image_path TEXT`
   - `is_sample BOOLEAN NOT NULL DEFAULT false`
   - `created_at` / `updated_at` `TIMESTAMPTZ`

---

## 2. Hardened Row Level Security (RLS) Policy Summary

| Table | Operation | Role | Policy Rule | Security Objective |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `SELECT` | `authenticated` | `USING (auth.uid() = id)` | **Private Profile**: Users can only read their own profile row |
| `profiles` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = id)` | **Identity Isolation**: Prevents inserting records for another user |
| `profiles` | `UPDATE` | `authenticated` | `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)` | **Owner-Only**: Users can only modify their own profile |
| `items` | `SELECT` | `all` | `USING (true)` | **Public Bulletin**: Allows public browsing of lost & found posts |
| `items` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = owner_id)` | **Anti-Spoofing**: Blocks inserting posts under another user's ID |
| `items` | `UPDATE` | `authenticated` | `USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)` | **Anti-Hijacking**: Only owners can update posts; `owner_id` cannot change |
| `items` | `DELETE` | `authenticated` | `USING (auth.uid() = owner_id)` | **Owner-Only**: Only the post author can delete their notice |
| `storage.objects` | `SELECT` | `all` | `USING (bucket_id = 'item-photos')` | **Public Images**: Item photos can be displayed on cards |
| `storage.objects` | `INSERT` | `authenticated` | `WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text)` | **Folder Isolation**: Users can only upload to `${userId}/*` |
| `storage.objects` | `DELETE` | `authenticated` | `USING (auth.uid()::text = (storage.foldername(name))[1])` | **File Protection**: Users cannot delete another user's uploads |

---

## 3. SQL Migrations

1. [`supabase/migrations/20260929_init_campusfind.sql`](file:///c:/Users/Rajendra/OneDrive/Desktop/campusfind/supabase/migrations/20260929_init_campusfind.sql): Initial schema definition and triggers.
2. [`supabase/migrations/20260929_security_audit_fixes.sql`](file:///c:/Users/Rajendra/OneDrive/Desktop/campusfind/supabase/migrations/20260929_security_audit_fixes.sql): Hardening migration fixing broad profile SELECT access and standardizing on canonical `items` table.

---

## 4. Running the Two-Account Verification Suite

In the [Supabase SQL Editor](https://supabase.com/dashboard/project/pymgbepgpiqjzonihjem/sql):
1. Open and paste [`supabase/tests/audit_verification_tests.sql`](file:///c:/Users/Rajendra/OneDrive/Desktop/campusfind/supabase/tests/audit_verification_tests.sql).
2. Click **Run**.
3. All 14 cross-user and unauthenticated isolation test cases execute in a safe, rolled-back transaction:
   - Profile isolation between User A and User B
   - Cross-user update/delete/chown prevention on reports
   - Anonymous write rejections
