-- RESTORE DATABASE STATE
-- This script restores your database to the working state (RLS disabled)
-- Run this if the new RLS policies cause issues

-- ============================================================================
-- EMERGENCY RESTORE: Disable RLS (Known Working State)
-- ============================================================================

-- Disable RLS on all tables (this was your working configuration)
ALTER TABLE individual_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants DISABLE ROW LEVEL SECURITY;

-- Drop any policies that might have been created
DROP POLICY IF EXISTS "authenticated_users_select_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_participants" ON group_participants;
DROP POLICY IF EXISTS "authenticated_users_update_participants" ON group_participants;

-- Drop any other policies that might exist
DROP POLICY IF EXISTS "authenticated_can_update" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_can_select" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_can_update" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_can_select" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_can_update" ON group_participants;
DROP POLICY IF EXISTS "authenticated_can_select" ON group_participants;

-- Verify RLS is disabled
SELECT 'RLS STATUS AFTER RESTORE:' as info;
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename;

-- Verify no policies exist
SELECT 'POLICIES AFTER RESTORE:' as info;
SELECT schemaname, tablename, policyname
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename, policyname;

-- Success message
SELECT 'DATABASE RESTORED TO WORKING STATE (RLS DISABLED)' as status;
