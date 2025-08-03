-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
('receipts', 'receipts', true),
('excel-files', 'excel-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies to allow public uploads
CREATE POLICY "Allow public uploads to receipts bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow public uploads to excel-files bucket" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'excel-files');

CREATE POLICY "Allow public read access to receipts bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

CREATE POLICY "Allow public read access to excel-files bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'excel-files');

-- Allow public access to view uploaded files
CREATE POLICY "Allow public access to receipts" ON storage.objects
  FOR ALL USING (bucket_id = 'receipts');

CREATE POLICY "Allow public access to excel-files" ON storage.objects
  FOR ALL USING (bucket_id = 'excel-files');
