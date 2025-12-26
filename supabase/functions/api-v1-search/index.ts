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
      '/api/v1/search',
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

    // Parse query parameters
    const url = new URL(req.url);
    const q = url.searchParams.get('q');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const types = url.searchParams.get('types')?.split(',').filter(Boolean) || [];
    const cursor = url.searchParams.get('cursor');
    const updatedAfter = url.searchParams.get('updated_after');

    if (!q) {
      return errorResponse('bad_request', 'Missing required query parameter: q', 400, requestId, rateLimitHeaders);
    }

    console.log(`API search: q="${q}", limit=${limit}, user=${validation.userId}`);

    // Build query
    let query = supabase
      .from('documents')
      .select('id, title, content, source, metadata, created_at, updated_at')
      .ilike('content', `%${q}%`)
      .order('updated_at', { ascending: false })
      .limit(limit + 1); // +1 to check if there's a next page

    if (updatedAfter) {
      query = query.gte('updated_at', updatedAfter);
    }

    if (cursor) {
      // Decode cursor (base64 encoded timestamp)
      try {
        const decodedCursor = atob(cursor);
        query = query.lt('updated_at', decodedCursor);
      } catch {
        return errorResponse('bad_request', 'Invalid cursor format', 400, requestId, rateLimitHeaders);
      }
    }

    const { data: documents, error: searchError } = await query;

    if (searchError) {
      console.error('Search error:', searchError);
      return errorResponse('internal_error', 'Search failed', 500, requestId, rateLimitHeaders);
    }

    // Process results
    const hasNextPage = documents && documents.length > limit;
    const results = (documents || []).slice(0, limit).map((doc) => {
      const metadata = doc.metadata as Record<string, unknown> || {};
      const docTags = (metadata.tags as string[]) || [];
      const docType = (metadata.type as string) || 'article';
      
      // Filter by tags if specified
      if (tags.length > 0 && !tags.some(t => docTags.includes(t))) {
        return null;
      }
      
      // Filter by types if specified
      if (types.length > 0 && !types.includes(docType)) {
        return null;
      }

      // Create snippet
      const content = doc.content || '';
      const queryLower = q.toLowerCase();
      const contentLower = content.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);
      let snippet = '';
      
      if (matchIndex >= 0) {
        const start = Math.max(0, matchIndex - 50);
        const end = Math.min(content.length, matchIndex + q.length + 100);
        snippet = (start > 0 ? '...' : '') + content.slice(start, end).trim() + (end < content.length ? '...' : '');
      } else {
        snippet = content.slice(0, 150).trim() + (content.length > 150 ? '...' : '');
      }

      // Calculate simple relevance score
      const titleMatch = doc.title.toLowerCase().includes(queryLower) ? 0.3 : 0;
      const contentMatch = contentLower.includes(queryLower) ? 0.5 : 0;
      const score = Math.min(0.99, titleMatch + contentMatch + 0.2);

      return {
        docId: doc.id,
        title: doc.title,
        snippet,
        type: docType,
        tags: docTags,
        score: Math.round(score * 100) / 100,
        updatedAt: doc.updated_at,
        url: doc.source || `https://techno.dog/docs/${doc.id}`
      };
    }).filter(Boolean);

    // Generate next cursor
    let nextCursor = null;
    if (hasNextPage && documents && documents.length > 0) {
      const lastDoc = documents[limit - 1];
      nextCursor = btoa(lastDoc.updated_at);
    }

    return new Response(
      JSON.stringify({
        query: q,
        results,
        nextCursor,
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
    console.error('API v1 search error:', error);
    return errorResponse('internal_error', errorMessage, 500, requestId);
  }
});
