-- Run this query in your Supabase SQL Editor if you haven't already
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
