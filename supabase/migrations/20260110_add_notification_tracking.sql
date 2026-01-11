-- Add tracking columns for notifications
ALTER TABLE enquiries 
ADD COLUMN IF NOT EXISTS followup_notified BOOLEAN DEFAULT false;

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS expiry_notified_at TIMESTAMPTZ;

-- Index for performance on time-based checks
CREATE INDEX IF NOT EXISTS idx_enquiries_followup_date_notified ON enquiries(followup_date, followup_notified) WHERE followup_notified = false;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiry_check ON user_subscriptions(current_period_end, expiry_notified_at);
