import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate secure webhook secret
function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return 'whsec_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);

    // GET - List webhooks
    if (req.method === 'GET') {
      const webhookId = url.searchParams.get('id');
      
      if (webhookId) {
        // Get single webhook with recent deliveries
        const { data: webhook, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('id', webhookId)
          .eq('user_id', user.id)
          .single();

        if (error || !webhook) {
          return new Response(
            JSON.stringify({ error: 'Webhook not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get recent deliveries
        const { data: deliveries } = await supabase
          .from('webhook_deliveries')
          .select('*')
          .eq('webhook_id', webhookId)
          .order('created_at', { ascending: false })
          .limit(10);

        return new Response(
          JSON.stringify({ webhook, deliveries: deliveries || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // List all webhooks
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select('id, name, url, events, status, failure_count, last_triggered_at, last_success_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ webhooks: webhooks || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST - Create webhook
    if (req.method === 'POST') {
      const body = await req.json();
      const { name, url: webhookUrl, events } = body;

      if (!webhookUrl) {
        return new Response(
          JSON.stringify({ error: 'URL is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate URL
      try {
        new URL(webhookUrl);
      } catch {
        return new Response(
          JSON.stringify({ error: 'Invalid URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const secret = generateWebhookSecret();
      const validEvents = ['content.updated', 'content.created', 'content.deleted'];
      const selectedEvents = (events || ['content.updated']).filter((e: string) => validEvents.includes(e));

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          name: name || 'My Webhook',
          url: webhookUrl,
          secret,
          events: selectedEvents.length > 0 ? selectedEvents : ['content.updated'],
          status: 'active'
        })
        .select('id, name, url, events, status, created_at')
        .single();

      if (error) throw error;

      console.log(`Webhook created: ${webhook.id} for user ${user.id}`);

      return new Response(
        JSON.stringify({ 
          webhook,
          secret,
          notice: 'Save this secret securely. It will not be shown again.'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PATCH - Update webhook
    if (req.method === 'PATCH') {
      const webhookId = url.searchParams.get('id');
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: 'Webhook ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const body = await req.json();
      const updates: Record<string, unknown> = {};

      if (body.name) updates.name = body.name;
      if (body.url) {
        try {
          new URL(body.url);
          updates.url = body.url;
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid URL format' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      if (body.events) updates.events = body.events;
      if (body.status) updates.status = body.status;

      // Reset failure count if reactivating
      if (body.status === 'active') {
        updates.failure_count = 0;
        updates.last_error = null;
      }

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', webhookId)
        .eq('user_id', user.id)
        .select('id, name, url, events, status, created_at')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ webhook }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE - Delete webhook
    if (req.method === 'DELETE') {
      const webhookId = url.searchParams.get('id');
      if (!webhookId) {
        return new Response(
          JSON.stringify({ error: 'Webhook ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log(`Webhook deleted: ${webhookId}`);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhooks function error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
