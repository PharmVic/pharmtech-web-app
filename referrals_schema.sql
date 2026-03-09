-- Add referral and points fields to the existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_balance numeric DEFAULT 0;

-- Create a table to securely track points transactions
CREATE TABLE IF NOT EXISTS public.points_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount numeric NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Since 1 point = N1, amount represents both the points and value in Naira.

-- Enable RLS on the new table
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own points transactions
CREATE POLICY "Users can view their own points" ON public.points_transactions
    FOR SELECT USING (auth.uid() = profile_id);

-- Admins can view all points transactions
CREATE POLICY "Admins can view all points" ON public.points_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- (Optional) Admins can insert/update points directly if manually awarding
CREATE POLICY "Admins can insert points" ON public.points_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Database Function: Safe way to award points
-- This function can be called via Supabase RPC after a purchase is completed.
CREATE OR REPLACE FUNCTION public.award_referral_points(
    purchase_amount numeric,
    purchaser_id uuid,
    order_description text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_id uuid;
    points_to_award numeric;
BEGIN
    -- Get the referrer of this purchaser
    SELECT referred_by INTO referrer_id FROM public.profiles WHERE id = purchaser_id;
    
    IF referrer_id IS NOT NULL THEN
        -- Calculate 1% of the purchase amount
        points_to_award := purchase_amount * 0.01;
        
        -- If points > 0, proceed
        IF points_to_award > 0 THEN
            -- 1. Insert transaction log
            INSERT INTO public.points_transactions (profile_id, amount, description)
            VALUES (referrer_id, points_to_award, 'Referral point bonus for purchase: ' || order_description);
            
            -- 2. Update user's total balance in profiles table
            UPDATE public.profiles
            SET points_balance = COALESCE(points_balance, 0) + points_to_award
            WHERE id = referrer_id;
        END IF;
    END IF;
END;
$$;
