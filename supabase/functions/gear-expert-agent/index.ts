import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GearItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  short_description?: string;
  techno_applications?: string;
  notable_features?: string;
  strengths?: string;
  limitations?: string;
  synthesis_type?: string;
  release_year?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action, gearId, query } = await req.json();

    // Get gear catalog stats
    const { count: totalGear } = await supabase
      .from('gear_catalog')
      .select('*', { count: 'exact', head: true });

    const { count: withDescriptions } = await supabase
      .from('gear_catalog')
      .select('*', { count: 'exact', head: true })
      .not('short_description', 'is', null)
      .neq('short_description', '');

    const { count: withTechnoApps } = await supabase
      .from('gear_catalog')
      .select('*', { count: 'exact', head: true })
      .not('techno_applications', 'is', null)
      .neq('techno_applications', '');

    if (action === 'status') {
      // Return database health status
      const { data: recentItems } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, category, short_description')
        .order('updated_at', { ascending: false })
        .limit(5);

      const { data: needsContent } = await supabase
        .from('gear_catalog')
        .select('id, name, brand')
        .or('short_description.is.null,techno_applications.is.null')
        .limit(10);

      return new Response(JSON.stringify({
        status: 'healthy',
        stats: {
          totalGear,
          withDescriptions,
          withTechnoApps,
          completionRate: totalGear ? Math.round((withDescriptions! / totalGear) * 100) : 0
        },
        recentItems,
        needsContent,
        message: `Gear Expert Agent: ${totalGear} items in catalog, ${withDescriptions} have descriptions`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'enrich' && gearId) {
      // Enrich a specific gear item with AI-generated content
      const { data: gear, error: gearError } = await supabase
        .from('gear_catalog')
        .select('*')
        .eq('id', gearId)
        .single();

      if (gearError || !gear) {
        throw new Error(`Gear not found: ${gearId}`);
      }

      const prompt = `You are a techno music gear expert. Generate detailed content for this synthesizer/drum machine/equipment used in techno production.

Equipment: ${gear.name}
Brand: ${gear.brand}
Category: ${gear.category}
Release Year: ${gear.release_year || 'Unknown'}
Synthesis Type: ${gear.synthesis_type || 'Unknown'}

Generate the following in JSON format:
{
  "short_description": "A compelling 2-3 sentence description emphasizing its importance in techno",
  "techno_applications": "How this gear is specifically used in techno production (2-3 sentences)",
  "notable_features": "Key technical features that matter for techno producers",
  "strengths": "What makes this gear exceptional for techno",
  "limitations": "Honest assessment of any drawbacks"
}

Focus on warehouse techno, industrial, Detroit, and Berlin-style production. Be specific and technical.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert in electronic music gear, especially synthesizers and drum machines used in techno production. You have deep knowledge of the Berlin, Detroit, and underground techno scenes.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      const aiData = await response.json();
      const content = JSON.parse(aiData.choices[0].message.content);

      // Update the gear item
      const { error: updateError } = await supabase
        .from('gear_catalog')
        .update({
          short_description: content.short_description,
          techno_applications: content.techno_applications,
          notable_features: content.notable_features,
          strengths: content.strengths,
          limitations: content.limitations,
          updated_at: new Date().toISOString()
        })
        .eq('id', gearId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({
        success: true,
        gearId,
        content,
        message: `Successfully enriched ${gear.name}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'batch-enrich') {
      // Enrich multiple items that need content
      const { data: needsContent } = await supabase
        .from('gear_catalog')
        .select('id, name, brand, category, release_year, synthesis_type')
        .or('short_description.is.null,techno_applications.is.null')
        .limit(3);

      if (!needsContent || needsContent.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          enriched: 0,
          message: 'All gear items already have content'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const results = [];
      for (const gear of needsContent) {
        try {
          const prompt = `Generate techno-focused content for ${gear.brand} ${gear.name} (${gear.category}). Return JSON with: short_description, techno_applications, notable_features, strengths, limitations. Focus on warehouse/industrial/Detroit/Berlin techno.`;

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a techno gear expert. Return only valid JSON.' },
                { role: 'user', content: prompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          const aiData = await response.json();
          const content = JSON.parse(aiData.choices[0].message.content);

          await supabase
            .from('gear_catalog')
            .update({
              short_description: content.short_description,
              techno_applications: content.techno_applications,
              notable_features: content.notable_features,
              strengths: content.strengths,
              limitations: content.limitations,
              updated_at: new Date().toISOString()
            })
            .eq('id', gear.id);

          results.push({ id: gear.id, name: gear.name, success: true });
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          results.push({ id: gear.id, name: gear.name, success: false, error: errorMessage });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        enriched: results.filter(r => r.success).length,
        results,
        message: `Batch enrichment complete: ${results.filter(r => r.success).length}/${results.length} items`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'chat' && query) {
      // Chat with the gear expert about any gear topic
      const { data: allGear } = await supabase
        .from('gear_catalog')
        .select('name, brand, category, synthesis_type, release_year')
        .limit(100);

      const gearContext = allGear?.map(g => `${g.brand} ${g.name} (${g.category})`).join(', ');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: `You are the Gear Expert Agent for TechnoDog, an encyclopedia of techno music gear. You have deep knowledge of synthesizers, drum machines, and production equipment used in techno.

Your database contains: ${gearContext}

You speak with authority about gear specifications, techno production techniques, and which artists use what equipment. You're passionate about warehouse techno, industrial, and the Detroit/Berlin scenes.

Keep responses focused and technical but accessible. Use specific examples when possible.`
            },
            { role: 'user', content: query }
          ],
        }),
      });

      const aiData = await response.json();
      const answer = aiData.choices[0].message.content;

      return new Response(JSON.stringify({
        success: true,
        response: answer,
        context: { totalGear, withDescriptions }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default: return agent info
    return new Response(JSON.stringify({
      agent: 'Gear Expert',
      version: '1.0',
      capabilities: ['status', 'enrich', 'batch-enrich', 'chat'],
      stats: { totalGear, withDescriptions, withTechnoApps }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Gear Expert Agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
