-- RLS UPDATE policies for registration tables
-- Run this in Supabase SQL editor or via `supabase db push`

-- individual_registrations --------------------------------------------------
ALTER TABLE individual_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_can_update" ON individual_registrations;

CREATE POLICY "authenticated_can_update"
ON individual_registrations
FOR UPDATE
USING ( auth.uid() IS NOT NULL )
WITH CHECK ( auth.uid() IS NOT NULL );

-- group_registrations --------------------------------------------------------
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_can_update" ON group_registrations;

CREATE POLICY "authenticated_can_update"
ON group_registrations
FOR UPDATE
USING ( auth.uid() IS NOT NULL )
WITH CHECK ( auth.uid() IS NOT NULL );
