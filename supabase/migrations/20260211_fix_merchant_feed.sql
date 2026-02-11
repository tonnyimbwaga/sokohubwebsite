-- FIX FOR GOOGLE MERCHANT CENTER FEED
-- Run this in your Supabase SQL Editor

-- 1. Add missing google_product_category column to products
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='google_product_category') THEN
        ALTER TABLE products ADD COLUMN google_product_category TEXT;
    END IF;
END $$;

-- 2. Ensure product_image_versions table exists (used for optimized feed images)
CREATE TABLE IF NOT EXISTS public.product_image_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    web_image_url TEXT NOT NULL,
    feed_image_url TEXT NOT NULL,
    web_optimized_image_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, web_image_url)
);

-- 3. Set up RLS for product_image_versions
ALTER TABLE public.product_image_versions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read product image versions') THEN
        CREATE POLICY "Public read product image versions" ON public.product_image_versions FOR SELECT USING (true);
    END IF;
END $$;

-- 4. Grant permissions
GRANT SELECT ON public.product_image_versions TO anon, authenticated;
