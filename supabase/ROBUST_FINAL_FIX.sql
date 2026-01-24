-- ROBUST DATABASE & STORAGE REPAIR FOR SOKOHUB KENYA
-- This script is "idempotent" (safe to run multiple times).

-------------------------------------------------------------------------------
-- 1. CREATE HERO SLIDES TABLE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL DEFAULT '#',
    button_text TEXT NOT NULL DEFAULT 'Shop Now',
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies for the table
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read access to active slides" ON public.hero_slides;
    DROP POLICY IF EXISTS "Authenticated Manage All" ON public.hero_slides;
    
    CREATE POLICY "Allow public read access to active slides" ON public.hero_slides 
    FOR SELECT USING (active = true);
    
    CREATE POLICY "Authenticated Manage All" ON public.hero_slides 
    FOR ALL USING (auth.role() = 'authenticated');
END $$;

-------------------------------------------------------------------------------
-- 2. SETUP STORAGE BUCKETS
-------------------------------------------------------------------------------
-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('categories', 'categories', true),
  ('hero-slides', 'hero-slides', true),
  ('blog', 'blog', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Safely recreate Storage policies to avoid "already exists" errors
DO $$ 
BEGIN
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Upload Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;
    
    -- Create fresh policies
    CREATE POLICY "Public Read Access" ON storage.objects 
    FOR SELECT USING (bucket_id IN ('product-images', 'categories', 'hero-slides', 'blog'));
    
    CREATE POLICY "Authenticated Upload Access" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id IN ('product-images', 'categories', 'hero-slides', 'blog') AND auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated Update Access" ON storage.objects 
    FOR UPDATE USING (bucket_id IN ('product-images', 'categories', 'hero-slides', 'blog') AND auth.role() = 'authenticated');
    
    CREATE POLICY "Authenticated Delete Access" ON storage.objects 
    FOR DELETE USING (bucket_id IN ('product-images', 'categories', 'hero-slides', 'blog') AND auth.role() = 'authenticated');
END $$;

-------------------------------------------------------------------------------
-- 3. REPAIR IMAGE PATHS
-------------------------------------------------------------------------------
-- Clean up doubled prefix "categories/categories/..."
UPDATE public.categories 
SET image_url = REGEXP_REPLACE(image_url, '^categories/categories/', 'categories/')
WHERE image_url LIKE 'categories/categories/%';

-- Clean up doubled prefix "hero-slides/hero-slides/..."
UPDATE public.hero_slides 
SET image_url = REGEXP_REPLACE(image_url, '^hero-slides/hero-slides/', 'hero-slides/')
WHERE image_url LIKE 'hero-slides/hero-slides/%';

-- Ensure all category images start with 'categories/'
UPDATE public.categories
SET image_url = 'categories/' || image_url
WHERE image_url NOT LIKE '%/%' AND image_url IS NOT NULL AND image_url != '';

-- Ensure all hero images start with 'hero-slides/'
UPDATE public.hero_slides
SET image_url = 'hero-slides/' || image_url
WHERE image_url NOT LIKE '%/%' AND image_url IS NOT NULL AND image_url != '';
