import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, stream = true } = await req.json();
    
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Use full-text search to find relevant documents
    console.log('Searching for documents matching:', query);
    
    // Extract keywords from query for full-text search
    const searchTerms = query
      .toLowerCase()
      .replace(/[¿?¡!.,;:]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .join(' | ');

    const { data: documents, error: searchError } = await supabase
      .from('documents')
      .select('id, title, content, source')
      .textSearch('content', searchTerms, { type: 'websearch', config: 'spanish' })
      .limit(5);

    if (searchError) {
      console.error('Search error:', searchError);
      // Fallback: get all documents if full-text search fails
      const { data: allDocs } = await supabase
        .from('documents')
        .select('id, title, content, source')
        .limit(5);
      
      if (allDocs && allDocs.length > 0) {
        console.log(`Fallback: using ${allDocs.length} documents`);
      }
    }

    console.log(`Found ${documents?.length || 0} relevant documents`);

    // Build context from retrieved documents
    let context = '';
    const usedDocs = documents || [];
    
    if (usedDocs.length > 0) {
      context = usedDocs
        .map((doc: { title: string; content: string }) => `[${doc.title}]\n${doc.content}`)
        .join('\n\n---\n\n');
    } else {
      // If no documents found, fetch some anyway
      const { data: fallbackDocs } = await supabase
        .from('documents')
        .select('id, title, content, source')
        .limit(3);
      
      if (fallbackDocs && fallbackDocs.length > 0) {
        context = fallbackDocs
          .map((doc: { title: string; content: string }) => `[${doc.title}]\n${doc.content}`)
          .join('\n\n---\n\n');
        console.log(`Using ${fallbackDocs.length} fallback documents`);
      }
    }

    // Create the RAG prompt
    const systemPrompt = `Eres un experto en festivales de música electrónica y techno underground en Europa, especialmente en España. 
Tu conocimiento se basa en información detallada sobre festivales como Aquasella, L.E.V., y la escena techno europea.

Responde siempre en español, de forma clara y concisa. Si la información no está en el contexto proporcionado, 
indica que no tienes esa información específica pero ofrece lo que sepas del tema.

CONTEXTO DE CONOCIMIENTO:
${context || 'No hay documentos en la base de conocimiento. Responde basándote en tu conocimiento general sobre techno y festivales europeos.'}`;

    // Generate response with AI
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
          { role: 'user', content: query }
        ],
        stream: stream
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error('AI error:', errText);
      throw new Error('AI request failed');
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
