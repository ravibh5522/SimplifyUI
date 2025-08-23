-- Fix offer_templates table structure and add missing columns
-- Add missing columns to offer_templates if they don't exist
ALTER TABLE public.offer_templates ADD COLUMN IF NOT EXISTS template_link TEXT;
ALTER TABLE public.offer_templates ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;
ALTER TABLE public.offer_templates ADD COLUMN IF NOT EXISTS template_version INTEGER DEFAULT 1;
ALTER TABLE public.offer_templates ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE public.offer_templates ADD COLUMN IF NOT EXISTS logs JSONB DEFAULT '[]'::jsonb;

-- Add foreign key constraint for company_id if companies table exists
-- You can uncomment this if you want to enforce company relationship
-- ALTER TABLE public.offer_templates 
-- ADD CONSTRAINT offer_templates_company_id_fkey 
-- FOREIGN KEY (company_id) REFERENCES public.companies(id);

-- Enable RLS on offer_templates table
ALTER TABLE public.offer_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own offer templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can view their own offer templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can insert their own offer templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can update their own offer templates" ON public.offer_templates;
DROP POLICY IF EXISTS "Users can delete their own offer templates" ON public.offer_templates;

-- Create comprehensive RLS policies for offer_templates
CREATE POLICY "Users can view their own offer templates" 
ON public.offer_templates FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own offer templates" 
ON public.offer_templates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own offer templates" 
ON public.offer_templates FOR UPDATE 
USING (auth.uid() = created_by) 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own offer templates" 
ON public.offer_templates FOR DELETE 
USING (auth.uid() = created_by);

-- Enable RLS on storage bucket for offer-templates
-- First ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES ('offer-templates', 'offer-templates', false, 52428800, 
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop existing storage policies first
DROP POLICY IF EXISTS "Users can upload their own offer templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own offer templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own offer templates" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own offer templates" ON storage.objects;

-- Storage policies for offer-templates bucket
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
