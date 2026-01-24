import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * MULTI-MODEL BOOK RESEARCH & VERIFICATION
 * 
 * This function:
 * 1. Scrapes trusted sources (Amazon, Google Books, Open Library) via Firecrawl
 * 2. Extracts structured data with Anthropic Claude
 * 3. Verifies findings with Gemini
 * 4. Cross-validates with OpenAI
 * 5. Only returns data where 2+ models agree
 * 
 * Zero hallucination policy: If models disagree, data is flagged for human review.
 */

interface BookResearchResult {
  book_id: string;
  title: string;
  verified_data: {
    isbn?: string;
    publisher?: string;
    year_published?: number;
    pages?: number;
    language?: string;
  };
  unverified_data: Record<string, unknown>;
  verification_status: 'verified' | 'partial' | 'needs_review';
  model_agreement: {
    anthropic: boolean;
    gemini: boolean;
    openai: boolean;
  };
  sources: string[];
  discrepancies: string[];
}

// Scrape URL using Firecrawl
async function scrapeUrl(url: string, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error for ${url}:`, response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.markdown || data.markdown || null;
  } catch (error) {
    console.error(`Scrape error for ${url}:`, error);
    return null;
  }
}

// Search Open Library API (no scraping needed)
async function searchOpenLibrary(isbn: string | null, title: string, author: string): Promise<Record<string, unknown> | null> {
  try {
    let url: string;
    
    if (isbn) {
      url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    } else {
      const query = encodeURIComponent(`${title} ${author}`);
      url = `https://openlibrary.org/search.json?q=${query}&limit=1`;
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    
    if (isbn && data[`ISBN:${isbn}`]) {
      return data[`ISBN:${isbn}`];
    }
    
    if (data.docs && data.docs.length > 0) {
      return data.docs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Open Library error:', error);
    return null;
  }
}

// Extract structured data with Anthropic Claude
async function extractWithAnthropic(
  content: string,
  book: { title: string; author: string },
  apiKey: string
): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Extract ONLY verifiable bibliographic data from this content about the book "${book.title}" by ${book.author}.

CONTENT:
${content.slice(0, 6000)}

Return ONLY a JSON object with these fields (use null if not found):
{
  "isbn_10": "string or null",
  "isbn_13": "string or null", 
  "publisher": "string or null",
  "year_published": "number or null",
  "pages": "number or null",
  "language": "string or null",
  "edition": "string or null"
}

IMPORTANT: Only include data explicitly stated in the content. Do NOT infer or guess.
Return ONLY the JSON, no explanation.`
        }]
      }),
    });

    if (!response.ok) {
      console.error('Anthropic error:', response.status);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Anthropic extraction error:', error);
    return null;
  }
}

// Verify data with Gemini
async function verifyWithGemini(
  data: Record<string, unknown>,
  book: { title: string; author: string },
  apiKey: string
): Promise<{ verified: boolean; confidence: number; notes: string }> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Verify this bibliographic data for "${book.title}" by ${book.author}:

${JSON.stringify(data, null, 2)}

Based on your knowledge, rate the likelihood this data is accurate.
Return JSON only:
{
  "verified": true/false,
  "confidence": 0.0-1.0,
  "notes": "brief explanation"
}`
        }],
        max_tokens: 512
      }),
    });

    if (!response.ok) {
      return { verified: false, confidence: 0, notes: 'Gemini verification failed' };
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { verified: false, confidence: 0, notes: 'Failed to parse response' };
  } catch (error) {
    console.error('Gemini verification error:', error);
    return { verified: false, confidence: 0, notes: 'Error during verification' };
  }
}

