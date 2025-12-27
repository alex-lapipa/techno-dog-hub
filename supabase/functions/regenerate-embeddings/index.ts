import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate embedding using OpenAI API
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    // Use first 8000 characters for embedding generation
    const truncatedText = text.slice(0, 8000);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: truncatedText,
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required Supabase environment variables');
    }

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get documents without embeddings
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, content')
      .is('embedding', null)
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch documents: ${fetchError.message}`);
    }

    if (!documents || documents.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No documents without embeddings found',
        updated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${documents.length} documents without embeddings`);

    const results = [];
    let updated = 0;

    for (const doc of documents) {
      console.log(`Generating embedding for: ${doc.title}`);
      
      const embedding = await generateEmbedding(doc.content, OPENAI_API_KEY);
      
      if (embedding) {
        const embeddingStr = `[${embedding.join(',')}]`;
        
        const { error: updateError } = await supabase
          .from('documents')
          .update({ embedding: embeddingStr })
          .eq('id', doc.id);
        
        if (updateError) {
          console.error(`Failed to update ${doc.title}:`, updateError);
          results.push({ id: doc.id, title: doc.title, success: false, error: updateError.message });
        } else {
          console.log(`Updated embedding for: ${doc.title}`);
          results.push({ id: doc.id, title: doc.title, success: true });
          updated++;
        }
      } else {
        console.error(`Failed to generate embedding for: ${doc.title}`);
        results.push({ id: doc.id, title: doc.title, success: false, error: 'Failed to generate embedding' });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`Updated ${updated} documents with embeddings`);

    return new Response(JSON.stringify({ 
      success: true, 
      updated,
      total: documents.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in regenerate-embeddings:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});