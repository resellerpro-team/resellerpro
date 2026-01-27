-- Add email_verified column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have email_verified = false (or check auth.users if possible, but safe default is false)
UPDATE profiles SET email_verified = FALSE WHERE email_verified IS NULL;
