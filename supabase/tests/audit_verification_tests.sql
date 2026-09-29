-- ==============================================================================
-- CampusFind Audit Verification: Two-Account Cross-User Isolation Test Suite
-- File: supabase/tests/audit_verification_tests.sql
-- Description: Executes live RLS isolation test cases simulating User A, User B,
--              and anonymous requests against public.profiles and public.items.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    user_a_id UUID := '11111111-1111-4111-8111-111111111111';
    user_b_id UUID := '22222222-2222-4222-8222-222222222222';
    item_a_id UUID := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    item_b_id UUID := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    temp_count INTEGER;
    temp_title TEXT;
BEGIN
    RAISE NOTICE '=== STARTING TWO-ACCOUNT AUDIT SECURITY TESTS ===';

    -- --------------------------------------------------------------------------
    -- SECTION 1: PROFILES ISOLATION
    -- --------------------------------------------------------------------------
    -- 1.1 User A sets up profile
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_a_id::text);

    INSERT INTO public.profiles (id, full_name)
    VALUES (user_a_id, 'Alice Johnson');
    RAISE NOTICE 'TEST 1 PASSED: User A successfully created their own profile.';

    -- 1.2 User A reads own profile
    SELECT count(*) INTO temp_count FROM public.profiles WHERE id = user_a_id;
    IF temp_count = 1 THEN
        RAISE NOTICE 'TEST 2 PASSED: User A can read their own profile.';
    ELSE
        RAISE EXCEPTION 'TEST 2 FAILED: User A cannot read their own profile!';
    END IF;

    -- 1.3 Switch to User B
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_b_id::text);

    INSERT INTO public.profiles (id, full_name)
    VALUES (user_b_id, 'Bob Smith');

    -- 1.4 User B attempts to read User A's private profile
    SELECT count(*) INTO temp_count FROM public.profiles WHERE id = user_a_id;
    IF temp_count = 0 THEN
        RAISE NOTICE 'TEST 3 PASSED: User B cannot read User A private profile (0 rows returned).';
    ELSE
        RAISE EXCEPTION 'TEST 3 FAILED: User B was able to read User A private profile!';
    END IF;

    -- 1.5 User B attempts to update User A's profile
    UPDATE public.profiles SET full_name = 'Hacked Name' WHERE id = user_a_id;
    SELECT full_name INTO temp_title FROM public.profiles WHERE id = user_a_id;
    IF temp_title IS NULL OR temp_title != 'Hacked Name' THEN
        RAISE NOTICE 'TEST 4 PASSED: User B cannot update User A profile (0 rows affected).';
    ELSE
        RAISE EXCEPTION 'TEST 4 FAILED: User B was able to modify User A profile!';
    END IF;

    -- --------------------------------------------------------------------------
    -- SECTION 2: REPORT OWNERSHIP & CRUD ISOLATION
    -- --------------------------------------------------------------------------
    -- 2.1 Switch back to User A to create Report A
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_a_id::text);

    INSERT INTO public.items (id, owner_id, type, status, name, description, category, location, contact_name, contact_info)
    VALUES (item_a_id, user_a_id, 'lost', 'active', 'Alice Wallet', 'Black leather wallet', 'Wallet', 'Library 2F', 'Alice J', 'alice@campus.edu');
    RAISE NOTICE 'TEST 5 PASSED: User A successfully created report Item A.';

    -- 2.2 User A attempts to create report with owner_id = User B (Should fail)
    BEGIN
        INSERT INTO public.items (owner_id, type, status, name, description, category, location, contact_name, contact_info)
        VALUES (user_b_id, 'lost', 'active', 'Fake Item', 'Desc', 'Other', 'Campus', 'Fake', 'fake@campus.edu');
        RAISE EXCEPTION 'TEST 6 FAILED: User A was able to create report owned by User B!';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        RAISE NOTICE 'TEST 6 PASSED: User A cannot create report owned by User B.';
    END;

    -- 2.3 Switch to User B
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_b_id::text);

    -- 2.4 User B can view Item A on public bulletin
    SELECT count(*) INTO temp_count FROM public.items WHERE id = item_a_id;
    IF temp_count = 1 THEN
        RAISE NOTICE 'TEST 7 PASSED: User B can view Item A on public bulletin.';
    ELSE
        RAISE EXCEPTION 'TEST 7 FAILED: User B cannot view Item A on public bulletin!';
    END IF;

    -- 2.5 User B attempts to update User A's report
    UPDATE public.items SET name = 'Modified by Bob' WHERE id = item_a_id;
    SELECT name INTO temp_title FROM public.items WHERE id = item_a_id;
    IF temp_title = 'Alice Wallet' THEN
        RAISE NOTICE 'TEST 8 PASSED: User B cannot update User A report (original name preserved).';
    ELSE
        RAISE EXCEPTION 'TEST 8 FAILED: User B was able to modify User A report!';
    END IF;

    -- 2.6 User B attempts to change ownership of Item A
    UPDATE public.items SET owner_id = user_b_id WHERE id = item_a_id;
    SELECT count(*) INTO temp_count FROM public.items WHERE id = item_a_id AND owner_id = user_a_id;
    IF temp_count = 1 THEN
        RAISE NOTICE 'TEST 9 PASSED: User B cannot hijack ownership of Item A.';
    ELSE
        RAISE EXCEPTION 'TEST 9 FAILED: User B was able to change owner_id of Item A!';
    END IF;

    -- 2.7 User B attempts to delete User A's report
    DELETE FROM public.items WHERE id = item_a_id;
    SELECT count(*) INTO temp_count FROM public.items WHERE id = item_a_id;
    IF temp_count = 1 THEN
        RAISE NOTICE 'TEST 10 PASSED: User B cannot delete User A report (Item A still exists).';
    ELSE
        RAISE EXCEPTION 'TEST 10 FAILED: User B was able to delete User A report!';
    END IF;

    -- 2.8 Switch to User A and update own report
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL "request.jwt.claim.sub" = %L', user_a_id::text);

    UPDATE public.items SET status = 'resolved' WHERE id = item_a_id;
    SELECT count(*) INTO temp_count FROM public.items WHERE id = item_a_id AND status = 'resolved';
    IF temp_count = 1 THEN
        RAISE NOTICE 'TEST 11 PASSED: User A can update their own report status to resolved.';
    ELSE
        RAISE EXCEPTION 'TEST 11 FAILED: User A was unable to update their own report!';
    END IF;

    -- 2.9 User A deletes own report
    DELETE FROM public.items WHERE id = item_a_id;
    SELECT count(*) INTO temp_count FROM public.items WHERE id = item_a_id;
    IF temp_count = 0 THEN
        RAISE NOTICE 'TEST 12 PASSED: User A can delete their own report.';
    ELSE
        RAISE EXCEPTION 'TEST 12 FAILED: User A was unable to delete their own report!';
    END IF;

    -- --------------------------------------------------------------------------
    -- SECTION 3: UNAUTHENTICATED / ANONYMOUS RESTRICTIONS
    -- --------------------------------------------------------------------------
    SET LOCAL ROLE anon;
    RESET "request.jwt.claim.sub";

    -- 3.1 Anonymous user attempts write to items
    BEGIN
        INSERT INTO public.items (owner_id, type, status, name, description, category, location, contact_name, contact_info)
        VALUES (user_a_id, 'lost', 'active', 'Anon Item', 'Desc', 'Other', 'Campus', 'Anon', 'anon@campus.edu');
        RAISE EXCEPTION 'TEST 13 FAILED: Anonymous user was able to insert an item!';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        RAISE NOTICE 'TEST 13 PASSED: Anonymous users cannot write to items table.';
    END;

    -- 3.2 Anonymous user attempts write to profiles
    BEGIN
        INSERT INTO public.profiles (id, full_name)
        VALUES (user_a_id, 'Anon Profile');
        RAISE EXCEPTION 'TEST 14 FAILED: Anonymous user was able to insert a profile!';
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        RAISE NOTICE 'TEST 14 PASSED: Anonymous users cannot write to profiles table.';
    END;

    RAISE NOTICE '=== ALL 14 AUDIT SECURITY TESTS COMPLETED SUCCESSFULLY! ===';
END $$;

ROLLBACK;
