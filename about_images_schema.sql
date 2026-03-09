-- Create About Images table
CREATE TABLE IF NOT EXISTS public.about_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position INTEGER UNIQUE NOT NULL CHECK (position >= 1 AND position <= 4),
    image_url TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.about_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to everyone
CREATE POLICY "Allow public read access to about_images"
ON public.about_images FOR SELECT
USING (true);

-- Policy: Allow all access to authenticated users (admins)
CREATE POLICY "Allow all access to authenticated users for about_images"
ON public.about_images FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert initial placeholder data
INSERT INTO public.about_images (position, image_url, alt_text) VALUES 
(1, 'https://images.unsplash.com/photo-1509391366360-1e96f5b16e51?w=500&auto=format', 'Solar Panels Installation'),
(2, 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf?w=500&auto=format', 'Enterprise Networking'),
(3, 'https://images.unsplash.com/photo-1557064619-2169b476c535?w=500&auto=format', 'CCTV Security Systems'),
(4, 'https://images.unsplash.com/photo-1558002038-1091a086e98c?w=500&auto=format', 'Smart Home Automation')
ON CONFLICT (position) DO NOTHING;
