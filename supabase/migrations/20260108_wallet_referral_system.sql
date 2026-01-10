-- ============================================
-- Wallet & Referral System Migration
-- ============================================

-- 1. Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS is_referral_rewarded BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(referee_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- 3. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('referral_reward', 'signup_reward', 'subscription_debit')),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

-- 4. Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to avoid errors on re-run)
DROP TRIGGER IF EXISTS trigger_set_referral_code ON profiles;
CREATE TRIGGER trigger_set_referral_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();

-- 6. Function to process referral signup (called from application)
CREATE OR REPLACE FUNCTION create_referral_entry(
  p_referee_id UUID,
  p_referral_code TEXT
)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_inserted BOOLEAN;
BEGIN
  -- Find referrer by code
  SELECT id INTO v_referrer_id
  FROM profiles
  WHERE referral_code = p_referral_code;
  
  -- If referrer exists and is not the same as referee (prevent self-referral)
  IF v_referrer_id IS NOT NULL AND v_referrer_id != p_referee_id THEN
    -- Insert referral record (will fail silently if already exists due to UNIQUE constraint)
    INSERT INTO referrals (referrer_id, referee_id, status)
    VALUES (v_referrer_id, p_referee_id, 'pending')
    ON CONFLICT (referee_id) DO NOTHING
    RETURNING TRUE INTO v_referral_inserted;
    
    -- If referral was successfully inserted, credit ₹50 to referee immediately
    IF v_referral_inserted THEN
      PERFORM add_wallet_transaction(
        p_referee_id,
        50,
        'signup_reward',
        'Referral signup reward'
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Function to add wallet transaction and update balance
CREATE OR REPLACE FUNCTION add_wallet_transaction(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type TEXT,
  p_description TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction
  INSERT INTO wallet_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, p_type, p_description);
  
  -- Update wallet balance
  UPDATE profiles
  SET wallet_balance = wallet_balance + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to process referral rewards (called after first subscription payment)
CREATE OR REPLACE FUNCTION process_referral_rewards(p_referee_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Check if already rewarded
  SELECT is_referral_rewarded INTO v_already_rewarded
  FROM profiles
  WHERE id = p_referee_id;
  
  -- Exit if already rewarded
  IF v_already_rewarded THEN
    RETURN;
  END IF;
  
  -- Get referrer from referrals table
  SELECT referrer_id INTO v_referrer_id
  FROM referrals
  WHERE referee_id = p_referee_id AND status = 'pending';
  
  -- If referral exists, process rewards
  IF v_referrer_id IS NOT NULL THEN
    -- Update referral status
    UPDATE referrals
    SET status = 'converted'
    WHERE referee_id = p_referee_id;
    
    -- Credit referrer (₹75) - Referee already got ₹50 during signup
    PERFORM add_wallet_transaction(
      v_referrer_id,
      75,
      'referral_reward',
      'Referral conversion reward'
    );
    
    -- Mark as rewarded
    UPDATE profiles
    SET is_referral_rewarded = TRUE
    WHERE id = p_referee_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for referrals
-- Users can view referrals where they are the referrer
CREATE POLICY "Users can view their own referrals"
ON referrals FOR SELECT
USING (auth.uid() = referrer_id);

-- Users can view referrals where they are the referee
CREATE POLICY "Users can view referrals where they are referee"
ON referrals FOR SELECT
USING (auth.uid() = referee_id);

-- 11. RLS Policies for wallet_transactions
-- Users can view their own transactions
CREATE POLICY "Users can view their own wallet transactions"
ON wallet_transactions FOR SELECT
USING (auth.uid() = user_id);

-- 12. Grant necessary permissions
GRANT SELECT ON referrals TO authenticated;
GRANT SELECT ON wallet_transactions TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================
