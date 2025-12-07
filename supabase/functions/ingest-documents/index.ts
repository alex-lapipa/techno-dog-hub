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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documents } = await req.json();
    
    if (!documents || !Array.isArray(documents)) {
      throw new Error('Documents array is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results = [];

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

        // Insert into database without embedding (will use full-text search)
        const { data, error } = await supabase
          .from('documents')
          .insert({
            title: chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title,
            content: chunk,
            source,
            metadata: { ...metadata, original_title: title, chunk_index: i, total_chunks: chunks.length },
            chunk_index: i
          })
          .select('id')
          .single();

        if (error) {
          console.error(`Error inserting chunk ${i} of "${title}":`, error);
        } else {
          results.push({ title, chunk: i, id: data.id });
          console.log(`Inserted chunk ${i + 1}/${chunks.length} of "${title}"`);
        }
      }
    }

    console.log(`Ingested ${results.length} document chunks`);

    return new Response(JSON.stringify({ 
      success: true, 
      ingested: results.length,
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
