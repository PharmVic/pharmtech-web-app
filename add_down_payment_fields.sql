-- SQL script to add down payment tracking fields to instalment applications
ALTER TABLE public.instalment_applications
ADD COLUMN IF NOT EXISTS down_payment_paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS down_payment_reference text;
