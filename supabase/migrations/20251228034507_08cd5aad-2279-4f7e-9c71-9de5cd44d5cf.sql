-- Fix #3: Add notification_channels table for Discord/Slack alerting
CREATE TABLE IF NOT EXISTS public.notification_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('discord', 'slack', 'email', 'webhook')),
  webhook_url TEXT,
  email_addresses TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  notify_on_severity TEXT[] NOT NULL DEFAULT ARRAY['critical', 'error']::TEXT[],
  notify_categories TEXT[] NOT NULL DEFAULT ARRAY['operations', 'security', 'content']::TEXT[],
  cooldown_minutes INTEGER NOT NULL DEFAULT 15,
  last_notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage notification channels"
ON public.notification_channels
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Service role can manage notification channels"
ON public.notification_channels
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for quick lookups
CREATE INDEX idx_notification_channels_active 
ON public.notification_channels(is_active, channel_type);

-- Add notification_logs table to track sent notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.notification_channels(id) ON DELETE SET NULL,
  agent_report_id UUID REFERENCES public.agent_reports(id) ON DELETE SET NULL,
  health_alert_id UUID REFERENCES public.health_alerts(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  response_code INTEGER,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view notification logs"
ON public.notification_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Service role can manage notification logs"
ON public.notification_logs
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for quick lookups
CREATE INDEX idx_notification_logs_sent_at 
ON public.notification_logs(sent_at DESC);