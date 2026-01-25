
-- Create public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- Create logos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Reset policies to avoid conflicts if they exist (DROP IF EXISTS is safer manually, but for migration file we can just CREATE IF NOT EXISTS logic or simple CREATE which fails if exists)
-- Simplifying for migration file:

DO $$
BEGIN
    -- Public Bucket Policies
    BEGIN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'public' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
        CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'public' );
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    BEGIN
        CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'public' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
        CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'public' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Logos Bucket Policies
    BEGIN
        CREATE POLICY "Logos Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'logos' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
        CREATE POLICY "Logos Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'logos' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Avatars Bucket Policies
    BEGIN
        CREATE POLICY "Avatars Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    BEGIN
        CREATE POLICY "Avatars Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'avatars' );
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;
