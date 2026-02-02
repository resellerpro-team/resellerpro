-- Add created_at column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Backfill created_at from updated_at for existing users (best guess)
UPDATE public.profiles 
SET created_at = updated_at 
WHERE created_at IS NULL;

-- Add an index for performance when filtering and broadcasting
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
