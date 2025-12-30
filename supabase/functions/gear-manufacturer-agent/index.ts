import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model responsibilities for gear/manufacturer intelligence
const MODEL_ROLES = {
  openai: 'extraction, normalization, structured records, outreach drafting, categorization',
  anthropic: 'corporate structure reasoning, contact validation, policy extraction, relationship strategy',
  grok: 'freshness scanning, current team detection, organizational changes, active channels'
};

// Existing gear data from our project (read-only source)
const GEAR_DATA_ENDPOINT = 'src/data/gear.ts';

interface IngestParams {
  limit?: number;
}

interface VerifyParams {
  brandIds?: string[];
}

interface EnrichParams {
  brandIds?: string[];
  contactTypes?: string[];
}

interface OutreachParams {
  brandId: string;
  contactId?: string;
  projectContext: string;
  collaborationType: string;
  tone: 'formal' | 'scene_native' | 'journalist' | 'partnership';
}

async function safeParseBody(req: Request): Promise<any> {
  try {
    const text = await req.text();
    if (!text || text.trim() === '') return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}

// Call OpenAI for structured extraction
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return null;
  }
}

// Call Anthropic for reasoning and validation
async function callAnthropic(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('Anthropic error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('Anthropic call failed:', error);
    return null;
  }
}

// Call Grok for fast scanning
async function callGrok(prompt: string, systemPrompt: string): Promise<string | null> {
  const apiKey = Deno.env.get('XAI_KEY');
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Grok error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Grok call failed:', error);
    return null;
  }
}

// Firecrawl for manufacturer discovery
async function firecrawlScrape(url: string): Promise<any> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
  if (!apiKey) return null;

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
        onlyMainContent: true
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl scrape error:', await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Firecrawl scrape failed:', error);
    return null;
  }
}

async function firecrawlSearch(query: string): Promise<any[]> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY') || Deno.env.get('FIRECRAWL_API_KEY_1');
  if (!apiKey) return [];

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 10,
        scrapeOptions: { formats: ['markdown'] }
      }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// Known gear manufacturers from our data
const KNOWN_MANUFACTURERS = [
  { name: 'Roland', aliases: ['Roland Corporation'], country: 'Japan', website: 'https://www.roland.com' },
  { name: 'Moog', aliases: ['Moog Music', 'Moog Synthesizers'], country: 'USA', website: 'https://www.moogmusic.com' },
  { name: 'Korg', aliases: ['Korg Inc'], country: 'Japan', website: 'https://www.korg.com' },
  { name: 'Elektron', aliases: ['Elektron Music Machines'], country: 'Sweden', website: 'https://www.elektron.se' },
  { name: 'Sequential', aliases: ['Sequential Circuits', 'Dave Smith Instruments'], country: 'USA', website: 'https://www.sequential.com' },
  { name: 'Behringer', aliases: ['Music Tribe'], country: 'Germany', website: 'https://www.behringer.com' },
  { name: 'Native Instruments', aliases: ['NI'], country: 'Germany', website: 'https://www.native-instruments.com' },
  { name: 'Ableton', aliases: [], country: 'Germany', website: 'https://www.ableton.com' },
  { name: 'Arturia', aliases: [], country: 'France', website: 'https://www.arturia.com' },
  { name: 'Novation', aliases: ['Focusrite Novation'], country: 'UK', website: 'https://novationmusic.com' },
  { name: 'Akai', aliases: ['Akai Professional'], country: 'Japan', website: 'https://www.akaipro.com' },
  { name: 'Teenage Engineering', aliases: ['TE'], country: 'Sweden', website: 'https://teenage.engineering' },
  { name: 'Make Noise', aliases: [], country: 'USA', website: 'https://www.makenoisemusic.com' },
  { name: 'Mutable Instruments', aliases: [], country: 'France', website: 'https://mutable-instruments.net' },
  { name: 'Oberheim', aliases: [], country: 'USA', website: 'https://www.oberheim.com' },
  { name: 'Access', aliases: ['Access Music'], country: 'Germany', website: 'https://www.access-music.de' },
  { name: 'Waldorf', aliases: ['Waldorf Music'], country: 'Germany', website: 'https://waldorfmusic.com' },
  { name: 'Nord', aliases: ['Clavia', 'Nord Keyboards'], country: 'Sweden', website: 'https://www.nordkeyboards.com' },
  { name: 'Eventide', aliases: [], country: 'USA', website: 'https://www.eventideaudio.com' },
  { name: 'Strymon', aliases: [], country: 'USA', website: 'https://www.strymon.net' }
];

