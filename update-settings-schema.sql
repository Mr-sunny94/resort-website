ALTER TABLE public.resort_settings 
ADD COLUMN IF NOT EXISTS atmosphere_media_url TEXT,
ADD COLUMN IF NOT EXISTS atmosphere_media_type TEXT DEFAULT 'image',
ADD COLUMN IF NOT EXISTS resort_logo_url TEXT;
