-- RESTORE JUNCTION TABLE LOGIC FOR SOKOHUB KENYA
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/rmgtdipwxieqlqkxyohv/sql)

-- 1. ENSURE JUNCTION TABLE EXISTS
CREATE TABLE IF NOT EXISTS public.product_categories (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 2. CREATE/REPLACE RPC FUNCTION
-- Note: Function names and parameter types must match the frontend RPC call exactly.
CREATE OR REPLACE FUNCTION public.update_product_categories(p_product_id UUID, p_category_ids UUID[])
RETURNS VOID AS $$
BEGIN
  -- 1. Clear existing categories for this product
  DELETE FROM public.product_categories
  WHERE product_id = p_product_id;

  -- 2. Insert new categories if any
  IF p_category_ids IS NOT NULL AND ARRAY_LENGTH(p_category_ids, 1) > 0 THEN
    INSERT INTO public.product_categories (product_id, category_id)
    SELECT p_product_id, UNNEST(p_category_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. GRANT PERMISSIONS
-- Ensure the function is accessible to authorized users
ALTER FUNCTION public.update_product_categories(UUID, UUID[]) OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.update_product_categories(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_product_categories(UUID, UUID[]) TO service_role;
