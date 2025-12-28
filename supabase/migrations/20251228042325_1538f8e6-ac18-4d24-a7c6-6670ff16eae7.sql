-- Create XP multiplier events table
CREATE TABLE public.xp_multiplier_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  multiplier numeric(3,1) NOT NULL DEFAULT 2.0 CHECK (multiplier >= 1.0 AND multiplier <= 10.0),
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  event_type text NOT NULL DEFAULT 'special' CHECK (event_type IN ('special', 'weekend', 'holiday', 'milestone')),
  icon text DEFAULT '⚡',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_date_range CHECK (end_at > start_at)
);

-- Enable RLS
ALTER TABLE public.xp_multiplier_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "XP events are publicly readable"
  ON public.xp_multiplier_events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage XP events"
  ON public.xp_multiplier_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get current active multiplier
CREATE OR REPLACE FUNCTION public.get_current_xp_multiplier()
RETURNS TABLE(multiplier numeric, event_name text, event_icon text, ends_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamp with time zone := now();
  v_is_weekend boolean;
BEGIN
  -- Check for active special events first (they take priority)
  RETURN QUERY
  SELECT 
    e.multiplier,
    e.name,
    e.icon,
    e.end_at
  FROM xp_multiplier_events e
  WHERE e.is_active = true
    AND e.start_at <= v_now
    AND e.end_at > v_now
  ORDER BY e.multiplier DESC
  LIMIT 1;

  -- If no rows returned, check for weekend bonus
  IF NOT FOUND THEN
    v_is_weekend := EXTRACT(DOW FROM v_now) IN (0, 6); -- Sunday = 0, Saturday = 6
    IF v_is_weekend THEN
      RETURN QUERY SELECT 
        1.5::numeric as multiplier,
        'Weekend Bonus'::text as event_name,
        '🎉'::text as event_icon,
        (date_trunc('week', v_now) + interval '1 week')::timestamp with time zone as ends_at;
    ELSE
      -- No multiplier active
      RETURN QUERY SELECT 
        1.0::numeric as multiplier,
        NULL::text as event_name,
        NULL::text as event_icon,
        NULL::timestamp with time zone as ends_at;
    END IF;
  END IF;
END;
$$;

-- Insert a sample future event
INSERT INTO public.xp_multiplier_events (name, description, multiplier, start_at, end_at, event_type, icon) VALUES
('New Year Celebration', 'Double XP to kick off the new year!', 2.0, '2025-01-01 00:00:00+00', '2025-01-02 00:00:00+00', 'holiday', '🎆');