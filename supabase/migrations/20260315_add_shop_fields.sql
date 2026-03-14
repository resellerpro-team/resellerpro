-- Add shop-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS shop_slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS shop_theme JSONB DEFAULT '{"primaryColor": "#4f46e5", "font": "Inter"}'::jsonb,
ADD COLUMN IF NOT EXISTS shop_description TEXT;

-- Create an index on shop_slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_shop_slug ON public.profiles(shop_slug);
