-- Add user_id to payments table
ALTER TABLE public.payments ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS so users can see their own payments
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);