// Workflow 1: Ingest from existing gear database
async function ingestFromGearDB(supabase: any, userId: string): Promise<any> {
  const results = { brandsCreated: 0, productsCreated: 0, errors: [] as string[] };
  
  // Create agent run
  const { data: run } = await supabase
    .from('gear_agent_runs')
    .insert({
      run_type: 'ingest',
      status: 'running',
      models_used: ['openai'],
      created_by: userId
    })
    .select()
    .single();

  try {
    // First, create known manufacturers
    for (const mfr of KNOWN_MANUFACTURERS) {
      const { data: existing } = await supabase
        .from('gear_brands')
        .select('id')
        .eq('brand_name', mfr.name)
        .single();
      
      if (!existing) {
        const { error } = await supabase
          .from('gear_brands')
          .insert({
            brand_name: mfr.name,
            brand_aliases: mfr.aliases,
            brand_website_url: mfr.website,
            headquarters_country: mfr.country,
            status: 'unknown',
            created_by: userId
          });
        
        if (!error) results.brandsCreated++;
        else results.errors.push(`Failed to create ${mfr.name}: ${error.message}`);
      }
    }

    // Use OpenAI to analyze and normalize additional gear data
    const openaiPrompt = `Analyze this list of known electronic music gear manufacturers and provide normalized data.
    
    Known brands: ${KNOWN_MANUFACTURERS.map(m => m.name).join(', ')}
    
    For each brand, provide:
    1. Full official company name
    2. Parent company (if applicable)
    3. Primary product categories (synth, drum_machine, sampler, effect, daw, plugin, modular, controller)
    4. Whether they are currently active manufacturing
    
    Return JSON array:
    [
      {
        "brand_name": "string",
        "official_name": "string",
        "parent_company": "string or null",
        "categories": ["synth", "drum_machine"],
        "is_active": true/false,
        "country": "string"
      }
    ]`;

    const openaiResult = await callOpenAI(openaiPrompt,
      'You are an expert in electronic music equipment manufacturers. Return valid JSON only.');

    if (openaiResult) {
      try {
        const brandData = JSON.parse(openaiResult.replace(/```json\n?|\n?```/g, ''));
        
        for (const brand of brandData) {
          await supabase
            .from('gear_brands')
            .update({
              parent_company_name: brand.parent_company,
              status: brand.is_active ? 'active' : 'inactive',
              headquarters_country: brand.country
            })
            .eq('brand_name', brand.brand_name);
        }
      } catch (e) {
        results.errors.push('Failed to parse OpenAI brand analysis');
      }
    }

    // Log audit
    await supabase.from('gear_scrape_audit_log').insert({
      action: 'ingest',
      records_affected: results.brandsCreated,
      models_used: ['openai'],
      status: 'completed',
      created_by: userId
    });

    // Update run
    await supabase
      .from('gear_agent_runs')
      .update({
        status: 'completed',
        results,
        brands_processed: results.brandsCreated,
        completed_at: new Date().toISOString()
      })
      .eq('id', run.id);

    return results;
  } catch (error) {
    await supabase
      .from('gear_agent_runs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', run.id);
    throw error;
  }
}

