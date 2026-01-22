-- Database Setup Script for Sokohub Kenya
-- Run this script in the Supabase SQL Editor to initialize your database.

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Create Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'published', 'out_of_stock', 'active'); -- 'active' added as it is used in SQL functions
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tables

-- PROFILES (Linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES categories(id),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC NOT NULL,
    compare_at_price NUMERIC,
    cost_price NUMERIC,
    sku TEXT,
    barcode TEXT,
    stock INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active', -- syncing with SQL functions which check status='active'
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    trending_order INTEGER,
    featured_order INTEGER,
    deal_order INTEGER,
    category_id UUID REFERENCES categories(id),
    images JSONB DEFAULT '[]'::jsonb, -- Using JSONB for array of strings as per Supabase pattern or text array
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCT_CATEGORIES (Junction table if needed by code)
CREATE TABLE IF NOT EXISTS product_categories (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    customer_email TEXT NOT NULL,
    status order_status DEFAULT 'pending',
    total_amount NUMERIC NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    payment_status TEXT DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    metadata JSONB
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    excerpt TEXT,
    featured_image TEXT,
    is_published BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published', 
    author_id UUID REFERENCES profiles(id),
    tags TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)

-- Profiles: Users can view/edit their own, Admins can view all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products & Categories: Public read, Admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins all products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins all categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: Users view own, Admins view all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Triggers

-- Handle New User (Auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (new.id, new.email, 'customer', new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Install Optimized Functions (from your codebase)

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
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue,
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
      COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0) as total_revenue,
      COALESCE(AVG(total_amount) FILTER (WHERE status = 'completed'), 0) as avg_order_value
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
