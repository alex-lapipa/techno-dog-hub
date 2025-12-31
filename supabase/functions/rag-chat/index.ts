import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getEnv, getRequiredEnv } from "../_shared/supabase.ts";

// Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_ENDPOINT = 'rag-chat';

// Get client IP from request headers
function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return realIP.trim();
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) return cfConnectingIP.trim();
  
  return 'unknown';
}

// Check rate limit using persistent Supabase storage
async function checkPersistentRateLimit(
  supabaseUrl: string,
  supabaseKey: string,
  ip: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/check_ip_rate_limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_ip_address: ip,
        p_endpoint: RATE_LIMIT_ENDPOINT,
        p_limit_per_minute: RATE_LIMIT_MAX_REQUESTS
      })
    });

    if (!response.ok) {
      console.error('Rate limit check error:', response.status);
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, resetAt: new Date(Date.now() + 60000) };
    }

    const data = await response.json();
    const result = data?.[0];
    
    if (!result) {
      return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, resetAt: new Date(Date.now() + 60000) };
    }

    return {
      allowed: result.allowed,
      remaining: result.limit_remaining,
      resetAt: new Date(result.reset_at)
    };
  } catch (err) {
    console.error('Rate limit check exception:', err);
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, resetAt: new Date(Date.now() + 60000) };
  }
}

