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
}

interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  limit_remaining: number;
  reset_at: string;
}

// Validate API key
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
    .select('id, user_id, status, rate_limit_per_minute')
    .eq('key_hash', keyHash)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid or revoked API key' };
  }

  const keyRecord = data as KeyRecord;

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

// Check rate limit
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

// Generate request ID
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

// Error response helper
function errorResponse(
  code: string, 
  message: string, 
  status: number, 
  requestId: string,
  headers: Record<string, string> = {}
): Response {
  return new Response(
    JSON.stringify({
      error: { code, message, requestId }
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json', ...headers } 
    }
  );
}

// Extract docId from URL path
function extractDocId(url: URL): string | null {
  // URL pattern: /api-v1-docs or function invoke with docId in query/body
  const docId = url.searchParams.get('docId');
  return docId;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = generateRequestId();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('unauthorized', 'Missing or invalid API key.', 401, requestId);
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const validation = await validateApiKey(apiKey, supabase);

    if (!validation.valid) {
      return errorResponse('unauthorized', validation.error || 'Invalid API key.', 401, requestId);
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(
      supabase,
      validation.keyId!,
      validation.userId!,
      '/api/v1/docs',
      validation.rateLimit || 60
    );

    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(validation.rateLimit || 60),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': rateLimit.resetAt,
      'X-Request-Id': requestId,
    };

    if (!rateLimit.allowed) {
      return errorResponse('rate_limited', 'Rate limit exceeded. Please try again later.', 429, requestId, rateLimitHeaders);
    }

    // Get docId from query params
    const url = new URL(req.url);
    const docId = extractDocId(url);

    if (!docId) {
      return errorResponse('bad_request', 'Missing required parameter: docId', 400, requestId, rateLimitHeaders);
    }

    console.log(`API docs: docId="${docId}", user=${validation.userId}`);

    // Fetch document
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, content, source, metadata, created_at, updated_at')
      .eq('id', docId)
      .single();

    if (fetchError || !doc) {
      return errorResponse('not_found', `Document not found: ${docId}`, 404, requestId, rateLimitHeaders);
    }

    const metadata = doc.metadata as Record<string, unknown> || {};

    return new Response(
      JSON.stringify({
        doc: {
          docId: doc.id,
          type: (metadata.type as string) || 'article',
          title: doc.title,
          tags: (metadata.tags as string[]) || [],
          updatedAt: doc.updated_at,
          content: {
            text: doc.content
          },
          metadata: {
            source_url: doc.source || `https://techno.dog/docs/${doc.id}`,
            license: 'TECHNO.DOG Knowledge License',
            createdAt: doc.created_at,
            ...metadata
          }
        },
        requestId
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...rateLimitHeaders 
        } 
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API v1 docs error:', error);
    return errorResponse('internal_error', errorMessage, 500, requestId);
  }
});
