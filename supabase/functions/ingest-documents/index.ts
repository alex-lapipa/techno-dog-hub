import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Split text into chunks with overlap
function chunkText(text: string, chunkSize: number = 1500, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Verify JWT and check admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with user's JWT to verify auth
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin using service role client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.log('User is not admin:', user.id);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin verified:', user.email);

    const { documents, generateEmbeddings = true } = await req.json();
    
    if (!documents || !Array.isArray(documents)) {
      throw new Error('Documents array is required');
    }

    const results = [];
    let embeddingsGenerated = 0;

    for (const doc of documents) {
      const { title, content, source, metadata = {} } = doc;
      
      if (!title || !content) {
        console.warn('Skipping document with missing title or content');
        continue;
      }

      // Chunk the content
      const chunks = chunkText(content);
      console.log(`Processing "${title}" - ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Generate embedding if API key is available
        let embedding = null;
        if (generateEmbeddings && OPENAI_API_KEY) {
          embedding = await generateEmbedding(chunk, OPENAI_API_KEY);
          if (embedding) {
            embeddingsGenerated++;
          }
        }

        // Format embedding for pgvector
        const embeddingStr = embedding ? `[${embedding.join(',')}]` : null;

        // Insert into database
        const { data, error } = await supabaseAdmin
          .from('documents')
          .insert({
            title: chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title,
            content: chunk,
            source,
            embedding: embeddingStr,
            metadata: { ...metadata, original_title: title, chunk_index: i, total_chunks: chunks.length },
            chunk_index: i
          })
          .select('id')
          .single();

        if (error) {
          console.error(`Error inserting chunk ${i} of "${title}":`, error);
        } else {
          results.push({ title, chunk: i, id: data.id, hasEmbedding: !!embedding });
          console.log(`Inserted chunk ${i + 1}/${chunks.length} of "${title}" (embedding: ${!!embedding})`);
        }
      }
    }

    console.log(`Ingested ${results.length} document chunks, ${embeddingsGenerated} with embeddings`);

    return new Response(JSON.stringify({ 
      success: true, 
      ingested: results.length,
      embeddingsGenerated,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in ingest-documents:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});