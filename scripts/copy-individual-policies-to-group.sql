-- Copy individual registration RLS policies to group registrations and group participants
-- This ensures consistent policy structure across all tables

-- First, check what policies exist on individual_registrations
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'individual_registrations'
ORDER BY policyname;

-- Enable RLS on all tables
ALTER TABLE individual_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "authenticated_users_select_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_individual" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_update_group" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_users_select_participants" ON group_participants;
DROP POLICY IF EXISTS "authenticated_users_update_participants" ON group_participants;

-- Create consistent policies for individual_registrations
CREATE POLICY "authenticated_users_select_individual" 
ON individual_registrations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_individual" 
ON individual_registrations FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Copy the same policies to group_registrations
CREATE POLICY "authenticated_users_select_group" 
ON group_registrations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_group" 
ON group_registrations FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Copy the same policies to group_participants
CREATE POLICY "authenticated_users_select_participants" 
ON group_participants FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_participants" 
ON group_participants FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify all policies were created correctly
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants')
ORDER BY tablename, policyname;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations', 'group_participants');
