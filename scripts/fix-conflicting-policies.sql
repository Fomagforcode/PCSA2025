-- Fix conflicting RLS policies by consolidating them into one comprehensive policy

-- Drop the conflicting authenticated_can_update policies
DROP POLICY IF EXISTS "authenticated_can_update" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_can_update" ON group_registrations;

-- The admin_access policy already handles both main_admin and field office admin access
-- It allows updates if:
-- 1. User has role 'main_admin' (can update any registration), OR
-- 2. User's fieldOfficeId matches the registration's field_office_id

-- Verify the remaining policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations')
AND policyname = 'admin_access'
ORDER BY tablename;
