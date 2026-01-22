-- Fix RLS Recursion - FINAL NON-RECURSIVE SOLUTION
-- The key insight: profiles table policies CANNOT call is_admin() 
-- because is_admin() queries profiles, creating infinite recursion!

-- Step 1: Create the is_admin function (for use in OTHER tables only)
CREATE OR REPLACE FUNCTION is_admin(user_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_role boolean;
BEGIN
  -- This function can safely query profiles because it's SECURITY DEFINER
  -- It bypasses RLS entirely when called
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id_to_check AND role = 'admin'
  )
  INTO is_admin_role;

  RETURN is_admin_role;
END;
$$;

-- Step 2: Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admin All Profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles view policy" ON profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Step 3: Create SIMPLE profiles policies WITHOUT is_admin() calls
-- This breaks the recursion cycle!
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Step 4: Fix admin policies on products table (can safely use is_admin)
DROP POLICY IF EXISTS "Products are editable by authenticated admin users" ON products;
DROP POLICY IF EXISTS "Products admin policy" ON products;
DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
    FOR ALL
    USING (is_admin(auth.uid()));

-- Step 5: Fix admin policies on categories table (can safely use is_admin)
DROP POLICY IF EXISTS "Categories are editable by authenticated admin users" ON categories;
DROP POLICY IF EXISTS "Categories admin policy" ON categories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories
    FOR ALL
    USING (is_admin(auth.uid()));

-- Step 6: Fix admin policies on blog_posts table (can safely use is_admin)
DROP POLICY IF EXISTS "Blog posts are editable by authenticated admin users" ON blog_posts;
DROP POLICY IF EXISTS "Blog posts admin policy" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all" ON blog_posts;
CREATE POLICY "blog_posts_admin_all" ON blog_posts
    FOR ALL
    USING (is_admin(auth.uid()));
