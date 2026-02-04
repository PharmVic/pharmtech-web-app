-- 1. Create table if missing
create table if not exists public.product_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Security (RLS)
alter table public.product_categories enable row level security;
drop policy if exists "Public can view categories" on public.product_categories;
create policy "Public can view categories" on public.product_categories for select using (true);

-- 3. Insert Default Categories (including Homepage ones)
insert into public.product_categories (name, slug)
values 
  ('Solar Panels', 'solar-panels'),
  ('Inverters', 'inverters'),
  ('Batteries', 'batteries'),
  ('Accessories', 'accessories'),
  ('CCTV', 'cctv'),
  ('Solar', 'solar'),
  ('Networking', 'networking'),
  ('Automation', 'automation'),
  ('Access Control', 'access-control')
on conflict (slug) do nothing;
