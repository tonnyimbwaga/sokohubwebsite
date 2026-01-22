create table public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  delivery_zone text not null check (delivery_zone in ('nairobi', 'outside')),
  location text not null,
  items jsonb not null,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.orders enable row level security;

-- Create policy to allow anyone to create orders
create policy "Allow anyone to create orders"
  on public.orders for insert
  to anon
  with check (true);

-- Create policy to allow reading orders by ID
create policy "Allow reading orders by ID"
  on public.orders for select
  to anon
  using (true);

-- Create trigger to update updated_at
create trigger orders_updated_at
  before update on public.orders
  for each row
  execute function update_updated_at_column();

-- Create index on created_at for sorting
create index orders_created_at_idx on public.orders (created_at desc);

-- Create index on status for filtering
create index orders_status_idx on public.orders (status);
