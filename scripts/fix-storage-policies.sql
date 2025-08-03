-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public uploads to receipts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to excel-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to receipts bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to excel-files bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to excel-files" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public can upload to receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Public can view receipts" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Public can update receipts" ON storage.objects
  FOR UPDATE USING (bucket_id = 'receipts');

CREATE POLICY "Public can delete receipts" ON storage.objects
  FOR DELETE USING (bucket_id = 'receipts');

CREATE POLICY "Public can upload to excel-files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'excel-files');

CREATE POLICY "Public can view excel-files" ON storage.objects
  FOR SELECT USING (bucket_id = 'excel-files');

CREATE POLICY "Public can update excel-files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'excel-files');

CREATE POLICY "Public can delete excel-files" ON storage.objects
  FOR DELETE USING (bucket_id = 'excel-files');

-- Ensure buckets exist and are public
UPDATE storage.buckets SET public = true WHERE id IN ('receipts', 'excel-files');
