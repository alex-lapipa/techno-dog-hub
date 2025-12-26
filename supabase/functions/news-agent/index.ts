import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// EDM BLACKLIST - Keywords to filter out commercial content
// ============================================================
const EDM_BLACKLIST = {
  keywords: [
    'edm', 'big room', 'mainstage', 'festival anthem', 'banger', 'drop', 'radio edit',
    'tomorrowland', 'ultra', 'creamfields', 'e-zoo', 'edc', 'electric daisy',
    'top 10', 'best dance tracks', 'best drops', 'top tracks',
    'chart', 'billboard', 'grammy', 'pop collab',
    'superstar dj', 'highest paid dj', 'headliner',
    'future bass', 'slap house', 'tropical house', 'commercial trance',
    'david guetta', 'martin garrix', 'tiesto', 'hardwell', 'afrojack',
    'mainstream dance', 'dance pop', 'radio hit'
  ],
  genres: [
    'future bass', 'slap house', 'big room', 'tropical house', 
    'commercial trance', 'commercial house', 'electro house'
  ]
};

// ============================================================
// SOURCE TIERS - Underground credibility scoring
// ============================================================
const SOURCE_TIERS = {
  tier1: {
    weight: 1.0,
    sources: [
      { name: 'Resident Advisor', url: 'https://ra.co/news', searchUrl: 'https://ra.co' },
      { name: 'XLR8R', url: 'https://xlr8r.com', searchUrl: 'https://xlr8r.com' },
      { name: 'Bandcamp Daily', url: 'https://daily.bandcamp.com', searchUrl: 'https://daily.bandcamp.com' },
      { name: 'The Quietus', url: 'https://thequietus.com', searchUrl: 'https://thequietus.com' }
    ]
  },
  tier2: {
    weight: 0.7,
    sources: [
      { name: 'FACT Magazine', url: 'https://www.factmag.com', searchUrl: 'https://www.factmag.com' },
      { name: 'Crack Magazine', url: 'https://crackmagazine.net', searchUrl: 'https://crackmagazine.net' }
    ]
  },
  tier3: {
    weight: 0.4,
    sources: [
      { name: 'Mixmag', url: 'https://mixmag.net', searchUrl: 'https://mixmag.net' },
      { name: 'DJ Mag', url: 'https://djmag.com', searchUrl: 'https://djmag.com' }
    ]
  }
};

// ============================================================
// AUTHOR PSEUDONYMS - TECHNO.DOG house writers
// ============================================================
const AUTHOR_PSEUDONYMS = [
  'K. Vaultkeeper',
  'S. Lowend',
  'M. Strobe',
  'D. Analog',
  'R. Bassweight',
  'A. Darkroom',
  'T. Reverb',
  'L. Concrete'
];

// ============================================================
// PROMPT TEMPLATES
// ============================================================

const CLASSIFIER_PROMPT = `You are a techno music journalist classifier. Your job is to determine if a news story is about UNDERGROUND TECHNO or not.

UNDERGROUND TECHNO includes:
- Detroit techno, Berlin techno, hypnotic techno, dub techno, industrial techno, minimal techno
- Underground club culture, warehouse raves, DIY scenes
- Independent labels, small venues, cultural movements
- Scenes in: Berlin, Detroit, Tbilisi, Tokyo, Madrid, London, Amsterdam, NYC, etc.

COMMERCIAL/EDM includes:
- Big room, tropical house, future bass, mainstream dance
- Major festival headliners (Ultra, Tomorrowland, EDC)
- Chart music, pop collaborations
- Celebrity DJs, mainstream media coverage

Analyze this content and respond with ONLY valid JSON:
{
  "classification": "underground-techno" | "commercial-dance" | "irrelevant",
  "underground_score": 0-100,
  "reason": "brief explanation"
}

Content to classify:
TITLE: {title}
EXCERPT: {excerpt}
SOURCE: {source}`;

const RANKING_PROMPT = `You are ranking underground techno news stories by importance for a serious techno journalism outlet.

Consider:
1. Cultural significance (scene impact, historical importance)
2. Timeliness (breaking news vs evergreen)
3. Geographic diversity (global underground scenes)
4. Story depth potential (enough substance for 600-1200 word article)

Rank these candidates and return ONLY valid JSON:
{
  "rankings": [
    {
      "index": 0,
      "impact_score": 0-100,
      "reason": "why this story matters"
    }
  ],
  "recommended_index": 0
}

Candidates:
{candidates}`;

