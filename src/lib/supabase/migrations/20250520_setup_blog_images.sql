-- Create the blog images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- RLS is enabled by default in Supabase when creating a bucket with public=true

-- Allow public access to view files in blog bucket
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'blog');

-- Allow authenticated users to upload files to blog bucket
CREATE POLICY "Upload Access" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'blog' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Update Access" ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'blog'
    AND auth.role() = 'authenticated'
    AND (auth.uid() = owner)
)
WITH CHECK (
    bucket_id = 'blog'
    AND auth.role() = 'authenticated'
    AND (auth.uid() = owner)
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Delete Access" ON storage.objects
FOR DELETE
USING (
    bucket_id = 'blog'
    AND auth.role() = 'authenticated'
    AND (auth.uid() = owner)
);

-- Grant appropriate permissions using Supabase's built-in functions
-- In Supabase, these permissions are handled by the storage system based on the policies we've defined
