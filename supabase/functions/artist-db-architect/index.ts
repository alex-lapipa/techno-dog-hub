// Artist Database Architecture Auditor
// Dual-model (OpenAI + Anthropic) analysis of database structure
// Provides recommendations on whether to consolidate or maintain separate DBs

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArchitectRequest {
  action: 'analyze' | 'compare_dbs' | 'recommend';
}

interface AIAnalysis {
  model: string;
  recommendation: 'consolidate' | 'keep_separate' | 'hybrid';
  confidence: number;
  reasoning: string;
  pros: string[];
  cons: string[];
  migration_effort: 'low' | 'medium' | 'high';
  data_integrity_risk: 'low' | 'medium' | 'high';
}

const ARCHITECTURE_PROMPT = `You are a senior database architect specializing in music knowledge bases and RAG systems.

Analyze the following database statistics for a techno artist knowledge platform that has TWO artist tables:

1. **dj_artists** (RAG/Vector Store):
   - Purpose: Unverified raw knowledge base for semantic search
   - Contains embeddings for vector similarity search
   - Data source: Web scraping, AI extraction
   - Schema: artist_name, nationality, subgenres[], labels[], known_for, real_name, years_active, rank, embedding

2. **canonical_artists** (Curated Display):
   - Purpose: Verified, curated data for frontend display
   - Human-reviewed and cleaned
   - Schema: canonical_name, slug, city, country, region, primary_genre, rank, real_name, active_years, photo_url, photo_verified

Linking: artist_source_map table maps records between systems

DATABASE STATISTICS:
{stats}

CURRENT ISSUES OBSERVED:
{issues}

QUESTION: Should we consolidate into a single table or maintain the separation?

Analyze considering:
1. Data quality and verification workflows
2. RAG/embedding search performance
3. Frontend display requirements
4. Maintenance overhead
5. Data integrity risks
6. Migration complexity

Return ONLY valid JSON:
{
  "recommendation": "consolidate" | "keep_separate" | "hybrid",
  "confidence": 0.0-1.0,
  "reasoning": "Detailed explanation (3-5 sentences)",
  "pros": ["List of advantages of your recommendation"],
  "cons": ["List of disadvantages/risks"],
  "migration_effort": "low" | "medium" | "high",
  "data_integrity_risk": "low" | "medium" | "high"
}`;

// Call OpenAI for analysis
async function callOpenAI(prompt: string): Promise<AIAnalysis> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a database architecture expert. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Extract JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to extract JSON from OpenAI');
  
  const parsed = JSON.parse(jsonMatch[0]);
  return { model: 'gpt-4o', ...parsed };
}

// Call Anthropic for cross-validation
async function callAnthropic(prompt: string): Promise<AIAnalysis> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'You are a database architecture expert. Respond only with valid JSON.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  
  // Extract JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to extract JSON from Anthropic');
  
  const parsed = JSON.parse(jsonMatch[0]);
  return { model: 'claude-sonnet-4-20250514', ...parsed };
}

// Gather database statistics
async function gatherStats(supabase: any): Promise<any> {
  const stats: any = {};
  
  // dj_artists stats
  const { count: djArtistsCount } = await supabase
    .from('dj_artists')
    .select('*', { count: 'exact', head: true });
  stats.dj_artists_count = djArtistsCount || 0;
  
  // Count with embeddings
  const { data: djWithEmbeddings } = await supabase
    .from('dj_artists')
    .select('id')
    .not('embedding', 'is', null)
    .limit(1000);
  stats.dj_artists_with_embeddings = djWithEmbeddings?.length || 0;
  
  // canonical_artists stats
  const { count: canonicalCount } = await supabase
    .from('canonical_artists')
    .select('*', { count: 'exact', head: true });
  stats.canonical_artists_count = canonicalCount || 0;
  
  // Count with photos
  const { data: canonicalWithPhotos } = await supabase
    .from('canonical_artists')
    .select('artist_id')
    .not('photo_url', 'is', null)
    .limit(1000);
  stats.canonical_with_photos = canonicalWithPhotos?.length || 0;
  
  // artist_source_map stats
  const { count: mappedCount } = await supabase
    .from('artist_source_map')
    .select('*', { count: 'exact', head: true });
  stats.source_mappings = mappedCount || 0;
  
  // RAG-to-canonical linking percentage
  const { data: ragMappings } = await supabase
    .from('artist_source_map')
    .select('artist_id')
    .eq('source_system', 'rag');
  stats.rag_linked_to_canonical = ragMappings?.length || 0;
  
  // Additional tables
  const { count: claimsCount } = await supabase
    .from('artist_claims')
    .select('*', { count: 'exact', head: true });
  stats.artist_claims = claimsCount || 0;
  
  const { count: documentsCount } = await supabase
    .from('artist_documents')
    .select('*', { count: 'exact', head: true });
  stats.artist_documents = documentsCount || 0;
  
  const { count: profilesCount } = await supabase
    .from('artist_profiles')
    .select('*', { count: 'exact', head: true });
  stats.artist_profiles = profilesCount || 0;
  
  // Calculate linking percentage
  if (stats.dj_artists_count > 0) {
    stats.rag_link_percentage = ((stats.rag_linked_to_canonical / stats.dj_artists_count) * 100).toFixed(1) + '%';
  } else {
    stats.rag_link_percentage = '0%';
  }
  
  return stats;
}

