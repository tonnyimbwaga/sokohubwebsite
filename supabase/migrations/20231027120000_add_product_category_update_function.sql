create or replace function public.update_product_categories(p_product_id uuid, p_category_ids uuid[])
returns void as $$
begin
  -- First, delete existing categories for the product
  delete from public.product_categories
  where product_id = p_product_id;

  -- Then, insert the new categories
  if array_length(p_category_ids, 1) > 0 then
    insert into public.product_categories (product_id, category_id)
    select p_product_id, unnest(p_category_ids);
  end if;
end;
$$ language plpgsql; 