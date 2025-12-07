import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentEntity {
  type: string;
  id: string;
  data: Record<string, unknown>;
}

async function verifyWithGrok(entity: ContentEntity, xaiKey: string) {
  const prompt = buildVerificationPrompt(entity);
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${xaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        {
          role: 'system',
          content: `You are a techno music expert and fact-checker. Your job is to verify information about techno artists, venues, festivals, labels, releases, gear, and crews. 
          
Be precise and cite sources when correcting information. Focus on:
- Founding dates and active periods
- Locations (cities, countries)
- Associated labels and artists
- Capacities and technical specifications
- Historical accuracy

Also find a publicly available photo URL from Wikimedia Commons or official sources with proper licensing.

Respond in JSON format:
{
  "verified": boolean,
  "corrections": [{"field": "fieldName", "original": "value", "corrected": "value", "reason": "explanation with source"}],
  "photo": {"url": "https://...", "source": "Wikimedia Commons", "license": "CC BY-SA 4.0"} or null
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Grok API error:', errorText);
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in Grok response');
  }

  return JSON.parse(content);
}

function buildVerificationPrompt(entity: ContentEntity): string {
  const { type, id, data } = entity;
  
  const dataStr = JSON.stringify(data, null, 2);
  
  const typeInstructions: Record<string, string> = {
    artist: 'Verify artist details including real name, active years, associated labels, and city/country.',
    venue: 'Verify venue capacity, opening year, sound system details, and current operational status.',
    festival: 'Verify founding year, location, typical months of operation, and current active status.',
    label: 'Verify founding year, founders, location, and current active status.',
    release: 'Verify release title, year, format, and label. Check against Discogs or official sources.',
    gear: 'Verify manufacturer, release year, and technical specifications.',
    crew: 'Verify founding year, location, key members, and current active status.'
  };

  return `Verify this ${type} (ID: ${id}):

${dataStr}

${typeInstructions[type] || 'Verify all details for accuracy.'}

Find a suitable photo from Wikimedia Commons or official sources with proper Creative Commons licensing.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('Starting scheduled content sync...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const xaiKey = Deno.env.get('XAI_KEY');

    if (!xaiKey) {
      throw new Error('XAI_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all existing entities from content_sync table
    const { data: existingEntities, error: fetchError } = await supabase
      .from('content_sync')
      .select('entity_type, entity_id, original_data')
      .order('last_synced_at', { ascending: true, nullsFirst: true })
      .limit(50); // Process 50 at a time to avoid timeout

    if (fetchError) {
      throw new Error(`Failed to fetch entities: ${fetchError.message}`);
    }

    if (!existingEntities || existingEntities.length === 0) {
      console.log('No entities to sync');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No entities to sync',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${existingEntities.length} entities to re-verify`);

    const results = [];
    let verified = 0;
    let needsReview = 0;
    let failed = 0;

    // Process entities one at a time to avoid rate limits
    for (const entity of existingEntities) {
      try {
        console.log(`Verifying ${entity.entity_type}:${entity.entity_id}...`);
        
        const verification = await verifyWithGrok({
          type: entity.entity_type,
          id: entity.entity_id,
          data: entity.original_data as Record<string, unknown>
        }, xaiKey);

        const status = verification.verified ? 'verified' : 'needs_review';
        
        // Update the entity in the database
        const { error: updateError } = await supabase
          .from('content_sync')
          .update({
            status,
            corrections: verification.corrections || [],
            verified_data: verification.verified 
              ? entity.original_data 
              : applyCorrections(entity.original_data as Record<string, unknown>, verification.corrections),
            photo_url: verification.photo?.url || null,
            photo_source: verification.photo?.source || null,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('entity_type', entity.entity_type)
          .eq('entity_id', entity.entity_id);

        if (updateError) {
          console.error(`Update error for ${entity.entity_id}:`, updateError);
          failed++;
          continue;
        }

        if (verification.verified) {
          verified++;
        } else {
          needsReview++;
        }

        results.push({
          type: entity.entity_type,
          id: entity.entity_id,
          verified: verification.verified,
          correctionsCount: verification.corrections?.length || 0
        });

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (entityError) {
        console.error(`Error processing ${entity.entity_id}:`, entityError);
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Scheduled sync complete in ${duration}ms: ${verified} verified, ${needsReview} need review, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        processed: existingEntities.length,
        verified,
        needsReview,
        failed,
        durationMs: duration
      },
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Scheduled sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function applyCorrections(
  data: Record<string, unknown>, 
  corrections: Array<{ field: string; corrected: string }>
): Record<string, unknown> {
  const corrected = { ...data };
  
  for (const correction of corrections || []) {
    if (correction.field && correction.corrected !== undefined) {
      corrected[correction.field] = correction.corrected;
    }
  }
  
  return corrected;
}