// Generate embedding using OpenAI API
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 768
      }),
    });

    if (!response.ok) {
      console.error('OpenAI Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Format artist data for context
function formatArtistContext(artist: {
  rank: number;
  artist_name: string;
  real_name: string | null;
  nationality: string | null;
  years_active: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
  top_tracks: string[] | null;
  known_for: string | null;
  similarity: number;
}): string {
  const parts = [
    `**#${artist.rank} ${artist.artist_name}**`,
    artist.real_name ? `Real name: ${artist.real_name}` : null,
    artist.nationality ? `Nationality: ${artist.nationality}` : null,
    artist.years_active ? `Active: ${artist.years_active}` : null,
    artist.subgenres?.length ? `Genres: ${artist.subgenres.join(', ')}` : null,
    artist.labels?.length ? `Labels: ${artist.labels.join(', ')}` : null,
    artist.top_tracks?.length ? `Key tracks: ${artist.top_tracks.join(', ')}` : null,
    artist.known_for ? `Known for: ${artist.known_for}` : null,
    `Relevance: ${(artist.similarity * 100).toFixed(1)}%`
  ].filter(Boolean);
  
  return parts.join('\n');
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');

  // Check for admin bypass
  let isAdmin = false;
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/has_role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': getEnv('SUPABASE_ANON_KEY', ''),
          'Authorization': authHeader
        },
        body: JSON.stringify({
          _user_id: null,
          _role: 'admin'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        isAdmin = result === true;
        if (isAdmin) console.log('Admin user detected - bypassing rate limit');
      }
    } catch (err) {
      console.error('Admin check failed:', err);
    }
  }

  // Apply persistent IP-based rate limiting
  const clientIP = getClientIP(req);
  let rateLimit = { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS, resetAt: new Date(Date.now() + 60000) };
  
  if (!isAdmin) {
    rateLimit = await checkPersistentRateLimit(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, clientIP);
  }
  
  const rateLimitHeaders = {
    'X-RateLimit-Limit': isAdmin ? 'unlimited' : RATE_LIMIT_MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': isAdmin ? 'unlimited' : rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetAt.getTime() / 1000).toString(),
  };
  
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000);
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded. Please wait before making more requests.',
        retryAfter: Math.max(1, retryAfter)
      }), 
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          ...rateLimitHeaders,
          'Retry-After': Math.max(1, retryAfter).toString(),
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
  
  console.log(`Request from IP: ${clientIP}, admin: ${isAdmin}, remaining: ${isAdmin ? 'unlimited' : rateLimit.remaining}`);

  try {
    const { query, stream = true } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required');
    }
    
    if (query.length > 2000) {
      return errorResponse('Query exceeds maximum length of 2000 characters', 400);
    }
    
    const sanitizedQuery = query.trim().slice(0, 2000);

    const LOVABLE_API_KEY = getRequiredEnv('LOVABLE_API_KEY');
    const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');

    const supabase = createServiceClient();

    let documents: Array<{ title: string; content: string; source?: string; similarity?: number }> | null = null;
    let artists: Array<{
      rank: number;
      artist_name: string;
      real_name: string | null;
      nationality: string | null;
      years_active: string | null;
      subgenres: string[] | null;
      labels: string[] | null;
      top_tracks: string[] | null;
      known_for: string | null;
      similarity: number;
    }> | null = null;

    // Generate embedding for vector searches
    console.log('Generating embedding for query:', sanitizedQuery);
    const queryEmbedding = OPENAI_API_KEY ? await generateEmbedding(sanitizedQuery, OPENAI_API_KEY) : null;

    // Search DJ artists using vector similarity
    if (queryEmbedding) {
      console.log('Searching DJ artists with vector similarity');
      const { data: artistResults, error: artistError } = await supabase.rpc('search_dj_artists', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        similarity_threshold: 0.3,
        match_count: 5
      });

      if (!artistError && artistResults && artistResults.length > 0) {
        artists = artistResults;
        console.log(`Found ${artistResults.length} matching artists`);
      } else if (artistError) {
        console.error('Artist search error:', artistError);
      }
    }

    // Search documents using vector similarity
    if (queryEmbedding) {
      console.log('Using vector search for documents');
      const { data: vectorResults, error: vectorError } = await supabase.rpc('match_documents', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.3,
        match_count: 5
      });

      if (!vectorError && vectorResults && vectorResults.length > 0) {
        documents = vectorResults;
        console.log(`Vector search found ${vectorResults.length} documents`);
      } else if (vectorError) {
        console.error('Vector search error:', vectorError);
      }
    }

    // Fallback to full-text search
    if (!documents || documents.length === 0) {
      console.log('Falling back to full-text search for:', sanitizedQuery);
      
      const searchTerms = sanitizedQuery
        .toLowerCase()
        .replace(/[¿?¡!.,;:]/g, '')
        .split(' ')
        .filter(word => word.length > 2)
        .join(' | ');

      const { data: textResults, error: searchError } = await supabase
        .from('documents')
        .select('id, title, content, source')
        .textSearch('content', searchTerms, { type: 'websearch', config: 'english' })
        .limit(5);

      if (!searchError && textResults) {
        documents = textResults;
        console.log(`Full-text search found ${documents.length} documents`);
      }
    }

    // Final fallback
    if (!documents || documents.length === 0) {
      console.log('Using fallback: fetching recent documents');
      const { data: fallbackDocs } = await supabase
        .from('documents')
        .select('id, title, content, source')
        .order('created_at', { ascending: false })
        .limit(5);
      
      documents = fallbackDocs || [];
    }

    console.log(`Total documents for context: ${documents?.length || 0}, artists: ${artists?.length || 0}`);

    // Build context
    let artistContext = '';
    if (artists && artists.length > 0) {
      artistContext = '## DJ ARTISTS DATABASE:\n\n' + artists.map(formatArtistContext).join('\n\n---\n\n');
    }

    let documentContext = '';
    const usedDocs = documents || [];
    
    if (usedDocs.length > 0) {
      documentContext = '## KNOWLEDGE BASE DOCUMENTS:\n\n' + usedDocs
        .map((doc) => 
          `[${doc.title}${doc.similarity ? ` (relevance: ${(doc.similarity * 100).toFixed(1)}%)` : ''}]\n${doc.content}`
        )
        .join('\n\n---\n\n');
    }

    const combinedContext = [artistContext, documentContext].filter(Boolean).join('\n\n');

    const systemPrompt = `You are an expert curator of underground techno music with deep knowledge of artists, labels, venues, and the global scene. 

IMPORTANT: You MUST always respond in English, regardless of the language of the user's question. All responses must be in English only.

Your knowledge comes from an authoritative ranking of 100 techno artists scored on underground authenticity, innovation, and scene contribution, plus a curated knowledge base of techno culture.

When answering about artists, use the DJ ARTISTS DATABASE information which includes:
- Rankings (1-100, lower is more influential/authentic)
- Real names, nationalities, years active
- Subgenres they represent
- Labels they've released on
- Key tracks
- What they're known for

Be concise, knowledgeable, and speak with authority about techno culture. Reference specific artists, labels, tracks, and venues when relevant.

If asked about rankings, tiers, or comparisons, base your answers on the provided context. The artists are ranked across dimensions: commitment to underground values, resistance to commercialization, influential tracks, scene contribution, longevity, innovation, and resistance to industry trends.

CONTEXT:
${combinedContext || 'No relevant data found. Respond based on general techno knowledge.'}`;

    console.log('Calling Lovable AI with model: google/gemini-2.5-flash');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedQuery }
        ],
        stream: stream,
        max_tokens: 1024
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return errorResponse('Rate limit exceeded. Please try again later.', 429);
      }
      if (aiResponse.status === 402) {
        return errorResponse('AI credits exhausted. Please add credits to continue.', 402);
      }
      throw new Error(`AI API request failed: ${errText}`);
    }

    if (stream) {
      const artistMeta = artists?.map(a => ({
        name: a.artist_name,
        rank: a.rank,
        nationality: a.nationality,
        subgenres: a.subgenres,
        labels: a.labels
      })) || [];
      
      const metaEvent = `data: ${JSON.stringify({ type: 'metadata', artists: artistMeta })}\n\n`;
      const metaEncoder = new TextEncoder();
      const metaBytes = metaEncoder.encode(metaEvent);
      
      const combinedStream = new ReadableStream({
        async start(controller) {
          controller.enqueue(metaBytes);
          
          const reader = aiResponse.body!.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } finally {
            controller.close();
          }
        }
      });
      
      return new Response(combinedStream, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      const data = await aiResponse.json();
      return jsonResponse({
        answer: data.choices?.[0]?.message?.content,
        sources: usedDocs.map((d) => ({ title: d.title, source: d.source })),
        artists: artists?.map(a => ({ name: a.artist_name, rank: a.rank })) || []
      });
    }
  } catch (error: unknown) {
    console.error('Error in rag-chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(message);
  }
});
