# CampusFind Database & Security Architecture (Part 2)

This directory contains the versioned PostgreSQL migrations, Row Level Security (RLS) policies, and test suites for **CampusFind**.

---

## 1. Tables & Schema Overview

### `public.profiles`
Stores extended user profile information matching authenticated Supabase Auth users.
- **`id`** (`UUID`, Primary Key): References `auth.users(id)` with `ON DELETE CASCADE`.
- **`full_name`** (`TEXT`, Required): User's legal or campus name ($1 \le \text{length} \le 100$).
- **`avatar_url`** (`TEXT`, Nullable): Link to user avatar image.
- **`created_at`** / **`updated_at`** (`TIMESTAMPTZ`): Automatic timestamps.

### `public.lost_found_items`
Contains non-sensitive public bulletin lost & found listings.
- **`id`** (`UUID`, Primary Key): Auto-generated `gen_random_uuid()`.
- **`owner_id`** (`UUID`, Foreign Key): References `auth.users(id)` with `ON DELETE CASCADE`.
- **`type`** (`TEXT`, Required): `'lost'` | `'found'`.
- **`status`** (`TEXT`, Required): `'active'` | `'resolved'`.
- **`name`** (`TEXT`, Required): Item title ($1 \le \text{length} \le 120$).
- **`description`** (`TEXT`, Required): Item description ($1 \le \text{length} \le 2000$).
- **`category`** (`TEXT`, Required): Item category ($1 \le \text{length} \le 50$).
- **`location`** (`TEXT`, Required): Campus location ($1 \le \text{length} \le 120$).
- **`date`** (`TIMESTAMPTZ`, Required): Date when item was lost or found.
- **`image_path`** (`TEXT`, Nullable): Supabase Storage path/URL.
- **`is_sample`** (`BOOLEAN`): Tracks demo/sample records.
- **`created_at`** / **`updated_at`** (`TIMESTAMPTZ`): Automatic timestamps.

### `public.item_contact_details`
Isolates private contact details (e.g. phone numbers or personal emails) so that public bulletin queries do not leak sensitive personal information.
- **`item_id`** (`UUID`, Primary Key): References `public.lost_found_items(id)` with `ON DELETE CASCADE`.
- **`contact_name`** (`TEXT`, Required): Full name of the contact person.
- **`contact_info`** (`TEXT`, Required): Email or phone number.
- **`updated_at`** (`TIMESTAMPTZ`): Automatic timestamp.

---

## 2. Row Level Security (RLS) Policies

| Table | Operation | Role | Policy Rule |
| :--- | :--- | :--- | :--- |
| `profiles` | `SELECT` | `authenticated` | `USING (true)` |
| `profiles` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = id)` |
| `profiles` | `UPDATE` | `authenticated` | `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)` |
| `lost_found_items` | `SELECT` | `authenticated` | `USING (true)` |
| `lost_found_items` | `INSERT` | `authenticated` | `WITH CHECK (auth.uid() = owner_id)` |
| `lost_found_items` | `UPDATE` | `authenticated` | `USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)` |
| `lost_found_items` | `DELETE` | `authenticated` | `USING (auth.uid() = owner_id)` |
| `item_contact_details` | `SELECT` | `authenticated` | `EXISTS (SELECT 1 FROM lost_found_items WHERE id = item_id AND owner_id = auth.uid())` |
| `item_contact_details` | `INSERT` | `authenticated` | `EXISTS (SELECT 1 FROM lost_found_items WHERE id = item_id AND owner_id = auth.uid())` |
| `item_contact_details` | `UPDATE` | `authenticated` | `EXISTS (SELECT 1 FROM lost_found_items WHERE id = item_id AND owner_id = auth.uid())` |
| `item_contact_details` | `DELETE` | `authenticated` | `EXISTS (SELECT 1 FROM lost_found_items WHERE id = item_id AND owner_id = auth.uid())` |

---

## 3. Database Indexes

- `idx_lost_found_items_owner_id`: Fast filtering by owner in "My Reports".
- `idx_lost_found_items_type`: Fast filtering by `lost` vs `found`.
- `idx_lost_found_items_status`: Fast filtering by `active` vs `resolved`.
- `idx_lost_found_items_category`: Fast filtering by category.
- `idx_lost_found_items_created_at`: Chronological ordering.
- `idx_lost_found_items_feed`: Multi-column composite index on `(status, type, created_at DESC)` for high-throughput bulletin feeds.
- `idx_lost_found_items_search`: GIN Full-Text Search index on `(name || ' ' || description || ' ' || location)`.

---

## 4. How to Apply Migration

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project: `pymgbepgpiqjzonihjem`.
3. Open the **SQL Editor** from the left sidebar.
4. Copy the entire content of [`supabase/migrations/20260929_part2_database_schema_and_security.sql`](file:///c:/Users/Rajendra/OneDrive/Desktop/campusfind/supabase/migrations/20260929_part2_database_schema_and_security.sql).
5. Click **Run**.

---

## 5. How to Run Automated Security & RLS Tests

1. In the Supabase **SQL Editor**, paste the content of [`supabase/tests/security_tests.sql`](file:///c:/Users/Rajendra/OneDrive/Desktop/campusfind/supabase/tests/security_tests.sql).
2. Click **Run**.
3. The script will execute a transaction simulating User A, User B, and unauthenticated roles, outputting:
   ```text
   NOTICE:  === Running CampusFind Security & RLS Test Suite ===
   NOTICE:  TEST 1 PASSED: User A can create their own profile.
   NOTICE:  TEST 2 PASSED: User A cannot create profile for User B.
   NOTICE:  TEST 3 PASSED: User A can create a report with owner_id = User A.
   NOTICE:  TEST 4 PASSED: User A can attach private contact details to Item A.
   NOTICE:  TEST 5 PASSED: User A cannot create report owned by User B.
   NOTICE:  TEST 6 PASSED: User B created profile and Item B with private contact info.
   NOTICE:  TEST 7 PASSED: User B cannot read User A private contact details (0 rows returned).
   NOTICE:  TEST 8 PASSED: User B cannot update User A report (0 rows modified).
   NOTICE:  TEST 9 PASSED: User B cannot delete User A report (Item A still exists).
   NOTICE:  TEST 10 PASSED: Anonymous / Unauthenticated users cannot create reports.
   NOTICE:  === ALL 10 SECURITY & RLS TESTS PASSED SUCCESSFULLY! ===
   ```
4. The test uses `ROLLBACK;` so test records are automatically cleaned up without leaving mock records in your database.
