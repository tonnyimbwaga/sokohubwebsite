-- Create the hero-slides bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-slides', 'hero-slides', true);

-- Allow public access to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'hero-slides'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] != 'private'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update their own files"
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
CREATE POLICY "Authenticated users can delete their own files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'hero-slides'
    AND auth.uid() = owner
);
