-- Migration to add is_deal column to products table
-- To be run in Supabase SQL editor

-- Add is_deal column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_deal') THEN
        ALTER TABLE products ADD COLUMN is_deal BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_products_deal ON products(is_deal) WHERE is_deal = true;