// Workflow 2: Verify active manufacturing
async function verifyActiveManufacturing(supabase: any, brandIds: string[] | undefined, userId: string): Promise<any> {
  const results = { verified: 0, active: 0, inactive: 0, errors: [] as string[] };

  let query = supabase.from('gear_brands').select('*');
  if (brandIds && brandIds.length > 0) {
    query = query.in('id', brandIds);
  } else {
    query = query.eq('status', 'unknown').limit(20);
  }

  const { data: brands, error } = await query;
  if (error) throw error;

  for (const brand of brands || []) {
    try {
      // Use Grok for fast scanning of brand activity
      const grokPrompt = `Quick check: Is "${brand.brand_name}" still actively manufacturing electronic music equipment as of 2024-2025?
      
      Check if:
      1. Company still exists and operates
      2. They are actively selling/manufacturing products
      3. Any recent product releases or announcements
      
      Return JSON: {"is_active": true/false, "confidence": 0-100, "recent_activity": "brief description", "notes": "any relevant info"}`;

      const grokResult = await callGrok(grokPrompt,
        'You are a fast scanner for music equipment manufacturers. Return valid JSON only.');

      if (grokResult) {
        try {
          const check = JSON.parse(grokResult.replace(/```json\n?|\n?```/g, ''));
          
          await supabase
            .from('gear_brands')
            .update({
              status: check.is_active ? 'active' : 'inactive',
              verification_confidence: check.confidence,
              last_verified_at: new Date().toISOString()
            })
            .eq('id', brand.id);
          
          results.verified++;
          if (check.is_active) results.active++;
          else results.inactive++;
        } catch {
          results.errors.push(`Parse error for ${brand.brand_name}`);
        }
      }
    } catch {
      results.errors.push(`Failed to verify ${brand.brand_name}`);
    }
  }

  return results;
}

// Workflow 3: Find manufacturer identity & ownership
async function findOwnershipAndPolicies(supabase: any, brandIds: string[] | undefined, userId: string): Promise<any> {
  const results = { enriched: 0, contactPagesFound: 0, errors: [] as string[] };

  let query = supabase.from('gear_brands').select('*').eq('status', 'active');
  if (brandIds && brandIds.length > 0) {
    query = query.in('id', brandIds);
  }
  query = query.limit(10);

  const { data: brands, error } = await query;
  if (error) throw error;

  for (const brand of brands || []) {
    try {
      // Scrape official website if available
      if (brand.brand_website_url) {
        const contactUrl = `${brand.brand_website_url}/contact`;
        const aboutUrl = `${brand.brand_website_url}/about`;
        
        // Use Anthropic for deep reasoning about corporate structure
        const anthropicPrompt = `Analyze this electronic music gear manufacturer for partnership/collaboration opportunities:
        
        Brand: ${brand.brand_name}
        Website: ${brand.brand_website_url}
        Country: ${brand.headquarters_country || 'Unknown'}
        
        Research and determine:
        1. Parent company ownership structure
        2. Typical collaboration pathways (artist programs, press, education)
        3. Best contact routes for professional outreach
        4. What they typically look for in partnerships
        5. Red flags or things to avoid in outreach
        
        Return JSON:
        {
          "parent_company": "string or null",
          "ownership_notes": "string",
          "collaboration_policy_summary": "what we know about their approach to partnerships",
          "press_page_likely": "URL pattern guess",
          "contact_page_likely": "URL pattern guess",
          "collaboration_friendliness": 0-100,
          "approach_strategy": "how to best approach them",
          "what_they_care_about": "their priorities",
          "do_not_do": "things to avoid"
        }`;

        const anthropicResult = await callAnthropic(anthropicPrompt,
          'You are an expert in music industry relationships and gear manufacturer partnerships. Return valid JSON only.');

        if (anthropicResult) {
          try {
            const analysis = JSON.parse(anthropicResult.replace(/```json\n?|\n?```/g, ''));
            
            await supabase
              .from('gear_brands')
              .update({
                parent_company_name: analysis.parent_company || brand.parent_company_name,
                ownership_notes: analysis.ownership_notes,
                collaboration_policy_summary: analysis.collaboration_policy_summary,
                official_press_page_url: analysis.press_page_likely,
                official_contact_page_url: analysis.contact_page_likely,
                collaboration_friendliness_score: analysis.collaboration_friendliness,
                last_verified_at: new Date().toISOString()
              })
              .eq('id', brand.id);
            
            results.enriched++;
            if (analysis.contact_page_likely) results.contactPagesFound++;
          } catch {
            results.errors.push(`Parse error for ${brand.brand_name}`);
          }
        }
      }
    } catch {
      results.errors.push(`Failed to analyze ${brand.brand_name}`);
    }
  }

  return results;
}

