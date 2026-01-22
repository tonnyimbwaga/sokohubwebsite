-- 2025-05-18: Comprehensive RLS and permissions fix for product_categories and auth.users

-- 1. Fix RLS on product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Remove old policies if they exist
DROP POLICY IF EXISTS "Allow public read access for product_categories" ON product_categories;
DROP POLICY IF EXISTS "Allow admin write access for product_categories" ON product_categories;

-- Allow all authenticated users to read ANY product_categories row
CREATE POLICY "Authenticated users can read any product_category" 
  ON product_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert, update, and delete product_categories
CREATE POLICY "Authenticated users can modify product_categories" 
  ON product_categories
  FOR ALL
  TO authenticated
  USING (true);

-- 2. Fix RLS on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to select their own auth record" ON auth.users;
DROP POLICY IF EXISTS "Allow individual authenticated users to read their own user data" ON auth.users;

-- Allow all authenticated users to SELECT ANY record in auth.users
CREATE POLICY "Authenticated users can read any user" 
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (true);

-- (Optional) If you want to restrict UPDATE/DELETE/INSERT on auth.users, do NOT add policies for those actions.
-- If you want to allow only service_role/admin to modify auth.users, grant those separately.

-- 3. Grant permissions for smooth operation
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON product_categories TO authenticated;