// Identify issues
async function identifyIssues(supabase: any, stats: any): Promise<string[]> {
  const issues: string[] = [];
  
  // Check for orphaned records
  if (stats.dj_artists_count > stats.rag_linked_to_canonical + 50) {
    issues.push(`${stats.dj_artists_count - stats.rag_linked_to_canonical} dj_artists records not linked to canonical_artists`);
  }
  
  // Check for potential duplicates
  const { data: potentialDups } = await supabase
    .from('artist_merge_candidates')
    .select('candidate_id')
    .eq('status', 'pending')
    .limit(100);
  if (potentialDups && potentialDups.length > 0) {
    issues.push(`${potentialDups.length} potential duplicate artist pairs pending review`);
  }
  
  // Check embedding coverage
  if (stats.dj_artists_count > 0 && stats.dj_artists_with_embeddings < stats.dj_artists_count * 0.8) {
    const missing = stats.dj_artists_count - stats.dj_artists_with_embeddings;
    issues.push(`${missing} dj_artists records missing embeddings (${((missing / stats.dj_artists_count) * 100).toFixed(0)}%)`);
  }
  
  // Check canonical photo coverage
  if (stats.canonical_artists_count > 0 && stats.canonical_with_photos < stats.canonical_artists_count * 0.5) {
    const missing = stats.canonical_artists_count - stats.canonical_with_photos;
    issues.push(`${missing} canonical_artists missing photos`);
  }
  
  // Check profile coverage
  if (stats.artist_profiles < stats.canonical_artists_count * 0.3) {
    issues.push(`Only ${stats.artist_profiles} artist_profiles for ${stats.canonical_artists_count} canonical artists (low coverage)`);
  }
  
  // Data freshness (check if source_map is stale)
  if (stats.source_mappings < stats.dj_artists_count * 0.5 && stats.source_mappings < stats.canonical_artists_count * 0.5) {
    issues.push('artist_source_map appears incomplete - may need sync');
  }
  
  return issues;
}

