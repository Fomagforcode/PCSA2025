-- Temporarily disable RLS to allow updates while using localStorage auth
-- This bypasses the JWT requirement until we implement proper Supabase auth

ALTER TABLE individual_registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('individual_registrations', 'group_registrations');
