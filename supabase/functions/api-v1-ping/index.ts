import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SHA-256 hash function
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface KeyRecord {
  id: string;
  user_id: string;
  status: string;
}

// Validate API key and return user info
async function validateApiKey(
  apiKey: string, 
  supabase: SupabaseClient
): Promise<{ valid: boolean; userId?: string; keyId?: string; error?: string }> {
  if (!apiKey || !apiKey.startsWith('td_live_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const keyHash = await hashKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, status')
    .eq('key_hash', keyHash)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid or revoked API key' };
  }

  const keyRecord = data as KeyRecord;

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyRecord.id);

  return { valid: true, userId: keyRecord.user_id, keyId: keyRecord.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Missing or invalid Authorization header. Use: Bearer td_live_...' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const validation = await validateApiKey(apiKey, supabase);

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ ok: false, error: validation.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`API ping from user: ${validation.userId}`);

    return new Response(
      JSON.stringify({
        ok: true,
        project: 'techno.dog',
        timestamp: new Date().toISOString(),
        version: 'v1'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API v1 ping error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
