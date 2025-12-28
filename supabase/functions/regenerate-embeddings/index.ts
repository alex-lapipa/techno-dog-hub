import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmbeddingRequest {
  action?: 'documents' | 'artist_documents' | 'status' | 'all';
  batch_size?: number;
  document_type?: string;
}

// Generate embedding using OpenAI API
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const truncatedText = text.slice(0, 8000);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: truncatedText
        // Use default 1536 dimensions for compatibility with existing embeddings
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
    
    // Parse request body
    let body: EmbeddingRequest = { action: 'documents', batch_size: 10 };
    try {
      body = await req.json();
    } catch {
      // Default values if no body
    }
    
    const { action = 'documents', batch_size = 25, document_type } = body;
    
    console.log(`Regenerate embeddings: action=${action}, batch_size=${batch_size}, document_type=${document_type}`);

    // Status action - return counts of documents without embeddings
    if (action === 'status') {
      const { data: docsNoEmbed } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .is('embedding', null);
      
      const { data: artistDocsNoEmbed } = await supabase
        .from('artist_documents')
        .select('document_id, document_type')
        .is('embedding', null);
      
      const byType: Record<string, number> = {};
      for (const doc of artistDocsNoEmbed || []) {
        byType[doc.document_type] = (byType[doc.document_type] || 0) + 1;
      }

      return new Response(JSON.stringify({
        success: true,
        documents_missing: docsNoEmbed?.length || 0,
        artist_documents_missing: artistDocsNoEmbed?.length || 0,
        by_document_type: byType
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process artist_documents
    if (action === 'artist_documents' || action === 'all') {
      let query = supabase
        .from('artist_documents')
        .select('document_id, artist_id, content, document_type, title')
        .is('embedding', null)
        .limit(batch_size);
      
      if (document_type) {
        query = query.eq('document_type', document_type);
      }

      const { data: artistDocs, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(`Failed to fetch artist documents: ${fetchError.message}`);
      }

      if (!artistDocs || artistDocs.length === 0) {
        if (action === 'artist_documents') {
          return new Response(JSON.stringify({
            success: true,
            message: 'No artist documents without embeddings found',
            updated: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        console.log(`Processing ${artistDocs.length} artist documents`);
        
        let updated = 0;
        const results: any[] = [];

        for (const doc of artistDocs) {
          if (!doc.content || doc.content.length < 10) {
            console.log(`Skipping ${doc.document_id}: content too short`);
            continue;
          }

          const embedding = await generateEmbedding(doc.content, OPENAI_API_KEY);

          if (embedding) {
            const embeddingStr = `[${embedding.join(',')}]`;
            
            const { error: updateError } = await supabase
              .from('artist_documents')
              .update({ embedding: embeddingStr })
              .eq('document_id', doc.document_id);

            if (updateError) {
              console.error(`Failed to update ${doc.document_id}:`, updateError);
              results.push({ document_id: doc.document_id, success: false, error: updateError.message });
            } else {
              console.log(`Updated embedding for: ${doc.title || doc.document_id}`);
              results.push({ document_id: doc.document_id, document_type: doc.document_type, success: true });
              updated++;
            }
          } else {
            results.push({ document_id: doc.document_id, success: false, error: 'Failed to generate embedding' });
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (action === 'artist_documents') {
          return new Response(JSON.stringify({
            success: true,
            updated,
            total: artistDocs.length,
            results: results.slice(0, 15)
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Process documents table (original behavior)
    if (action === 'documents' || action === 'all') {
      const { data: documents, error: fetchError } = await supabase
        .from('documents')
        .select('id, title, content')
        .is('embedding', null)
        .limit(batch_size);

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
        
        await new Promise(resolve => setTimeout(resolve, 100));
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
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
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
