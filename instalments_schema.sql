-- Add instalment columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS allow_instalments boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS instalment_down_payment numeric DEFAULT 0;

-- Create instalment applications table
CREATE TABLE IF NOT EXISTS public.instalment_applications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for guests
    
    -- Page 1: Client Info
    bvn text,
    name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    relationship_status text,
    occupation text,
    address text NOT NULL,
    
    -- Page 2: Guarantor Info
    guarantor_name text NOT NULL,
    guarantor_phone text NOT NULL,
    guarantor_email text,
    guarantor_relationship text,
    guarantor_address text NOT NULL,
    
    -- Page 3: Documents
    nin_number text NOT NULL,
    id_document_url text NOT NULL,
    proof_of_address_url text NOT NULL,
    
    -- Status
    status text DEFAULT 'pending', -- pending, approved, rejected
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.instalment_applications ENABLE ROW LEVEL SECURITY;

-- Policies for Instalment Applications
CREATE POLICY "Anyone can insert instalment application" 
ON public.instalment_applications FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all instalment applications" 
ON public.instalment_applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- ==============================================================================
-- STORAGE BUCKET CREATION (Note: Best to verify in Supabase Dashboard -> Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for KYC Documents
CREATE POLICY "Anyone can upload KYC documents" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents');

CREATE POLICY "Admins can view KYC documents" 
ON storage.objects FOR SELECT USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
