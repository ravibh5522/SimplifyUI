-- Simple script to create the offer-templates storage bucket
-- Run this in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('offer-templates', 'offer-templates', false, 52428800, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies
CREATE POLICY "Users can upload their own offer templates" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'offer-templates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own offer templates" 
ON storage.objects FOR SELECT 
USING (
    bucket_id = 'offer-templates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own offer templates" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'offer-templates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own offer templates" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'offer-templates' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
