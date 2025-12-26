-- Create webhooks table for subscriber notifications
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Webhook',
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['content.updated'],
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'failed')),
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook_deliveries table for delivery logs
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_webhooks_user_id ON public.webhooks(user_id);
CREATE INDEX idx_webhooks_status ON public.webhooks(status);
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS policies for webhooks
CREATE POLICY "Users can view own webhooks"
ON public.webhooks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own webhooks"
ON public.webhooks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks"
ON public.webhooks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks"
ON public.webhooks FOR DELETE
USING (auth.uid() = user_id);

-- Service role access for dispatch
CREATE POLICY "Service role can read all webhooks"
ON public.webhooks FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can update all webhooks"
ON public.webhooks FOR UPDATE
TO service_role
USING (true);

-- RLS policies for webhook_deliveries
CREATE POLICY "Users can view own webhook deliveries"
ON public.webhook_deliveries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.webhooks 
  WHERE webhooks.id = webhook_deliveries.webhook_id 
  AND webhooks.user_id = auth.uid()
));

CREATE POLICY "Service role can manage deliveries"
ON public.webhook_deliveries FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at
CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create pending_webhook_events table for queuing
CREATE TABLE public.pending_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_pending_webhook_events_processed ON public.pending_webhook_events(processed, created_at);

ALTER TABLE public.pending_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage pending events"
ON public.pending_webhook_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);