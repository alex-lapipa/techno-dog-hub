-- Create table for store launch notifications
CREATE TABLE public.launch_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.launch_notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup)
CREATE POLICY "Anyone can sign up for launch notifications"
ON public.launch_notifications
FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage notifications
CREATE POLICY "Admins can view launch notifications"
ON public.launch_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);