const ARTICLE_WRITER_PROMPT = `You are a senior techno journalist for TECHNO.DOG, an underground techno publication.

VOICE:
- Smart, streetwise, knowledgeable
- Not marketing speak - real journalism
- Scene insider perspective
- Global awareness of techno culture
- Cite everything

AVOID:
- Clichés: "legendary", "iconic", "groundbreaking", "game-changing"
- Marketing language: "must-see", "unmissable", "essential"
- EDM terminology: "drop", "banger", "fire"
- Speculation without sources

STRUCTURE:
1. Strong opening hook
2. Core news/story
3. Scene context (geographic, cultural, historical)
4. Why it matters section
5. Forward-looking conclusion

Write a 600-1200 word article about this story. Return ONLY valid JSON:
{
  "title": "string (headline, no quotes)",
  "subtitle": "string (subheadline)",
  "body_markdown": "string (full article in markdown)",
  "author_pseudonym": "string (from provided list)",
  "city_tags": ["string"],
  "genre_tags": ["string"],
  "entity_tags": ["string (artists, labels, venues mentioned)"],
  "confidence_score": 0.0-1.0
}

Author pseudonym options: {authors}

Story to write about:
{story}

Source content:
{content}`;

const ENTITY_EXTRACTOR_PROMPT = `Extract named entities from this techno article. Return ONLY valid JSON:
{
  "entities": [
    {
      "name": "string",
      "type": "artist|label|club|venue|festival|promoter|collective|city|scene|release",
      "city": "string or null",
      "country": "string or null",
      "description": "brief description",
      "aliases": ["string"],
      "source_urls": ["string"]
    }
  ]
}

Article:
{article}`;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function containsBlacklistedContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return EDM_BLACKLIST.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function getRandomAuthor(): string {
  return AUTHOR_PSEUDONYMS[Math.floor(Math.random() * AUTHOR_PSEUDONYMS.length)];
}

async function callOpenAI(prompt: string, openaiKey: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a techno music journalist. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content;
  if (content.includes('```json')) {
    jsonStr = content.split('```json')[1].split('```')[0].trim();
  } else if (content.includes('```')) {
    jsonStr = content.split('```')[1].split('```')[0].trim();
  }
  
  return JSON.parse(jsonStr);
}

async function scrapeWithFirecrawl(url: string, firecrawlKey: string): Promise<any> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
    }),
  });

  if (!response.ok) {
    console.error('Firecrawl error for URL:', url);
    return null;
  }

  return response.json();
}

async function searchWithFirecrawl(query: string, firecrawlKey: string): Promise<any> {
  const response = await fetch('https://api.firecrawl.dev/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firecrawlKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `${query} techno underground music news`,
      limit: 10,
      tbs: 'qdr:d', // Last day
      scrapeOptions: { formats: ['markdown'] }
    }),
  });

  if (!response.ok) {
    console.error('Firecrawl search error');
    return { data: [] };
  }

  return response.json();
}

