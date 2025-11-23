-- Fix 1: Restrict profiles table access to protect PII
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Allow users to view only their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow shelters to view profiles of users who applied to their pets
CREATE POLICY "Shelters can view applicant profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.adopter_id = profiles.id
      AND applications.shelter_id = auth.uid()
    )
  );

-- Allow adopters to view profiles of shelters whose pets they applied for
CREATE POLICY "Adopters can view shelter profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.shelter_id = profiles.id
      AND applications.adopter_id = auth.uid()
    )
  );

-- Fix 2: Prevent role modification through profile updates
-- Drop existing update policy and recreate with role protection
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- Fix 3: Add storage bucket RLS policies for pet-photos (drop first if exists)
DROP POLICY IF EXISTS "Authenticated users can upload pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view pet photos" ON storage.objects;

-- Allow only authenticated users to upload to their own folders
CREATE POLICY "Authenticated users can upload pet photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-photos' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow only owners to delete their own files
CREATE POLICY "Users can delete own pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'pet-photos' AND
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Allow public read access (since pet photos should be viewable)
CREATE POLICY "Public can view pet photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-photos');

-- Fix 4: Configure bucket restrictions for file types and size
UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  file_size_limit = 5242880 -- 5MB
WHERE id = 'pet-photos';