// Batch Embedding Generator for Artist Documents
// Generates embeddings for all documents that are missing them

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BatchRequest {
  action: 'embed_artist_documents' | 'embed_rag_documents' | 'status';
  batch_size?: number;
  document_type?: string;
}

async function generateEmbedding(text: string, openaiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI embedding error:', response.status, error);
      return null;
    }

    const data = await response.json();
    return data.data[0]?.embedding || null;
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const body: BatchRequest = await req.json();
    const { action, batch_size = 20, document_type } = body;

    console.log(`Batch embed action: ${action}, batch_size: ${batch_size}`);

    if (action === 'status') {
      // Get stats on documents without embeddings
      const { data: artistDocs } = await supabase
        .from('artist_documents')
        .select('document_type, embedding')
        .is('embedding', null);

      const { data: ragDocs } = await supabase
        .from('documents')
        .select('id, embedding')
        .is('embedding', null);

      const byType: Record<string, number> = {};
      for (const doc of artistDocs || []) {
        byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
      }

      return new Response(JSON.stringify({
        success: true,
        stats: {
          artist_documents_missing_embeddings: artistDocs?.length || 0,
          rag_documents_missing_embeddings: ragDocs?.length || 0,
          by_document_type: byType
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'embed_artist_documents') {
      // Fetch documents without embeddings
      let query = supabase
        .from('artist_documents')
        .select('document_id, artist_id, content, document_type')
        .is('embedding', null)
        .limit(batch_size);

      if (document_type) {
        query = query.eq('document_type', document_type);
      }

      const { data: documents, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch documents: ${fetchError.message}`);
      }

      if (!documents || documents.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No documents need embeddings',
          processed: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Processing ${documents.length} documents for embeddings`);

      let successCount = 0;
      let errorCount = 0;
      const results: any[] = [];

      for (const doc of documents) {
        if (!doc.content || doc.content.length < 10) {
          console.log(`Skipping document ${doc.document_id}: content too short`);
          continue;
        }

        const embedding = await generateEmbedding(doc.content, openaiKey);

        if (embedding) {
          const { error: updateError } = await supabase
            .from('artist_documents')
            .update({ embedding: `[${embedding.join(',')}]` })
            .eq('document_id', doc.document_id);

          if (updateError) {
            console.error(`Failed to update document ${doc.document_id}:`, updateError);
            errorCount++;
            results.push({ document_id: doc.document_id, success: false, error: updateError.message });
          } else {
            successCount++;
            results.push({ document_id: doc.document_id, success: true, document_type: doc.document_type });
          }
        } else {
          errorCount++;
          results.push({ document_id: doc.document_id, success: false, error: 'Embedding generation failed' });
        }

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 100));
      }

      return new Response(JSON.stringify({
        success: true,
        processed: documents.length,
        successful: successCount,
        errors: errorCount,
        results: results.slice(0, 10) // Only return first 10 for brevity
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'embed_rag_documents') {
      // Fetch RAG documents without embeddings
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('id, content, title')
        .is('embedding', null)
        .limit(batch_size);

      if (fetchError) {
        throw new Error(`Failed to fetch documents: ${fetchError.message}`);
      }

      if (!documents || documents.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'No RAG documents need embeddings',
          processed: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Processing ${documents.length} RAG documents for embeddings`);

      let successCount = 0;
      let errorCount = 0;

      for (const doc of documents) {
        if (!doc.content || doc.content.length < 10) continue;

        const embedding = await generateEmbedding(doc.content, openaiKey);

        if (embedding) {
          const { error: updateError } = await supabase
            .from('documents')
            .update({ embedding: `[${embedding.join(',')}]` })
            .eq('id', doc.id);

          if (updateError) {
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          errorCount++;
        }

        await new Promise(r => setTimeout(r, 100));
      }

      return new Response(JSON.stringify({
        success: true,
        processed: documents.length,
        successful: successCount,
        errors: errorCount
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in batch-embed-documents:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
