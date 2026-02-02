-- PROPERLY backfill created_at from auth.users (source of truth)
-- This fixes the issue where all users showed the same 'Joined' date
UPDATE public.profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id;

-- Ensure an index exists for sorting performance in the admin panel
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at);
