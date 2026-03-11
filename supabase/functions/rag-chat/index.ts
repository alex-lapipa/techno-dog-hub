/**
 * rag-chat — RAG-powered techno knowledge chat endpoint.
 * 
 * Orchestrates: rate limiting → caching → embedding → context retrieval → AI completion.
 * All heavy logic lives in shared modules under _shared/.
 */

import { handleCors, corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getEnv, getRequiredEnv } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";
import { getClientIP, checkRateLimit, isAdminRequest, rateLimitHeaders } from "../_shared/rate-limiter.ts";
import { hashQuery, getCachedResponse, setCachedResponse } from "../_shared/rag-cache.ts";
import { retrieveContext, buildContextString, buildArtistMeta } from "../_shared/rag-context.ts";
import {
  callCompletion,
  handleCompletionError,
  buildStreamingResponse,
  parseNonStreamingResponse,
} from "../_shared/rag-completion.ts";

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_ENDPOINT = 'rag-chat';

Deno.serve(async (req) => {
  // --- CORS ---
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  // --- Admin check ---
  const isAdmin = await isAdminRequest(req, SUPABASE_URL, getEnv('SUPABASE_ANON_KEY', ''));
  if (isAdmin) console.log('Admin user detected — bypassing rate limit');

  // --- Rate limiting ---
  const clientIP = getClientIP(req);
  let rateLimit = { allowed: true, remaining: RATE_LIMIT_MAX, resetAt: new Date(Date.now() + 60000) };

  if (!isAdmin) {
    rateLimit = await checkRateLimit(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, clientIP, {
      maxRequests: RATE_LIMIT_MAX,
      endpoint: RATE_LIMIT_ENDPOINT,
    });
  }

  const rlHeaders = rateLimitHeaders(isAdmin, rateLimit, RATE_LIMIT_MAX);

  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000));
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait before making more requests.', retryAfter }),
      {
        status: 429,
        headers: { ...corsHeaders, ...rlHeaders, 'Retry-After': retryAfter.toString(), 'Content-Type': 'application/json' },
      }
    );
  }

  console.log(`Request from IP: ${clientIP}, admin: ${isAdmin}, remaining: ${isAdmin ? 'unlimited' : rateLimit.remaining}`);

  try {
    // --- Parse & validate input ---
    const { query, stream = true } = await req.json();
    if (!query || typeof query !== 'string') throw new Error('Query is required');
    if (query.length > 2000) return errorResponse('Query exceeds maximum length of 2000 characters', 400);

    const sanitizedQuery = query.trim().slice(0, 2000);
    const LOVABLE_API_KEY = getRequiredEnv('LOVABLE_API_KEY');
    const supabase = createServiceClient();

    // --- Cache check (non-streaming only) ---
    const cacheKey = hashQuery(sanitizedQuery);

    if (!stream) {
      const cached = await getCachedResponse(supabase, cacheKey);
      if (cached && !cached.stale) {
        console.log('Returning fresh cached response — COST SAVED');
        return jsonResponse({ ...cached.data, cached: true });
      }
      if (cached?.stale) {
        console.log('Returning stale cached response (SWR)');
        return jsonResponse({ ...cached.data, cached: true, stale: true });
      }
    }

    // --- Generate embedding ---
    console.log('Generating Voyage embedding for query:', sanitizedQuery);
    const voyageResult = await generateVoyageEmbedding(sanitizedQuery);
    const queryEmbedding = voyageResult?.embedding || null;
    const embeddingProvider = voyageResult?.provider || 'none';
    console.log(`Embedding provider: ${embeddingProvider}, dimensions: ${queryEmbedding?.length || 0}`);

    // --- Retrieve context ---
    let context = '';
    let ragContext = { artists: [] as any[], documents: [] as any[], artistDocs: [] as any[], gear: [] as any[], embeddingProvider };

    if (queryEmbedding) {
      const embeddingStr = formatEmbeddingForStorage(queryEmbedding);
      ragContext = await retrieveContext(supabase, embeddingStr, sanitizedQuery);
      context = buildContextString(ragContext);
    }

    // --- AI completion ---
    const aiResponse = await callCompletion({
      query: sanitizedQuery,
      context,
      apiKey: LOVABLE_API_KEY,
      stream,
    });

    // Handle AI errors
    const aiError = handleCompletionError(aiResponse);
    if (aiError) return aiError;

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errText);
      throw new Error(`AI API request failed: ${errText}`);
    }

    // --- Build response ---
    if (stream) {
      const artistMeta = buildArtistMeta(ragContext.artists);
      return buildStreamingResponse(aiResponse, artistMeta);
    } else {
      const result = await parseNonStreamingResponse(aiResponse, ragContext.documents, ragContext.artists);
      await setCachedResponse(supabase, cacheKey, sanitizedQuery, result);
      return jsonResponse({ ...result, cached: false });
    }
  } catch (error: unknown) {
    console.error('Error in rag-chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message);
  }
});
