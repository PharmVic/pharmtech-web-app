-- Run this script in your Supabase SQL Editor to set up the aftersales support system.

-- 1. Create the aftersales_registrations table
CREATE TABLE IF NOT EXISTS public.aftersales_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_purchased TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- pending, active, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.aftersales_registrations ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Allow authenticated users to insert their own aftersales registrations
CREATE POLICY "Users can create aftersales registrations" ON public.aftersales_registrations
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        auth.uid() = user_id
    );

-- Allow users to view their own aftersales registrations
CREATE POLICY "Users can view their own aftersales registrations" ON public.aftersales_registrations
    FOR SELECT USING (
        auth.uid() = user_id
    );

-- Allow admins to view all aftersales registrations
CREATE POLICY "Admins can view all aftersales registrations" ON public.aftersales_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to update aftersales registrations (e.g., status changes)
CREATE POLICY "Admins can update aftersales registrations" ON public.aftersales_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Allow admins to delete aftersales registrations
CREATE POLICY "Admins can delete aftersales registrations" ON public.aftersales_registrations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
