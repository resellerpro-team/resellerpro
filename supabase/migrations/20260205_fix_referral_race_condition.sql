-- Fix Race Condition in Referral Rewards
-- Add Postgres advisory lock to prevent duplicate credits

-- Drop existing function (required when changing return type)
DROP FUNCTION IF EXISTS process_referral_rewards(uuid);

-- Recreate with advisory lock to prevent race condition
CREATE OR REPLACE FUNCTION process_referral_rewards(p_referee_id UUID)
RETURNS VOID AS $$
DECLARE
  v_lock_key bigint;
  v_referrer_id UUID;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Create unique lock key from referee_id (convert UUID to bigint for lock)
  -- Take first 15 hex chars of MD5 hash and convert to bigint
  v_lock_key := ('x' || substring(md5(p_referee_id::text), 1, 15))::bit(60)::bigint;
  
  -- Acquire advisory lock (automatically released at transaction end)
  -- This prevents concurrent execution for the same user
  IF NOT pg_try_advisory_xact_lock(v_lock_key) THEN
    RAISE NOTICE 'Referral reward already processing for user %', p_referee_id;
    RETURN; -- Exit early if another transaction is processing this user
  END IF;
  
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
    
    -- Mark as rewarded (prevents double processing)
    UPDATE profiles
    SET is_referral_rewarded = TRUE
    WHERE id = p_referee_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
