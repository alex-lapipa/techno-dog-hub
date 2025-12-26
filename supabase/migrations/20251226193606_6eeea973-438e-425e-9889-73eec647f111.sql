-- Add notification tracking to api_keys
ALTER TABLE public.api_keys 
ADD COLUMN IF NOT EXISTS usage_notification_sent_at timestamp with time zone DEFAULT NULL;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_api_keys_notification ON public.api_keys (status, usage_notification_sent_at);

COMMENT ON COLUMN public.api_keys.usage_notification_sent_at IS 'Tracks when usage limit notification was last sent to avoid duplicate emails';