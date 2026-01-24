-- STORAGE BUCKETS SETUP FOR SOKOHUB KENYA
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/rmgtdipwxieqlqkxyohv/sql

-- 1. ENABLE STORAGE EXTENSION (If not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE BUCKETS
-- Public buckets for various features
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('categories', 'categories', true),
  ('hero-slides', 'hero-slides', true),
  ('blog', 'blog', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. SET UP RLS POLICIES FOR 'product-images'
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 4. SET UP RLS POLICIES FOR 'categories'
CREATE POLICY "Public Read Access Categories" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Admin Upload Access Categories" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'categories' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Categories" ON storage.objects FOR UPDATE USING (bucket_id = 'categories' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Categories" ON storage.objects FOR DELETE USING (bucket_id = 'categories' AND auth.role() = 'authenticated');

-- 5. SET UP RLS POLICIES FOR 'hero-slides'
CREATE POLICY "Public Read Access Hero" ON storage.objects FOR SELECT USING (bucket_id = 'hero-slides');
CREATE POLICY "Admin Upload Access Hero" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hero-slides' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Hero" ON storage.objects FOR UPDATE USING (bucket_id = 'hero-slides' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Hero" ON storage.objects FOR DELETE USING (bucket_id = 'hero-slides' AND auth.role() = 'authenticated');

-- 6. SET UP RLS POLICIES FOR 'blog'
CREATE POLICY "Public Read Access Blog" ON storage.objects FOR SELECT USING (bucket_id = 'blog');
CREATE POLICY "Admin Upload Access Blog" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Update Access Blog" ON storage.objects FOR UPDATE USING (bucket_id = 'blog' AND auth.role() = 'authenticated');
CREATE POLICY "Admin Delete Access Blog" ON storage.objects FOR DELETE USING (bucket_id = 'blog' AND auth.role() = 'authenticated');
