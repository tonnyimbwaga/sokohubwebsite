-- ==========================================
-- Plug and Play Ecommerce Template Setup
-- ==========================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Create Custom Types
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
    CREATE TYPE product_status AS ENUM ('draft', 'published', 'out_of_stock');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Linked to Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= price),
    cost_price DECIMAL(10,2),
    sku TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_deal BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Order Submissions
CREATE TABLE IF NOT EXISTS order_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_location TEXT NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Functions & Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_order_submissions_updated_at BEFORE UPDATE ON order_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Profile Sync
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 9. Search Function
CREATE OR REPLACE FUNCTION search_products(
    search_query TEXT,
    page_number INTEGER DEFAULT 1,
    items_per_page INTEGER DEFAULT 12
)
RETURNS TABLE (
    items JSON,
    total_count BIGINT
) AS $$
DECLARE
    offset_val INTEGER;
BEGIN
    offset_val := (page_number - 1) * items_per_page;
    
    RETURN QUERY
    WITH search_results AS (
        SELECT 
            p.*,
            ts_rank(
                to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')),
                plainto_tsquery('english', search_query)
            ) as rank
        FROM products p
        WHERE 
            p.status = 'published'
            AND (
                to_tsvector('english', p.name || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('english', search_query)
                OR p.name ILIKE '%' || search_query || '%'
                OR p.description ILIKE '%' || search_query || '%'
            )
    )
    SELECT 
        json_agg(
            json_build_object(
                'id', sr.id,
                'name', sr.name,
                'slug', sr.slug,
                'description', sr.description,
                'price', sr.price,
                'images', sr.images,
                'status', sr.status,
                'created_at', sr.created_at
            )
        ) as items,
        COUNT(*) OVER() as total_count
    FROM search_results sr
    ORDER BY sr.rank DESC, sr.name ASC
    LIMIT items_per_page
    OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Product Policies
DROP POLICY IF EXISTS "Public access for published products" ON products;
CREATE POLICY "Public access for published products" ON products FOR SELECT USING (is_published = true AND status = 'published');

-- Category Policies
DROP POLICY IF EXISTS "Public access for active categories" ON categories;
CREATE POLICY "Public access for active categories" ON categories FOR SELECT USING (is_active = true);

-- Order Policies
DROP POLICY IF EXISTS "Anyone can submit orders" ON order_submissions;
CREATE POLICY "Anyone can submit orders" ON order_submissions FOR INSERT WITH CHECK (true);

-- Admin Policies (Example - Requires 'admin' role in profiles)
DROP POLICY IF EXISTS "Admins have full access to products" ON products;
CREATE POLICY "Admins have full access to products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 11. Storage Setup
-- Note: Buckets can only be created via API/Console or special SQL in some environments.
-- However, this is the standard SQL for it.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access for product-images" ON storage.objects;
CREATE POLICY "Public Access for product-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
