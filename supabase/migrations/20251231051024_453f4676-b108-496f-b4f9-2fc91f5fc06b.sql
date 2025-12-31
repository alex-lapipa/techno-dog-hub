-- Privacy Compliance Database Tables for GDPR/Cookie Consent

-- 1. Consent Records - stores user consent preferences
CREATE TABLE public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('essential', 'analytics', 'marketing', 'personalization')),
  is_granted BOOLEAN NOT NULL DEFAULT false,
  ip_hash TEXT, -- Hashed for privacy
  user_agent_hash TEXT, -- Hashed for privacy
  consent_version TEXT DEFAULT '1.0',
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Privacy Alerts - watchdog alerts for compliance issues
CREATE TABLE public.privacy_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('data_exposure', 'missing_consent', 'policy_violation', 'retention_exceeded', 'access_anomaly', 'third_party_risk', 'configuration_issue')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
  title TEXT NOT NULL,
  description TEXT,
  affected_entity TEXT, -- e.g., 'users', 'analytics_events', etc.
  affected_count INTEGER DEFAULT 0,
  detection_source TEXT, -- Which agent/check detected this
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'false_positive')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Privacy Audit Log - tracks all privacy-related actions
CREATE TABLE public.privacy_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN ('consent_granted', 'consent_revoked', 'data_export', 'data_deletion', 'policy_view', 'opt_out', 'access_request', 'agent_scan', 'config_change')),
  session_id TEXT,
  user_id UUID,
  ip_hash TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Data Retention Rules - configurable retention policies
CREATE TABLE public.data_retention_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  retention_days INTEGER NOT NULL DEFAULT 365,
  deletion_strategy TEXT DEFAULT 'soft' CHECK (deletion_strategy IN ('soft', 'hard', 'anonymize')),
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  records_deleted INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Privacy Agent Runs - tracks privacy watchdog scans
CREATE TABLE public.privacy_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_type TEXT NOT NULL CHECK (scan_type IN ('full', 'quick', 'targeted', 'scheduled')),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  tables_scanned INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,
  alerts_created INTEGER DEFAULT 0,
  scan_results JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Third Party Integrations Registry - track external data processors
CREATE TABLE public.third_party_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  integration_type TEXT CHECK (integration_type IN ('analytics', 'advertising', 'payment', 'email', 'cdn', 'social', 'other')),
  data_shared TEXT[], -- Types of data shared
  privacy_policy_url TEXT,
  dpa_signed BOOLEAN DEFAULT false, -- Data Processing Agreement
  is_active BOOLEAN DEFAULT true,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.third_party_integrations ENABLE ROW LEVEL SECURITY;

-- Consent records: public insert for anonymous consent, users can read their own
CREATE POLICY "Anyone can record consent" ON public.consent_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own consent" ON public.consent_records
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id = current_setting('app.session_id', true)
  );

-- Privacy alerts: admin only
CREATE POLICY "Admins can manage privacy alerts" ON public.privacy_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Privacy audit log: insert for tracking, admin read
CREATE POLICY "Anyone can create audit entries" ON public.privacy_audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view audit log" ON public.privacy_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Data retention rules: admin only
CREATE POLICY "Admins can manage retention rules" ON public.data_retention_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Privacy agent runs: admin only
CREATE POLICY "Admins can view agent runs" ON public.privacy_agent_runs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Third party integrations: admin only
CREATE POLICY "Admins can manage integrations" ON public.third_party_integrations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Indexes for performance
CREATE INDEX idx_consent_records_session ON public.consent_records(session_id);
CREATE INDEX idx_consent_records_user ON public.consent_records(user_id);
CREATE INDEX idx_privacy_alerts_status ON public.privacy_alerts(status);
CREATE INDEX idx_privacy_alerts_severity ON public.privacy_alerts(severity);
CREATE INDEX idx_privacy_audit_log_type ON public.privacy_audit_log(action_type);
CREATE INDEX idx_privacy_audit_log_created ON public.privacy_audit_log(created_at DESC);

-- Insert default retention rules for key tables
INSERT INTO public.data_retention_rules (table_name, retention_days, deletion_strategy, notes) VALUES
  ('analytics_events', 365, 'anonymize', 'Anonymize user data after 1 year'),
  ('consent_records', 2555, 'hard', 'Keep consent records for 7 years per GDPR'),
  ('privacy_audit_log', 2555, 'hard', 'Keep audit logs for 7 years'),
  ('api_usage', 90, 'hard', 'Delete API usage data after 90 days'),
  ('ip_rate_limits', 1, 'hard', 'Delete rate limit data daily');

-- Insert known third-party integrations
INSERT INTO public.third_party_integrations (name, provider, integration_type, data_shared, privacy_policy_url, dpa_signed, notes) VALUES
  ('Google Analytics 4', 'Google', 'analytics', ARRAY['page_views', 'session_data', 'device_info'], 'https://policies.google.com/privacy', true, 'GA4 with consent mode'),
  ('Google Tag Manager', 'Google', 'analytics', ARRAY['page_views', 'events'], 'https://policies.google.com/privacy', true, 'Container for tracking scripts'),
  ('Shopify Storefront', 'Shopify', 'payment', ARRAY['orders', 'customer_data'], 'https://www.shopify.com/legal/privacy', true, 'E-commerce integration'),
  ('Supabase', 'Supabase', 'other', ARRAY['all_app_data'], 'https://supabase.com/privacy', true, 'Primary backend'),
  ('Resend', 'Resend', 'email', ARRAY['email_addresses', 'email_content'], 'https://resend.com/privacy', true, 'Transactional emails');

-- Trigger to update updated_at
CREATE TRIGGER update_consent_records_updated_at
  BEFORE UPDATE ON public.consent_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_rules_updated_at
  BEFORE UPDATE ON public.data_retention_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.third_party_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();