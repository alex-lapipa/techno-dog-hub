import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate HMAC-SHA256 signature
async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  status: string;
  failure_count: number;
}

interface WebhookEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  payload: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting webhook dispatch...');

    // Get pending events
    const { data: pendingEvents, error: eventsError } = await supabase
      .from('pending_webhook_events')
      .select('*')
      .eq('processed', false)
      .order('created_at', { ascending: true })
      .limit(50);

    if (eventsError) {
      console.error('Error fetching pending events:', eventsError);
      throw eventsError;
    }

    if (!pendingEvents || pendingEvents.length === 0) {
      console.log('No pending events to process');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending events' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${pendingEvents.length} pending events`);

    // Get all active webhooks
    const { data: webhooks, error: webhooksError } = await supabase
      .from('webhooks')
      .select('id, url, secret, events, status, failure_count')
      .eq('status', 'active');

    if (webhooksError) {
      console.error('Error fetching webhooks:', webhooksError);
      throw webhooksError;
    }

    if (!webhooks || webhooks.length === 0) {
      // Mark events as processed even if no webhooks
      await supabase
        .from('pending_webhook_events')
        .update({ processed: true })
        .in('id', pendingEvents.map(e => e.id));

      console.log('No active webhooks, marked events as processed');
      return new Response(
        JSON.stringify({ processed: pendingEvents.length, dispatched: 0, message: 'No active webhooks' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let dispatchedCount = 0;
    const MAX_FAILURES = 5;

    // Process each event
    for (const event of pendingEvents as WebhookEvent[]) {
      // Find webhooks subscribed to this event type
      const matchingWebhooks = (webhooks as Webhook[]).filter(
        w => w.events.includes(event.event_type) || w.events.includes('*')
      );

      for (const webhook of matchingWebhooks) {
        const timestamp = Math.floor(Date.now() / 1000);
        const payload = JSON.stringify({
          id: event.id,
          type: event.event_type,
          created: new Date().toISOString(),
          data: {
            entity_type: event.entity_type,
            entity_id: event.entity_id,
            ...event.payload
          }
        });

        // Generate signature
        const signedPayload = `${timestamp}.${payload}`;
        const signature = await generateSignature(signedPayload, webhook.secret);

        const startTime = Date.now();
        let success = false;
        let responseStatus = 0;
        let responseBody = '';

        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
              'X-Webhook-ID': event.id,
              'User-Agent': 'TECHNO.DOG-Webhooks/1.0'
            },
            body: payload,
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });

          responseStatus = response.status;
          responseBody = await response.text().catch(() => '');
          success = response.ok;

          console.log(`Webhook ${webhook.id} to ${webhook.url}: ${responseStatus}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Webhook ${webhook.id} failed:`, errorMessage);
          responseBody = errorMessage;
        }

        const durationMs = Date.now() - startTime;

        // Log delivery
        await supabase.from('webhook_deliveries').insert({
          webhook_id: webhook.id,
          event_type: event.event_type,
          payload: event.payload,
          response_status: responseStatus,
          response_body: responseBody.slice(0, 1000),
          success,
          duration_ms: durationMs
        });

        // Update webhook status
        if (success) {
          await supabase
            .from('webhooks')
            .update({
              last_triggered_at: new Date().toISOString(),
              last_success_at: new Date().toISOString(),
              failure_count: 0,
              last_error: null
            })
            .eq('id', webhook.id);
          dispatchedCount++;
        } else {
          const newFailureCount = webhook.failure_count + 1;
          await supabase
            .from('webhooks')
            .update({
              last_triggered_at: new Date().toISOString(),
              last_failure_at: new Date().toISOString(),
              failure_count: newFailureCount,
              last_error: responseBody.slice(0, 500),
              status: newFailureCount >= MAX_FAILURES ? 'failed' : 'active'
            })
            .eq('id', webhook.id);
        }
      }

      // Mark event as processed
      await supabase
        .from('pending_webhook_events')
        .update({ processed: true })
        .eq('id', event.id);
    }

    console.log(`Dispatch complete: ${dispatchedCount} webhooks sent`);

    return new Response(
      JSON.stringify({ 
        processed: pendingEvents.length, 
        dispatched: dispatchedCount,
        webhooks: webhooks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook dispatch error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
