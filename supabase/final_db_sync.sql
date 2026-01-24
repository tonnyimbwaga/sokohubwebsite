-- FINAL DATABASE REPAIR FOR SOKOHUB KENYA
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/rmgtdipwxieqlqkxyohv/sql)

-- 1. SYNC ORDERS TABLE WITH ADMIN PANEL REQUIREMENTS
-- The frontend expects specific top-level columns instead of nested JSON properties
DO $$ 
BEGIN 
    -- Column: customer_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
    END IF;

    -- Column: phone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='phone') THEN
        ALTER TABLE orders ADD COLUMN phone TEXT;
    END IF;

    -- Column: delivery_zone
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_zone') THEN
        ALTER TABLE orders ADD COLUMN delivery_zone TEXT;
    END IF;

    -- Column: location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='location') THEN
        ALTER TABLE orders ADD COLUMN location TEXT;
    END IF;

    -- Column: items (JSONB list of purchased products)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Column: total (Aliases to total_amount for compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
        ALTER TABLE orders ADD COLUMN total NUMERIC;
    END IF;

END $$;

-- 2. ENSURE PRODUCTS TABLE HAS ALL NEW FIELDS (Double checking)
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

-- 3. CLEAN UP OLD JUNCTION FUNCTIONS
DROP FUNCTION IF EXISTS public.update_product_categories(uuid, uuid[]);
DROP FUNCTION IF EXISTS public.update_product_categories(p_product_id uuid, p_category_ids uuid[]);