// ============================================================
// MAIN AGENT WORKFLOW
// ============================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!firecrawlKey) {
    return new Response(JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create run record
  const { data: runRecord, error: runError } = await supabase
    .from('td_news_agent_runs')
    .insert({ status: 'running' })
    .select()
    .single();

  if (runError) {
    console.error('Failed to create run record:', runError);
    return new Response(JSON.stringify({ error: 'Failed to create run record' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const runId = runRecord.id;
  console.log(`Starting news agent run: ${runId}`);

  try {
    // ============================================
    // STEP A: DISCOVER - Search for news
    // ============================================
    console.log('Step A: Discovering news sources...');
    
    const allCandidates: any[] = [];
    const sourcesChecked: any[] = [];

    // Search only Tier 1 sources to stay within timeout limits
    const tier1 = SOURCE_TIERS.tier1;
    for (const source of tier1.sources.slice(0, 2)) { // Limit to 2 sources
      try {
        console.log(`Searching ${source.name}...`);
        const searchResult = await searchWithFirecrawl(source.name, firecrawlKey);
        
        sourcesChecked.push({ name: source.name, tier: 'tier1', resultsCount: searchResult?.data?.length || 0 });
        
        if (searchResult?.data) {
          for (const item of searchResult.data.slice(0, 5)) { // Limit to 5 per source
            allCandidates.push({
              title: item.title || 'Untitled',
              url: item.url,
              excerpt: item.description || item.markdown?.substring(0, 500) || '',
              source: source.name,
              tier: 'tier1',
              tierWeight: tier1.weight,
              content: item.markdown?.substring(0, 10000) || '',
            });
          }
        }
      } catch (err) {
        console.error(`Error searching ${source.name}:`, err);
      }
    }

    console.log(`Found ${allCandidates.length} total candidates`);

    // ============================================
    // STEP B: FILTER - Remove EDM/commercial content
    // ============================================
    console.log('Step B: Filtering candidates...');
    
    const rejected: any[] = [];
    const filtered: any[] = [];

    for (const candidate of allCandidates) {
      // First: keyword blacklist check
      if (containsBlacklistedContent(candidate.title + ' ' + candidate.excerpt)) {
        rejected.push({ ...candidate, reason: 'EDM blacklist keyword match' });
        continue;
      }

      // Second: AI classification
      try {
        const classifierPrompt = CLASSIFIER_PROMPT
          .replace('{title}', candidate.title)
          .replace('{excerpt}', candidate.excerpt)
          .replace('{source}', candidate.source);

        const classification = await callOpenAI(classifierPrompt, openaiKey);
        
        if (classification.classification === 'underground-techno' && classification.underground_score >= 50) {
          filtered.push({
            ...candidate,
            underground_score: classification.underground_score,
            classification_reason: classification.reason
          });
        } else {
          rejected.push({
            ...candidate,
            reason: `Classification: ${classification.classification}, Score: ${classification.underground_score}, Reason: ${classification.reason}`
          });
        }
      } catch (err) {
        console.error('Classification error:', err);
        // If classification fails, be conservative and reject
        rejected.push({ ...candidate, reason: 'Classification failed' });
      }
    }

    console.log(`Filtered to ${filtered.length} underground techno candidates, rejected ${rejected.length}`);

    if (filtered.length === 0) {
      // Update run record with no results
      await supabase.from('td_news_agent_runs').update({
        status: 'partial',
        sources_checked: sourcesChecked,
        candidates: [],
        rejected: rejected.slice(0, 50), // Limit stored rejections
        error_log: 'No suitable underground techno stories found today'
      }).eq('id', runId);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No suitable stories found',
        runId,
        rejected: rejected.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============================================
    // STEP C: RANK - Find the best story
    // ============================================
    console.log('Step C: Ranking candidates...');
    
    // Pre-rank by combined score
    filtered.sort((a, b) => {
      const scoreA = (a.underground_score * a.tierWeight);
      const scoreB = (b.underground_score * b.tierWeight);
      return scoreB - scoreA;
    });

    // Take top 5 for AI ranking
    const topCandidates = filtered.slice(0, 5);
    
    const rankingPrompt = RANKING_PROMPT.replace(
      '{candidates}',
      JSON.stringify(topCandidates.map((c, i) => ({
        index: i,
        title: c.title,
        excerpt: c.excerpt,
        source: c.source,
        underground_score: c.underground_score
      })), null, 2)
    );

    let chosenIndex = 0;
    try {
      const ranking = await callOpenAI(rankingPrompt, openaiKey);
      chosenIndex = ranking.recommended_index || 0;
    } catch (err) {
      console.error('Ranking error:', err);
      // Fall back to first candidate
    }

    const chosenStory = topCandidates[chosenIndex];
    console.log(`Chosen story: ${chosenStory.title}`);

    // ============================================
    // STEP D: WRITE - Generate article
    // ============================================
    console.log('Step D: Writing article...');
    
    // Get fresh content for the chosen story
    let fullContent = chosenStory.content;
    let sourceSnapshot = null;
    
    if (chosenStory.url) {
      try {
        const scrapeResult = await scrapeWithFirecrawl(chosenStory.url, firecrawlKey);
        if (scrapeResult?.data?.markdown) {
          fullContent = scrapeResult.data.markdown.substring(0, 20000);
          sourceSnapshot = {
            url: chosenStory.url,
            scraped_at: new Date().toISOString(),
            content_preview: fullContent.substring(0, 1000)
          };
        }
      } catch (err) {
        console.error('Scrape error:', err);
      }
    }

    const writerPrompt = ARTICLE_WRITER_PROMPT
      .replace('{authors}', AUTHOR_PSEUDONYMS.join(', '))
      .replace('{story}', JSON.stringify({
        title: chosenStory.title,
        source: chosenStory.source,
        url: chosenStory.url
      }))
      .replace('{content}', fullContent);

    const article = await callOpenAI(writerPrompt, openaiKey);
    
    // Ensure author is from our list
    if (!AUTHOR_PSEUDONYMS.includes(article.author_pseudonym)) {
      article.author_pseudonym = getRandomAuthor();
    }

    // ============================================
    // STEP E: STORE - Save as draft
    // ============================================
    console.log('Step E: Saving draft article...');
    
    const { data: savedArticle, error: articleError } = await supabase
      .from('td_news_articles')
      .insert({
        title: article.title,
        subtitle: article.subtitle,
        body_markdown: article.body_markdown,
        author_pseudonym: article.author_pseudonym,
        city_tags: article.city_tags || [],
        genre_tags: article.genre_tags || [],
        entity_tags: article.entity_tags || [],
        source_urls: [chosenStory.url].filter(Boolean),
        source_snapshots: sourceSnapshot ? [sourceSnapshot] : [],
        confidence_score: article.confidence_score || 0.75,
        status: 'draft'
      })
      .select()
      .single();

    if (articleError) {
      throw new Error(`Failed to save article: ${articleError.message}`);
    }

    console.log(`Saved draft article: ${savedArticle.id}`);

    // ============================================
    // STEP F: EXTRACT ENTITIES
    // ============================================
    console.log('Step F: Extracting entities...');
    
    try {
      const entityPrompt = ENTITY_EXTRACTOR_PROMPT.replace('{article}', article.body_markdown);
      const entityResult = await callOpenAI(entityPrompt, openaiKey);
      
      if (entityResult.entities && entityResult.entities.length > 0) {
        for (const entity of entityResult.entities) {
          // Upsert entity
          const { data: existingEntity } = await supabase
            .from('td_knowledge_entities')
            .select('id')
            .eq('name', entity.name)
            .eq('type', entity.type)
            .single();

          let entityId: string;

          if (existingEntity) {
            entityId = existingEntity.id;
            // Update with new info
            await supabase.from('td_knowledge_entities').update({
              description: entity.description || undefined,
              city: entity.city || undefined,
              country: entity.country || undefined,
            }).eq('id', entityId);
          } else {
            // Insert new entity
            const { data: newEntity } = await supabase
              .from('td_knowledge_entities')
              .insert({
                name: entity.name,
                type: entity.type,
                city: entity.city,
                country: entity.country,
                description: entity.description,
                aliases: entity.aliases || [],
                source_urls: entity.source_urls || []
              })
              .select()
              .single();
            
            entityId = newEntity?.id;
          }

          // Link to article (ignore if already exists)
          if (entityId) {
            await supabase.from('td_article_entities').upsert({
              article_id: savedArticle.id,
              entity_id: entityId
            }, { onConflict: 'article_id,entity_id', ignoreDuplicates: true });
          }
        }
        console.log(`Extracted ${entityResult.entities.length} entities`);
      }
    } catch (err) {
      console.error('Entity extraction error:', err);
      // Non-fatal, continue
    }

    // ============================================
    // UPDATE RUN RECORD
    // ============================================
    await supabase.from('td_news_agent_runs').update({
      status: 'success',
      sources_checked: sourcesChecked,
      candidates: filtered.slice(0, 20).map(c => ({ title: c.title, url: c.url, score: c.underground_score })),
      rejected: rejected.slice(0, 50).map(r => ({ title: r.title, reason: r.reason })),
      chosen_story: { title: chosenStory.title, url: chosenStory.url },
      final_article_id: savedArticle.id
    }).eq('id', runId);

    console.log(`News agent run ${runId} completed successfully`);

    return new Response(JSON.stringify({
      success: true,
      runId,
      articleId: savedArticle.id,
      title: article.title,
      candidatesFound: allCandidates.length,
      filtered: filtered.length,
      rejected: rejected.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('News agent error:', error);
    
    // Update run record with error
    await supabase.from('td_news_agent_runs').update({
      status: 'failed',
      error_log: error instanceof Error ? error.message : 'Unknown error'
    }).eq('id', runId);

    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      runId
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
