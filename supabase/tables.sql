-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types to ensure clean slate
DO $$ BEGIN
    DROP TYPE IF EXISTS product_status CASCADE;
    DROP TYPE IF EXISTS order_status CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS post_status CASCADE;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create enum types
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create categories table first (no foreign key dependencies)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create products table (depends on categories)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    sku TEXT UNIQUE,
    weight DECIMAL(10,2),
    dimensions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create product_images table (depends on products)
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    width INTEGER CHECK (width > 0),
    height INTEGER CHECK (height > 0),
    size INTEGER CHECK (size > 0),
    format TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    featured_image TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the function for updating timestamps first
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating updated_at columns
DO $$ BEGIN
    CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_product_images_updated_at
        BEFORE UPDATE ON product_images
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_blog_posts_updated_at
        BEFORE UPDATE ON blog_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_blog_categories_updated_at
        BEFORE UPDATE ON blog_categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DO $$ BEGIN
    DROP POLICY IF EXISTS "Enable read access for all users" ON products;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON products;
    DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON categories;
    DROP POLICY IF EXISTS "Enable read access for all users" ON product_images;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON product_images;
    DROP POLICY IF EXISTS "Blog posts are viewable by everyone when published" ON blog_posts;
    DROP POLICY IF EXISTS "Blog posts are editable by authenticated admin users" ON blog_posts;
    DROP POLICY IF EXISTS "Enable read access for all users" ON blog_categories;
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON blog_categories;
END $$;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON products 
    FOR SELECT USING (status = 'active');

CREATE POLICY "Enable all access for authenticated users" ON products 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON categories 
    FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Enable all access for authenticated users" ON categories 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON product_images 
    FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Enable all access for authenticated users" ON product_images 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Blog posts are viewable by everyone when published" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Blog posts are editable by authenticated admin users" ON blog_posts
    FOR ALL USING (auth.role() = 'authenticated' AND auth.jwt() ? 'admin_access');

CREATE POLICY "Enable read access for all users" ON blog_categories 
    FOR SELECT TO PUBLIC USING (true);

CREATE POLICY "Enable all access for authenticated users" ON blog_categories 
    FOR ALL USING (auth.role() = 'authenticated');
