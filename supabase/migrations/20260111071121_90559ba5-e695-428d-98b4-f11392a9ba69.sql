-- GDPR Compliance: Data Subject Requests Table

-- Create GDPR data subject requests table for right to erasure/access
CREATE TABLE public.gdpr_subject_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'erasure', 'rectification', 'portability', 'restriction')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  verification_token TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gdpr_subject_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests (authenticated)
CREATE POLICY "Users can view own requests" ON public.gdpr_subject_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Anonymous users can insert requests (for non-authenticated users)
CREATE POLICY "Anyone can submit GDPR requests" ON public.gdpr_subject_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can update requests
CREATE POLICY "Admins can manage requests" ON public.gdpr_subject_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_gdpr_requests_email ON public.gdpr_subject_requests(email);
CREATE INDEX idx_gdpr_requests_status ON public.gdpr_subject_requests(status);

-- Add unique constraint to data_retention_rules for upsert
ALTER TABLE public.data_retention_rules ADD CONSTRAINT data_retention_rules_table_name_key UNIQUE (table_name);

-- Add missing retention rules
INSERT INTO public.data_retention_rules (table_name, retention_days, deletion_strategy, notes) 
VALUES
  ('community_submissions', 1825, 'anonymize', 'Anonymize after 5 years, keep content for archive'),
  ('community_profiles', 1825, 'hard', 'Delete profiles after 5 years of inactivity'),
  ('supporter_records', 2555, 'anonymize', 'Keep financial records 7 years, anonymize PII'),
  ('gdpr_subject_requests', 2555, 'hard', 'Keep GDPR requests 7 years for compliance')
ON CONFLICT (table_name) DO NOTHING;

-- Extend privacy_audit_log action_type to include GDPR actions
ALTER TABLE public.privacy_audit_log DROP CONSTRAINT IF EXISTS privacy_audit_log_action_type_check;
ALTER TABLE public.privacy_audit_log ADD CONSTRAINT privacy_audit_log_action_type_check 
  CHECK (action_type = ANY (ARRAY[
    'consent_granted', 'consent_revoked', 'data_export', 'data_deletion', 
    'policy_view', 'opt_out', 'access_request', 'agent_scan', 'config_change',
    'gdpr_request_submitted', 'gdpr_request_completed', 'data_anonymized'
  ]));

-- Log compliance enhancement
INSERT INTO public.privacy_audit_log (action_type, details)
VALUES ('config_change', '{"change": "gdpr_compliance_v2", "added": ["gdpr_subject_requests_table", "retention_rules", "enhanced_audit_types"]}');