-- Create blog_authors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Enable read access for all users"
  ON public.blog_authors
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Enable all for authenticated users"
  ON public.blog_authors
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_authors_updated_at
BEFORE UPDATE ON public.blog_authors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
