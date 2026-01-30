-- Add colors and options columns to products table if they don't exist

DO $$ 
BEGIN
    -- Add colors column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
        ALTER TABLE products ADD COLUMN colors TEXT[];
    END IF;

    -- Add options column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'options') THEN
        ALTER TABLE products ADD COLUMN options JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
