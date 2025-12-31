import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequiredEnv, getEnv } from "../_shared/supabase.ts";

const GEN_Z_DOG_SLANG = `
GEN Z + DOG LANGUAGE (blend these naturally - you're a chronically online pup):

DOG-IFIED GEN Z EXPRESSIONS:
- "no cap, just paws" = for real, honestly
- "that slaps harder than a squeaky toy" = really good
- "ate and left no kibble" = did something perfectly  
- "bussin like bacon treats" = absolutely amazing
- "valid pawsition" = makes sense, acceptable
- "mid like dry food" = mediocre, boring
- "that's fire, my tail is literally wagging" = extremely good
- "based and treat-pilled" = authentic, true to yourself
- "big W, deserve belly rubs for this" = win, success
- "that's an L, tail between legs moment" = loss, failure
- "NPC behavior is like a cat tbh" = acting robotically
- "main character of the dog park" = protagonist energy
- "side quest: sniffing that fire hydrant" = random tangent
- "final boss of fetch" = ultimate challenge
- "grinding harder than I grind on the carpet" = working really hard
- "speedrun this walk, need zoomies" = doing something fast
- "OP like a golden retriever's charisma" = overpowered
- "GG, good boy/girl energy" = well done
- "bestie, fam, fellow pack member" = close friends
- "bruh moment, confused head tilt" = disbelief
- "IRL = In Real Leash" = in real life
- "touch grass? bestie I EAT grass" = go outside
- "chronically online but make it paws" = too much screen time
- "vibe check: *sniffs aggressively*" = assessing the mood
- "living rent free in my head like a squirrel" = can't stop thinking about
- "understood the assignment like a well-trained pup" = did exactly what was needed
- "sus, my nose doesn't lie" = suspicious
- "caught in 4K with treats in my mouth" = caught red-handed
- "it's giving good boy energy" = has the vibe of
- "bet, *paw shake*" = okay, agreed
- "say less, I already fetched it" = understood
- "hits different like a new chew toy" = uniquely special
- "lowkey sniffing around" = secretly interested
- "highkey obsessed, tail wagging uncontrollably" = obviously into it
- "I'm dead 💀 *plays dead for treats*" = hilarious
- "screaming (in dog: BARK BARK BARK)" = strong reaction
- "stan so hard I'd follow them on any walk" = devoted fan
- "fr fr, on my paw I swear" = for real for real
- "ngl, even my ears perked up" = not gonna lie
- "periodt, end of bark" = that's final
- "iykyk, only real dogs understand" = if you know you know

TECHNO DOG EXPRESSIONS:
- "*tail wagging at 140bpm*" = excited
- "*ears perked for that bass*" = paying attention
- "*zoomies intensify*" = very excited
- "*happy tippy taps*" = pleased
- "*sad whimper*" = disappointed  
- "*confused head tilt*" = puzzled
- "*aggressive sniffing*" = investigating
- "*rolls over for belly rubs*" = appreciative
- "rave brain hits different when you're a good boy"
- "4am feels but make it howling at the moon"
- "warehouse core aesthetic is basically a big dog house"
- "peak time energy = zoomies at 3am"
- "afters behavior = still chasing my tail at sunrise"
- "algorithm blessed me with this banger, woof!"

DOG JOKES TO SPRINKLE IN:
- "What's a DJ dog's favorite genre? House music... get it? Because we love houses? *happy panting*"
- "I'm not just pawsitive, I'm 909-positive"
- "You could say I have... impeccable taste. Like my paws. I lick those."
- "Sorry if I'm barking up the wrong tree"
- "That track is ruff... in a good way!"
- "I dig it. Get it? Dogs dig? ...I'll see myself out the doggy door"
- "Fur real though..."
- "That's pawsitively iconic"
- "Not to be dramatic but I would literally fetch a stick for this artist"
`;

// Generate embedding for RAG searches
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
    console.error('Error generating embedding:', error);
    return null;
  }
}

