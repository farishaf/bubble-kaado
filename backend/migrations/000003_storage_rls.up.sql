-- 000003_storage_rls.up.sql
-- RLS policies for the lumio-assets storage bucket.
-- The bucket itself was created by `cmd/setup` and is public for reads.
-- This migration adds write policies for authenticated users so the
-- browser-side upload (which uses the user's JWT, not the service_role key)
-- can INSERT and DELETE files.
--
-- Run this on the Supabase project (via SQL editor or Management API).
-- It is idempotent — DROP IF EXISTS + CREATE.

DROP POLICY IF EXISTS "lumio assets: authenticated upload" ON storage.objects;
CREATE POLICY "lumio assets: authenticated upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lumio-assets');

DROP POLICY IF EXISTS "lumio assets: authenticated delete" ON storage.objects;
CREATE POLICY "lumio assets: authenticated delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'lumio-assets');

DROP POLICY IF EXISTS "lumio assets: authenticated update" ON storage.objects;
CREATE POLICY "lumio assets: authenticated update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lumio-assets')
  WITH CHECK (bucket_id = 'lumio-assets');
