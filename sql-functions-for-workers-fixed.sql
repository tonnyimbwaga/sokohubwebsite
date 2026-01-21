-- SQL Functions for Cloudflare Workers Performance Optimization
-- Fixed version that drops existing functions first to avoid conflicts

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_best_deals(INTEGER);
DROP FUNCTION IF EXISTS batch_update_deal_order(JSONB);
DROP FUNCTION IF EXISTS get_trending_products(INTEGER);
DROP FUNCTION IF EXISTS get_featured_products(INTEGER);
DROP FUNCTION IF EXISTS get_new_arrivals(INTEGER);
DROP FUNCTION IF EXISTS get_admin_dashboard_stats();
DROP FUNCTION IF EXISTS search_products(TEXT, TEXT, NUMERIC, NUMERIC, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_categories_with_counts();
DROP FUNCTION IF EXISTS batch_update_product_status(UUID[], TEXT);
DROP FUNCTION IF EXISTS get_order_summary(DATE, DATE);

-- 1. Optimized function to get best deals
CREATE OR REPLACE FUNCTION get_best_deals(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  status TEXT,
  is_featured BOOLEAN,
  sku TEXT,
  slug TEXT,
  category_id UUID,
  images JSONB,
  category_name TEXT,
  category_slug TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.compare_at_price,
    p.stock,
    p.status,
    p.is_featured,
    p.sku,
    p.slug,
    p.category_id,
    p.images,
    c.name as category_name,
    c.slug as category_slug
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
  description TEXT,
  price NUMERIC,
  stock INTEGER,
  status TEXT,
  is_featured BOOLEAN,
  is_trending BOOLEAN,
  trending_order INTEGER,
  sku TEXT,
  slug TEXT,
  category_id UUID,
  images JSONB,
  category_name TEXT,
  category_slug TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.status,
    p.is_featured,
    p.is_trending,
    p.trending_order,
    p.sku,
    p.slug,
    p.category_id,
    p.images,
    c.name as category_name,
    c.slug as category_slug
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
  description TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  status TEXT,
  is_featured BOOLEAN,
  featured_order INTEGER,
  sku TEXT,
  slug TEXT,
  category_id UUID,
  images JSONB,
  category_name TEXT,
  category_slug TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.compare_at_price,
    p.stock,
    p.status,
    p.is_featured,
    p.featured_order,
    p.sku,
    p.slug,
    p.category_id,
    p.images,
    c.name as category_name,
    c.slug as category_slug
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
  description TEXT,
  price NUMERIC,
  stock INTEGER,
  status TEXT,
  is_featured BOOLEAN,
  sku TEXT,
  slug TEXT,
  category_id UUID,
  images JSONB,
  category_name TEXT,
  category_slug TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.status,
    p.is_featured,
    p.sku,
    p.slug,
    p.category_id,
    p.images,
    c.name as category_name,
    c.slug as category_slug
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.stock > 0
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- 6. Optimized admin dashboard stats
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

-- 7. Optimized search function with ranking
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT DEFAULT '',
  category_filter TEXT DEFAULT '',
  min_price NUMERIC DEFAULT 0,
  max_price NUMERIC DEFAULT 999999,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  compare_at_price NUMERIC,
  stock INTEGER,
  sku TEXT,
  slug TEXT,
  images JSONB,
  category_name TEXT,
  category_slug TEXT,
  search_rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.compare_at_price,
    p.stock,
    p.sku,
    p.slug,
    p.images,
    c.name as category_name,
    c.slug as category_slug,
    CASE 
      WHEN search_query = '' THEN 1.0
      ELSE ts_rank(
        to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
        plainto_tsquery('english', search_query)
      )
    END as search_rank
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'active'
    AND p.stock > 0
    AND p.price >= min_price
    AND p.price <= max_price
    AND (category_filter = '' OR c.slug = category_filter)
    AND (
      search_query = '' OR
      to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY search_rank DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- 8. Get categories with product counts
CREATE OR REPLACE FUNCTION get_categories_with_counts()
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
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
    COUNT(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
  GROUP BY c.id, c.name, c.slug, c.description
  ORDER BY product_count DESC, c.name;
END;
$$;

-- 9. Batch update product status
CREATE OR REPLACE FUNCTION batch_update_product_status(
  product_ids UUID[],
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products 
  SET status = new_status, updated_at = NOW()
  WHERE id = ANY(product_ids);
END;
$$;

-- 10. Get order summary for analytics
CREATE OR REPLACE FUNCTION get_order_summary(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
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
      COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
      COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
      COALESCE(SUM(total) FILTER (WHERE status = 'completed'), 0) as total_revenue,
      COALESCE(AVG(total) FILTER (WHERE status = 'completed'), 0) as avg_order_value
    FROM orders
    WHERE created_at::date BETWEEN start_date AND end_date
  )
  SELECT jsonb_build_object(
    'total_orders', total_orders,
    'completed_orders', completed_orders,
    'pending_orders', pending_orders,
    'cancelled_orders', cancelled_orders,
    'total_revenue', total_revenue,
    'avg_order_value', avg_order_value,
    'period_start', start_date,
    'period_end', end_date
  ) INTO result FROM order_stats;
  
  RETURN result;
END;
$$; 