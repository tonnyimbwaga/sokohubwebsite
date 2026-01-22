-- Function to check if the current user has permission for a specific operation on a bucket
CREATE OR REPLACE FUNCTION check_bucket_permissions(bucket_name text, operation text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Check if the bucket exists
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE name = bucket_name
  ) THEN
    RETURN false;
  END IF;

  -- Check if there's a policy allowing the operation
  RETURN EXISTS (
    SELECT 1 FROM storage.policies p
    WHERE p.bucket_id = bucket_name
    AND (
      CASE operation
        WHEN 'SELECT' THEN p.operation = 'SELECT'::text
        WHEN 'INSERT' THEN p.operation = 'INSERT'::text
        WHEN 'UPDATE' THEN p.operation = 'UPDATE'::text
        WHEN 'DELETE' THEN p.operation = 'DELETE'::text
        ELSE false
      END
    )
    AND p.definition @> jsonb_build_object('role', 'authenticated')
  );
END;
$$;
