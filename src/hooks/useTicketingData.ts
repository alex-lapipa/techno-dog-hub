import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface TktOrganization {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logo_url?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface TktEvent {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  description?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  image_url?: string | null;
  start_date: string;
  end_date?: string | null;
  doors_open?: string | null;
  status: string;
  settings: Json;
  created_at: string;
  updated_at: string;
  organization?: { id: string; name: string; slug: string } | null;
  ticket_types?: TktTicketType[];
}

export interface TktTicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string | null;
  price_cents: number;
  currency: string;
  quantity_total: number;
  quantity_sold: number;
  max_per_order: number | null;
  sale_start?: string | null;
  sale_end?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TktOrder {
  id: string;
  order_number: string;
  event_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  total_cents: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
  event?: { id: string; name: string; slug: string } | null;
}

export interface TicketingStats {
  totalOrganizations: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  recentOrders: TktOrder[];
}

export function useTicketingData() {
  const [organizations, setOrganizations] = useState<TktOrganization[]>([]);
  const [events, setEvents] = useState<TktEvent[]>([]);
  const [orders, setOrders] = useState<TktOrder[]>([]);
  const [stats, setStats] = useState<TicketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('tkt_organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (orgsError) throw orgsError;
      
      // Fetch events with ticket types
      const { data: eventsData, error: eventsError } = await supabase
        .from('tkt_events')
        .select(`
          *,
          organization:tkt_organizations(id, name, slug),
          ticket_types:tkt_ticket_types(*)
        `)
        .order('start_date', { ascending: false });
      
      if (eventsError) throw eventsError;
      
      // Fetch recent orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('tkt_orders')
        .select(`
          *,
          event:tkt_events(id, name, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (ordersError) throw ordersError;

      // Calculate stats
      const totalTicketsSold = (eventsData || []).reduce((sum, event) => {
        const eventTickets = (event.ticket_types as TktTicketType[] || []);
        return sum + eventTickets.reduce((s, t) => s + t.quantity_sold, 0);
      }, 0);

      const totalRevenue = (ordersData || [])
        .filter(o => o.status === 'confirmed')
        .reduce((sum, o) => sum + o.total_cents, 0);

      setOrganizations(orgsData || []);
      setEvents(eventsData as TktEvent[] || []);
      setOrders(ordersData as TktOrder[] || []);
      setStats({
        totalOrganizations: (orgsData || []).length,
        totalEvents: (eventsData || []).length,
        totalTicketsSold,
        totalRevenue,
        recentOrders: (ordersData as TktOrder[] || []).slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching ticketing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      toast.error('Failed to load ticketing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Organization CRUD
  const createOrganization = async (data: Partial<TktOrganization>) => {
    const { data: result, error } = await supabase
      .from('tkt_organizations')
      .insert({
        name: data.name!,
        slug: data.slug!,
        description: data.description || null,
        contact_email: data.contact_email || null,
        website_url: data.website_url || null,
        logo_url: data.logo_url || null,
        settings: data.settings || {}
      })
      .select()
      .single();
    
    if (error) {
      toast.error(`Failed to create organization: ${error.message}`);
      throw error;
    }
    
    toast.success('Organization created');
    await fetchAll();
    return result;
  };

  const updateOrganization = async (id: string, data: Partial<TktOrganization>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    
    const { error } = await supabase
      .from('tkt_organizations')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to update organization: ${error.message}`);
      throw error;
    }
    
    toast.success('Organization updated');
    await fetchAll();
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase
      .from('tkt_organizations')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to delete organization: ${error.message}`);
      throw error;
    }
    
    toast.success('Organization deleted');
    await fetchAll();
  };

  // Event CRUD
  const createEvent = async (data: Partial<TktEvent>) => {
    const { data: result, error } = await supabase
      .from('tkt_events')
      .insert({
        organization_id: data.organization_id!,
        name: data.name!,
        slug: data.slug!,
        description: data.description || null,
        venue_name: data.venue_name || null,
        venue_address: data.venue_address || null,
        image_url: data.image_url || null,
        start_date: data.start_date!,
        end_date: data.end_date || null,
        doors_open: data.doors_open || null,
        status: data.status || 'draft',
        settings: data.settings || {}
      })
      .select()
      .single();
    
    if (error) {
      toast.error(`Failed to create event: ${error.message}`);
      throw error;
    }
    
    toast.success('Event created');
    await fetchAll();
    return result;
  };

  const updateEvent = async (id: string, data: Partial<TktEvent>) => {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.venue_name !== undefined) updateData.venue_name = data.venue_name;
    
    const { error } = await supabase
      .from('tkt_events')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to update event: ${error.message}`);
      throw error;
    }
    
    toast.success('Event updated');
    await fetchAll();
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('tkt_events')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to delete event: ${error.message}`);
      throw error;
    }
    
    toast.success('Event deleted');
    await fetchAll();
  };

  // Ticket Type CRUD
  const createTicketType = async (data: Partial<TktTicketType>) => {
    const { data: result, error } = await supabase
      .from('tkt_ticket_types')
      .insert({
        event_id: data.event_id,
        name: data.name,
        description: data.description,
        price_cents: data.price_cents,
        currency: data.currency || 'EUR',
        quantity_total: data.quantity_total,
        max_per_order: data.max_per_order || 10,
        sale_start: data.sale_start,
        sale_end: data.sale_end,
        is_active: data.is_active ?? true,
        sort_order: data.sort_order || 0
      })
      .select()
      .single();
    
    if (error) {
      toast.error(`Failed to create ticket type: ${error.message}`);
      throw error;
    }
    
    toast.success('Ticket type created');
    await fetchAll();
    return result;
  };

  const updateTicketType = async (id: string, data: Partial<TktTicketType>) => {
    const { error } = await supabase
      .from('tkt_ticket_types')
      .update(data)
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to update ticket type: ${error.message}`);
      throw error;
    }
    
    toast.success('Ticket type updated');
    await fetchAll();
  };

  const deleteTicketType = async (id: string) => {
    const { error } = await supabase
      .from('tkt_ticket_types')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to delete ticket type: ${error.message}`);
      throw error;
    }
    
    toast.success('Ticket type deleted');
    await fetchAll();
  };

  // Order actions
  const updateOrderStatus = async (id: string, status: TktOrder['status']) => {
    const { error } = await supabase
      .from('tkt_orders')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      toast.error(`Failed to update order: ${error.message}`);
      throw error;
    }
    
    toast.success(`Order ${status}`);
    await fetchAll();
  };

  return {
    organizations,
    events,
    orders,
    stats,
    loading,
    error,
    refresh: fetchAll,
    // Organization
    createOrganization,
    updateOrganization,
    deleteOrganization,
    // Event
    createEvent,
    updateEvent,
    deleteEvent,
    // Ticket Type
    createTicketType,
    updateTicketType,
    deleteTicketType,
    // Order
    updateOrderStatus
  };
}
