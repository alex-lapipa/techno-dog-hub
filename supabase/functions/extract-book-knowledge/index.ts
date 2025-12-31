import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Chunk text with overlap for RAG
function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

// Generate embedding using OpenAI
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
      console.error('Embedding API error:', response.status);
      return null;
    }
    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error('Embedding error:', error);
    return null;
  }
}

// Call Anthropic Claude to extract deep knowledge from a book
async function extractBookKnowledge(
  book: { title: string; author: string; description: string | null; why_read: string | null },
  anthropicKey: string
): Promise<string> {
  const prompt = `You are an expert cultural historian and techno music scholar. Analyze this book and extract comprehensive knowledge for a RAG database that will power an AI expert on underground techno culture.

BOOK INFORMATION:
Title: ${book.title}
Author: ${book.author}
Description: ${book.description || 'Not provided'}
Why Read: ${book.why_read || 'Not provided'}

Your task is to generate a comprehensive knowledge document that includes:

1. **CORE THESIS & ARGUMENTS** (2-3 paragraphs)
   - What is the central argument or thesis of this book?
   - What new perspectives or frameworks does it introduce?
   - How does it challenge or expand existing narratives?

2. **KEY HISTORICAL FACTS** (bullet points)
   - Important dates, events, locations
   - Key figures mentioned and their contributions
   - Technological developments discussed
   - Cultural movements and their timelines

3. **PHILOSOPHICAL & THEORETICAL FRAMEWORKS** (2-3 paragraphs)
   - What theoretical lenses does the author use?
   - How does the book connect music to broader social/political themes?
   - What is the author's perspective on technology, race, class, or urbanism?

4. **KEY THEMES & CONCEPTS** (detailed list with explanations)
   - List 8-12 major themes with 2-3 sentence explanations each
   - Include concepts that would help answer questions about techno culture

5. **NOTABLE QUOTES & IDEAS** (paraphrased key insights)
   - 5-8 central ideas that capture the book's essence
   - Frame these as knowledge statements, not direct quotes

6. **CONNECTIONS TO BROADER TECHNO CULTURE**
   - How does this book connect to Detroit, Berlin, UK, or other scenes?
   - What labels, artists, venues, or movements does it illuminate?
   - How does it fit into the larger techno historiography?

7. **CRITICAL ANALYSIS**
   - What are the book's strengths as a historical/cultural document?
   - What gaps or biases might exist?
   - How should this source be weighted in understanding techno culture?

Write in a scholarly but accessible tone. Be comprehensive—this will be chunked for RAG and used to answer expert-level questions about techno culture, history, and philosophy. Aim for 2000-3000 words.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: prompt }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured for embeddings');
    }

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin verified:', user.email);

    const { bookId, processAll = false } = await req.json();

    // Get books to process
    let booksQuery = supabaseAdmin
      .from('books')
      .select('id, title, author, description, why_read')
      .eq('status', 'published');

    if (bookId && !processAll) {
      booksQuery = booksQuery.eq('id', bookId);
    }

    const { data: books, error: booksError } = await booksQuery;
    if (booksError) throw booksError;

    if (!books || books.length === 0) {
      return new Response(JSON.stringify({ error: 'No books found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${books.length} books...`);

    const results = [];

    for (const book of books) {
      console.log(`\n=== Processing: ${book.title} ===`);

      // Check if already processed
      const { count: existingCount } = await supabaseAdmin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('source', `book:${book.id}`);

      if (existingCount && existingCount > 0) {
        console.log(`Skipping "${book.title}" - already processed (${existingCount} chunks exist)`);
        results.push({ 
          bookId: book.id, 
          title: book.title, 
          status: 'skipped', 
          reason: 'already_processed',
          existingChunks: existingCount 
        });
        continue;
      }

      try {
        // Extract knowledge using Anthropic
        console.log(`Extracting knowledge from "${book.title}" using Claude...`);
        const knowledge = await extractBookKnowledge(book, ANTHROPIC_API_KEY);
        
        if (!knowledge || knowledge.length < 500) {
          console.error(`Insufficient knowledge extracted for "${book.title}"`);
          results.push({ bookId: book.id, title: book.title, status: 'error', reason: 'insufficient_extraction' });
          continue;
        }

        console.log(`Extracted ${knowledge.length} characters of knowledge`);

        // Chunk the knowledge
        const chunks = chunkText(knowledge);
        console.log(`Created ${chunks.length} chunks`);

        let successfulChunks = 0;
        let embeddingsGenerated = 0;

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          // Generate embedding
          const embedding = await generateEmbedding(chunk, OPENAI_API_KEY);
          if (embedding) embeddingsGenerated++;

          const embeddingStr = embedding ? `[${embedding.join(',')}]` : null;

          // Store in documents table
          const { error: insertError } = await supabaseAdmin
            .from('documents')
            .insert({
              title: chunks.length > 1 
                ? `${book.title} by ${book.author} (${i + 1}/${chunks.length})` 
                : `${book.title} by ${book.author}`,
              content: chunk,
              source: `book:${book.id}`,
              embedding: embeddingStr,
              metadata: {
                book_id: book.id,
                book_title: book.title,
                author: book.author,
                chunk_index: i,
                total_chunks: chunks.length,
                extraction_model: 'claude-sonnet-4-20250514',
                embedding_model: 'text-embedding-3-small',
                extracted_at: new Date().toISOString()
              },
              chunk_index: i
            });

          if (insertError) {
            console.error(`Error inserting chunk ${i}:`, insertError);
          } else {
            successfulChunks++;
          }
        }

        console.log(`Stored ${successfulChunks}/${chunks.length} chunks, ${embeddingsGenerated} with embeddings`);
        
        results.push({
          bookId: book.id,
          title: book.title,
          status: 'success',
          chunksCreated: successfulChunks,
          embeddingsGenerated
        });

        // Small delay between books to avoid rate limiting
        if (books.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (bookError) {
        console.error(`Error processing "${book.title}":`, bookError);
        results.push({
          bookId: book.id,
          title: book.title,
          status: 'error',
          reason: bookError instanceof Error ? bookError.message : 'Unknown error'
        });
      }
    }

    const summary = {
      totalBooks: books.length,
      successful: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      results
    };

    console.log('\n=== EXTRACTION COMPLETE ===');
    console.log(JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fatal error in extract-book-knowledge:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
