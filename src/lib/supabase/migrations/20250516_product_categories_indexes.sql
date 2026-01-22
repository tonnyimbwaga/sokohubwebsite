-- Add additional indexes to improve query performance for product categories

-- Index for faster lookups of products by category
CREATE INDEX IF NOT EXISTS idx_product_categories_category_products 
ON product_categories(category_id, product_id);

-- Index for faster filtering of published products within categories
CREATE INDEX IF NOT EXISTS idx_products_is_published 
ON products(is_published) 
WHERE is_published = true;

-- Index for faster text search on product names
CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(to_tsvector('english', name));

-- Add a function to get all products with their categories
CREATE OR REPLACE FUNCTION get_products_with_categories()
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_slug TEXT,
    category_ids UUID[],
    category_names TEXT[],
    category_slugs TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.slug AS product_slug,
        ARRAY_AGG(c.id) AS category_ids,
        ARRAY_AGG(c.name) AS category_names,
        ARRAY_AGG(c.slug) AS category_slugs
    FROM 
        products p
    JOIN 
        product_categories pc ON p.id = pc.product_id
    JOIN 
        categories c ON pc.category_id = c.id
    WHERE 
        p.is_published = true AND c.is_active = true
    GROUP BY 
        p.id, p.name, p.slug;
END;
$$ LANGUAGE plpgsql;
