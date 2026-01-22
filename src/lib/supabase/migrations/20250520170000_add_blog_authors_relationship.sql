-- Add author_id foreign key to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL;

-- Update existing posts to have a default author (if any exists)
-- This assumes you have at least one author in the blog_authors table
-- You may need to run this after creating the first author
-- UPDATE blog_posts SET author_id = (SELECT id FROM blog_authors LIMIT 1) WHERE author_id IS NULL;

-- Update RLS policies to check author permissions
CREATE OR REPLACE POLICY "Public Access" ON blog_posts
FOR SELECT
USING (status = 'published');

-- Allow authenticated users to manage their own posts
CREATE OR REPLACE POLICY "Authenticated Users Access" ON blog_posts
FOR ALL
USING (
  auth.role() = 'authenticated' AND 
  (
    -- Users can manage their own posts
    (auth.uid() = user_id) OR
    -- Or if the post has an author_id, they can manage if they own that author
    (author_id IN (SELECT id FROM blog_authors WHERE user_id = auth.uid()))
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (
    (auth.uid() = user_id) OR
    (author_id IN (SELECT id FROM blog_authors WHERE user_id = auth.uid()))
  )
);

-- Function to get the current user's author ID
CREATE OR REPLACE FUNCTION get_user_author_id()
RETURNS UUID AS $$
DECLARE
  author_id UUID;
BEGIN
  SELECT id INTO author_id FROM blog_authors WHERE user_id = auth.uid() LIMIT 1;
  RETURN author_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default author_id to the current user's author ID when creating a new post
ALTER TABLE blog_posts ALTER COLUMN author_id SET DEFAULT get_user_author_id();
