-- SQL REPAIR SCRIPT FOR SOKOHUB IMAGE PATHS
-- This script fixes redundant prefixes created by previous buggy admin forms.

-- 1. FIX PRODUCTS TABLE (images column is JSONB array of objects)
-- We need to iterate through the images array and fix web_image_url and feed_image_url
DO $$
DECLARE
    prod_row RECORD;
    img_json JSONB;
    new_images JSONB;
    img RECORD;
BEGIN
    FOR prod_row IN SELECT id, images FROM public.products WHERE images IS NOT NULL AND jsonb_array_length(images) > 0 LOOP
        new_images := '[]'::jsonb;
        FOR img_json IN SELECT * FROM jsonb_array_elements(prod_row.images) LOOP
            -- Fix web_image_url
            IF img_json ? 'web_image_url' AND img_json->>'web_image_url' LIKE 'product-images/product-images/%' THEN
                img_json := jsonb_set(img_json, '{web_image_url}', to_jsonb(REGEXP_REPLACE(img_json->>'web_image_url', '^product-images/product-images/', 'product-images/')));
            END IF;
            
            -- Fix feed_image_url
            IF img_json ? 'feed_image_url' AND img_json->>'feed_image_url' LIKE 'product-images/product-images/%' THEN
                img_json := jsonb_set(img_json, '{feed_image_url}', to_jsonb(REGEXP_REPLACE(img_json->>'feed_image_url', '^product-images/product-images/', 'product-images/')));
            END IF;
            
            new_images := new_images || img_json;
        END LOOP;
        
        UPDATE public.products SET images = new_images WHERE id = prod_row.id;
    END LOOP;
END $$;

-- 2. FIX CATEGORIES TABLE
UPDATE public.categories 
SET image_url = REGEXP_REPLACE(image_url, '^categories/categories/', 'categories/')
WHERE image_url LIKE 'categories/categories/%';

-- Ensure all category paths start with 'categories/'
UPDATE public.categories
SET image_url = 'categories/' || image_url
WHERE image_url NOT LIKE '%/%' AND image_url IS NOT NULL AND image_url != '';

-- 3. FIX HERO SLIDES TABLE
UPDATE public.hero_slides 
SET image_url = REGEXP_REPLACE(image_url, '^hero-slides/hero-slides/', 'hero-slides/')
WHERE image_url LIKE 'hero-slides/hero-slides/%';

-- Ensure all hero slide paths start with 'hero-slides/'
UPDATE public.hero_slides
SET image_url = 'hero-slides/' || image_url
WHERE image_url NOT LIKE '%/%' AND image_url IS NOT NULL AND image_url != '';

-- 4. FIX BLOG POSTS TABLE
UPDATE public.blog_posts
SET featured_image = REGEXP_REPLACE(featured_image, '^blog/blog/', 'blog/')
WHERE featured_image LIKE 'blog/blog/%';

-- Ensure all blog paths start with 'blog/'
UPDATE public.blog_posts
SET featured_image = 'blog/' || featured_image
WHERE featured_image NOT LIKE '%/%' AND featured_image IS NOT NULL AND featured_image != '';
