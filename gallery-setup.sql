-- 1. Create the resort_gallery table
CREATE TABLE IF NOT EXISTS public.resort_gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on the table
ALTER TABLE public.resort_gallery ENABLE ROW LEVEL SECURITY;

-- 3. Table Policies
CREATE POLICY "Allow public read access on resort_gallery" 
    ON public.resort_gallery FOR SELECT 
    USING (true);

CREATE POLICY "Allow authenticated users to insert resort_gallery" 
    ON public.resort_gallery FOR INSERT 
    TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update resort_gallery" 
    ON public.resort_gallery FOR UPDATE 
    TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete resort_gallery" 
    ON public.resort_gallery FOR DELETE 
    TO authenticated USING (true);

-- 4. Create the storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies (allows users to upload and view images)
CREATE POLICY "Allow public to read gallery images" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to upload gallery images" 
    ON storage.objects FOR INSERT 
    TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to update gallery images" 
    ON storage.objects FOR UPDATE 
    TO authenticated USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to delete gallery images" 
    ON storage.objects FOR DELETE 
    TO authenticated USING (bucket_id = 'gallery');
