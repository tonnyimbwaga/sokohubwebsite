-- Add missing product flag columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing products to have sensible defaults
UPDATE products 
SET 
  is_trending = CASE 
    WHEN random() < 0.3 THEN true 
    ELSE false 
  END,
  is_featured = CASE 
    WHEN random() < 0.3 THEN true 
    ELSE false 
  END,
  is_published = true
WHERE is_published IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_flags 
ON products (is_trending, is_featured, is_published);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
DROP POLICY IF EXISTS "Public can view published products" ON products;
CREATE POLICY "Public can view published products"
ON products FOR SELECT
USING (is_published = true);

-- Grant necessary permissions
GRANT SELECT ON products TO anon;
GRANT ALL ON products TO authenticated;
