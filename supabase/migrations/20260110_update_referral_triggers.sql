-- Update process_referral_rewards to return the referrer_id and reward amount
CREATE OR REPLACE FUNCTION process_referral_rewards(p_referee_id UUID)
RETURNS TABLE (referrer_id UUID, amount NUMERIC) AS $$
DECLARE
  v_referrer_id UUID;
  v_already_rewarded BOOLEAN;
  v_reward_amount NUMERIC := 75;
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
  SELECT r.referrer_id INTO v_referrer_id
  FROM referrals r
  WHERE r.referee_id = p_referee_id AND r.status = 'pending';
  
  -- If referral exists, process rewards
  IF v_referrer_id IS NOT NULL THEN
    -- Update referral status
    UPDATE referrals
    SET status = 'converted'
    WHERE referee_id = p_referee_id;
    
    -- Credit referrer (₹75)
    PERFORM add_wallet_transaction(
      v_referrer_id,
      v_reward_amount,
      'referral_reward',
      'Referral conversion reward'
    );
    
    -- Mark as rewarded
    UPDATE profiles
    SET is_referral_rewarded = TRUE
    WHERE id = p_referee_id;

    -- Return the referrer_id and reward amount
    RETURN QUERY SELECT v_referrer_id, v_reward_amount;
  END IF;
END;
$$ LANGUAGE plpgsql;
