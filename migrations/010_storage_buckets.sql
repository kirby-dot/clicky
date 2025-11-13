-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view public files
CREATE POLICY "Public files are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
