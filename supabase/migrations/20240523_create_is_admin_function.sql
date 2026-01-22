-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_role boolean;
BEGIN
  -- First, ensure the function is being called by an authenticated user
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Check if the user has the 'admin' role in the profiles table
  SELECT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = user_id_to_check AND role = 'admin'
  )
  INTO is_admin_role;

  RETURN is_admin_role;
END;
$$; 