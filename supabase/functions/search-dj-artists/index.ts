import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI embedding error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { query, matchCount = 5, threshold = 0.5 } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'query string required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Searching for: "${query}"`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, openaiKey);

    // Call the search function
    const { data, error } = await supabase.rpc('search_dj_artists', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      similarity_threshold: threshold,
    });

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} matching artists`);

    return new Response(JSON.stringify({
      success: true,
      query,
      results: data || [],
      count: data?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
