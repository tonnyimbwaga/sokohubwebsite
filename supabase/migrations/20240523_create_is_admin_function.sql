-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the role in user_metadata is 'admin'
  -- This is fast and doesn't rely on the profiles table
  RETURN (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin';
END;
$$;
 