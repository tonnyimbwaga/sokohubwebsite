-- Create the blog_posts_categories junction table
CREATE TABLE IF NOT EXISTS blog_posts_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, category_id)
);

-- Add RLS policies for blog_posts_categories
ALTER TABLE blog_posts_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to blog_posts_categories
CREATE POLICY "Allow public read access to blog_posts_categories"
  ON blog_posts_categories
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to manage their own blog post categories
CREATE POLICY "Allow authenticated users to manage their own blog post categories"
  ON blog_posts_categories
  FOR ALL
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM blog_posts WHERE author_id = auth.uid()
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT id FROM blog_posts WHERE author_id = auth.uid()
    )
  );
