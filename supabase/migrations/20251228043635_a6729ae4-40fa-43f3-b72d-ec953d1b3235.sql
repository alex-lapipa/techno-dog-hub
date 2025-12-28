-- Add referral_code to community_profiles
ALTER TABLE public.community_profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_community_profiles_referral_code 
ON public.community_profiles(referral_code);

-- Create referrals tracking table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL REFERENCES public.community_profiles(id) ON DELETE CASCADE,
  referred_profile_id uuid REFERENCES public.community_profiles(id) ON DELETE SET NULL,
  referred_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  referral_code_used text NOT NULL,
  xp_awarded boolean NOT NULL DEFAULT false,
  xp_awarded_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT
USING (
  referrer_id IN (
    SELECT id FROM public.community_profiles WHERE user_id = auth.uid()
  )
);

-- Service role can manage all referrals
CREATE POLICY "Service role can manage referrals"
ON public.referrals FOR ALL
USING (true)
WITH CHECK (true);

-- Users can create referrals for themselves
CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
WITH CHECK (
  referrer_id IN (
    SELECT id FROM public.community_profiles WHERE user_id = auth.uid()
  )
);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to ensure profile has referral code
CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM community_profiles WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral codes
CREATE TRIGGER ensure_profile_referral_code
BEFORE INSERT OR UPDATE ON public.community_profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_referral_code();

-- Function to process referral when user becomes verified
CREATE OR REPLACE FUNCTION public.process_referral_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  referral_record record;
  referrer_profile_id uuid;
  xp_reward integer := 250;
BEGIN
  -- Only process when status changes to verified
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    -- Find pending referral for this email
    SELECT * INTO referral_record
    FROM referrals
    WHERE referred_email = NEW.email
      AND status = 'pending'
      AND xp_awarded = false
    LIMIT 1;
    
    IF referral_record IS NOT NULL THEN
      -- Update referral status
      UPDATE referrals
      SET status = 'completed',
          referred_profile_id = NEW.id,
          verified_at = now(),
          xp_awarded = true,
          xp_awarded_at = now()
      WHERE id = referral_record.id;
      
      -- Award XP to referrer
      PERFORM award_points(
        p_profile_id := referral_record.referrer_id,
        p_action_type := 'referral_verified',
        p_points := xp_reward,
        p_description := 'Referred user became verified contributor',
        p_reference_type := 'referral',
        p_reference_id := referral_record.id::text
      );
      
      -- Also award badge if they have enough referrals
      PERFORM check_referral_badges(referral_record.referrer_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for referral verification
CREATE TRIGGER on_profile_verified
AFTER UPDATE ON public.community_profiles
FOR EACH ROW
EXECUTE FUNCTION public.process_referral_verification();

-- Function to check and award referral badges
CREATE OR REPLACE FUNCTION public.check_referral_badges(p_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  referral_count integer;
BEGIN
  SELECT COUNT(*) INTO referral_count
  FROM referrals
  WHERE referrer_id = p_profile_id AND status = 'completed';
  
  -- Award badges based on referral count
  IF referral_count >= 1 THEN
    PERFORM award_badge('referrer-bronze', p_profile_id, 'First successful referral');
  END IF;
  
  IF referral_count >= 5 THEN
    PERFORM award_badge('referrer-silver', p_profile_id, '5 successful referrals');
  END IF;
  
  IF referral_count >= 10 THEN
    PERFORM award_badge('referrer-gold', p_profile_id, '10 successful referrals');
  END IF;
  
  IF referral_count >= 25 THEN
    PERFORM award_badge('referrer-platinum', p_profile_id, '25 successful referrals');
  END IF;
END;
$$;