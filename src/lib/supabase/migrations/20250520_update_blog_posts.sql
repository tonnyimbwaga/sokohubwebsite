-- Add SEO and image fields to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS featured_image text;

-- Update RLS policies for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Public Access" ON blog_posts
FOR SELECT
USING (status = 'published');

-- Allow authenticated users to manage their own posts
CREATE POLICY "Authenticated Users Access" ON blog_posts
FOR ALL
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);
