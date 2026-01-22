-- Enable Row Level Security on blog_categories if not already enabled.
-- This command is idempotent; it will only enable RLS if it's not already.
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Drop the policy if it already exists to ensure this script is re-runnable
-- during development if needed. In a production migration, you might omit this
-- or use more sophisticated migration management.
DROP POLICY IF EXISTS "Allow public read access to blog categories" ON public.blog_categories;

-- Create a policy to allow public read access to all blog categories.
-- This is necessary for joins from publicly accessible blog_posts.
CREATE POLICY "Allow public read access to blog categories"
  ON public.blog_categories
  FOR SELECT
  TO public  -- 'public' role grants access to all, including anonymous and authenticated users.
  USING (true);
