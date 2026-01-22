-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for this bucket to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete files" ON storage.objects;

-- 1. Allow anyone to view files in the hero-slides bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

-- 2. Allow authenticated users to upload files to hero-slides bucket
-- This is the most important policy for your current issue
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'hero-slides' 
    AND auth.role() = 'authenticated'
);

-- 3. Allow authenticated users to update files
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-slides' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-slides' AND auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
