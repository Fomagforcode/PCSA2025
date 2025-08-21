-- Remove the conflicting authenticated_can_update policies
-- The admin_access policy already handles proper authorization

DROP POLICY IF EXISTS "authenticated_can_update" ON individual_registrations;
DROP POLICY IF EXISTS "authenticated_can_update" ON group_registrations;

-- Verify remaining policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('individual_registrations', 'group_registrations')
ORDER BY tablename, policyname;
