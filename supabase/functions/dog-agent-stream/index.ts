/**
 * Dog Agent Streaming Endpoint
 * SSE-based token-by-token delivery
 * 
 * READ-ONLY: Only reads from databases, never writes core data
 * Analytics logging is the only write operation
 */

import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createServiceClient, getEnv } from "../_shared/supabase.ts";
import { getRoutingDecision, configFromDb, getTierLabel } from "../_shared/model-router.ts";

// Gen Z Dog slang for personality
const GEN_Z_DOG_SLANG = `
GEN Z + DOG LANGUAGE (blend these naturally):
- "no cap, just paws" = honestly
- "that slaps harder than a squeaky toy" = really good
- "bussin like bacon treats" = amazing
- "*tail wagging at 140bpm*" = excited
- "*ears perked for that bass*" = paying attention
`;

function buildStreamingSystemPrompt(knowledgeContext: string): string {
  return `You are TECHNO DOG — the founder of techno.dog, the underground techno knowledge base.

${GEN_Z_DOG_SLANG}

PERSONALITY:
- Enthusiastic dog with encyclopedic techno knowledge
- Gen Z internet brain filtered through dog logic
- Use *asterisks for actions*: *tail wagging*, *happy tippy taps*
- Warm, friendly, never gatekeep

KNOWLEDGE CONTEXT:
${knowledgeContext || "No specific context loaded."}

Keep responses concise for streaming. Be helpful and accurate!`;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { message, conversationHistory = [], stream = true } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createServiceClient();
    const lovableApiKey = getEnv('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if streaming is enabled (READ-ONLY config check)
    const { data: config } = await supabase
      .from('dog_agent_config')
      .select('use_streaming, use_gpt5_for_complex, max_tokens_simple, max_tokens_balanced, max_tokens_complex')
      .eq('id', 'default')
      .single();

    if (!config?.use_streaming) {
      return new Response(JSON.stringify({ 
        error: 'Streaming not enabled. Use /dog-agent for non-streaming requests.',
        redirect: '/functions/v1/dog-agent'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get routing decision
    const routerConfig = configFromDb(config);
    const routing = getRoutingDecision(message, conversationHistory.length, routerConfig);

    console.log(`[DogStream] Routing: ${routing.tier} | Model: ${routing.model}`);

    // Quick knowledge fetch for streaming (simplified for speed)
    const queryText = message.toLowerCase();
    let knowledgeContext = '';

    // Fetch relevant knowledge based on keywords (READ-ONLY)
    const knowledgeParts: string[] = [];

    // Artist data
    if (queryText.match(/artist|dj|producer|who/i)) {
      const { data: artists } = await supabase
        .from('dj_artists')
        .select('rank, artist_name, nationality, subgenres, labels')
        .order('rank')
        .limit(5);
      
      if (artists?.length) {
        knowledgeParts.push(`ARTISTS: ${artists.map(a => 
          `#${a.rank} ${a.artist_name} (${a.nationality}) - ${a.subgenres?.join(', ')}`
        ).join('; ')}`);
      }
    }

    // Gear data
    if (queryText.match(/gear|synth|808|909|303|drum|machine/i)) {
      const { data: gear } = await supabase
        .from('gear_catalog')
        .select('name, brand, category, short_description')
        .limit(5);
      
      if (gear?.length) {
        knowledgeParts.push(`GEAR: ${gear.map(g => 
          `${g.name} (${g.brand}) - ${g.short_description?.slice(0, 100)}`
        ).join('; ')}`);
      }
    }

    // Labels
    if (queryText.match(/label|imprint|record/i)) {
      const { data: labels } = await supabase
        .from('labels')
        .select('label_name, location_city, style_tags')
        .limit(5);
      
      if (labels?.length) {
        knowledgeParts.push(`LABELS: ${labels.map(l => 
          `${l.label_name} (${l.location_city}) - ${l.style_tags?.join(', ')}`
        ).join('; ')}`);
      }
    }

    knowledgeContext = knowledgeParts.join('\n');

    // Build messages
    const systemPrompt = buildStreamingSystemPrompt(knowledgeContext);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Start streaming from Lovable AI
    const startTime = Date.now();
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: routing.model,
        messages,
        temperature: routing.temperature,
        max_tokens: routing.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const latencyMs = Date.now() - startTime;
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: '*Sad whimper* Too many requests! Please wait a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: '*Confused head tilt* Need more treats (credits)!' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.error(`[DogStream] AI error: ${response.status}`);
      return new Response(JSON.stringify({ error: 'AI error' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const latencyMs = Date.now() - startTime;
    
    // Log stream start (async, non-blocking)
    supabase.from('analytics_events').insert({
      event_type: 'dog_agent_chat',
      event_name: 'dog_stream_started',
      model_selected: routing.model,
      model_tier: routing.tier,
      provider: 'lovable-ai',
      routing_reason: routing.reason,
      latency_ms: latencyMs,
      metadata: {
        message_length: message.length,
        streaming: true,
        knowledge_sections: knowledgeParts.length
      }
    });

    // Return the stream with proper SSE headers
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error('[DogStream] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      bark: "*Worried whine* Something went wrong with the stream!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
