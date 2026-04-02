-- SQL script to add static pricing fields to instalment applications
ALTER TABLE public.instalment_applications
ADD COLUMN IF NOT EXISTS down_payment_amount numeric,
ADD COLUMN IF NOT EXISTS product_name_snapshot text;
