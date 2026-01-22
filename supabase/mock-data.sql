-- Delete existing data first (respecting potential FKs)
DELETE FROM order_items; 
DELETE FROM orders; 
DELETE FROM product_images; 
DELETE FROM blog_posts_categories; 
DELETE FROM blog_posts; 
DELETE FROM products; 
DELETE FROM profiles; 
DELETE FROM order_submissions; 
DELETE FROM blog_categories;
DELETE FROM categories; 
DELETE FROM settings;

-- Insert categories (matching actual schema)
INSERT INTO categories (name, slug, description, image_url, meta_title, meta_description, is_active, parent_id) VALUES
('Skates', 'skates', 'High-quality skates for kids of all ages', '/images/categories/skates.jpg', 'Kids Skates | Toto Toys & Fun', 'Find the best skates for kids.', true, NULL),
('Tricycles', 'tricycles', 'Safe and fun tricycles for toddlers', '/images/categories/tricycles.jpg', 'Kids Tricycles | Toto Toys & Fun', 'Safe tricycles for toddlers.', true, NULL),
('Bicycles', 'bicycles', 'Quality bikes for kids of all ages', '/images/categories/bicycles.jpg', 'Kids Bicycles | Toto Toys & Fun', 'Bikes for every age.', true, NULL),
('Scooters', 'scooters', 'Fun and safe scooters for kids', '/images/categories/scooters.jpg', 'Kids Scooters | Toto Toys & Fun', 'Explore our fun scooters.', true, NULL),
('Toys', 'toys', 'Educational and fun toys for children', '/images/categories/toys.jpg', 'Educational Toys | Toto Toys & Fun', 'Toys that educate and entertain.', true, NULL),
('Games', 'games', 'Engaging games for all ages', '/images/categories/games.jpg', 'Family Games | Toto Toys & Fun', 'Fun games for the whole family.', true, NULL),
('Other', 'other', 'More amazing products for kids', '/images/categories/other.jpg', 'Other Kids Products | Toto Toys & Fun', 'More fun items.', true, NULL)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    is_active = EXCLUDED.is_active,
    parent_id = EXCLUDED.parent_id,
    updated_at = now();

