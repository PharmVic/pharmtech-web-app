-- Migration Script to add promotional pricing fields to the products table

ALTER TABLE public.products
ADD COLUMN is_promo_active BOOLEAN DEFAULT false;

ALTER TABLE public.products
ADD COLUMN promo_price NUMERIC;
