-- Create supporter tiers enum
CREATE TYPE public.supporter_tier AS ENUM ('free', 'member', 'patron', 'founding', 'bronze', 'silver', 'gold', 'custom');

-- Create support mode enum
CREATE TYPE public.support_mode AS ENUM ('one_time', 'recurring', 'corporate');

-- Create supporters table to track all support transactions
CREATE TABLE public.supporters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_checkout_session_id TEXT,
  support_mode support_mode NOT NULL,
  supporter_tier supporter_tier NOT NULL DEFAULT 'custom',
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_name TEXT,
  vat_number TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create index for lookups
CREATE INDEX idx_supporters_email ON public.supporters(email);
CREATE INDEX idx_supporters_user_id ON public.supporters(user_id);
CREATE INDEX idx_supporters_stripe_customer ON public.supporters(stripe_customer_id);
CREATE INDEX idx_supporters_active ON public.supporters(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own support records"
  ON public.supporters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all supporters"
  ON public.supporters FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage supporters"
  ON public.supporters FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role');

-- Create corporate sponsor requests table
CREATE TABLE public.corporate_sponsor_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  vat_number TEXT,
  requested_amount_cents INTEGER NOT NULL,
  tier TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.corporate_sponsor_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can submit corporate requests"
  ON public.corporate_sponsor_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage corporate requests"
  ON public.corporate_sponsor_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage corporate requests"
  ON public.corporate_sponsor_requests FOR ALL
  USING ((auth.jwt() ->> 'role') = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_supporters_updated_at
  BEFORE UPDATE ON public.supporters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();