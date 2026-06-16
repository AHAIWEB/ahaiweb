
CREATE POLICY "ebooks read all" ON storage.objects FOR SELECT
  USING (bucket_id = 'ebooks');
CREATE POLICY "ebooks insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ebooks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "ebooks update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'ebooks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "ebooks delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ebooks' AND auth.uid()::text = (storage.foldername(name))[1]);
