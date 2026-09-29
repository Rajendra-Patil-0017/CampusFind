-- ==============================================================================
-- CampusFind Part 2: Security & Row Level Security (RLS) Test Suite
-- File: supabase/tests/security_tests.sql
-- Description: Automated SQL test harness to verify RLS policy isolation
--              between User A, User B, and Unauthenticated / Anonymous requests.
-- ==============================================================================

BEGIN;

-- Test Setup: Define Mock User UUIDs
DO $$
DECLARE
    user_a_id UUID := '11111111-1111-4111-8111-111111111111';
    user_b_id UUID := '22222222-2222-4222-8222-222222222222';
    item_a_id UUID := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    item_b_id UUID := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    temp_count INTEGER;
BEGIN
    RAISE NOTICE '=== Running CampusFind Security & RLS Test Suite ===';

    -- --------------------------------------------------------------------------
    -- 1. Test Profile Creation & RLS Isolation
    -- --------------------------------------------------------------------------
    -- Simulate authenticated User A
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_a_id::text);

    -- User A creates their own profile (Should succeed)
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (user_a_id, 'Alice Johnson', 'https://example.com/alice.jpg');
    RAISE NOTICE 'TEST 1 PASSED: User A can create their own profile.';

    -- User A attempts to create a profile for User B (Should fail due to RLS WITH CHECK)
    BEGIN
        INSERT INTO public.profiles (id, full_name, avatar_url)
        VALUES (user_b_id, 'Bob Smith', 'https://example.com/bob.jpg');
        RAISE EXCEPTION 'TEST 2 FAILED: User A was able to insert profile for User B!';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        RAISE NOTICE 'TEST 2 PASSED: User A cannot create profile for User B.';
    END;

    -- --------------------------------------------------------------------------
    -- 2. Test Report Creation (Lost & Found Items)
    -- --------------------------------------------------------------------------
    -- User A creates a report owned by User A (Should succeed)
    INSERT INTO public.lost_found_items (id, owner_id, type, status, name, description, category, location)
    VALUES (item_a_id, user_a_id, 'lost', 'active', 'Calculus Textbook', 'Left in math hall', 'Books', 'Hall 101');
    RAISE NOTICE 'TEST 3 PASSED: User A can create a report with owner_id = User A.';

    -- User A creates private contact details for item A (Should succeed)
    INSERT INTO public.item_contact_details (item_id, contact_name, contact_info)
    VALUES (item_a_id, 'Alice Johnson', 'alice@campus.edu');
    RAISE NOTICE 'TEST 4 PASSED: User A can attach private contact details to Item A.';

    -- User A attempts to create a report with owner_id = User B (Should fail)
    BEGIN
        INSERT INTO public.lost_found_items (id, owner_id, type, status, name, description, category, location)
        VALUES (item_b_id, user_b_id, 'found', 'active', 'Keys', 'Found near gym', 'Keys', 'Gym Complex');
        RAISE EXCEPTION 'TEST 5 FAILED: User A was able to create a report owned by User B!';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        RAISE NOTICE 'TEST 5 PASSED: User A cannot create report owned by User B.';
    END;

    -- --------------------------------------------------------------------------
    -- 3. Switch to User B Context
    -- --------------------------------------------------------------------------
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_b_id::text);

    -- User B creates their own profile & report
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (user_b_id, 'Bob Smith', NULL);

    INSERT INTO public.lost_found_items (id, owner_id, type, status, name, description, category, location)
    VALUES (item_b_id, user_b_id, 'found', 'active', 'Silver Laptop Charger', 'MagSafe charger', 'Electronics', 'Cafeteria');

    INSERT INTO public.item_contact_details (item_id, contact_name, contact_info)
    VALUES (item_b_id, 'Bob Smith', 'bob@campus.edu');
    RAISE NOTICE 'TEST 6 PASSED: User B created profile and Item B with private contact info.';

    -- --------------------------------------------------------------------------
    -- 4. Test Cross-User Isolation (User B operating on User A data)
    -- --------------------------------------------------------------------------
    -- User B attempts to read User A's private contact details (Should return 0 rows)
    SELECT count(*) INTO temp_count FROM public.item_contact_details WHERE item_id = item_a_id;
    IF temp_count > 0 THEN
        RAISE EXCEPTION 'TEST 7 FAILED: User B was able to read User A contact details!';
    ELSE
        RAISE NOTICE 'TEST 7 PASSED: User B cannot read User A private contact details (0 rows returned).';
    END IF;

    -- User B attempts to update User A's report (Should affect 0 rows)
    UPDATE public.lost_found_items 
    SET name = 'Hacked Title' 
    WHERE id = item_a_id;

    SELECT count(*) INTO temp_count FROM public.lost_found_items WHERE id = item_a_id AND name = 'Hacked Title';
    IF temp_count > 0 THEN
        RAISE EXCEPTION 'TEST 8 FAILED: User B was able to update User A report!';
    ELSE
        RAISE NOTICE 'TEST 8 PASSED: User B cannot update User A report (0 rows modified).';
    END IF;

    -- User B attempts to delete User A's report (Should affect 0 rows)
    DELETE FROM public.lost_found_items WHERE id = item_a_id;

    SELECT count(*) INTO temp_count FROM public.lost_found_items WHERE id = item_a_id;
    IF temp_count = 0 THEN
        RAISE EXCEPTION 'TEST 9 FAILED: User B was able to delete User A report!';
    ELSE
        RAISE NOTICE 'TEST 9 PASSED: User B cannot delete User A report (Item A still exists).';
    END IF;

    -- --------------------------------------------------------------------------
    -- 5. Test Anonymous / Unauthenticated Protection
    -- --------------------------------------------------------------------------
    SET LOCAL ROLE anon;
    RESET "request.jwt.claim.sub";

    -- Anonymous user attempts to write to lost_found_items (Should fail)
    BEGIN
        INSERT INTO public.lost_found_items (owner_id, type, status, name, description, category, location)
        VALUES (user_a_id, 'lost', 'active', 'Anon Post', 'Anon desc', 'Other', 'Campus');
        RAISE EXCEPTION 'TEST 10 FAILED: Anonymous user was able to insert an item!';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        RAISE NOTICE 'TEST 10 PASSED: Anonymous / Unauthenticated users cannot create reports.';
    END IF;

    RAISE NOTICE '=== ALL 10 SECURITY & RLS TESTS PASSED SUCCESSFULLY! ===';
END $$;

ROLLBACK; -- Always roll back test mutations so live database state remains clean
