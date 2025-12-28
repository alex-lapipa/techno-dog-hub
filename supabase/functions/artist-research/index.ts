// Artist Knowledge Expansion Engine - Firecrawl Research Layer
// Uses Firecrawl to discover and crawl web pages about artists

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResearchRequest {
  action: 'search' | 'scrape' | 'discover' | 'research_artist';
  artist_id?: string;
  artist_name?: string;
  aliases?: string[];
  seed_urls?: string[];
  objectives?: string[]; // bio, discography, collaborators, events, press
  limit?: number;
}

interface FirecrawlSearchResult {
  url: string;
  title: string;
  description?: string;
}

// Generate search queries for an artist
function generateSearchQueries(artistName: string, aliases: string[], objectives: string[]): string[] {
  const queries: string[] = [];
  const names = [artistName, ...aliases].filter(Boolean);
  
  const objectiveKeywords: Record<string, string[]> = {
    bio: ['biography', 'interview', 'profile'],
    discography: ['discography', 'releases', 'albums', 'tracks'],
    collaborators: ['collaboration', 'featuring', 'remix'],
    events: ['tour', 'festival', 'live', 'DJ set'],
    press: ['review', 'article', 'news'],
    labels: ['record label', 'signed'],
  };
  
  for (const name of names.slice(0, 2)) { // Limit to main name + 1 alias
    // General search
    queries.push(`"${name}" techno DJ producer`);
    
    // Objective-specific searches
    for (const obj of objectives) {
      const keywords = objectiveKeywords[obj] || [obj];
      for (const kw of keywords.slice(0, 1)) {
        queries.push(`"${name}" ${kw}`);
      }
    }
  }
  
  return queries.slice(0, 10); // Max 10 queries per artist
}

// Get domain quality score from registry
async function getDomainQuality(supabase: any, domain: string): Promise<{ score: number; isBlocked: boolean; isPrimary: boolean }> {
  const { data } = await supabase
    .from('source_domain_registry')
    .select('quality_score, is_blocked, is_primary_source')
    .eq('domain', domain)
    .single();
  
  if (data) {
    return {
      score: data.quality_score,
      isBlocked: data.is_blocked,
      isPrimary: data.is_primary_source
    };
  }
  
  // Default for unknown domains
  return { score: 0.5, isBlocked: false, isPrimary: false };
}

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Create content hash for deduplication
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// Firecrawl search
async function firecrawlSearch(query: string, apiKey: string, limit: number = 10): Promise<FirecrawlSearchResult[]> {
  console.log(`Firecrawl search: "${query}"`);
  
  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      limit,
      lang: 'en',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firecrawl search error:', error);
    return [];
  }
  
  const data = await response.json();
  return data.data || [];
}

// Firecrawl scrape
async function firecrawlScrape(url: string, apiKey: string): Promise<any> {
  console.log(`Firecrawl scrape: ${url}`);
  
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      waitFor: 2000,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Firecrawl scrape error:', error);
    return null;
  }
  
  const data = await response.json();
  return data.data || data;
}

