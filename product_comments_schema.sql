-- Run this inside the Supabase SQL Editor

-- Create the product_comments table
CREATE TABLE IF NOT EXISTS product_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Everyone can read comments
CREATE POLICY "Public profiles are viewable by everyone."
ON product_comments FOR SELECT
USING (true);

-- 2. Policy: Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments."
ON product_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments."
ON product_comments FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments."
ON product_comments FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster querying by product_id
CREATE INDEX IF NOT EXISTS product_comments_product_id_idx ON product_comments(product_id);
