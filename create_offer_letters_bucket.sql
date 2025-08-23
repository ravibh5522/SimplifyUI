-- Create storage bucket for generated offer letters
-- Run this SQL in your Supabase SQL editor

-- Create the storage bucket for offer letters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'offer-letters',
  'offer-letters',
  false,  -- Private bucket
  50000000,  -- 50MB limit
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default in Supabase
-- Note: Basic storage policies are automatically created by Supabase

-- Optional: If you want custom policies, create them via Supabase Dashboard:
-- 1. Go to Storage -> Policies in Supabase Dashboard
-- 2. Create policies for the 'offer-letters' bucket
-- 3. Set conditions based on auth.uid() for user access control
