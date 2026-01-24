-- COMPREHENSIVE DATABASE FIX FOR SOKOHUB KENYA
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/rmgtdipwxieqlqkxyohv/sql)

-- 1. FIX FOR PRODUCTS TABLE
DO $$ 
BEGIN 
    -- Column: is_deal (Boolean flag for best deals)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_deal') THEN
        ALTER TABLE products ADD COLUMN is_deal BOOLEAN DEFAULT false;
    END IF;

    -- Column: sizes (JSONB list of available sizes with prices)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sizes') THEN
        ALTER TABLE products ADD COLUMN sizes JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Column: tags (JSONB or TEXT ARRAY - using JSONB for frontend compatibility)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='tags') THEN
        ALTER TABLE products ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Standardize feature/trending columns if they are named differently
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_featured') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured') THEN
            ALTER TABLE products RENAME COLUMN featured TO is_featured;
        ELSE
            ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
        END IF;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_trending') THEN
        ALTER TABLE products ADD COLUMN is_trending BOOLEAN DEFAULT false;
    END IF;

    -- Standardize stock column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='stock_quantity') THEN
            ALTER TABLE products RENAME COLUMN stock_quantity TO stock;
        ELSE
            ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
        END IF;
    END IF;

    -- Support custom display ordering
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='deal_order') THEN
        ALTER TABLE products ADD COLUMN deal_order INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured_order') THEN
        ALTER TABLE products ADD COLUMN featured_order INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='trending_order') THEN
        ALTER TABLE products ADD COLUMN trending_order INTEGER;
    END IF;
    
    -- Ensure is_published exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_published') THEN
        ALTER TABLE products ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;

END $$;

-- 2. FIX FOR ORDERS TABLE
DO $$ 
BEGIN 
    -- Add missing columns required by the Admin Panel
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='is_immediate_payment') THEN
        ALTER TABLE orders ADD COLUMN is_immediate_payment BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_percentage') THEN
        ALTER TABLE orders ADD COLUMN discount_percentage NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='original_amount') THEN
        ALTER TABLE orders ADD COLUMN original_amount NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discounted_amount') THEN
        ALTER TABLE orders ADD COLUMN discounted_amount NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_confirmed') THEN
        ALTER TABLE orders ADD COLUMN order_confirmed BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;

END $$;

-- 3. ENSURE RELEVANT INDEXES EXIST
CREATE INDEX IF NOT EXISTS idx_products_deal_final ON products(is_deal) WHERE is_deal = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_final ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_trending_final ON products(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_slug_final ON products(slug);

-- 4. ENSURE JUNCTION TABLE EXISTS
CREATE TABLE IF NOT EXISTS product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);
