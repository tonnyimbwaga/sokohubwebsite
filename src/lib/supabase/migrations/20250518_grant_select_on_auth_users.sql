-- 2025-05-18: Grant SELECT privileges on auth.users to authenticated role

-- Allow authenticated users to read their own row (governed by existing RLS policy)
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
