-- 000003_storage_rls.down.sql
DROP POLICY IF EXISTS "lumio assets: authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "lumio assets: authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "lumio assets: authenticated update" ON storage.objects;
