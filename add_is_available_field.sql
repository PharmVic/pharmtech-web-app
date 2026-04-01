-- Run this query in your Supabase SQL Editor
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;
