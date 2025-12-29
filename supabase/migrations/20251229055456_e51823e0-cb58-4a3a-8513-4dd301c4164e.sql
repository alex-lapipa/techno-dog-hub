-- =============================================
-- TICKETING MODULE - SELF-CONTAINED SCHEMA
-- Prefix: tkt_ to avoid conflicts
-- =============================================

-- Organizations table (ticket sellers/venues)
CREATE TABLE public.tkt_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  website_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE public.tkt_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.tkt_organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  venue_name TEXT,
  venue_address TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  doors_open TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Ticket types for each event
CREATE TABLE public.tkt_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.tkt_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  quantity_total INTEGER NOT NULL CHECK (quantity_total > 0),
  quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  max_per_order INTEGER DEFAULT 10 CHECK (max_per_order > 0),
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.tkt_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  event_id UUID NOT NULL REFERENCES public.tkt_events(id) ON DELETE RESTRICT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items (individual tickets in an order)
CREATE TABLE public.tkt_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.tkt_orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.tkt_ticket_types(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_tkt_events_org ON public.tkt_events(organization_id);
CREATE INDEX idx_tkt_events_slug ON public.tkt_events(slug);
CREATE INDEX idx_tkt_events_status ON public.tkt_events(status);
CREATE INDEX idx_tkt_ticket_types_event ON public.tkt_ticket_types(event_id);
CREATE INDEX idx_tkt_orders_event ON public.tkt_orders(event_id);
CREATE INDEX idx_tkt_orders_email ON public.tkt_orders(customer_email);
CREATE INDEX idx_tkt_orders_number ON public.tkt_orders(order_number);
CREATE INDEX idx_tkt_order_items_order ON public.tkt_order_items(order_id);

-- Enable RLS on all tables
ALTER TABLE public.tkt_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tkt_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tkt_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tkt_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tkt_order_items ENABLE ROW LEVEL SECURITY;

-- Public read policies for published content (widget needs this)
CREATE POLICY "Public can view organizations" ON public.tkt_organizations
  FOR SELECT USING (true);

CREATE POLICY "Public can view published events" ON public.tkt_events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view active ticket types for published events" ON public.tkt_ticket_types
  FOR SELECT USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM public.tkt_events 
      WHERE id = tkt_ticket_types.event_id 
      AND status = 'published'
    )
  );

-- Orders - public can create, only admins can view all
CREATE POLICY "Public can create orders" ON public.tkt_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view own orders by email" ON public.tkt_orders
  FOR SELECT USING (true);

-- Order items - tied to order access
CREATE POLICY "Public can create order items" ON public.tkt_order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view order items" ON public.tkt_order_items
  FOR SELECT USING (true);

-- Admin policies (for authenticated users with admin role)
CREATE POLICY "Admins can manage organizations" ON public.tkt_organizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.community_profiles 
      WHERE user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

CREATE POLICY "Admins can manage all events" ON public.tkt_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.community_profiles 
      WHERE user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

CREATE POLICY "Admins can manage all ticket types" ON public.tkt_ticket_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.community_profiles 
      WHERE user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

CREATE POLICY "Admins can manage all orders" ON public.tkt_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.community_profiles 
      WHERE user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

CREATE POLICY "Admins can manage all order items" ON public.tkt_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.community_profiles 
      WHERE user_id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Function to update quantity_sold when order is confirmed
CREATE OR REPLACE FUNCTION public.tkt_update_ticket_quantity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    UPDATE public.tkt_ticket_types tt
    SET quantity_sold = quantity_sold + oi.quantity,
        updated_at = now()
    FROM public.tkt_order_items oi
    WHERE oi.order_id = NEW.id
    AND tt.id = oi.ticket_type_id;
  ELSIF NEW.status IN ('cancelled', 'refunded') AND OLD.status = 'confirmed' THEN
    UPDATE public.tkt_ticket_types tt
    SET quantity_sold = GREATEST(0, quantity_sold - oi.quantity),
        updated_at = now()
    FROM public.tkt_order_items oi
    WHERE oi.order_id = NEW.id
    AND tt.id = oi.ticket_type_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tkt_order_status_change
  AFTER UPDATE OF status ON public.tkt_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.tkt_update_ticket_quantity();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.tkt_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'TKT-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tkt_set_order_number
  BEFORE INSERT ON public.tkt_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.tkt_generate_order_number();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.tkt_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER tkt_organizations_updated_at BEFORE UPDATE ON public.tkt_organizations
  FOR EACH ROW EXECUTE FUNCTION public.tkt_update_updated_at();

CREATE TRIGGER tkt_events_updated_at BEFORE UPDATE ON public.tkt_events
  FOR EACH ROW EXECUTE FUNCTION public.tkt_update_updated_at();

CREATE TRIGGER tkt_ticket_types_updated_at BEFORE UPDATE ON public.tkt_ticket_types
  FOR EACH ROW EXECUTE FUNCTION public.tkt_update_updated_at();

CREATE TRIGGER tkt_orders_updated_at BEFORE UPDATE ON public.tkt_orders
  FOR EACH ROW EXECUTE FUNCTION public.tkt_update_updated_at();