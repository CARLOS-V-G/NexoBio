
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nexobio',
  'nexobio',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "nexobio_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'nexobio' AND (storage.foldername(name))[1] IN ('avatar', 'cover'));

-- Allow public read
CREATE POLICY "nexobio_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'nexobio');

-- Allow users to update/delete own files
CREATE POLICY "nexobio_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'nexobio' AND auth.uid()::text = SPLIT_PART(SPLIT_PART(name, '/', 2), '.', 1));

CREATE POLICY "nexobio_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'nexobio' AND auth.uid()::text = SPLIT_PART(SPLIT_PART(name, '/', 2), '.', 1));
