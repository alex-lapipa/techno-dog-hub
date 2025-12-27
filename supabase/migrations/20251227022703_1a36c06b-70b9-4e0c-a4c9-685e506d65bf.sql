-- Create health alert tracking table
CREATE TABLE public.health_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'resolved')),
  service_name TEXT NOT NULL,
  message TEXT NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for querying active alerts
CREATE INDEX idx_health_alerts_active ON public.health_alerts(service_name, resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_health_alerts_created ON public.health_alerts(created_at DESC);

-- Enable RLS
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view health alerts
CREATE POLICY "Admins can view health alerts"
  ON public.health_alerts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage health alerts
CREATE POLICY "Service role can manage health alerts"
  ON public.health_alerts
  FOR ALL
  USING (true)
  WITH CHECK (true);