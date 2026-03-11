create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  reference text unique not null,
  amount numeric not null,
  email text not null,
  phone text,
  location text,
  delivery_date date,
  items jsonb, -- newly added for cart items
  status text default 'pending', -- 'pending', 'success', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

create policy "Public can insert payments" on public.payments
  for insert with check (true);

create policy "Admins can view all payments" on public.payments
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
