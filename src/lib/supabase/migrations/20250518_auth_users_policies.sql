-- 2025-05-18: Add RLS policies to auth.users

-- Ensure RLS is enabled (already is, but safe to include)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select their own auth record
CREATE POLICY "Allow authenticated users to select their own auth record"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
