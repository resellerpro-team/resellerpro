-- ============================================
-- Update Referral Functions to Credit Immediately
-- Run this script on your Supabase database to update the functions
-- ============================================

-- 1. Update create_referral_entry to credit ₹50 immediately
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

-- 2. Update process_referral_rewards to only credit referrer (₹75)
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

-- ============================================
-- Migration Complete
-- ============================================
