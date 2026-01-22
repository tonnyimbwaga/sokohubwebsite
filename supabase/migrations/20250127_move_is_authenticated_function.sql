-- Move is_authenticated function from auth schema to public schema
-- This migration addresses the Supabase restriction on custom objects in internal schemas

-- Drop the existing function in auth schema (if it exists)
DROP FUNCTION IF EXISTS auth.is_authenticated();

-- Create the function in public schema instead
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user is authenticated (matching original implementation)
  RETURN (auth.role() = 'authenticated');
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO authenticated;

-- If you have any RLS policies using auth.is_authenticated, 
-- you'll need to update them to use public.is_authenticated instead
-- Example (uncomment and modify as needed):
-- ALTER POLICY "your_policy_name" ON your_table_name 
-- USING (public.is_authenticated()); 