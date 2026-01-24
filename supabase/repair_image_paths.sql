-- IMAGE PATH REPAIR FOR SOKOHUB KENYA
-- Run this in the Supabase SQL Editor if your category or hero images are still broken.

-- 1. FIX CATEGORY IMAGES
UPDATE public.categories 
SET image_url = REGEXP_REPLACE(image_url, '^categories/categories/', 'categories/')
WHERE image_url LIKE 'categories/categories/%';

-- 2. FIX HERO SLIDES
UPDATE public.hero_slides 
SET image_url = REGEXP_REPLACE(image_url, '^hero-slides/hero-slides/', 'hero-slides/')
WHERE image_url LIKE 'hero-slides/hero-slides/%';

-- 3. ENSURE ALL PATHS START WITH BUCKET NAME
-- (If they don't, they will be broken after my fix)
UPDATE public.categories
SET image_url = 'categories/' || image_url
WHERE image_url NOT LIKE '%/%' AND image_url IS NOT NULL AND image_url != '';

UPDATE public.hero_slides
SET image_url = 'hero-slides/' || image_url
WHERE image_url NOT LIKE '%/%' AND image_url IS NOT NULL AND image_url != '';
