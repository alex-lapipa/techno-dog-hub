import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchResult {
  findings: Record<string, unknown>;
  sources: { url: string; title: string; snippet: string }[];
  rawData: unknown[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entityName, entityType, searchQueries } = await req.json();
    
    // Try both Firecrawl keys
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY") || Deno.env.get("FIRECRAWL_API_KEY_1");
    
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    console.log(`[Researcher] Researching: ${entityName} (${entityType})`);

    const sources: { url: string; title: string; snippet: string }[] = [];
    const rawData: unknown[] = [];

    // Define source priorities based on entity type
    const getSearchSources = (type: string, name: string): string[] => {
      const baseQueries = [
        `${name} official website`,
        `${name} ${type}`,
      ];

      switch (type) {
        case 'artist':
          return [
            ...baseQueries,
            `${name} resident advisor`,
            `${name} discogs`,
            `${name} bandcamp`,
            `${name} soundcloud`,
            `${name} techno DJ bio`,
          ];
        case 'venue':
          return [
            ...baseQueries,
            `${name} club resident advisor`,
            `${name} nightclub location capacity`,
          ];
        case 'festival':
          return [
            ...baseQueries,
            `${name} festival lineup`,
            `${name} festival location dates`,
          ];
        case 'gear':
          return [
            ...baseQueries,
            `${name} synthesizer specifications`,
            `${name} vintage synth explorer`,
          ];
        default:
          return baseQueries;
      }
    };

    const queries = searchQueries || getSearchSources(entityType, entityName);

    // Use Firecrawl search for each query (limit to prevent rate limiting)
    for (const query of queries.slice(0, 3)) {
      try {
        console.log(`[Researcher] Searching: ${query}`);
        
        const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 5,
            scrapeOptions: {
              formats: ["markdown"],
            },
          }),
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error(`[Researcher] Firecrawl search error for "${query}":`, errorText);
          continue;
        }

        const searchData = await searchResponse.json();
        
        if (searchData.success && searchData.data) {
          for (const result of searchData.data) {
            sources.push({
              url: result.url || "",
              title: result.title || result.metadata?.title || "Unknown",
              snippet: result.description || result.markdown?.substring(0, 500) || "",
            });
            rawData.push(result);
          }
        }
      } catch (e) {
        console.error(`[Researcher] Error searching "${query}":`, e);
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Also try to scrape specific known sources
    const knownSources: Record<string, string[]> = {
      artist: [
        `https://ra.co/dj/${entityName.toLowerCase().replace(/\s+/g, '')}`,
        `https://www.discogs.com/artist/${entityName.replace(/\s+/g, '-')}`,
      ],
      venue: [
        `https://ra.co/clubs/${entityName.toLowerCase().replace(/\s+/g, '')}`,
      ],
      festival: [
        `https://ra.co/festivals/${entityName.toLowerCase().replace(/\s+/g, '')}`,
      ],
    };

    const specificUrls = knownSources[entityType] || [];
    
    for (const url of specificUrls.slice(0, 2)) {
      try {
        console.log(`[Researcher] Scraping: ${url}`);
        
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
            onlyMainContent: true,
          }),
        });

        if (scrapeResponse.ok) {
          const scrapeData = await scrapeResponse.json();
          if (scrapeData.success && scrapeData.data) {
            sources.push({
              url,
              title: scrapeData.data.metadata?.title || url,
              snippet: scrapeData.data.markdown?.substring(0, 1000) || "",
            });
            rawData.push(scrapeData.data);
          }
        }
      } catch (e) {
        console.error(`[Researcher] Error scraping ${url}:`, e);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Deduplicate sources by URL
    const uniqueSources = sources.filter((source, index, self) =>
      index === self.findIndex(s => s.url === source.url)
    );

    console.log(`[Researcher] Found ${uniqueSources.length} unique sources for ${entityName}`);

    // Compile findings from raw data
    const findings: Record<string, unknown> = {
      entityName,
      entityType,
      sourcesFound: uniqueSources.length,
      dataPoints: rawData.map(d => ({
        title: (d as any).metadata?.title || (d as any).title,
        url: (d as any).url || (d as any).sourceURL,
        hasMarkdown: !!(d as any).markdown,
        contentLength: (d as any).markdown?.length || 0,
      })),
    };

    return new Response(
      JSON.stringify({
        success: true,
        findings,
        sources: uniqueSources,
        rawData: rawData.slice(0, 5), // Limit to prevent huge responses
      } as ResearchResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Researcher] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
