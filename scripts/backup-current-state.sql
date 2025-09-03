-- BACKUP CURRENT DATABASE STATE
-- Run this BEFORE making any RLS policy changes
-- This script captures the current state so you can restore if needed

-- ============================================================================
-- BACKUP: Current RLS Status
-- ============================================================================
SELECT 'CURRENT RLS STATUS:' as info;
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename;

-- ============================================================================
-- BACKUP: Current Policies
-- ============================================================================
SELECT 'CURRENT POLICIES:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename, policyname;

-- ============================================================================
-- GENERATE RESTORE COMMANDS
-- ============================================================================
SELECT 'RESTORE COMMANDS (copy these to restore-database-state.sql):' as info;

-- Generate disable RLS commands based on current state
SELECT 
  CASE 
    WHEN rowsecurity = false THEN 'ALTER TABLE ' || tablename || ' DISABLE ROW LEVEL SECURITY;'
    ELSE 'ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;'
  END as restore_rls_command
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename;

-- Generate drop policy commands for existing policies
SELECT 'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';' as drop_policy_command
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename, policyname;

-- Generate recreate policy commands for existing policies
SELECT 
  'CREATE POLICY "' || policyname || '" ON ' || tablename || 
  ' FOR ' || cmd || 
  CASE 
    WHEN qual IS NOT NULL THEN ' USING (' || qual || ')'
    ELSE ''
  END ||
  CASE 
    WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')'
    ELSE ''
  END || ';' as recreate_policy_command
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename, policyname;