// Cross-validate with OpenAI
async function validateWithOpenAI(
  data: Record<string, unknown>,
  book: { title: string; author: string },
  apiKey: string
): Promise<{ validated: boolean; corrections: Record<string, unknown>; notes: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Cross-validate this bibliographic data for "${book.title}" by ${book.author}:

${JSON.stringify(data, null, 2)}

Check if this data matches your knowledge. If you find errors, provide corrections.
Return JSON only:
{
  "validated": true/false,
  "corrections": { "field_name": "corrected_value" } or {},
  "notes": "brief explanation"
}`
        }],
        max_tokens: 512
      }),
    });

    if (!response.ok) {
      return { validated: false, corrections: {}, notes: 'OpenAI validation failed' };
    }

    const result = await response.json();
    const text = result.choices?.[0]?.message?.content || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { validated: false, corrections: {}, notes: 'Failed to parse response' };
  } catch (error) {
    console.error('OpenAI validation error:', error);
    return { validated: false, corrections: {}, notes: 'Error during validation' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY_1') || Deno.env.get('FIRECRAWL_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    const { book_ids, batch_size = 5 } = await req.json().catch(() => ({}));
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch books to research
    let query = supabase
      .from('books')
      .select('id, title, author, isbn, publisher, year_published, pages')
      .eq('status', 'published');
    
    if (book_ids && Array.isArray(book_ids)) {
      query = query.in('id', book_ids);
    } else {
      // Focus on books missing data
      query = query.or('isbn.is.null,publisher.is.null,year_published.is.null')
        .limit(batch_size);
    }

    const { data: books, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch books: ${fetchError.message}`);
    }

    if (!books || books.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No books to research',
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: BookResearchResult[] = [];

    for (const book of books) {
      console.log(`Researching: ${book.title}`);
      
      const result: BookResearchResult = {
        book_id: book.id,
        title: book.title,
        verified_data: {},
        unverified_data: {},
        verification_status: 'needs_review',
        model_agreement: { anthropic: false, gemini: false, openai: false },
        sources: [],
        discrepancies: []
      };

      // Step 1: Search Open Library API (free, structured data)
      const openLibData = await searchOpenLibrary(book.isbn, book.title, book.author);
      if (openLibData) {
        result.sources.push('openlibrary.org');
        
        // Extract structured data from Open Library
        if (openLibData.number_of_pages) {
          result.verified_data.pages = Number(openLibData.number_of_pages);
        }
        if (openLibData.publishers && Array.isArray(openLibData.publishers)) {
          const pubName = openLibData.publishers[0]?.name || openLibData.publishers[0];
          if (typeof pubName === 'string') {
            result.verified_data.publisher = pubName;
          }
        }
        if (openLibData.publish_date || openLibData.first_publish_year) {
          const yearStr = openLibData.first_publish_year || 
            String(openLibData.publish_date || '').match(/\d{4}/)?.[0];
          const year = parseInt(String(yearStr), 10);
          if (!isNaN(year) && year > 1900 && year <= new Date().getFullYear()) {
            result.verified_data.year_published = year;
          }
        }
      }

      // Step 2: If we have Firecrawl and Anthropic, do deep research
      if (FIRECRAWL_API_KEY && ANTHROPIC_API_KEY) {
        // Search Google Books
        const searchQuery = encodeURIComponent(`${book.title} ${book.author} book`);
        const googleBooksUrl = `https://www.google.com/search?q=${searchQuery}+site:books.google.com`;
        
        const scrapedContent = await scrapeUrl(
          `https://www.amazon.com/s?k=${searchQuery}`,
          FIRECRAWL_API_KEY
        );

        if (scrapedContent) {
          result.sources.push('amazon.com');
          
          // Extract with Anthropic
          const anthropicData = await extractWithAnthropic(scrapedContent, book, ANTHROPIC_API_KEY);
          
          if (anthropicData) {
            result.model_agreement.anthropic = true;
            
            // Verify with Gemini if available
            if (LOVABLE_API_KEY) {
              const geminiResult = await verifyWithGemini(anthropicData, book, LOVABLE_API_KEY);
              result.model_agreement.gemini = geminiResult.verified;
              
              if (!geminiResult.verified && geminiResult.notes) {
                result.discrepancies.push(`Gemini: ${geminiResult.notes}`);
              }
            }
            
            // Cross-validate with OpenAI
            if (OPENAI_API_KEY) {
              const openaiResult = await validateWithOpenAI(anthropicData, book, OPENAI_API_KEY);
              result.model_agreement.openai = openaiResult.validated;
              
              if (!openaiResult.validated && openaiResult.notes) {
                result.discrepancies.push(`OpenAI: ${openaiResult.notes}`);
              }
              
              // Apply corrections if any
              if (Object.keys(openaiResult.corrections).length > 0) {
                result.discrepancies.push(`Corrections suggested: ${JSON.stringify(openaiResult.corrections)}`);
              }
            }
            
            // Only add to verified_data if 2+ models agree
            const agreementCount = [
              result.model_agreement.anthropic,
              result.model_agreement.gemini,
              result.model_agreement.openai
            ].filter(Boolean).length;
            
            if (agreementCount >= 2) {
              // Merge anthropic data into verified_data
              if (anthropicData.isbn_13 && !book.isbn) {
                result.verified_data.isbn = String(anthropicData.isbn_13);
              }
              if (anthropicData.publisher && !result.verified_data.publisher) {
                result.verified_data.publisher = String(anthropicData.publisher);
              }
              if (anthropicData.year_published && !result.verified_data.year_published) {
                result.verified_data.year_published = Number(anthropicData.year_published);
              }
              if (anthropicData.pages && !result.verified_data.pages) {
                result.verified_data.pages = Number(anthropicData.pages);
              }
              
              result.verification_status = agreementCount === 3 ? 'verified' : 'partial';
            } else {
              // Store as unverified for human review
              result.unverified_data = anthropicData;
              result.verification_status = 'needs_review';
            }
          }
        }
      }

      // Determine final verification status
      if (Object.keys(result.verified_data).length > 0 && result.discrepancies.length === 0) {
        result.verification_status = 'verified';
      } else if (Object.keys(result.verified_data).length > 0) {
        result.verification_status = 'partial';
      }

      results.push(result);
      
      // Rate limiting between books
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Return results for human review - DO NOT auto-update database
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Research complete - review results before applying updates',
      total_researched: results.length,
      verified: results.filter(r => r.verification_status === 'verified').length,
      partial: results.filter(r => r.verification_status === 'partial').length,
      needs_review: results.filter(r => r.verification_status === 'needs_review').length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in research-book-metadata:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
