import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding using Lovable AI
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
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
      console.error('Embedding API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, stream = true } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required');
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let documents = null;

    // First try vector search if we have embeddings
    if (LOVABLE_API_KEY) {
      console.log('Generating embedding for query:', query);
      const queryEmbedding = await generateEmbedding(query, LOVABLE_API_KEY);
      
      if (queryEmbedding) {
        console.log('Using vector search with embedding');
        const { data: vectorResults, error: vectorError } = await supabase.rpc('match_documents', {
          query_embedding: `[${queryEmbedding.join(',')}]`,
          match_threshold: 0.3,
          match_count: 5
        });

        if (!vectorError && vectorResults && vectorResults.length > 0) {
          documents = vectorResults;
          console.log(`Vector search found ${documents.length} documents`);
        } else if (vectorError) {
          console.error('Vector search error:', vectorError);
        }
      }
    }

    // Fallback to full-text search if vector search didn't work
    if (!documents || documents.length === 0) {
      console.log('Falling back to full-text search for:', query);
      
      const searchTerms = query
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

    // Final fallback: get recent documents
    if (!documents || documents.length === 0) {
      console.log('Using fallback: fetching recent documents');
      const { data: fallbackDocs } = await supabase
        .from('documents')
        .select('id, title, content, source')
        .order('created_at', { ascending: false })
        .limit(5);
      
      documents = fallbackDocs || [];
    }

    console.log(`Total documents for context: ${documents?.length || 0}`);

    // Build context from retrieved documents
    let context = '';
    const usedDocs = documents || [];
    
    if (usedDocs.length > 0) {
      context = usedDocs
        .map((doc: { title: string; content: string; similarity?: number }) => 
          `[${doc.title}${doc.similarity ? ` (relevance: ${(doc.similarity * 100).toFixed(1)}%)` : ''}]\n${doc.content}`
        )
        .join('\n\n---\n\n');
    }

    // Create the RAG prompt - now techno-focused based on the knowledge base
    const systemPrompt = `You are an expert curator of underground techno music with deep knowledge of artists, labels, venues, and the global scene from Detroit to Berlin to Tokyo. 

Your knowledge comes from an authoritative ranking of 100 techno artists scored on underground authenticity, innovation, and scene contribution.

Respond in the same language as the user's question. Be concise, knowledgeable, and speak with authority about techno culture. Reference specific artists, labels, tracks, and venues when relevant.

If asked about rankings, tiers, or comparisons, base your answers on the provided context. The artists are ranked across dimensions: commitment to underground values, resistance to commercialization, influential tracks, scene contribution, longevity, innovation, and resistance to industry trends.

KNOWLEDGE BASE CONTEXT:
${context || 'No documents loaded in the knowledge base yet. Respond based on general techno knowledge.'}`;

    console.log('Calling Groq API with model: llama-3.1-70b-versatile');

    // Generate response with Groq AI
    const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        stream: stream,
        temperature: 0.7,
        max_tokens: 1024
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('Groq API error:', aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Please check your Groq API key.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Groq API request failed: ${errText}`);
    }

    if (stream) {
      return new Response(aiResponse.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      const data = await aiResponse.json();
      return new Response(JSON.stringify({
        answer: data.choices?.[0]?.message?.content,
        sources: usedDocs.map((d: { title: string; source: string }) => ({ title: d.title, source: d.source }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: unknown) {
    console.error('Error in rag-chat:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});