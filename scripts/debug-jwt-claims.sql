-- Debug JWT claims to see what's in your token
SELECT 
  current_setting('request.jwt.claims', true) as full_claims,
  (current_setting('request.jwt.claims', true)::jsonb ->> 'role') as role,
  (current_setting('request.jwt.claims', true)::jsonb ->> 'fieldOfficeId') as field_office_id,
  auth.uid() as user_id;

-- Check a specific registration to see if field_office_id matches
SELECT id, field_office_id, status 
FROM individual_registrations 
WHERE id = 1; -- replace with actual ID you're trying to update
