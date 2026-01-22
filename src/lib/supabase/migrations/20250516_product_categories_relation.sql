-- Create a junction table for the many-to-many relationship between products and categories
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(product_id, category_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);

-- Migrate existing data: Copy current category_id relationships to the junction table
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id FROM products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Add RLS policies for the new table
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for product_categories" 
ON product_categories FOR SELECT 
TO authenticated, anon
USING (true);

-- Allow admin write access
CREATE POLICY "Allow admin write access for product_categories" 
ON product_categories FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
  )
);

-- Create a function to get all categories for a product
CREATE OR REPLACE FUNCTION get_product_categories(product_id UUID)
RETURNS TABLE (
    category_id UUID,
    name TEXT,
    slug TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.slug
    FROM categories c
    JOIN product_categories pc ON c.id = pc.category_id
    WHERE pc.product_id = $1 AND c.is_active = true
    ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Note: We're not removing the category_id column from products yet to ensure backward compatibility
-- This can be done in a future migration after the application is updated
