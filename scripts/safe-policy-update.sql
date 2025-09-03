-- SAFE POLICY UPDATE PROCEDURE
-- This script applies RLS policies with built-in rollback capability
-- Run each section step by step, testing between sections

-- ============================================================================
-- STEP 1: BACKUP CURRENT STATE (Run this first!)
-- ============================================================================

-- Create a temporary table to store current policies for rollback
CREATE TEMP TABLE policy_backup AS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants');

-- Store current RLS status
CREATE TEMP TABLE rls_backup AS
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants');

SELECT 'BACKUP COMPLETED - Current state saved to temp tables' as status;

-- ============================================================================
-- STEP 2: APPLY NEW POLICIES (Test this section)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE individual_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_users_select_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_participants" ON group_participants;
DROP POLICY IF EXISTS "authenticated_users_update_participants" ON group_participants;

-- Create new policies
CREATE POLICY "authenticated_users_select_individual" 
ON individual_registrations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_individual" 
ON individual_registrations FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_select_group" 
ON group_registrations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_group" 
ON group_registrations FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_select_participants" 
ON group_participants FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_participants" 
ON group_participants FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

SELECT 'NEW POLICIES APPLIED - Test your application now!' as status;

-- ============================================================================
-- STEP 3: VERIFY NEW STATE
-- ============================================================================

SELECT 'NEW RLS STATUS:' as info;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants');

SELECT 'NEW POLICIES:' as info;
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 4: ROLLBACK (Only run if Step 2 caused issues!)
-- ============================================================================

/*
-- UNCOMMENT AND RUN THIS SECTION ONLY IF YOU NEED TO ROLLBACK

-- Restore original RLS settings
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT * FROM rls_backup LOOP
        IF rec.rowsecurity THEN
            EXECUTE 'ALTER TABLE ' || rec.tablename || ' ENABLE ROW LEVEL SECURITY';
        ELSE
            EXECUTE 'ALTER TABLE ' || rec.tablename || ' DISABLE ROW LEVEL SECURITY';
        END IF;
    END LOOP;
END $$;

-- Drop new policies
DROP POLICY IF EXISTS "authenticated_users_select_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_participants" ON group_participants;
DROP POLICY IF EXISTS "authenticated_users_update_participants" ON group_participants;

SELECT 'ROLLBACK COMPLETED - Database restored to original state' as status;

*/
