-- Enable RLS to be sure
alter table public.quotes enable row level security;

-- Drop existing policies to prevent conflicts (clean slate)
drop policy if exists "Allow anonymous access" on public.quotes;
drop policy if exists "Allow anonymous inserts" on public.quotes;
drop policy if exists "Allow anonymous updates" on public.quotes;
drop policy if exists "Enable read access for all users" on public.quotes;
drop policy if exists "Enable insert for all users" on public.quotes;
drop policy if exists "Enable update for all users" on public.quotes;

-- 1. Allow Select (Read) - needed for the 'Upsert' to check matching rows
create policy "Enable read access for all users"
on public.quotes for select
to anon
using (true);

-- 2. Allow Insert (Create) - needed for new quotes
create policy "Enable insert for all users"
on public.quotes for insert
to anon
with check (true);

-- 3. Allow Update (Modify) - needed for updating existing quotes
create policy "Enable update for all users"
on public.quotes for update
to anon
using (true);