-- Insert mock products (matching actual schema)
WITH product_data AS (
    SELECT
        n, 
        CASE (n % 7)
            WHEN 0 THEN 'Pro Adjustable Skates' WHEN 1 THEN 'Kids Safety Tricycle'
            WHEN 2 THEN 'Mountain Explorer Bike' WHEN 3 THEN 'Lightning Scooter'
            WHEN 4 THEN 'Educational Building Set' WHEN 5 THEN 'Family Board Game'
            WHEN 6 THEN 'Creative Art Kit'
        END || ' ' || n as name,
        CASE (n % 7)
            WHEN 0 THEN 'pro-adjustable-skates' WHEN 1 THEN 'kids-safety-tricycle'
            WHEN 2 THEN 'mountain-explorer-bike' WHEN 3 THEN 'lightning-scooter'
            WHEN 4 THEN 'educational-building-set' WHEN 5 THEN 'family-board-game'
            WHEN 6 THEN 'creative-art-kit'
        END || '-' || n as slug,
        CASE (n % 7)
            WHEN 0 THEN 'Professional adjustable skates with safety features.'
            WHEN 1 THEN 'Safe and sturdy tricycle perfect for toddlers.'
            WHEN 2 THEN 'Durable mountain bike for adventurous kids.'
            WHEN 3 THEN 'Fast and safe scooter with LED wheels.'
            WHEN 4 THEN 'Educational STEM building set for learning.'
            WHEN 5 THEN 'Fun family board game for all ages.'
            WHEN 6 THEN 'Complete art supply kit for creative kids.'
        END as description,
        -- Price: numeric, non-nullable
        (random() * 50 + 10)::numeric(10,2) as price,
        -- Stock: integer, non-nullable, default 0
        (random() * 100 + 1)::int as stock,
         -- Status: product_status enum, nullable, default 'draft'
        (ARRAY['draft', 'active', 'archived'])[floor(random() * 3 + 1)]::product_status as status,
         -- Booleans: nullable, default false
        CASE WHEN random() < 0.2 THEN true ELSE false END as is_featured,
        CASE WHEN random() < 0.2 THEN true ELSE false END as is_trending,
        CASE WHEN random() < 0.2 THEN true ELSE false END as is_deal,
        -- Category slug for joining
        CASE (n % 7)
            WHEN 0 THEN 'skates' WHEN 1 THEN 'tricycles' WHEN 2 THEN 'bicycles'
            WHEN 3 THEN 'scooters' WHEN 4 THEN 'toys' WHEN 5 THEN 'games'
            WHEN 6 THEN 'other'
        END as category_slug,
        'TOT-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) as sku,
        '["https://source.unsplash.com/800x600/?' || CASE (n % 7)
            WHEN 0 THEN 'skates' WHEN 1 THEN 'tricycle'
            WHEN 2 THEN 'bike' WHEN 3 THEN 'scooter'
            WHEN 4 THEN 'building-blocks' WHEN 5 THEN 'board-game'
            WHEN 6 THEN 'art-supplies'
        END || '"]' as images
    FROM generate_series(1, 35) n
)
INSERT INTO products (
    name, slug, description, price, 
    compare_at_price, cost_price, 
    sku, barcode, 
    stock, 
    weight, width, height, length, 
    status, is_featured, is_trending, is_deal, 
    category_id, images, 
    meta_title, meta_description, seo_keywords 
    -- created_at, updated_at have defaults
)
SELECT
    pd.name, pd.slug, pd.description, pd.price,
    -- Compare at price: numeric, nullable. Ensure > price if set.
    CASE WHEN random() < 0.3
        THEN pd.price + (random() * 10 + 5)::numeric(10,2) -- Always higher than price
        ELSE NULL
    END as compare_at_price,
    -- Cost price: numeric, nullable. Should be < price.
    CASE WHEN random() < 0.8
        THEN (pd.price * (0.5 + random() * 0.2))::numeric(10,2) -- 50-70% of price
        ELSE NULL
    END as cost_price,
    -- SKU, Barcode: text, nullable
    pd.sku,
    'BAR-' || pd.category_slug || '-' || pd.n as barcode,
    pd.stock,
    -- Weight, Dimensions: numeric, nullable
    (random() * 5 + 0.5)::numeric(5,1) as weight, -- kg
    (random() * 50 + 10)::numeric(5,1) as width,  -- cm
    (random() * 40 + 10)::numeric(5,1) as height, -- cm
    (random() * 60 + 15)::numeric(5,1) as length, -- cm
    pd.status, pd.is_featured, pd.is_trending, pd.is_deal,
    c.id as category_id, -- Join to get the correct UUID
    pd.images,
    -- Meta Title, Description, Keywords: text/array, nullable
    pd.name || ' | Toto Toys & Fun' as meta_title,
    'Buy ' || pd.name || ' online at Toto Toys & Fun. ' || pd.description as meta_description,
    ARRAY['toys', 'kids', pd.category_slug, lower(regexp_replace(pd.name, '[^a-zA-Z0-9]+', '-', 'g'))] as seo_keywords
FROM product_data pd
JOIN categories c ON c.slug = pd.category_slug;

-- Insert mock blog categories (Actual Schema)
INSERT INTO blog_categories (name, slug, description) VALUES
('News', 'news', 'Latest updates and news about our products'),
('Guides', 'guides', 'Helpful guides and tutorials'),
('Reviews', 'reviews', 'Product reviews and recommendations')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = now();

