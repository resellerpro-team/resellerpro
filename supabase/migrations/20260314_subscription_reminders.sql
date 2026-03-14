-- ============================================
-- Subscription Expiry Reminder System Migration
-- ============================================

-- 1. Extend notifications table with data JSONB column
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- 2. Clean up duplicate notifications (keep the latest one)
-- This is necessary to allow the unique index to be created
DELETE FROM public.notifications n1
USING public.notifications n2
WHERE n1.id < n2.id 
  AND n1.entity_id = n2.entity_id 
  AND n1.type = n2.type 
  AND n1.entity_id IS NOT NULL;

-- 3. Add unique index to prevent duplicate notifications
-- Based on user request: unique(reference_id, type)
-- In our schema, reference_id is entity_id (uuid)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_entity_id_type 
ON public.notifications (entity_id, type) 
WHERE entity_id IS NOT NULL;

-- 3. Create invoices table (basic structure)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
    billing_reason TEXT, -- e.g., 'subscription_cycle', 'subscription_update'
    invoice_pdf_url TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for invoices
CREATE POLICY "Users can view their own invoices"
ON public.invoices FOR SELECT
USING (auth.uid() = user_id);

-- 6. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================
