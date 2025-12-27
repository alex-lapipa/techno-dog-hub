import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditLogEntry {
  action_type: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden - Admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      // Log a new admin action
      const body: AuditLogEntry = await req.json();
      
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';

      const { data, error } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: user.id,
          action_type: body.action_type,
          entity_type: body.entity_type,
          entity_id: body.entity_id,
          details: body.details || {},
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging audit:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Audit log created:', data.id);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Fetch audit logs with filtering
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const actionType = url.searchParams.get('action_type');
      const entityType = url.searchParams.get('entity_type');
      const startDate = url.searchParams.get('start_date');
      const endDate = url.searchParams.get('end_date');

      let query = supabase
        .from('admin_audit_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (actionType) {
        query = query.eq('action_type', actionType);
      }
      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get admin emails for the logs
      const adminIds = [...new Set(data?.map(log => log.admin_user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', adminIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

      const logsWithEmail = data?.map(log => ({
        ...log,
        admin_email: profileMap.get(log.admin_user_id) || 'Unknown',
      }));

      console.log(`Fetched ${data?.length || 0} audit logs`);
      return new Response(JSON.stringify({ 
        data: logsWithEmail, 
        total: count,
        limit,
        offset 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Activity log error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
