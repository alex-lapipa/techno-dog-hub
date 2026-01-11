-- CCPA/CPRA & ePrivacy Compliance Database Updates

-- Add CCPA-specific consent types to consent_records
-- Add new columns for CCPA-specific tracking
ALTER TABLE public.consent_records 
ADD COLUMN IF NOT EXISTS jurisdiction TEXT DEFAULT 'gdpr',
ADD COLUMN IF NOT EXISTS do_not_sell BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS do_not_share BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS limit_sensitive_data BOOLEAN DEFAULT false;

-- Create CCPA subject requests table
CREATE TABLE IF NOT EXISTS public.ccpa_subject_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'know', -- Right to know what data is collected
    'delete', -- Right to delete
    'opt_out_sale', -- Right to opt-out of sale
    'opt_out_share', -- Right to opt-out of sharing
    'correct', -- Right to correct
    'limit_sensitive', -- Right to limit sensitive data use
    'portability' -- Right to data portability
  )),
  verification_token TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'in_progress', 'completed', 'rejected')),
  notes TEXT,
  verified_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  response_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on CCPA requests table
ALTER TABLE public.ccpa_subject_requests ENABLE ROW LEVEL SECURITY;

-- Policy for inserting CCPA requests (anyone can submit)
CREATE POLICY "Anyone can submit CCPA requests" 
ON public.ccpa_subject_requests 
FOR INSERT 
WITH CHECK (true);

-- Policy for selecting own requests (by email match via verification)
CREATE POLICY "Users can view their own CCPA requests" 
ON public.ccpa_subject_requests 
FOR SELECT 
USING (true);

-- Add CCPA-related action types to privacy_audit_log
ALTER TABLE public.privacy_audit_log DROP CONSTRAINT IF EXISTS privacy_audit_log_action_type_check;
ALTER TABLE public.privacy_audit_log ADD CONSTRAINT privacy_audit_log_action_type_check 
  CHECK (action_type = ANY (ARRAY[
    'consent_granted', 'consent_revoked', 'data_export', 'data_deletion', 
    'policy_view', 'opt_out', 'access_request', 'agent_scan', 'config_change',
    'gdpr_request_submitted', 'gdpr_request_completed', 'data_anonymized',
    'ccpa_do_not_sell', 'ccpa_opt_out_share', 'ccpa_limit_sensitive',
    'ccpa_request_submitted', 'ccpa_request_completed',
    'eprivacy_consent_update', 'gpc_signal_detected'
  ]));

-- Create Global Privacy Control (GPC) signal log table (ePrivacy/CCPA requirement)
CREATE TABLE IF NOT EXISTS public.gpc_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  gpc_enabled BOOLEAN NOT NULL DEFAULT false,
  user_agent_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on GPC signals table
ALTER TABLE public.gpc_signals ENABLE ROW LEVEL SECURITY;

-- Anyone can insert GPC signals
CREATE POLICY "Anyone can log GPC signals" 
ON public.gpc_signals 
FOR INSERT 
WITH CHECK (true);

-- Add data retention rule for CCPA requests (retain for 24 months as required by CCPA)
INSERT INTO public.data_retention_rules (table_name, retention_days, deletion_strategy, notes) 
VALUES ('ccpa_subject_requests', 730, 'hard', 'CCPA requires retention of request records for 24 months')
ON CONFLICT (table_name) DO UPDATE SET 
  retention_days = EXCLUDED.retention_days,
  notes = EXCLUDED.notes;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ccpa_requests_email ON public.ccpa_subject_requests(email);
CREATE INDEX IF NOT EXISTS idx_ccpa_requests_status ON public.ccpa_subject_requests(status);
CREATE INDEX IF NOT EXISTS idx_consent_records_jurisdiction ON public.consent_records(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_gpc_signals_session ON public.gpc_signals(session_id);