// Workflow 4: Find key contacts
async function findKeyContacts(supabase: any, brandIds: string[] | undefined, userId: string): Promise<any> {
  const results = { contactsFound: 0, errors: [] as string[] };

  let query = supabase.from('gear_brands').select('*').eq('status', 'active');
  if (brandIds && brandIds.length > 0) {
    query = query.in('id', brandIds);
  }
  query = query.limit(10);

  const { data: brands, error } = await query;
  if (error) throw error;

  for (const brand of brands || []) {
    try {
      // Search for contact information
      const searchResults = await firecrawlSearch(`${brand.brand_name} press contact artist relations email`);
      
      if (searchResults.length > 0) {
        // Use OpenAI to extract structured contact info
        const openaiPrompt = `Extract professional contact information for ${brand.brand_name} from this content:
        
        ${searchResults.slice(0, 3).map((r: any) => `URL: ${r.url}\nContent: ${(r.markdown || '').substring(0, 1000)}`).join('\n---\n')}
        
        Find contacts for: press, partnerships, artist relations, marketing, product, support
        
        Return JSON array:
        [
          {
            "contact_type": "press|partnerships|artist_relations|marketing|product|support|general",
            "contact_person_name": "string or null",
            "role_title": "string or null",
            "department": "string or null",
            "email": "string or null",
            "contact_form_url": "string or null",
            "region_coverage": "global|europe|north_america",
            "source_url": "where this was found",
            "confidence": 0-100
          }
        ]
        
        Only include verifiable, professional contact info. No personal emails.`;

        const openaiResult = await callOpenAI(openaiPrompt,
          'You are a professional contact researcher. Extract only public professional contacts. Return valid JSON array only.');

        if (openaiResult) {
          try {
            const contacts = JSON.parse(openaiResult.replace(/```json\n?|\n?```/g, ''));
            
            for (const contact of contacts) {
              if (contact.email || contact.contact_form_url) {
                const { error: insertError } = await supabase
                  .from('brand_contacts')
                  .insert({
                    brand_id: brand.id,
                    contact_type: contact.contact_type || 'general',
                    contact_person_name: contact.contact_person_name,
                    role_title: contact.role_title,
                    department: contact.department,
                    email: contact.email,
                    contact_form_url: contact.contact_form_url,
                    region_coverage: contact.region_coverage || 'global',
                    source_url: contact.source_url,
                    enrichment_confidence: contact.confidence || 50,
                    last_verified_at: new Date().toISOString(),
                    created_by: userId
                  });
                
                if (!insertError) results.contactsFound++;
              }
            }
          } catch {
            results.errors.push(`Parse error for ${brand.brand_name} contacts`);
          }
        }
      }
    } catch {
      results.errors.push(`Failed to find contacts for ${brand.brand_name}`);
    }
  }

  // Log audit
  await supabase.from('gear_scrape_audit_log').insert({
    action: 'find_contacts',
    records_affected: results.contactsFound,
    models_used: ['openai', 'firecrawl'],
    status: 'completed',
    created_by: userId
  });

  return results;
}

