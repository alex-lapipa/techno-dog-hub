-- Add column to track if referral notification email was sent
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS email_notification_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;