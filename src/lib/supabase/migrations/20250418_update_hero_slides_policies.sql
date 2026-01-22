-- First, drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own files" ON storage.objects;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to view files in hero-slides bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'hero-slides'
);

-- Allow authenticated users to upload files to hero-slides bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'hero-slides'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] != 'private'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update own files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'hero-slides'
    AND auth.uid() = owner
)
WITH CHECK (
    bucket_id = 'hero-slides'
    AND auth.uid() = owner
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'hero-slides'
    AND auth.uid() = owner
);

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- Grant all on bucket to authenticated users
GRANT ALL ON storage.objects TO authenticated;

-- Grant select on bucket to anonymous users
GRANT SELECT ON storage.objects TO anon;
