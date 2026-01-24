-- DEFINITIVE DATABASE REPAIR SCRIPT FOR SOKOHUB KENYA
-- Run this ONCE in the Supabase SQL Editor: https://supabase.com/dashboard/project/rmgtdipwxieqlqkxyohv/sql

-- 1. ENSURE JUNCTION TABLE EXISTS
-- This table is required for products to belong to multiple categories.
CREATE TABLE IF NOT EXISTS public.product_categories (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 2. CREATE THE CATEGORY UPDATE FUNCTION (RPC)
-- This fixes the error: "Could not find the function public.update_product_categories"
CREATE OR REPLACE FUNCTION public.update_product_categories(p_product_id UUID, p_category_ids UUID[])
RETURNS VOID AS $$
BEGIN
  -- Clear existing categories for this product
  DELETE FROM public.product_categories
  WHERE product_id = p_product_id;

  -- Insert new categories if any were provided
  IF p_category_ids IS NOT NULL AND ARRAY_LENGTH(p_category_ids, 1) > 0 THEN
    INSERT INTO public.product_categories (product_id, category_id)
    SELECT p_product_id, UNNEST(p_category_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.update_product_categories(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_categories(UUID, UUID[]) TO service_role;

-- 3. SYNC PRODUCTS TABLE
-- Ensuring all columns expected by the frontend exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_deal') THEN
        ALTER TABLE products ADD COLUMN is_deal BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sizes') THEN
        ALTER TABLE products ADD COLUMN sizes JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
        ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. SYNC ORDERS TABLE
-- This fixes potential 400 errors in the Admin Orders panel
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='phone') THEN
        ALTER TABLE orders ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_zone') THEN
        ALTER TABLE orders ADD COLUMN delivery_zone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='location') THEN
        ALTER TABLE orders ADD COLUMN location TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
        ALTER TABLE orders ADD COLUMN total NUMERIC;
    END IF;
END $$;
