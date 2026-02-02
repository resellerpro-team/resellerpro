-- ============================================
-- Security Sessions Table for Device Tracking
-- ============================================
-- Tracks user login sessions, devices, and login history
-- for the Security Settings module

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address TEXT,
    location TEXT,
    user_agent TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT DEFAULT 'desktop', -- 'desktop', 'mobile', 'tablet'
    is_current BOOLEAN DEFAULT false,
    login_success BOOLEAN DEFAULT true,
    last_active TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days')
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
CREATE POLICY "Users can view their own sessions"
    ON public.user_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;
CREATE POLICY "Users can delete their own sessions"
    ON public.user_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can insert sessions (called from middleware/API)
DROP POLICY IF EXISTS "Service role can insert sessions" ON public.user_sessions;
CREATE POLICY "Service role can insert sessions"
    ON public.user_sessions FOR INSERT
    WITH CHECK (true);

-- Service role can update sessions
DROP POLICY IF EXISTS "Service role can update sessions" ON public.user_sessions;
CREATE POLICY "Service role can update sessions"
    ON public.user_sessions FOR UPDATE
    USING (true);

-- ============================================
-- Security Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.security_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email_on_new_login BOOLEAN DEFAULT true,
    email_on_password_change BOOLEAN DEFAULT true,
    email_on_suspicious_activity BOOLEAN DEFAULT true,
    weekly_security_summary BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for security preferences
ALTER TABLE public.security_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their security preferences" ON public.security_preferences;
CREATE POLICY "Users can manage their security preferences"
    ON public.security_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Auto-create security preferences for new users (trigger)
CREATE OR REPLACE FUNCTION public.create_security_preferences()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.security_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_security ON auth.users;
CREATE TRIGGER on_auth_user_created_security
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_security_preferences();