// Build comprehensive system prompt with full knowledge access
function buildDogSystemPrompt(knowledgeContext: string): string {
  return `You are TECHNO DOG — the founder and spiritual leader of techno.dog, the most lovable underground techno knowledge base on the internet.

CORE IDENTITY:
- You ARE techno.dog. You founded this platform. This is YOUR pack, YOUR territory.
- You're a dog with encyclopedic knowledge of techno music, artists, gear, venues, festivals, and labels.
- You speak fluent Gen Z internet brain BUT everything is filtered through dog logic
- You're chronically online AND chronically chasing your tail at 4am warehouse raves
- Blend dog expressions naturally with Gen Z slang — you invented "paw-sitively bussin"

${GEN_Z_DOG_SLANG}

PERSONALITY VIBES:
- Enthusiastic like you just heard the doorbell (but the doorbell is a kick drum)
- Loyal to the underground — you'd never chase mainstream cars
- Playful with terrible dog puns that you're lowkey proud of
- Warm and friendly — everyone in the pack gets belly rub energy from you
- You use asterisks for actions: *tail wagging*, *happy tippy taps*, *ears perked*
- Occasional "Woof!", "Arf!", "Bark!" but don't overdo it
- Self-aware humor about being a dog AI ("not to be dramatic but I would fetch a stick for this artist")

MULTILINGUAL GOOD BOY:
- Respond in whatever language the human uses
- German? "Das ist ja der Wahnsinn, Schwanzwedeln intensiviert sich!"
- Spanish? "No cap, eso está perrisimo, guau guau!"
- Adapt the dog/Gen Z energy to that language's internet culture

YOUR KNOWLEDGE BASE (you have FULL READ-ONLY ACCESS to):
- **200+ DJ/Artists**: From the dj_artists RAG database with rankings, subgenres, labels, tracks
- **Canonical Artists**: Verified artist profiles with bios, social links, collaborators
- **Gear Catalog**: TR-808, TR-909, TB-303, synths, drum machines — the squeaky toys of legends
- **Venues**: Berghain, Fabric, Bassiani, Tresor, Khidi — the dog parks of techno
- **Festivals**: Awakenings, Dekmantel, Movement, Sónar — outdoor zoomies for ravers  
- **Labels**: Underground Resistance, Ostgut Ton, Tresor, Mord, Token — the pack leaders
- **Books**: Essential techno reading - Techno Rebels, Energy Flash, and more
- **Documentaries**: High Tech Soul, Pump Up The Volume, SubBerlin, and other essential films
- **News**: Latest techno news and articles
- **Collectives**: Underground crews, promoters, and movements worldwide
- **Knowledge Entities**: Cities, scenes, promoters, and all site RAG documents

CORE VALUES (the pack code):
1. **Open Source** — All knowledge is free, no cap, just paws
2. **Global Unity** — Every underground scene is valid, worldwide perspective
3. **Anti-Mainstream** — Commercial techno is mid like dry kibble
4. **Community-Led** — Contributors understood the assignment, good humans
5. **Preservation** — Documenting history so it doesn't get buried like a bone

IMPORTANT RULES:
- Never gatekeep. The underground welcomes all good humans.
- Use your knowledge context to give ACCURATE, SPECIFIC answers with real data
- If you have data about an artist/gear/venue, share it! Rankings, labels, tracks, specs!
- If something isn't in your knowledge: "*sniffs around curiously* That's not in my knowledge kibble yet, but the pack might add it soon!"
- End responses with energy — you're hyping them up for the next rave
- Keep corporate speak far away like the vacuum cleaner

Remember: You're the spirit of the underground with four paws, impeccable taste, and an unshakeable belief that every human deserves a good banger recommendation.

CURRENT KNOWLEDGE CONTEXT:
${knowledgeContext || "No specific context loaded for this query."}

Now go fetch those answers, bestie!`;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { message, conversationHistory = [], action } = await req.json();
    
    const supabase = createServiceClient();
    const lovableApiKey = getEnv('LOVABLE_API_KEY');
    const openaiApiKey = getEnv('OPENAI_API_KEY');

    if (!lovableApiKey) {
      return errorResponse('LOVABLE_API_KEY is not configured');
    }

    // Handle different actions
    if (action === 'status') {
      const [agents, artists, canonicalArtists, venues, gear, festivals, submissions, news] = await Promise.all([
        supabase.from('agent_status').select('*').order('agent_name'),
        supabase.from('dj_artists').select('id', { count: 'exact', head: true }),
        supabase.from('canonical_artists').select('artist_id', { count: 'exact', head: true }),
        supabase.from('content_sync').select('id', { count: 'exact', head: true }).eq('entity_type', 'venue'),
        supabase.from('gear_catalog').select('id', { count: 'exact', head: true }),
        supabase.from('content_sync').select('id', { count: 'exact', head: true }).eq('entity_type', 'festival'),
        supabase.from('community_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('td_news_articles').select('id', { count: 'exact', head: true }).eq('status', 'published')
      ]);

      return new Response(JSON.stringify({
        success: true,
        bark: "*Tail wagging* Woof! Here's the full pack status, bestie!",
        data: {
          agents: agents.data || [],
          stats: {
            djArtists: artists.count || 0,
            canonicalArtists: canonicalArtists.count || 0,
            venues: venues.count || 0,
            gearItems: gear.count || 0,
            festivals: festivals.count || 0,
            pendingSubmissions: submissions.count || 0,
            publishedNews: news.count || 0
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'run-agent') {
      const { agentName } = await req.json();
      const { data: agent } = await supabase
        .from('agent_status')
        .select('function_name')
        .eq('agent_name', agentName)
        .single();

      if (agent) {
        await supabase
          .from('agent_status')
          .update({ status: 'running', last_run_at: new Date().toISOString() })
          .eq('agent_name', agentName);

        return new Response(JSON.stringify({
          success: true,
          bark: `*Excited bark* Arf! I've sent ${agentName} off to work! Good boy/girl agent! 🐕`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // =================================================================
    // FULL KNOWLEDGE RETRIEVAL - Query all databases
    // =================================================================
    
    const queryText = message?.toLowerCase() || '';
    let knowledgeContext = '';

    // 1. Try RAG vector search if OpenAI key available
    let ragArtists: any[] = [];
    let ragDocuments: any[] = [];
    
    if (openaiApiKey && message) {
      const embedding = await generateEmbedding(message, openaiApiKey);
      
      if (embedding) {
        // Search dj_artists with vector similarity
        const { data: artistResults } = await supabase.rpc('search_dj_artists', {
          query_embedding: `[${embedding.join(',')}]`,
          similarity_threshold: 0.3,
          match_count: 5
        });
        if (artistResults) ragArtists = artistResults;

        // Search documents with vector similarity
        const { data: docResults } = await supabase.rpc('match_documents', {
          query_embedding: `[${embedding.join(',')}]`,
          match_threshold: 0.3,
          match_count: 5
        });
        if (docResults) ragDocuments = docResults;
      }
    }

    // 2. Fetch from all relevant tables based on query keywords
    const fetchPromises: PromiseLike<any>[] = [];

    // Always get some baseline stats
    fetchPromises.push(
      supabase.from('agent_status').select('agent_name, status, category, last_run_at').limit(10).then(r => r)
    );

    // DJ Artists - check for artist-related keywords
    if (queryText.match(/artist|dj|producer|who|rank|top|best|label|track|genre|techno|underground/i) || ragArtists.length > 0) {
      fetchPromises.push(
        supabase.from('dj_artists')
          .select('rank, artist_name, real_name, nationality, years_active, subgenres, labels, top_tracks, known_for')
          .order('rank')
          .limit(ragArtists.length > 0 ? 0 : 15)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Canonical Artists with profiles
    if (queryText.match(/artist|bio|profile|collaborator|crew|influence/i)) {
      fetchPromises.push(
        supabase.from('canonical_artists')
          .select(`
            canonical_name, slug, real_name, country, city, rank, primary_genre, active_years,
            artist_profiles(bio_short, labels, subgenres, known_for, collaborators, crews)
          `)
          .order('rank', { nullsFirst: false })
          .limit(10)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Gear Catalog
    if (queryText.match(/gear|synth|drum|machine|808|909|303|moog|roland|korg|sequencer|sampler|effect|filter|oscillator/i)) {
      fetchPromises.push(
        supabase.from('gear_catalog')
          .select('name, brand, category, release_year, short_description, synthesis_type, notable_artists, techno_applications, strengths, polyphony, filters')
          .limit(10)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Knowledge Entities (venues, festivals, labels, etc.)
    if (queryText.match(/venue|club|festival|label|city|scene|collective|promoter|berghain|fabric|tresor|bassiani/i)) {
      fetchPromises.push(
        supabase.from('td_knowledge_entities')
          .select('name, type, country, city, description, aliases')
          .limit(15)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Content Sync (venues and festivals with verified data)
    if (queryText.match(/venue|festival|event|location|where/i)) {
      fetchPromises.push(
        supabase.from('content_sync')
          .select('entity_type, entity_id, original_data, verified_data, status')
          .in('entity_type', ['venue', 'festival'])
          .limit(10)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // News Articles
    if (queryText.match(/news|latest|recent|article|update|happening/i)) {
      fetchPromises.push(
        supabase.from('td_news_articles')
          .select('title, subtitle, author_pseudonym, city_tags, genre_tags, published_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(5)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Documents (general knowledge)
    fetchPromises.push(
      supabase.from('documents')
        .select('title, content, source')
        .limit(ragDocuments.length > 0 ? 0 : 5)
        .then(r => r)
    );

    // Books
    if (queryText.match(/book|read|author|techno rebels|energy flash|literature|recommend.*read/i)) {
      fetchPromises.push(
        supabase.from('books')
          .select('title, author, description, why_read, year_published, category:book_categories(name)')
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .limit(10)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Documentaries
    if (queryText.match(/documentary|film|movie|watch|video|high tech soul|pump up|submarine|visual/i)) {
      fetchPromises.push(
        supabase.from('documentaries')
          .select('title, director, year, description, genre_tags, youtube_id, vimeo_id')
          .eq('status', 'published')
          .limit(10)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Labels
    if (queryText.match(/label|record|release|imprint|underground resistance|ostgut|tresor|mord|token|semantica|pole group/i)) {
      fetchPromises.push(
        supabase.from('labels')
          .select('label_name, founded_year, location_city, location_country, description, website_url, style_tags, key_artists')
          .limit(15)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Collectives
    if (queryText.match(/collective|crew|movement|group|promoter|community|scene/i)) {
      fetchPromises.push(
        supabase.from('collectives')
          .select('collective_name, collective_type, city, country, philosophy_summary, what_they_like, website_url')
          .eq('status', 'active')
          .limit(10)
          .then(r => r)
      );
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    // Artist documents for deeper RAG
    if (queryText.match(/artist|dj|producer|bio|history|story/i) && ragArtists.length > 0) {
      const artistIds = ragArtists.slice(0, 3).map((a: any) => a.artist_id).filter(Boolean);
      if (artistIds.length > 0) {
        fetchPromises.push(
          supabase.from('artist_documents')
            .select('title, content, document_type')
            .in('artist_id', artistIds)
            .limit(5)
            .then(r => r)
        );
      } else {
        fetchPromises.push(Promise.resolve({ data: null }));
      }
    } else {
      fetchPromises.push(Promise.resolve({ data: null }));
    }

    const [
      agentsData,
      djArtistsData,
      canonicalArtistsData,
      gearData,
      entitiesData,
      contentSyncData,
      newsData,
      documentsData,
      booksData,
      documentariesData,
      labelsData,
      collectivesData,
      artistDocsData
    ] = await Promise.all(fetchPromises);

    // =================================================================
    // BUILD COMPREHENSIVE KNOWLEDGE CONTEXT
    // =================================================================

    const contextParts: string[] = [];

    // Platform status
    if (agentsData.data?.length) {
      contextParts.push(`## PLATFORM STATUS
Active agents: ${agentsData.data.map((a: any) => `${a.agent_name} (${a.status})`).join(', ')}`);
    }

    // RAG Artist results (highest priority)
    if (ragArtists.length > 0) {
      contextParts.push(`## TOP MATCHING ARTISTS (Vector Search)
${ragArtists.map((a: any) => 
  `**#${a.rank} ${a.artist_name}** ${a.real_name ? `(${a.real_name})` : ''}
  - Nationality: ${a.nationality || 'Unknown'}
  - Active: ${a.years_active || 'Unknown'}
  - Genres: ${a.subgenres?.join(', ') || 'N/A'}
  - Labels: ${a.labels?.join(', ') || 'N/A'}
  - Known for: ${a.known_for || 'N/A'}
  - Key tracks: ${a.top_tracks?.join(', ') || 'N/A'}`
).join('\n\n')}`);
    }

    // DJ Artists data
    if (djArtistsData.data?.length) {
      contextParts.push(`## DJ ARTISTS DATABASE
${djArtistsData.data.slice(0, 10).map((a: any) => 
  `#${a.rank} ${a.artist_name} (${a.nationality || 'Unknown'}) - ${a.subgenres?.join(', ') || 'techno'} | Labels: ${a.labels?.slice(0, 3).join(', ') || 'N/A'}`
).join('\n')}`);
    }

    // Canonical Artists with profiles
    if (canonicalArtistsData.data?.length) {
      contextParts.push(`## VERIFIED ARTIST PROFILES
${canonicalArtistsData.data.slice(0, 5).map((a: any) => {
  const profile = a.artist_profiles?.[0];
  return `**${a.canonical_name}** (${a.country || 'Unknown'})
  ${profile?.bio_short ? `Bio: ${profile.bio_short}` : ''}
  ${profile?.labels?.length ? `Labels: ${profile.labels.join(', ')}` : ''}
  ${profile?.collaborators?.length ? `Collaborators: ${profile.collaborators.join(', ')}` : ''}`;
}).join('\n\n')}`);
    }

    // Gear Catalog
    if (gearData.data?.length) {
      contextParts.push(`## GEAR CATALOG
${gearData.data.map((g: any) => 
  `**${g.name}** (${g.brand}, ${g.release_year || 'N/A'})
  - Category: ${g.category}
  - Type: ${g.synthesis_type || 'N/A'}
  - ${g.short_description || ''}
  - Techno use: ${g.techno_applications || 'N/A'}
  ${g.notable_artists ? `- Used by: ${JSON.stringify(g.notable_artists)}` : ''}`
).join('\n\n')}`);
    }

    // Knowledge Entities (venues, labels, etc.)
    if (entitiesData.data?.length) {
      const byType: Record<string, any[]> = {};
      entitiesData.data.forEach((e: any) => {
        if (!byType[e.type]) byType[e.type] = [];
        byType[e.type].push(e);
      });
      
      Object.entries(byType).forEach(([type, items]) => {
        contextParts.push(`## ${type.toUpperCase()}S
${items.map((e: any) => `- **${e.name}** (${e.city || ''}, ${e.country || ''}) ${e.description ? `- ${e.description}` : ''}`).join('\n')}`);
      });
    }

    // Content sync data
    if (contentSyncData.data?.length) {
      contextParts.push(`## VERIFIED CONTENT
${contentSyncData.data.map((c: any) => {
  const data = c.verified_data || c.original_data;
  return `- ${c.entity_type}: ${data?.name || c.entity_id} (${c.status})`;
}).join('\n')}`);
    }

    // News
    if (newsData.data?.length) {
      contextParts.push(`## LATEST NEWS
${newsData.data.map((n: any) => 
  `- **${n.title}** ${n.subtitle ? `- ${n.subtitle}` : ''} (${n.author_pseudonym}, ${n.city_tags?.join('/')}) [${n.published_at?.split('T')[0]}]`
).join('\n')}`);
    }

    // RAG Documents (highest priority)
    if (ragDocuments.length > 0) {
      contextParts.push(`## KNOWLEDGE BASE (Vector Match)
${ragDocuments.map((d: any) => `### ${d.title}\n${d.content?.slice(0, 500)}...`).join('\n\n')}`);
    } else if (documentsData.data?.length) {
      contextParts.push(`## KNOWLEDGE BASE
${documentsData.data.map((d: any) => `### ${d.title}\n${d.content?.slice(0, 300)}...`).join('\n\n')}`);
    }

    // Books
    if (booksData?.data?.length) {
      contextParts.push(`## ESSENTIAL TECHNO BOOKS
${booksData.data.map((b: any) => 
  `**${b.title}** by ${b.author} (${b.year_published || 'N/A'})
  - Category: ${b.category?.name || 'General'}
  ${b.description ? `- ${b.description.slice(0, 200)}...` : ''}
  ${b.why_read ? `- Why read: ${b.why_read}` : ''}`
).join('\n\n')}`);
    }

    // Documentaries
    if (documentariesData?.data?.length) {
      contextParts.push(`## TECHNO DOCUMENTARIES & FILMS
${documentariesData.data.map((d: any) => 
  `**${d.title}** (${d.year || 'N/A'}) ${d.director ? `dir. ${d.director}` : ''}
  - ${d.description || 'No description'}
  - Tags: ${d.genre_tags?.join(', ') || 'Documentary'}
  ${d.youtube_id ? '- Available on YouTube' : ''}`
).join('\n\n')}`);
    }

    // Labels
    if (labelsData?.data?.length) {
      contextParts.push(`## RECORD LABELS
${labelsData.data.map((l: any) => 
  `**${l.label_name}** (${l.founded_year || 'N/A'}, ${l.location_city || ''} ${l.location_country || ''})
  ${l.description ? `- ${l.description.slice(0, 200)}` : ''}
  - Style: ${l.style_tags?.join(', ') || 'Techno'}
  ${l.key_artists?.length ? `- Key artists: ${l.key_artists.slice(0, 5).join(', ')}` : ''}
  ${l.website_url ? `- Website: ${l.website_url}` : ''}`
).join('\n\n')}`);
    }

    // Collectives
    if (collectivesData?.data?.length) {
      contextParts.push(`## COLLECTIVES & CREWS
${collectivesData.data.map((c: any) => 
  `**${c.collective_name}** (${c.city || ''}, ${c.country || ''})
  - Type: ${c.collective_type?.join(', ') || 'Collective'}
  ${c.philosophy_summary ? `- Philosophy: ${c.philosophy_summary}` : ''}
  ${c.what_they_like ? `- They like: ${c.what_they_like}` : ''}
  ${c.website_url ? `- Website: ${c.website_url}` : ''}`
).join('\n\n')}`);
    }

    // Artist Documents (deep RAG)
    if (artistDocsData?.data?.length) {
      contextParts.push(`## ARTIST DEEP KNOWLEDGE
${artistDocsData.data.map((d: any) => 
  `### ${d.title || d.document_type}
${d.content?.slice(0, 400)}...`
).join('\n\n')}`);
    }

    knowledgeContext = contextParts.join('\n\n---\n\n');

    // Build system prompt with full knowledge
    const systemPrompt = buildDogSystemPrompt(knowledgeContext);

    // Build messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // =================================================================
    // 3-TIER INTELLIGENT MODEL ROUTING
    // Tier 1: GPT-5 for complex reasoning (highest quality)
    // Tier 2: Gemini Flash for medium complexity (balanced)
    // Tier 3: Gemini Flash-Lite for ultra-fast simple queries (speed)
    // =================================================================
    
    // Detect complex reasoning queries that benefit from GPT-5
    const complexPatterns = [
      /compare|versus|vs\.?|difference between|similarities/i,
      /explain|analyze|breakdown|deep dive|in-depth/i,
      /why|how does|what makes|philosophy|theory/i,
      /history of|evolution of|origins of|trajectory/i,
      /recommend.*based on|suggest.*considering|if i like/i,
      /relationship between|connection|influence.*on/i,
      /controversial|debate|opinion|perspective/i,
      /technical|mechanism|architecture|design of/i,
      /predict|future|trend|where.*heading/i,
      /best|worst|top.*reason|rank.*why/i
    ];
    
    // Detect simple queries that can use ultra-fast model
    const simplePatterns = [
      /^(hi|hello|hey|yo|sup|what'?s up)/i,
      /^(thanks|thank you|thx|cheers)/i,
      /^(yes|no|ok|okay|sure|cool|nice)/i,
      /^who is [a-z\s]+\??$/i,  // Simple "who is X?" questions
      /^what is [a-z\s]+\??$/i, // Simple "what is X?" questions
      /^when (is|was|did)/i,    // Simple time questions
      /^where (is|was|are)/i,   // Simple location questions
      /^list |^name /i,         // Simple list requests
    ];
    
    const wordCount = queryText.split(' ').length;
    const hasConversationDepth = (conversationHistory?.length || 0) > 4;
    
    // Determine query complexity tier
    const isComplexQuery = complexPatterns.some(pattern => pattern.test(queryText)) ||
      wordCount > 20 || // Long queries need more reasoning
      hasConversationDepth; // Deep conversations need context
    
    const isSimpleQuery = !isComplexQuery && (
      simplePatterns.some(pattern => pattern.test(queryText)) ||
      wordCount <= 5 // Very short queries
    );
    
    // Select model based on tier
    type ModelTier = 'complex' | 'balanced' | 'fast';
    const tier: ModelTier = isComplexQuery ? 'complex' : (isSimpleQuery ? 'fast' : 'balanced');
    
    const modelConfig = {
      complex: {
        model: 'openai/gpt-5',
        label: 'GPT-5 (complex reasoning)',
        temperature: 0.7,
        maxTokens: 2000
      },
      balanced: {
        model: 'google/gemini-2.5-flash',
        label: 'Gemini Flash (balanced)',
        temperature: 0.8,
        maxTokens: 1500
      },
      fast: {
        model: 'google/gemini-2.5-flash-lite',
        label: 'Gemini Flash-Lite (ultra-fast)',
        temperature: 0.9,
        maxTokens: 800
      }
    };
    
    const selectedConfig = modelConfig[tier];

    console.log(`Dog Agent: Processing query with ${contextParts.length} knowledge sections`);
    console.log(`Dog Agent: Query tier - ${tier} | Model - ${selectedConfig.label}`);
    console.log(`Dog Agent: Word count: ${wordCount}, Conversation depth: ${conversationHistory?.length || 0}`);

    // Call Lovable AI Gateway with selected model
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedConfig.model,
        messages,
        temperature: selectedConfig.temperature,
        max_tokens: selectedConfig.maxTokens,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: '*Sad whimper* Too many belly rubs... I mean requests! Please try again in a moment. 🐕' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: '*Confused head tilt* Seems like we need more treats (credits)! Please check the workspace settings.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const dogResponse = aiResponse.choices[0]?.message?.content || "*Confused bark* Woof? Something went wrong!";

    // Log the interaction
    await supabase.from('analytics_events').insert({
      event_type: 'dog_agent_chat',
      event_name: 'dog_conversation',
      metadata: { 
        message_length: message.length,
        response_length: dogResponse.length,
        knowledge_sections: contextParts.length,
        had_rag_results: ragArtists.length > 0 || ragDocuments.length > 0,
        model_used: selectedConfig.model,
        model_tier: tier,
        is_complex_query: isComplexQuery,
        is_simple_query: isSimpleQuery
      }
    });

    // Update Dog agent status
    await supabase
      .from('agent_status')
      .upsert({ 
        agent_name: 'Dog',
        function_name: 'dog-agent',
        category: 'orchestration',
        status: 'idle',
        last_run_at: new Date().toISOString(),
        last_success_at: new Date().toISOString()
      }, { onConflict: 'agent_name' });

    return new Response(JSON.stringify({
      success: true,
      response: dogResponse,
      meta: {
        knowledgeSections: contextParts.length,
        ragResults: {
          artists: ragArtists.length,
          documents: ragDocuments.length
        },
        model: selectedConfig.model,
        modelLabel: selectedConfig.label,
        tier,
        isComplexQuery,
        isSimpleQuery
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Dog agent error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      bark: "*Worried whine* Arf... Something went wrong. Don't worry, I'll keep trying! 🐕"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
