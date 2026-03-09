-- Run this script in your Supabase SQL Editor

-- 1. Create the reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow anyone to read reviews
CREATE POLICY "Public reviews are viewable by everyone." ON public.reviews
    FOR SELECT USING (true);

-- Allow authenticated admins to insert reviews
CREATE POLICY "Admins can insert reviews." ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Allow authenticated admins to update reviews
CREATE POLICY "Admins can update reviews." ON public.reviews
    FOR UPDATE USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Allow authenticated admins to delete reviews
CREATE POLICY "Admins can delete reviews." ON public.reviews
    FOR DELETE USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );
