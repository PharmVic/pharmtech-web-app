-- Create Profiles table (users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  address text,
  role text default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create Quotes table (for solar calculator)
create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  quote_number text not null,
  customer_name text,
  customer_phone text,
  customer_address text,
  total_load_watts numeric,
  total_surge_watts numeric,
  recommended_kva numeric,
  system_voltage numeric,
  estimated_price numeric,
  appliances jsonb, -- Store the loads array
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quotes enable row level security;

-- Policies for Quotes
create policy "Public can insert quotes" on public.quotes
  for insert with check (true);

create policy "Admins can view all quotes" on public.quotes
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Create Products table
create table if not exists public.product_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.product_categories(id),
  name text not null,
  description text,
  price numeric,
  image_url text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.product_categories enable row level security;

-- Public read access for products
create policy "Public can view products" on public.products for select using (true);
create policy "Public can view categories" on public.product_categories for select using (true);
