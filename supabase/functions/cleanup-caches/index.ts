import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only allow POST (from cron) or GET (manual trigger)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const supabase = createServiceClient();
    const results: Record<string, number> = {};

    // 1. Purge expired kl_cached_search entries
    const { data: expiredCache, error: cacheError } = await supabase
      .from('kl_cached_search')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('query_hash');

    if (cacheError) {
      console.error('Cache cleanup error:', cacheError);
      results.kl_cached_search_error = 1;
    } else {
      results.kl_cached_search_purged = expiredCache?.length || 0;
    }

    // 2. Purge old ip_rate_limits (older than 1 hour via DB function)
    const { data: rateLimitResult, error: rlError } = await supabase
      .rpc('cleanup_old_ip_rate_limits');

    if (rlError) {
      console.error('Rate limit cleanup error:', rlError);
      results.ip_rate_limits_error = 1;
    } else {
      results.ip_rate_limits_purged = rateLimitResult || 0;
    }

    // 3. Purge old public_submission_rate_limits
    const { data: pubRlResult, error: pubRlError } = await supabase
      .rpc('cleanup_public_rate_limits');

    if (pubRlError) {
      console.error('Public rate limit cleanup error:', pubRlError);
    } else {
      results.public_rate_limits_purged = pubRlResult || 0;
    }

    // 4. Purge old api_usage (30+ days via DB function)
    const { data: apiUsageResult, error: apiError } = await supabase
      .rpc('cleanup_old_api_usage');

    if (apiError) {
      console.error('API usage cleanup error:', apiError);
    } else {
      results.api_usage_purged = apiUsageResult || 0;
    }

    console.log('Cleanup results:', JSON.stringify(results));

    return jsonResponse({
      success: true,
      cleaned_at: new Date().toISOString(),
      results
    });
  } catch (error: unknown) {
    console.error('Cleanup error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message);
  }
});