-- Insert mock blog posts (Actual Schema)
-- NOTE: Requires a user to exist in auth.users to set author_id.
--       If no users exist, this will fail or insert NULL depending on FK constraint.
--       Assuming an admin user might exist or FK allows NULL for now.
WITH blog_data AS (
    SELECT
        n,
        CASE (n % 3)
            WHEN 0 THEN 'New Collection Launch: ' || date_trunc('month', NOW() - (n || ' months')::interval)::date
            WHEN 1 THEN 'Top ' || (n + 3) || ' Toys for Summer Fun'
            WHEN 2 THEN 'Guide: Choosing the Perfect Gift for Kids Age ' || (n + 3)
        END as title,
        CASE (n % 3)
            WHEN 0 THEN 'new-collection-' || to_char(date_trunc('month', NOW() - (n || ' months')::interval), 'YYYY-MM')
            WHEN 1 THEN 'top-' || (n + 3) || '-toys-summer-fun'
            WHEN 2 THEN 'guide-choosing-perfect-gift-kids-age-' || (n + 3)
        END as slug,
        CASE (n % 3)
            WHEN 0 THEN 'We are excited to announce our latest collection for the season. Featuring amazing new toys and games that your kids will love.'
            WHEN 1 THEN 'Summer is here! Check out our top picks for outdoor fun and entertainment that will keep your kids active and engaged.'
            WHEN 2 THEN 'Finding the perfect gift can be challenging. Here''s our comprehensive guide to help you choose the best toys for different age groups.'
        END as content,
        CASE (n % 3)
            WHEN 0 THEN 'Discover our exciting new collection of toys and games for this season.'
            WHEN 1 THEN 'Find the perfect outdoor toys for summer entertainment.'
            WHEN 2 THEN 'Expert tips on choosing age-appropriate gifts for children.'
        END as excerpt,
        'https://picsum.photos/800/400?random=' || n as featured_image,
        (ARRAY['draft', 'published', 'archived'])[floor(random() * 3 + 1)]::post_status as status,
        CASE WHEN random() < 0.5 THEN now() - (random() * 30)::int * '1 day'::interval ELSE NULL END as published_at,
        jsonb_build_object(
            'meta_title', CASE (n % 3)
                            WHEN 0 THEN 'New Toy Collection ' || date_trunc('month', NOW() - (n || ' months')::interval)::date || ' | Toto Toys & Fun Blog'
                            WHEN 1 THEN 'Best Summer Toys Guide | Toto Toys & Fun Blog'
                            WHEN 2 THEN 'Kids Gift Guide Age ' || (n + 3) || ' | Toto Toys & Fun Blog'
                          END,
            'meta_description', CASE (n % 3)
                                 WHEN 0 THEN 'Explore our latest toy collection features.'
                                 WHEN 1 THEN 'Top summer toys and outdoor games.'
                                 WHEN 2 THEN 'Gift guide for children aged ' || (n + 3) || '.'
                               END,
            'seo_keywords', ARRAY['blog', 'kids', 'toys',
                               CASE (n % 3)
                                   WHEN 0 THEN 'new collection'
                                   WHEN 1 THEN 'summer'
                                   WHEN 2 THEN 'gift guide'
                               END],
            'is_featured', CASE WHEN random() < 0.2 THEN true ELSE false END
        ) as metadata
    FROM generate_series(1, 12) n
)
INSERT INTO blog_posts (
    title, slug, content, excerpt, author_id, status,
    featured_image, published_at, metadata
)
SELECT
    bd.title, bd.slug, bd.content, bd.excerpt,
    (SELECT id FROM auth.users LIMIT 1), 
    bd.status, bd.featured_image, bd.published_at, bd.metadata
FROM blog_data bd
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    excerpt = EXCLUDED.excerpt,
    author_id = EXCLUDED.author_id,
    status = EXCLUDED.status,
    featured_image = EXCLUDED.featured_image,
    published_at = EXCLUDED.published_at,
    metadata = EXCLUDED.metadata,
    updated_at = now();

-- Insert into blog_posts_categories junction table
INSERT INTO blog_posts_categories (post_id, category_id)
SELECT
    bp.id as post_id,
    bc.id as category_id
FROM blog_posts bp, blog_categories bc
WHERE random() < 0.3 
ON CONFLICT (post_id, category_id) DO NOTHING;

-- Insert mock product images (Actual Schema)
INSERT INTO product_images (product_id, url, alt_text, is_primary, width, height, size, format)
SELECT
    p.id as product_id,
    img.url,
    img.alt,
    true as is_primary, 
    400, 400, 
    (random()*50 + 50)::int, 
    'jpg' 
FROM products p,
     jsonb_to_record(p.images->0) as img(url text, alt text) 
ON CONFLICT (id) DO 
UPDATE SET
    url = EXCLUDED.url,
    alt_text = EXCLUDED.alt_text,
    is_primary = EXCLUDED.is_primary,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    size = EXCLUDED.size,
    format = EXCLUDED.format,
    updated_at = now();

-- Insert default settings (Actual Schema)
INSERT INTO settings (
    site_name, site_description, contact_email, support_phone,
    address, social_media, shipping_policy, return_policy
) VALUES (
    'Toto Toys & Fun', 
    'Your favorite online store for kids toys and games.', 
    'support@toto-toys.com',
    '+1234567890',
    '123 Toy Street, Kid City, Funland 12345',
    '{"facebook": "https://facebook.com/tototoys", "instagram": "https://instagram.com/tototoys"}',
    'Free shipping on orders over $50. Standard shipping takes 3-5 business days.',
    '30-day return policy on unused items in original packaging.'
)
ON CONFLICT (id) DO UPDATE SET
    site_name = EXCLUDED.site_name,
    site_description = EXCLUDED.site_description,
    contact_email = EXCLUDED.contact_email,
    support_phone = EXCLUDED.support_phone,
    address = EXCLUDED.address,
    social_media = EXCLUDED.social_media,
    shipping_policy = EXCLUDED.shipping_policy,
    return_policy = EXCLUDED.return_policy,
    updated_at = now();
