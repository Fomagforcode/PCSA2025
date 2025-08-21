-- First, check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations');

-- Drop all existing policies and recreate them properly
DROP POLICY IF EXISTS "authenticated_can_update" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_can_select" ON individual_registrations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON individual_registrations;

DROP POLICY IF EXISTS "authenticated_can_update" ON group_registrations;
DROP POLICY IF EXISTS "authenticated_can_select" ON group_registrations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON group_registrations;

-- Enable RLS
ALTER TABLE individual_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies for individual_registrations
CREATE POLICY "authenticated_users_select_individual" 
ON individual_registrations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_individual" 
ON individual_registrations FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create comprehensive policies for group_registrations
CREATE POLICY "authenticated_users_select_group" 
ON group_registrations FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_users_update_group" 
ON group_registrations FOR UPDATE 
USING (auth.uid() IS NOT NULL) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations')
ORDER BY tablename, policyname;
