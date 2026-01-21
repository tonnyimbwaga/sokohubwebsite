-- SQL Functions for Cloudflare Workers Performance Optimization
-- Add these functions to your Supabase database for better performance

-- 1. Optimized function to get best deals
CREATE OR REPLACE FUNCTION get_best_deals(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  sku TEXT,
  slug TEXT,
  images JSONB,
  categories JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.compare_at_price,
    p.stock,
    p.sku,
    p.slug,
    p.images,
    jsonb_build_object('name', c.name) as categories
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.compare_at_price IS NOT NULL
    AND p.compare_at_price > p.price
    AND p.stock > 0
  ORDER BY 
    CASE WHEN p.deal_order IS NOT NULL THEN p.deal_order ELSE 999999 END,
    ((p.compare_at_price - p.price) / p.compare_at_price) DESC
  LIMIT limit_count;
END;
$$;

-- 2. Batch update function for deal orders
CREATE OR REPLACE FUNCTION batch_update_deal_order(
  updates JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  update_item JSONB;
BEGIN
  FOR update_item IN SELECT * FROM jsonb_array_elements(updates)
  LOOP
    UPDATE products 
    SET deal_order = (update_item->>'deal_order')::INTEGER
    WHERE id = (update_item->>'id')::UUID;
  END LOOP;
END;
$$;

-- 3. Optimized function for trending products
CREATE OR REPLACE FUNCTION get_trending_products(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  sku TEXT,
  slug TEXT,
  images JSONB,
  categories JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.compare_at_price,
    p.stock,
    p.sku,
    p.slug,
    p.images,
    jsonb_build_object('name', c.name) as categories
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.is_trending = true
    AND p.stock > 0
  ORDER BY 
    CASE WHEN p.trending_order IS NOT NULL THEN p.trending_order ELSE 999999 END,
    p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 4. Optimized function for featured products
CREATE OR REPLACE FUNCTION get_featured_products(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  sku TEXT,
  slug TEXT,
  images JSONB,
  categories JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.compare_at_price,
    p.stock,
    p.sku,
    p.slug,
    p.images,
    jsonb_build_object('name', c.name) as categories
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.is_featured = true
    AND p.stock > 0
  ORDER BY 
    CASE WHEN p.featured_order IS NOT NULL THEN p.featured_order ELSE 999999 END,
    p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 5. Optimized function for new arrivals
CREATE OR REPLACE FUNCTION get_new_arrivals(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  sku TEXT,
  slug TEXT,
  images JSONB,
  categories JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.compare_at_price,
    p.stock,
    p.sku,
    p.slug,
    p.images,
    jsonb_build_object('name', c.name) as categories
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.stock > 0
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 6. Optimized admin dashboard stats (already exists but optimized)
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH stats AS (
    SELECT 
      (SELECT COUNT(*) FROM products WHERE status = 'active') as total_products,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
      (SELECT COUNT(*) FROM orders WHERE status = 'completed') as completed_orders,
      (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue,
      (SELECT COUNT(*) FROM products WHERE stock <= 5 AND status = 'active') as low_stock_products
  )
  SELECT jsonb_build_object(
    'total_products', total_products,
    'pending_orders', pending_orders,
    'completed_orders', completed_orders,
    'monthly_revenue', monthly_revenue,
    'low_stock_products', low_stock_products
  ) INTO result FROM stats;
  
  RETURN result;
END;
$$;

-- 7. Optimized product search function
CREATE OR REPLACE FUNCTION search_products(
  search_term TEXT,
  category_filter UUID DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  sku TEXT,
  slug TEXT,
  images JSONB,
  categories JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.compare_at_price,
    p.stock,
    p.sku,
    p.slug,
    p.images,
    jsonb_build_object('name', c.name, 'slug', c.slug) as categories
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.stock > 0
    AND (
      search_term IS NULL OR
      p.name ILIKE '%' || search_term || '%' OR
      p.description ILIKE '%' || search_term || '%' OR
      p.sku ILIKE '%' || search_term || '%'
    )
    AND (category_filter IS NULL OR p.category_id = category_filter)
  ORDER BY 
    -- Prioritize exact name matches
    CASE WHEN p.name ILIKE search_term THEN 1
         WHEN p.name ILIKE search_term || '%' THEN 2
         WHEN p.name ILIKE '%' || search_term || '%' THEN 3
         ELSE 4 END,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- 8. Optimized categories with product counts
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  product_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    COUNT(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active' AND p.stock > 0
  GROUP BY c.id, c.name, c.slug, c.description, c.image_url
  ORDER BY c.name;
END;
$$;

-- 9. Batch operations for better performance
CREATE OR REPLACE FUNCTION batch_update_product_status(
  product_ids UUID[],
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products 
  SET status = new_status
  WHERE id = ANY(product_ids);
END;
$$;

-- 10. Optimized order summary for admin
CREATE OR REPLACE FUNCTION get_order_summary(
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH order_stats AS (
    SELECT 
      COUNT(*) as total_orders,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
      COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) as total_revenue,
      COALESCE(AVG(total) FILTER (WHERE status = 'completed'), 0) as avg_order_value
    FROM orders 
    WHERE created_at::DATE BETWEEN date_from AND date_to
  )
  SELECT jsonb_build_object(
    'total_orders', total_orders,
    'pending_orders', pending_orders,
    'completed_orders', completed_orders,
    'cancelled_orders', cancelled_orders,
    'total_revenue', total_revenue,
    'avg_order_value', avg_order_value,
    'date_from', date_from,
    'date_to', date_to
  ) INTO result FROM order_stats;
  
  RETURN result;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_best_deals(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION batch_update_deal_order(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_products(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_featured_products(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_new_arrivals(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION search_products(TEXT, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_categories_with_counts() TO authenticated;
GRANT EXECUTE ON FUNCTION batch_update_product_status(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_summary(DATE, DATE) TO authenticated; 