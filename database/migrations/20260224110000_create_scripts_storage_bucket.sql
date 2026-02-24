-- ============================================
-- ZOOMING STUDIO: Storage Bucket for Scripts/Storyboard
-- ============================================

-- Create scripts bucket for storyboard images and scene assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('scripts', 'scripts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for 'scripts' bucket
DO $$
BEGIN
    -- Public Access (anyone can view storyboard images)
    BEGIN
        CREATE POLICY "Scripts Public Access" ON storage.objects
          FOR SELECT USING ( bucket_id = 'scripts' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated Upload
    BEGIN
        CREATE POLICY "Scripts Authenticated Upload" ON storage.objects
          FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'scripts' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated Update
    BEGIN
        CREATE POLICY "Scripts Authenticated Update" ON storage.objects
          FOR UPDATE TO authenticated USING ( bucket_id = 'scripts' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated Delete
    BEGIN
        CREATE POLICY "Scripts Authenticated Delete" ON storage.objects
          FOR DELETE TO authenticated USING ( bucket_id = 'scripts' );
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;
