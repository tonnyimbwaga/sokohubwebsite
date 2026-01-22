-- Add order fields to products table for trending, featured, and deals
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS trending_order integer,
  ADD COLUMN IF NOT EXISTS featured_order integer,
  ADD COLUMN IF NOT EXISTS deal_order integer;

-- Create indexes for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_products_trending_order ON public.products (trending_order) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON public.products (featured_order) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_deal_order ON public.products (deal_order) WHERE is_deal = true;

-- Update existing products to have sequential order values
-- This ensures existing products have valid order values before we implement the drag-and-drop functionality

-- Trending products
WITH ranked_trending AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM public.products
  WHERE is_trending = true
)
UPDATE public.products p
SET trending_order = r.row_num
FROM ranked_trending r
WHERE p.id = r.id;

-- Featured products
WITH ranked_featured AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM public.products
  WHERE is_featured = true
)
UPDATE public.products p
SET featured_order = r.row_num
FROM ranked_featured r
WHERE p.id = r.id;

-- Deal products
WITH ranked_deals AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM public.products
  WHERE is_deal = true
)
UPDATE public.products p
SET deal_order = r.row_num
FROM ranked_deals r
WHERE p.id = r.id;
