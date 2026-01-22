-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled');
CREATE TYPE product_status AS ENUM ('draft', 'published', 'out_of_stock');

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for product images bucket
CREATE POLICY "Public Access for product-images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admin Access for product-images uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.jwt() ? 'admin_access'
);

CREATE POLICY "Admin Access for product-images updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND auth.jwt() ? 'admin_access'
)
WITH CHECK (
    bucket_id = 'product-images'
    AND auth.jwt() ? 'admin_access'
);

CREATE POLICY "Admin Access for product-images deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images'
    AND auth.jwt() ? 'admin_access'
);

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up profile triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'customer');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create tables with proper indexes and constraints
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

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= price),
    cost_price DECIMAL(10,2),
    sku TEXT,
    barcode TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    weight DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    length DECIMAL(10,2),
    status product_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_deal BOOLEAN DEFAULT false,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]'::jsonb,
    meta_title TEXT,
    meta_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_dimensions CHECK (
        (width IS NULL OR width > 0) AND
        (height IS NULL OR height > 0) AND
        (length IS NULL OR length > 0) AND
        (weight IS NULL OR weight > 0)
    )
);

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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_trending ON products(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_products_deal ON products(is_deal) WHERE is_deal = true;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON order_submissions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_submissions_updated_at
    BEFORE UPDATE ON order_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Products are viewable by everyone when published"
    ON products FOR SELECT
    USING (status = 'published');

CREATE POLICY "Products are editable by authenticated admin users"
    ON products FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone when active"
    ON categories FOR SELECT
    USING (is_active = true);

CREATE POLICY "Categories are editable by authenticated admin users"
    ON categories FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policies for blog posts
CREATE POLICY "Blog posts are viewable by everyone when published"
    ON blog_posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Blog posts are editable by authenticated admin users"
    ON blog_posts FOR ALL
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policies for order submissions
CREATE POLICY "Orders can be created by anyone"
    ON order_submissions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Orders are viewable by authenticated admin users"
    ON order_submissions FOR SELECT
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Orders are editable by authenticated admin users"
    ON order_submissions FOR UPDATE
    USING (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND (
            NEW.role = OLD.role  -- Prevent users from changing their own role
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        )
    );

-- Create function for full-text search with pagination
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
