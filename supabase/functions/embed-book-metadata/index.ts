import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * SAFE BOOK METADATA EMBEDDING
 * 
 * This function ONLY embeds verified, curator-provided metadata.
 * It does NOT generate any imagined content or "historical facts".
 * 
 * Sources of truth:
 * - title: Book title (verified)
 * - author: Author name (verified)
 * - description: Curator-written description
 * - why_read: Curator-written reason to read
 * - curator_notes: Additional curator notes
 * - isbn: Verifiable identifier
 * - publisher: Verified publisher
 */

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
        input: text.slice(0, 8000),
        dimensions: 768  // Match existing documents table schema
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

// Create verified knowledge document from curator metadata ONLY
function createVerifiedKnowledgeDocument(book: {
  title: string;
  author: string;
  description: string | null;
  why_read: string | null;
  curator_notes: string | null;
  isbn: string | null;
  publisher: string | null;
  year_published: number | null;
  category_name: string | null;
}): string {
  const sections: string[] = [];
  
  // Header with verified bibliographic info
  sections.push(`# ${book.title}`);
  sections.push(`**Author:** ${book.author}`);
  
  if (book.publisher) {
    sections.push(`**Publisher:** ${book.publisher}`);
  }
  if (book.year_published) {
    sections.push(`**Published:** ${book.year_published}`);
  }
  if (book.isbn) {
    sections.push(`**ISBN:** ${book.isbn}`);
  }
  if (book.category_name) {
    sections.push(`**Category:** ${book.category_name}`);
  }
  
  sections.push(''); // Blank line
  
  // Curator-verified description
  if (book.description) {
    sections.push('## Description');
    sections.push(book.description);
    sections.push('');
  }
  
  // Curator-verified relevance
  if (book.why_read) {
    sections.push('## Cultural Relevance');
    sections.push(book.why_read);
    sections.push('');
  }
  
  // Additional curator notes
  if (book.curator_notes) {
    sections.push('## Curator Notes');
    sections.push(book.curator_notes);
    sections.push('');
  }
  
  // Source provenance marker
  sections.push('---');
  sections.push('*Source: techno.dog curated library - verified metadata only*');
  
  return sections.join('\n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
      throw new Error('Missing required environment variables');
    }

    const { batch_size = 15, skip_existing = true } = await req.json().catch(() => ({}));
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch category names first
    const { data: categories } = await supabase
      .from('book_categories')
      .select('id, name');
    
    const categoryMap = new Map((categories || []).map(c => [c.id, c.name]));

    // Get all published books
    const { data: allBooks, error: fetchError } = await supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        description,
        why_read,
        curator_notes,
        isbn,
        publisher,
        year_published,
        category_id
      `)
      .eq('status', 'published')
      .order('title');

    if (fetchError) {
      throw new Error(`Failed to fetch books: ${fetchError.message}`);
    }

    if (!allBooks || allBooks.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No books to process',
        processed: 0,
        total_books: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check which books already have embeddings
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('source')
      .like('source', 'book-metadata:%');

    const existingBookIds = new Set(
      (existingDocs || []).map(d => d.source.replace('book-metadata:', ''))
    );

    // Filter to only unembedded books if skip_existing
    const books = skip_existing 
      ? allBooks.filter(b => !existingBookIds.has(b.id)).slice(0, batch_size)
      : allBooks.slice(0, batch_size);

    console.log(`Total books: ${allBooks.length}, Already embedded: ${existingBookIds.size}, To process: ${books.length}`);

    if (books.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All books already embedded',
        processed: 0,
        total_books: allBooks.length,
        already_embedded: existingBookIds.size
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = {
      processed: 0,
      skipped: 0,
      errors: [] as string[],
      books: [] as { id: string; title: string; status: string }[],
      total_books: allBooks.length,
      already_embedded: existingBookIds.size,
      remaining: allBooks.length - existingBookIds.size - books.length
    };

    for (const book of books) {
      try {
        // Create verified knowledge document
        const knowledgeDoc = createVerifiedKnowledgeDocument({
          ...book,
          category_name: categoryMap.get(book.category_id) || null
        });

        // Generate embedding
        const embedding = await generateEmbedding(knowledgeDoc, OPENAI_API_KEY);
        
        if (!embedding) {
          results.errors.push(`${book.title}: Failed to generate embedding`);
          results.books.push({ id: book.id, title: book.title, status: 'embedding_failed' });
          continue;
        }

        // Format embedding for pgvector
        const embeddingStr = `[${embedding.join(',')}]`;

        // Delete existing entry if any (safe replace pattern)
        const sourceKey = `book-metadata:${book.id}`;
        await supabase
          .from('documents')
          .delete()
          .eq('source', sourceKey);

        // Insert new document with verified metadata
        const { error: insertError } = await supabase
          .from('documents')
          .insert({
            title: `${book.title} by ${book.author}`,
            content: knowledgeDoc,
            source: sourceKey,
            embedding: embeddingStr,
            metadata: {
              book_id: book.id,
              isbn: book.isbn,
              author: book.author,
              publisher: book.publisher,
              year_published: book.year_published,
              source_type: 'verified_metadata',
              curator_verified: true,
              embedded_at: new Date().toISOString()
            }
          });

        if (insertError) {
          results.errors.push(`${book.title}: ${insertError.message}`);
          results.books.push({ id: book.id, title: book.title, status: 'db_error' });
          continue;
        }

        results.processed++;
        results.books.push({ id: book.id, title: book.title, status: 'success' });
        
        console.log(`✓ Embedded: ${book.title}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`${book.title}: ${message}`);
        results.books.push({ id: book.id, title: book.title, status: 'error' });
      }
    }

    console.log(`Completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors.length} errors`);

    return new Response(JSON.stringify({ 
      success: true,
      ...results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in embed-book-metadata:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
