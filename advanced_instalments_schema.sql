-- SQL Script to update Supabase schema for advanced instalments

-- 1. Add fields to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS instalment_3m_price numeric,
ADD COLUMN IF NOT EXISTS instalment_6m_price numeric,
ADD COLUMN IF NOT EXISTS instalment_9m_price numeric,
ADD COLUMN IF NOT EXISTS instalment_12m_price numeric;

-- 2. Add fields to instalment_applications
ALTER TABLE public.instalment_applications
ADD COLUMN IF NOT EXISTS duration_months integer,
ADD COLUMN IF NOT EXISTS monthly_payment_amount numeric;

-- 3. Create instalment_schedules table
CREATE TABLE IF NOT EXISTS public.instalment_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    application_id uuid REFERENCES public.instalment_applications(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_due numeric NOT NULL,
    due_date timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'late'
    paystack_reference text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.instalment_schedules ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Users can view own schedules" ON public.instalment_schedules;
CREATE POLICY "Users can view own schedules" 
ON public.instalment_schedules FOR SELECT USING (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Admins can view all schedules" ON public.instalment_schedules;
CREATE POLICY "Admins can view all schedules" 
ON public.instalment_schedules FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can update schedules" ON public.instalment_schedules;
CREATE POLICY "Admins can update schedules" 
ON public.instalment_schedules FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Users can insert schedules" ON public.instalment_schedules;
CREATE POLICY "Users can insert schedules"
ON public.instalment_schedules FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Users can update own schedules" ON public.instalment_schedules;
CREATE POLICY "Users can update own schedules"
ON public.instalment_schedules FOR UPDATE USING (
    auth.uid() = user_id
);
