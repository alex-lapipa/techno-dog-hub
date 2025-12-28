import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KnowledgeSource {
  type: 'wikipedia' | 'discogs' | 'resident_advisor' | 'manual';
  query?: string;
  url?: string;
  content?: string;
  title?: string;
}

interface ExtractionResult {
  entities: Array<{
    name: string;
    type: string;
    description?: string;
    aliases?: string[];
    city?: string;
    country?: string;
  }>;
  facts: string[];
  relationships: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

// Use Lovable AI for entity extraction
async function extractEntitiesWithAI(
  content: string,
  apiKey: string
): Promise<ExtractionResult> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a techno music knowledge extraction expert. Extract structured information from the provided content.

Return a JSON object with:
- entities: Array of { name, type, description, aliases, city, country }
  - type must be one of: artist, label, record_label, club, venue, festival, promoter, collective, crew, agency, city, scene, country, region, release, track, album, ep, event, party, rave, radio_show, podcast, mix, documentary, gear, synthesizer, drum_machine, genre, subgenre, movement, era, other
- facts: Array of key facts as strings
- relationships: Array of { from, to, type } describing connections

Focus on techno music culture. Be precise and factual.`
          },
          {
            role: "user",
            content: `Extract entities and knowledge from this content:\n\n${content.substring(0, 8000)}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      console.error("AI extraction failed:", response.status);
      return { entities: [], facts: [], relationships: [] };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '{}';
    
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { entities: [], facts: [], relationships: [] };
    }
  } catch (error) {
    console.error("Entity extraction error:", error);
    return { entities: [], facts: [], relationships: [] };
  }
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
        input: text.substring(0, 8000),
        dimensions: 768
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

// Fetch Wikipedia content
async function fetchWikipediaContent(query: string): Promise<{ title: string; content: string; url: string } | null> {
  try {
    // Search for the article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    
    if (!searchData.query?.search?.length) return null;
    
    const pageTitle = searchData.query.search[0].title;
    
    // Get article content
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=extracts&explaintext=1&format=json&origin=*`;
    const contentRes = await fetch(contentUrl);
    const contentData = await contentRes.json();
    
    const pages = contentData.query?.pages || {};
    const page = Object.values(pages)[0] as { title?: string; extract?: string };
    
    if (!page?.extract) return null;
    
    return {
      title: page.title || pageTitle,
      content: page.extract,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`
    };
  } catch (error) {
    console.error("Wikipedia fetch error:", error);
    return null;
  }
}