// Workflow 5: Generate outreach
async function generateOutreach(params: OutreachParams, supabase: any): Promise<any> {
  const { data: brand, error: brandError } = await supabase
    .from('gear_brands')
    .select('*')
    .eq('id', params.brandId)
    .single();
  
  if (brandError || !brand) throw new Error('Brand not found');

  let contact = null;
  if (params.contactId) {
    const { data } = await supabase
      .from('brand_contacts')
      .select('*')
      .eq('id', params.contactId)
      .single();
    contact = data;
  }

  const toneGuides: Record<string, string> = {
    formal: 'professional, industry-standard, concise',
    scene_native: 'gear-enthusiast, technically knowledgeable, authentic',
    journalist: 'press inquiry, editorial angle, publication context',
    partnership: 'business proposition, mutual value, collaboration opportunity'
  };

  const outreachPrompt = `Generate professional outreach for contacting this gear manufacturer:
  
  BRAND: ${brand.brand_name}
  ${brand.parent_company_name ? `Parent Company: ${brand.parent_company_name}` : ''}
  ${brand.collaboration_policy_summary ? `Their Approach: ${brand.collaboration_policy_summary}` : ''}
  ${contact ? `Contact: ${contact.contact_person_name || 'Unknown'}, ${contact.role_title || contact.contact_type}` : ''}
  
  PROJECT CONTEXT: ${params.projectContext}
  COLLABORATION TYPE: ${params.collaborationType}
  TONE: ${toneGuides[params.tone]}
  
  Generate:
  1. Email subject line
  2. Email body (professional but engaging)
  3. Short version for contact form
  4. One-page collaboration pitch summary
  5. Follow-up email (for 1 week later)
  
  Return JSON:
  {
    "email_subject": "string",
    "email_body": "string",
    "contact_form_version": "string (shorter)",
    "pitch_summary": "string (one page summary of collaboration proposal)",
    "followup_subject": "string",
    "followup_body": "string",
    "best_approach_notes": "string",
    "what_to_emphasize": "string",
    "what_to_avoid": "string"
  }`;

  const anthropicResult = await callAnthropic(outreachPrompt,
    `You are a professional in music industry partnerships, specializing in gear manufacturer relationships.
    Write authentic, knowledgeable outreach that demonstrates understanding of synthesis and production technology.
    Never be generic or salesy. Be specific and professional. Return valid JSON only.`);

  if (!anthropicResult) throw new Error('Failed to generate outreach');

  try {
    return JSON.parse(anthropicResult.replace(/```json\n?|\n?```/g, ''));
  } catch {
    throw new Error('Failed to parse outreach content');
  }
}

// Get dashboard stats
async function getDashboardStats(supabase: any): Promise<any> {
  const [brands, products, contacts, programs, runs] = await Promise.all([
    supabase.from('gear_brands').select('id, status, headquarters_country, verification_confidence, collaboration_friendliness_score', { count: 'exact' }),
    supabase.from('gear_products').select('id, product_status, product_type', { count: 'exact' }),
    supabase.from('brand_contacts').select('id, contact_type, region_coverage, enrichment_confidence', { count: 'exact' }),
    supabase.from('collaboration_programs').select('id, program_type, is_active', { count: 'exact' }),
    supabase.from('gear_agent_runs').select('*').order('started_at', { ascending: false }).limit(10)
  ]);

  const activeBrands = (brands.data || []).filter((b: any) => b.status === 'active');
  
  return {
    totalBrands: brands.count || 0,
    activeBrands: activeBrands.length,
    totalProducts: products.count || 0,
    totalContacts: contacts.count || 0,
    totalPrograms: programs.count || 0,
    brandsByStatus: groupBy(brands.data || [], 'status'),
    brandsByCountry: groupBy(brands.data || [], 'headquarters_country'),
    contactsByType: groupBy(contacts.data || [], 'contact_type'),
    productsByType: groupBy(products.data || [], 'product_type'),
    productsByStatus: groupBy(products.data || [], 'product_status'),
    avgVerificationConfidence: average(activeBrands.map((b: any) => b.verification_confidence || 0)),
    avgCollabFriendliness: average(activeBrands.map((b: any) => b.collaboration_friendliness_score || 0)),
    recentRuns: runs.data || []
  };
}

