# Storage Bucket Setup Instructions

## Quick Setup: Create Offer Letters Storage Bucket

### Method 1: SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor**

2. **Run the Simple SQL**
   - Copy and paste the contents of `create_offer_letters_bucket.sql` into the SQL Editor
   - Click **"Run"** to execute the SQL
   - This only creates the bucket, not the policies (which are handled automatically)

### Method 2: Manual Creation (Alternative)

If you prefer the dashboard approach:

1. **Go to Storage Section**
   - In Supabase dashboard, click **"Storage"** in the left sidebar
   - Click **"New Bucket"**

2. **Configure Bucket Settings**
   - **Name**: `offer-letters`
   - **Public**: `No` (Private bucket)
   - **File size limit**: `50 MB`
   - **Allowed MIME types**: 
     - `application/pdf`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

3. **Create the Bucket**
   - Click **"Create bucket"**

### Method 3: Storage Policies (Optional)

If you need custom access control:

1. **Go to Storage Policies**
   - In Supabase dashboard: **Storage** → **Policies**
   - Select the `offer-letters` bucket

2. **Create Policies** (if needed):
   ```sql
   -- Allow authenticated users to upload files in their own folder
   CREATE POLICY "Users can upload their own offer letters" 
   ON storage.objects FOR INSERT 
   WITH CHECK (
     bucket_id = 'offer-letters' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- Allow users to view their own files
   CREATE POLICY "Users can view their own offer letters" 
   ON storage.objects FOR SELECT 
   USING (
     bucket_id = 'offer-letters' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## Verification

After creating the bucket:

1. **Check Bucket Exists**
   - Go to **Storage** section in Supabase dashboard
   - You should see `offer-letters` bucket listed

2. **Test Upload** (Optional)
   - Try uploading a test PDF file to verify it works
   - Files should be organized as: `{user-id}/{job-application-id}/offer_letter_*.pdf`

## Troubleshooting

### Permission Errors
If you get "must be owner of table objects" errors:
- ✅ Use **Method 1** (simplified SQL) or **Method 2** (manual creation)
- ❌ Don't try to modify storage.objects table directly
- ✅ Supabase handles RLS automatically for storage

### Upload Errors
If file uploads fail:
1. Verify bucket exists and is named exactly `offer-letters`
2. Check that your user is authenticated
3. Ensure the bucket is set as **private** (not public)
4. Check browser console for detailed error messages

### Fallback Behavior
The system is designed to gracefully fall back:
- If storage upload fails → uses API file URLs instead
- If database insert fails → logs error but continues workflow
- The offer generation will still work even if storage has issues

## Important Notes

- **Bucket Name**: Must be exactly `offer-letters` (lowercase, with hyphen)
- **Privacy**: Bucket should be private for security
- **File Organization**: Files are stored as `{user-id}/{app-id}/offer_letter_{timestamp}.pdf`
- **Automatic Cleanup**: Consider setting up lifecycle policies for old files
- **Backup**: Generated files are also available via API URLs as fallback

The offer generation system will work regardless of storage setup, but having the bucket properly configured provides better file management and organization.
