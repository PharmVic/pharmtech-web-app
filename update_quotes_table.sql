-- Extended Schema for Full Quote Details
-- Run this to capture Inverter Models and Battery Capacity

alter table public.quotes add column if not exists battery_ah numeric;
alter table public.quotes add column if not exists inverter_name text;

-- Ensure previous columns exist (safe to re-run)
alter table public.quotes add column if not exists appliances jsonb;
alter table public.quotes add column if not exists battery_type text;
alter table public.quotes add column if not exists battery_count numeric;
alter table public.quotes add column if not exists panel_count numeric;
alter table public.quotes add column if not exists panel_wattage numeric;