function groupBy(arr: any[], key: string): Record<string, number> {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'unknown';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await safeParseBody(req);
    const { action, ...params } = body;

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    console.log(`Gear Manufacturer Agent: ${action}`, params);

    let result: any;

    switch (action) {
      case 'ingest':
        result = await ingestFromGearDB(supabase, userId!);
        break;
        
      case 'verify':
        result = await verifyActiveManufacturing(supabase, params.brandIds, userId!);
        break;
        
      case 'find_ownership':
        result = await findOwnershipAndPolicies(supabase, params.brandIds, userId!);
        break;
        
      case 'find_contacts':
        result = await findKeyContacts(supabase, params.brandIds, userId!);
        break;
        
      case 'generate_outreach':
        result = await generateOutreach(params as OutreachParams, supabase);
        break;
        
      case 'dashboard':
        result = await getDashboardStats(supabase);
        break;
        
      case 'get_brands':
        const { data: brandsData, error: brandsError } = await supabase
          .from('gear_brands')
          .select('*')
          .order('brand_name');
        if (brandsError) throw brandsError;
        result = { brands: brandsData };
        break;
        
      case 'get_products':
        const { data: productsData, error: productsError } = await supabase
          .from('gear_products')
          .select('*, gear_brands(brand_name)')
          .order('product_name');
        if (productsError) throw productsError;
        result = { products: productsData };
        break;
        
      case 'get_contacts':
        const { data: contactsData, error: contactsError } = await supabase
          .from('brand_contacts')
          .select('*, gear_brands(brand_name)')
          .order('enrichment_confidence', { ascending: false });
        if (contactsError) throw contactsError;
        result = { contacts: contactsData };
        break;
        
      case 'get_programs':
        const { data: programsData, error: programsError } = await supabase
          .from('collaboration_programs')
          .select('*, gear_brands(brand_name)')
          .order('created_at', { ascending: false });
        if (programsError) throw programsError;
        result = { programs: programsData };
        break;
        
      case 'get_outreach_history':
        const { data: historyData, error: historyError } = await supabase
          .from('gear_outreach_history')
          .select('*, gear_brands(brand_name), brand_contacts(contact_person_name, role_title)')
          .order('outreach_date', { ascending: false });
        if (historyError) throw historyError;
        result = { history: historyData };
        break;
        
      case 'save_outreach':
        const { data: savedOutreach, error: saveError } = await supabase
          .from('gear_outreach_history')
          .insert({
            brand_id: params.brand_id,
            contact_id: params.contact_id,
            outreach_type: params.outreach_type || 'email',
            subject_line: params.subject_line,
            message_content: params.message_content,
            message_summary: params.message_summary,
            campaign_name: params.campaign_name,
            status: params.status || 'draft',
            created_by: userId
          })
          .select()
          .single();
        if (saveError) throw saveError;
        result = { outreach: savedOutreach };
        break;
        
      case 'delete_brand':
        const { error: deleteBrandError } = await supabase
          .from('gear_brands')
          .delete()
          .eq('id', params.id);
        if (deleteBrandError) throw deleteBrandError;
        result = { success: true };
        break;
        
      case 'delete_contact':
        const { error: deleteContactError } = await supabase
          .from('brand_contacts')
          .delete()
          .eq('id', params.id);
        if (deleteContactError) throw deleteContactError;
        result = { success: true };
        break;
        
      case 'get_audit_log':
        const { data: auditData, error: auditError } = await supabase
          .from('gear_scrape_audit_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (auditError) throw auditError;
        result = { auditLog: auditData };
        break;
        
      case 'export':
        const exportType = params.type || 'brands';
        let exportData: any[] = [];
        
        if (exportType === 'brands') {
          const { data } = await supabase.from('gear_brands').select('*').eq('status', 'active');
          exportData = (data || []).map((b: any) => ({
            brand_name: b.brand_name,
            website: b.brand_website_url,
            country: b.headquarters_country,
            parent_company: b.parent_company_name,
            status: b.status,
            verification_confidence: b.verification_confidence,
            collab_friendliness: b.collaboration_friendliness_score
          }));
        } else if (exportType === 'contacts') {
          const { data } = await supabase
            .from('brand_contacts')
            .select('*, gear_brands(brand_name)');
          exportData = (data || []).map((c: any) => ({
            brand: c.gear_brands?.brand_name,
            type: c.contact_type,
            name: c.contact_person_name,
            role: c.role_title,
            email: c.email,
            region: c.region_coverage,
            confidence: c.enrichment_confidence
          }));
        }
        
        result = { data: exportData, type: exportType };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Gear Manufacturer Agent error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
