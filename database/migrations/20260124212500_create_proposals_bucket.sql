
-- Create proposals bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposals', 'proposals', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for 'proposals' bucket

DO $$
BEGIN
    -- Public Access
    BEGIN
        CREATE POLICY "Proposals Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'proposals' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated Upload
    BEGIN
        CREATE POLICY "Proposals Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'proposals' );
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    -- Authenticated Update
    BEGIN
        CREATE POLICY "Proposals Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'proposals' );
    EXCEPTION WHEN duplicate_object THEN null; END;

    -- Authenticated Delete
    BEGIN
        CREATE POLICY "Proposals Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'proposals' );
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;
