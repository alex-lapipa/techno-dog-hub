import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate cryptographically secure random bytes
function generateSecureKey(): { prefix: string; secret: string; fullKey: string } {
  const prefixBytes = new Uint8Array(4);
  const secretBytes = new Uint8Array(32);
  crypto.getRandomValues(prefixBytes);
  crypto.getRandomValues(secretBytes);
  
  const prefix = Array.from(prefixBytes)
    .map(b => b.toString(36).toUpperCase())
    .join('')
    .substring(0, 6);
  
  const secret = Array.from(secretBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const fullKey = `td_live_${prefix}.${secret}`;
  return { prefix, secret, fullKey };
}

// SHA-256 hash function
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    // Create client with user's token to verify authentication
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

    // Use service role client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      // Generate new API key
      const body = await req.json().catch(() => ({}));
      const keyName = body.name || 'Default API Key';
      const keyDescription = body.description || null;
      const keyScopes = body.scopes || ['read:public'];
      
      console.log(`Creating API key for user: ${user.id}`);

      // Check if user is a verified community member
      const { data: profile } = await supabase
        .from('community_profiles')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile || profile.status !== 'verified') {
        return new Response(
          JSON.stringify({ error: 'Email verification required to create API keys' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Revoke any existing active keys for this user (one active key per user)
      const { error: revokeError } = await supabase
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (revokeError) {
        console.error('Error revoking existing keys:', revokeError);
      }

      // Generate new key
      const { prefix, fullKey } = generateSecureKey();
      const keyHash = await hashKey(fullKey);

      // Store the key with scopes
      const { data: newKey, error: insertError } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          name: keyName,
          prefix: `td_live_${prefix}`,
          key_hash: keyHash,
          status: 'active',
          scopes: keyScopes,
          description: keyDescription,
        })
        .select('id, name, prefix, status, created_at, scopes')
        .single();

      if (insertError) {
        console.error('Error creating API key:', insertError);
        throw insertError;
      }

      console.log(`API key created: ${newKey.prefix} with scopes: ${keyScopes.join(', ')}`);

      return new Response(
        JSON.stringify({
          apiKey: fullKey,
          keyInfo: newKey,
          notice: 'Copy this key now. It will not be shown again.'
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // List user's API keys (without the actual key values)
      const { data: keys, error: listError } = await supabase
        .from('api_keys')
        .select('id, name, prefix, status, created_at, last_used_at, rate_limit_per_minute, rate_limit_per_day, total_requests, scopes, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (listError) {
        throw listError;
      }

      return new Response(
        JSON.stringify({ keys }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'DELETE') {
      // Revoke a specific key
      const url = new URL(req.url);
      const keyId = url.searchParams.get('id');
      
      if (!keyId) {
        return new Response(
          JSON.stringify({ error: 'Missing key id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: revokeError } = await supabase
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('id', keyId)
        .eq('user_id', user.id);

      if (revokeError) {
        throw revokeError;
      }

      console.log(`API key revoked: ${keyId}`);

      return new Response(
        JSON.stringify({ success: true, message: 'API key revoked' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API keys function error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
