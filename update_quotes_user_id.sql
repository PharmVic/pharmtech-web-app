-- Add user_id to quotes table
ALTER TABLE public.quotes ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Depending on your existing RLS, you might want to add a policy so users can only see their own quotes
-- CREATE POLICY "Users can view their own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own quotes" ON public.quotes FOR INSERT WITH CHECK (auth.uid() = user_id);
