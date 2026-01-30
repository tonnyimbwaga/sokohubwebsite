-- Migration to convert colors column from TEXT[] to JSONB
-- This allows for interactive color variants with labels, availability, and optional pricing.

DO $$ 
BEGIN
    -- Check if it's already JSONB
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') = 'text[]' THEN
        
        -- Create a temporary column
        ALTER TABLE products ADD COLUMN colors_jsonb JSONB DEFAULT '[]'::jsonb;

        -- Migrate existing data
        UPDATE products 
        SET colors_jsonb = (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'label', color,
                    'value', color,
                    'available', true,
                    'price', 0
                )
            )
            FROM unnest(colors) AS color
        )
        WHERE colors IS NOT NULL AND array_length(colors, 1) > 0;

        -- Swap columns
        ALTER TABLE products DROP COLUMN colors;
        ALTER TABLE products RENAME COLUMN colors_jsonb TO colors;
        
        RAISE NOTICE 'Successfully migrated colors to JSONB format.';
    ELSE
        -- If it doesn't exist, just create it as JSONB
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'colors') THEN
            ALTER TABLE products ADD COLUMN colors JSONB DEFAULT '[]'::jsonb;
            RAISE NOTICE 'Created colors column as JSONB.';
        END IF;
    END IF;
END $$;