// Chunk text with overlap
function chunkText(text: string, chunkSize = 1500, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }
  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { action, sources, extractEntities = true, generateEmbeddings = true } = body;

    if (action === "ingest" && sources) {
      const results = {
        documentsCreated: 0,
        entitiesCreated: 0,
        embeddingsGenerated: 0,
        errors: [] as string[],
      };

      for (const source of sources as KnowledgeSource[]) {
        let content = source.content;
        let title = source.title;
        let sourceUrl = source.url;

        // Fetch content based on source type
        if (source.type === 'wikipedia' && source.query) {
          console.log(`Fetching Wikipedia: ${source.query}`);
          const wikiResult = await fetchWikipediaContent(source.query);
          if (wikiResult) {
            content = wikiResult.content;
            title = wikiResult.title;
            sourceUrl = wikiResult.url;
          } else {
            results.errors.push(`Wikipedia: No results for "${source.query}"`);
            continue;
          }
        }

        if (!content || !title) {
          results.errors.push(`Missing content or title for source`);
          continue;
        }

        console.log(`Processing: ${title} (${content.length} chars)`);

        // Extract entities with AI
        if (extractEntities && lovableKey) {
          const extraction = await extractEntitiesWithAI(content, lovableKey);
          
          for (const entity of extraction.entities) {
            // Check if entity already exists
            const { data: existing } = await supabase
              .from('td_knowledge_entities')
              .select('id')
              .eq('name', entity.name)
              .eq('type', entity.type)
              .maybeSingle();

            if (!existing) {
              const { error } = await supabase
                .from('td_knowledge_entities')
                .insert({
                  name: entity.name,
                  type: entity.type,
                  description: entity.description,
                  aliases: entity.aliases || [],
                  city: entity.city,
                  country: entity.country,
                  source_urls: sourceUrl ? [sourceUrl] : [],
                });

              if (!error) {
                results.entitiesCreated++;
                console.log(`Created entity: ${entity.name} (${entity.type})`);
              }
            }
          }
        }

        // Chunk and store content
        const chunks = chunkText(content);
        
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          // Generate embedding
          let embedding = null;
          if (generateEmbeddings && openaiKey) {
            embedding = await generateEmbedding(chunk, openaiKey);
            if (embedding) results.embeddingsGenerated++;
          }

          const embeddingStr = embedding ? `[${embedding.join(',')}]` : null;

          const { error } = await supabase
            .from('documents')
            .insert({
              title: chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title,
              content: chunk,
              source: sourceUrl || source.type,
              embedding: embeddingStr,
              metadata: {
                source_type: source.type,
                original_title: title,
                chunk_index: i,
                total_chunks: chunks.length,
                ingested_at: new Date().toISOString(),
              },
              chunk_index: i,
            });

          if (!error) {
            results.documentsCreated++;
          }
        }

        console.log(`Completed: ${title}`);
      }

      return new Response(JSON.stringify({
        success: true,
        ...results,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "suggest-topics") {
      // Return suggested topics to expand the knowledge base
      const suggestedTopics = [
        // Detroit Techno
        { query: "Detroit techno", type: "wikipedia" },
        { query: "Belleville Three", type: "wikipedia" },
        { query: "Juan Atkins", type: "wikipedia" },
        { query: "Derrick May (musician)", type: "wikipedia" },
        { query: "Kevin Saunderson", type: "wikipedia" },
        { query: "Underground Resistance", type: "wikipedia" },
        { query: "Jeff Mills", type: "wikipedia" },
        { query: "Robert Hood", type: "wikipedia" },
        
        // Berlin Techno
        { query: "Berlin techno", type: "wikipedia" },
        { query: "Tresor (club)", type: "wikipedia" },
        { query: "Berghain", type: "wikipedia" },
        { query: "Love Parade", type: "wikipedia" },
        
        // Labels
        { query: "Warp Records", type: "wikipedia" },
        { query: "R&S Records", type: "wikipedia" },
        { query: "Planet E Communications", type: "wikipedia" },
        { query: "Ostgut Ton", type: "wikipedia" },
        
        // Subgenres
        { query: "Minimal techno", type: "wikipedia" },
        { query: "Industrial techno", type: "wikipedia" },
        { query: "Acid techno", type: "wikipedia" },
        { query: "Dub techno", type: "wikipedia" },
        
        // Scenes
        { query: "Techno music", type: "wikipedia" },
        { query: "Rave", type: "wikipedia" },
        { query: "Electronic dance music", type: "wikipedia" },
        
        // Equipment
        { query: "Roland TR-909", type: "wikipedia" },
        { query: "Roland TB-303", type: "wikipedia" },
        { query: "Roland TR-808", type: "wikipedia" },
      ];

      // Check which topics are already in the knowledge base
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('title, source');

      const existingTitles = new Set(
        (existingDocs || []).map(d => d.title?.toLowerCase().split(' (')[0])
      );

      const newTopics = suggestedTopics.filter(
        t => !existingTitles.has(t.query.toLowerCase())
      );

      return new Response(JSON.stringify({
        success: true,
        suggestedTopics: newTopics,
        alreadyIngested: suggestedTopics.length - newTopics.length,
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "stats") {
      const [docsResult, entitiesResult, embeddingsResult] = await Promise.all([
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('td_knowledge_entities').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }).not('embedding', 'is', null),
      ]);

      return new Response(JSON.stringify({
        success: true,
        stats: {
          documents: docsResult.count || 0,
          entities: entitiesResult.count || 0,
          documentsWithEmbeddings: embeddingsResult.count || 0,
        },
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: "Invalid action. Use 'ingest', 'suggest-topics', or 'stats'",
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Knowledge ingest error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
