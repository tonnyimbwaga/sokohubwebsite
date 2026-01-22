-- Supabase SQL migration for Google Merchant Center image automation
-- 1. Create a dedicated bucket for merchant feed images (public read)
select storage.create_bucket('merchant-feed-images', public := true);

-- 2. Enable RLS (Row Level Security) for the bucket
alter bucket "merchant-feed-images" enable row level security;

-- 3. Allow public read access to merchant feed images
create policy "Allow public read access to merchant feed images"
  on storage.objects
  for select
  using (bucket_id = 'merchant-feed-images');

-- 4. Allow authenticated users and service_role to insert/update/delete
create policy "Allow authenticated upload/update/delete to merchant feed images"
  on storage.objects
  for all
  using (
    bucket_id = 'merchant-feed-images' and (
      auth.role() = 'authenticated' or auth.role() = 'service_role'
    )
  );

-- 5. Create mapping table for product images and their merchant feed versions
create table if not exists public.product_merchant_images (
  product_id uuid references products(id) on delete cascade,
  original_image_url text not null,
  merchant_image_url text not null,
  updated_at timestamp with time zone default now(),
  primary key (product_id, original_image_url)
);

-- 6. Grant select on mapping table to anon (for feed generation)
grant select on public.product_merchant_images to anon;