// Store raw document
async function storeRawDocument(
  supabase: any,
  artistId: string | null,
  url: string,
  content: any
): Promise<string | null> {
  const domain = extractDomain(url);
  const contentText = content?.markdown || content?.text || '';
  const contentHash = await hashContent(contentText + url);
  
  // Check if already exists
  const { data: existing } = await supabase
    .from('artist_raw_documents')
    .select('raw_doc_id')
    .eq('url', url)
    .eq('content_hash', contentHash)
    .single();
  
  if (existing) {
    console.log(`Document already exists: ${url}`);
    return existing.raw_doc_id;
  }
  
  const { data, error } = await supabase
    .from('artist_raw_documents')
    .insert({
      artist_id: artistId,
      url,
      domain,
      content_text: contentText,
      content_markdown: content?.markdown,
      content_json: content,
      content_hash: contentHash,
    })
    .select('raw_doc_id')
    .single();
  
  if (error) {
    console.error('Error storing document:', error);
    return null;
  }
  
  return data.raw_doc_id;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
    
    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: ResearchRequest = await req.json();
    const { action, artist_id, artist_name, aliases = [], seed_urls = [], objectives = ['bio', 'discography'], limit = 20 } = body;

    console.log(`Artist research action: ${action}`, { artist_id, artist_name });

    // Handle different actions
    if (action === 'search') {
      // Simple search query
      const query = artist_name || '';
      const results = await firecrawlSearch(query, firecrawlKey, limit);
      
      return new Response(JSON.stringify({
        success: true,
        results,
        count: results.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'scrape') {
      // Scrape specific URLs
      const results = [];
      for (const url of seed_urls.slice(0, 5)) {
        const domain = extractDomain(url);
        const domainInfo = await getDomainQuality(supabase, domain);
        
        if (domainInfo.isBlocked) {
          console.log(`Skipping blocked domain: ${domain}`);
          continue;
        }
        
        const content = await firecrawlScrape(url, firecrawlKey);
        if (content) {
          const docId = await storeRawDocument(supabase, artist_id || null, url, content);
          results.push({
            url,
            domain,
            raw_doc_id: docId,
            quality_score: domainInfo.score,
            is_primary: domainInfo.isPrimary
          });
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        results,
        count: results.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'discover') {
      // Discover URLs for an artist via search
      if (!artist_name) {
        throw new Error('artist_name required for discover action');
      }
      
      const queries = generateSearchQueries(artist_name, aliases, objectives);
      const allUrls: Map<string, FirecrawlSearchResult> = new Map();
      
      for (const query of queries.slice(0, 5)) { // Limit API calls
        const results = await firecrawlSearch(query, firecrawlKey, 5);
        for (const result of results) {
          if (!allUrls.has(result.url)) {
            const domain = extractDomain(result.url);
            const domainInfo = await getDomainQuality(supabase, domain);
            
            if (!domainInfo.isBlocked) {
              allUrls.set(result.url, {
                ...result,
                quality_score: domainInfo.score,
                is_primary: domainInfo.isPrimary
              } as any);
            }
          }
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 500));
      }
      
      // Sort by quality score
      const sortedUrls = Array.from(allUrls.values())
        .sort((a: any, b: any) => (b.quality_score || 0) - (a.quality_score || 0));
      
      return new Response(JSON.stringify({
        success: true,
        urls: sortedUrls,
        count: sortedUrls.length,
        queries_used: queries.slice(0, 5)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'research_artist') {
      // Full research pipeline for an artist
      if (!artist_id || !artist_name) {
        throw new Error('artist_id and artist_name required for research_artist action');
      }
      
      // Create enrichment run
      const { data: run, error: runError } = await supabase
        .from('artist_enrichment_runs')
        .insert({
          artist_id,
          run_type: 'manual',
          status: 'running',
          started_at: new Date().toISOString(),
          firecrawl_urls_searched: [],
          models_used: []
        })
        .select('run_id')
        .single();
      
      if (runError) {
        throw runError;
      }
      
      const runId = run.run_id;
      const stats = {
        sources_discovered: 0,
        sources_scraped: 0,
        documents_stored: 0,
        errors: [] as string[]
      };
      
      try {
        // Step 1: Discover URLs
        const queries = generateSearchQueries(artist_name, aliases, objectives);
        const discoveredUrls: Map<string, any> = new Map();
        
        for (const query of queries.slice(0, 5)) {
          try {
            const results = await firecrawlSearch(query, firecrawlKey, 5);
            for (const result of results) {
              const domain = extractDomain(result.url);
              const domainInfo = await getDomainQuality(supabase, domain);
              
              if (!domainInfo.isBlocked && !discoveredUrls.has(result.url)) {
                discoveredUrls.set(result.url, {
                  ...result,
                  domain,
                  quality_score: domainInfo.score,
                  is_primary: domainInfo.isPrimary
                });
              }
            }
            await new Promise(r => setTimeout(r, 500));
          } catch (err) {
            stats.errors.push(`Search error: ${err instanceof Error ? err.message : 'Unknown'}`);
          }
        }
        
        stats.sources_discovered = discoveredUrls.size;
        
        // Step 2: Scrape top URLs (sorted by quality)
        const sortedUrls = Array.from(discoveredUrls.values())
          .sort((a, b) => b.quality_score - a.quality_score)
          .slice(0, limit);
        
        for (const urlInfo of sortedUrls) {
          try {
            const content = await firecrawlScrape(urlInfo.url, firecrawlKey);
            if (content) {
              const docId = await storeRawDocument(supabase, artist_id, urlInfo.url, content);
              if (docId) {
                stats.documents_stored++;
              }
              stats.sources_scraped++;
            }
            await new Promise(r => setTimeout(r, 1000)); // Rate limit
          } catch (err) {
            stats.errors.push(`Scrape error ${urlInfo.url}: ${err instanceof Error ? err.message : 'Unknown'}`);
          }
        }
        
        // Update run with success
        await supabase
          .from('artist_enrichment_runs')
          .update({
            status: stats.errors.length > 0 ? 'partial' : 'success',
            finished_at: new Date().toISOString(),
            stats,
            firecrawl_urls_searched: queries.slice(0, 5),
            errors: stats.errors.length > 0 ? { messages: stats.errors } : null
          })
          .eq('run_id', runId);
        
        return new Response(JSON.stringify({
          success: true,
          run_id: runId,
          stats
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (err) {
        // Update run with failure
        await supabase
          .from('artist_enrichment_runs')
          .update({
            status: 'failed',
            finished_at: new Date().toISOString(),
            errors: { message: err instanceof Error ? err.message : 'Unknown error' }
          })
          .eq('run_id', runId);
        
        throw err;
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown action: ${action}`
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Artist research error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
