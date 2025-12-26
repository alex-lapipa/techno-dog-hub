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
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
}

interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  limit_remaining: number;
  reset_at: string;
}

// Validate API key and return user info
async function validateApiKey(
  apiKey: string, 
  supabase: SupabaseClient
): Promise<{ valid: boolean; userId?: string; keyId?: string; rateLimit?: number; error?: string }> {
  if (!apiKey || !apiKey.startsWith('td_live_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const keyHash = await hashKey(apiKey);

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, user_id, status, rate_limit_per_minute, rate_limit_per_day')
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

  return { 
    valid: true, 
    userId: keyRecord.user_id, 
    keyId: keyRecord.id,
    rateLimit: keyRecord.rate_limit_per_minute 
  };
}

// Check rate limit using database function
async function checkRateLimit(
  supabase: SupabaseClient,
  keyId: string,
  userId: string,
  endpoint: string,
  limitPerMinute: number
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_api_key_id: keyId,
    p_user_id: userId,
    p_endpoint: endpoint,
    p_limit_per_minute: limitPerMinute
  });

  if (error) {
    console.error('Rate limit check error:', error);
    // Allow request on error but log it
    return { allowed: true, remaining: 0, resetAt: new Date().toISOString() };
  }

  const result = data?.[0] as RateLimitResult | undefined;
  if (!result) {
    return { allowed: true, remaining: 0, resetAt: new Date().toISOString() };
  }

  return {
    allowed: result.allowed,
    remaining: result.limit_remaining,
    resetAt: result.reset_at
  };
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

    // Check rate limit
    const rateLimit = await checkRateLimit(
      supabase,
      validation.keyId!,
      validation.userId!,
      '/api/v1/ping',
      validation.rateLimit || 60
    );

    // Add rate limit headers
    const rateLimitHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-RateLimit-Limit': String(validation.rateLimit || 60),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': rateLimit.resetAt,
    };

    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for user: ${validation.userId}`);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: rateLimit.resetAt
        }),
        { status: 429, headers: rateLimitHeaders }
      );
    }

    console.log(`API ping from user: ${validation.userId}, remaining: ${rateLimit.remaining}`);

    return new Response(
      JSON.stringify({
        ok: true,
        project: 'techno.dog',
        timestamp: new Date().toISOString(),
        version: 'v1',
        rateLimit: {
          limit: validation.rateLimit || 60,
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt
        }
      }),
      { headers: rateLimitHeaders }
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
