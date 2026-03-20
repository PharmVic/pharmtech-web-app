-- Create past_installations table
CREATE TABLE IF NOT EXISTS public.past_installations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  title text,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.past_installations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access to past_installations"
  ON public.past_installations
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admins to insert/update/delete 
-- (Assuming profiles.role = 'admin' handles authorization, but for simplicity we allow authenticated users, 
--  and rely on app logic or more complex policies if needed)
CREATE POLICY "Authenticated users can insert past_installations"
  ON public.past_installations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update past_installations"
  ON public.past_installations
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete past_installations"
  ON public.past_installations
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for past-installations if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('past-installations', 'past-installations', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for past-installations bucket
CREATE POLICY "Public read access for past-installations bucket"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'past-installations');

CREATE POLICY "Authenticated users can upload to past-installations bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'past-installations');

CREATE POLICY "Authenticated users can update to past-installations bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'past-installations');

CREATE POLICY "Authenticated users can delete from past-installations bucket"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'past-installations');