// Safe body parser
async function safeParseBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: ArchitectRequest = await safeParseBody(req);
    const { action = 'analyze' } = body;

    console.log(`Artist DB Architect action: ${action}`);

    if (action === 'compare_dbs') {
      // Just return database comparison stats
      const stats = await gatherStats(supabase);
      const issues = await identifyIssues(supabase, stats);
      
      return new Response(JSON.stringify({
        success: true,
        stats,
        issues,
        tables: {
          dj_artists: {
            purpose: 'RAG/Vector knowledge base',
            record_count: stats.dj_artists_count,
            with_embeddings: stats.dj_artists_with_embeddings
          },
          canonical_artists: {
            purpose: 'Curated display data',
            record_count: stats.canonical_artists_count,
            with_photos: stats.canonical_with_photos
          },
          linking: {
            source_mappings: stats.source_mappings,
            link_percentage: stats.rag_link_percentage
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'analyze' || action === 'recommend') {
      // Gather stats and issues
      const stats = await gatherStats(supabase);
      const issues = await identifyIssues(supabase, stats);
      
      // Build prompt with real data
      const prompt = ARCHITECTURE_PROMPT
        .replace('{stats}', JSON.stringify(stats, null, 2))
        .replace('{issues}', issues.length > 0 ? issues.map(i => `- ${i}`).join('\n') : 'No critical issues detected');
      
      // Get analyses from both models in parallel
      const [openaiAnalysis, anthropicAnalysis] = await Promise.all([
        callOpenAI(prompt),
        callAnthropic(prompt)
      ]);
      
      // Determine consensus
      const sameRecommendation = openaiAnalysis.recommendation === anthropicAnalysis.recommendation;
      const avgConfidence = (openaiAnalysis.confidence + anthropicAnalysis.confidence) / 2;
      
      // Merge pros/cons
      const allPros = [...new Set([...openaiAnalysis.pros, ...anthropicAnalysis.pros])];
      const allCons = [...new Set([...openaiAnalysis.cons, ...anthropicAnalysis.cons])];
      
      // Build consensus recommendation
      let consensusRecommendation: string;
      let consensusReasoning: string;
      
      if (sameRecommendation) {
        consensusRecommendation = openaiAnalysis.recommendation;
        consensusReasoning = `Both OpenAI and Anthropic agree: ${openaiAnalysis.recommendation.toUpperCase()}. ` +
          `Average confidence: ${(avgConfidence * 100).toFixed(0)}%. ` +
          `OpenAI reasoning: ${openaiAnalysis.reasoning} ` +
          `Anthropic reasoning: ${anthropicAnalysis.reasoning}`;
      } else {
        // Models disagree - go with higher confidence
        const winner = openaiAnalysis.confidence >= anthropicAnalysis.confidence ? openaiAnalysis : anthropicAnalysis;
        consensusRecommendation = winner.recommendation;
        consensusReasoning = `Models disagree. OpenAI recommends ${openaiAnalysis.recommendation} (${(openaiAnalysis.confidence * 100).toFixed(0)}% confidence). ` +
          `Anthropic recommends ${anthropicAnalysis.recommendation} (${(anthropicAnalysis.confidence * 100).toFixed(0)}% confidence). ` +
          `Going with ${winner.model}'s recommendation due to higher confidence. ` +
          `Reasoning: ${winner.reasoning}`;
      }
      
      return new Response(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        database_stats: stats,
        current_issues: issues,
        openai_analysis: openaiAnalysis,
        anthropic_analysis: anthropicAnalysis,
        consensus: {
          models_agree: sameRecommendation,
          recommendation: consensusRecommendation,
          average_confidence: avgConfidence,
          reasoning: consensusReasoning,
          combined_pros: allPros,
          combined_cons: allCons,
          migration_effort: sameRecommendation ? openaiAnalysis.migration_effort : 'needs_review',
          data_integrity_risk: sameRecommendation ? openaiAnalysis.data_integrity_risk : 'needs_review'
        },
        action_items: generateActionItems(consensusRecommendation, stats, issues)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: `Unknown action: ${action}`
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Artist DB Architect error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateActionItems(recommendation: string, stats: any, issues: string[]): string[] {
  const items: string[] = [];
  
  if (recommendation === 'consolidate') {
    items.push('Create migration plan to merge dj_artists into canonical_artists');
    items.push('Add embedding column to canonical_artists table');
    items.push('Update all RAG queries to use canonical_artists');
    items.push('Archive dj_artists table after validation');
  } else if (recommendation === 'keep_separate') {
    items.push('Improve artist_source_map linking to ensure full coverage');
    items.push('Create unified_artist_view if not exists for admin dashboards');
    items.push('Document the separation clearly in system docs');
    items.push('Set up automated sync jobs between tables');
  } else if (recommendation === 'hybrid') {
    items.push('Keep both tables but add foreign key from dj_artists to canonical_artists');
    items.push('Move embeddings to separate artist_embeddings table');
    items.push('Create materialized view for combined queries');
    items.push('Implement real-time sync triggers');
  }
  
  // Add issue-specific items
  for (const issue of issues) {
    if (issue.includes('not linked')) {
      items.push('Run artist matching algorithm to link orphaned records');
    }
    if (issue.includes('missing embeddings')) {
      items.push('Batch generate missing embeddings');
    }
    if (issue.includes('missing photos')) {
      items.push('Run photo pipeline for artists without photos');
    }
  }
  
  return items;
}
