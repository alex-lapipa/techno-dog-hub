import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentEntity {
  type: 'artist' | 'venue' | 'festival' | 'gear' | 'label' | 'release' | 'crew';
  id: string;
  data: Record<string, unknown>;
}

async function verifyWithGrok(entity: ContentEntity, xaiKey: string): Promise<{
  verified: boolean;
  corrections: Array<{ field: string; original: string; corrected: string; reason: string }>;
  photoUrl?: string;
  photoSource?: string;
}> {
  const prompt = buildVerificationPrompt(entity);
  
  console.log(`Verifying ${entity.type}: ${entity.id}`);
  
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages: [
          {
            role: 'system',
            content: `You are a techno music expert and fact-checker. Your job is to verify information about electronic music artists, venues, festivals, gear, labels, and releases.

For each entity, you must:
1. Check if the information is factually correct
2. Identify any hallucinations or errors
3. Suggest corrections with sources
4. Find a legitimate photo URL if missing (prefer Wikimedia Commons, official websites, or properly licensed images)

IMPORTANT: Only report actual errors. If information is correct, say so.
Respond in JSON format only.`
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
      console.error(`Grok API error: ${response.status} - ${errorText}`);
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in Grok response');
    }

    const result = JSON.parse(content);
    
    return {
      verified: result.verified ?? false,
      corrections: result.corrections ?? [],
      photoUrl: result.photo_url,
      photoSource: result.photo_source
    };
  } catch (error) {
    console.error(`Error verifying ${entity.type} ${entity.id}:`, error);
    throw error;
  }
}

function buildVerificationPrompt(entity: ContentEntity): string {
  const { type, id, data } = entity;
  
  const dataRecord = data as Record<string, unknown>;
  const imageObj = dataRecord.image as Record<string, unknown> | undefined;
  const hasPhoto = imageObj?.url || dataRecord.imageUrl || dataRecord.photoUrl;

  const typeSpecificInstructions: Record<string, string> = {
    artist: `Verify artist biography, career dates, associated labels, city/country of origin.
Key fields to check: name, realName, city, country, active years, labels, bio accuracy.
Look for: incorrect founding dates, wrong label associations, fabricated awards or performances.`,
    
    venue: `Verify venue details: location, capacity, opening date, sound system, closure status.
Key fields: name, city, country, capacity, opening year, closure status.
Common errors: wrong capacities, incorrect founding years, misattributed locations.`,
    
    festival: `Verify festival details: founding year, location, typical months, capacity.
Key fields: name, city, country, founded year, months held, capacity.
Watch for: wrong founding years, incorrect locations, fabricated lineups.`,
    
    gear: `Verify gear specifications: manufacturer, release year, synthesis type, polyphony.
Key fields: name, manufacturer, releaseYear, category, technical specs.
Common errors: wrong release years, incorrect specifications, misattributed manufacturers.`,
    
    label: `Verify label details: founding year, founders, location, active status.
Key fields: name, city, country, founded, founders, key artists.
Check: wrong founding years, incorrect founder attributions.`,
    
    release: `Verify release details: artist, label, year, format, tracklist.
Key fields: title, artist, label, year, format, tracklist.
Watch for: wrong release years, incorrect label associations, fabricated tracks.`,
    
    crew: `Verify crew/collective details: founding year, city, members, active status.
Key fields: name, city, country, founded, members, type.
Check: wrong founding years, incorrect member listings.`
  };

  return `
Entity Type: ${type.toUpperCase()}
Entity ID: ${id}

Current Data:
${JSON.stringify(data, null, 2)}

${typeSpecificInstructions[type] || ''}

${!hasPhoto ? `
IMPORTANT: This entity has NO PHOTO. Please find a legitimate image URL.
Prefer: Wikimedia Commons (CC licensed), official artist/venue websites, press photos.
Include attribution info if found.
` : ''}

Respond with this exact JSON structure:
{
  "verified": true/false,
  "overall_assessment": "Brief summary of accuracy",
  "corrections": [
    {
      "field": "field_name",
      "original": "original value",
      "corrected": "correct value",
      "reason": "why this is wrong and source for correction"
    }
  ],
  "photo_url": "URL if found and entity has no photo",
  "photo_source": "Attribution info for the photo"
}

If everything is correct, return empty corrections array and verified: true.
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const XAI_KEY = Deno.env.get('XAI_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !XAI_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { entities, batchSize = 5 } = await req.json();

    if (!entities || !Array.isArray(entities)) {
      throw new Error('Entities array is required');
    }

    const results = [];
    
    // Process in batches to avoid rate limits
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (entity: ContentEntity) => {
          try {
            const verification = await verifyWithGrok(entity, XAI_KEY);
            
            // Upsert to database
            const { error } = await supabase
              .from('content_sync')
              .upsert({
                entity_type: entity.type,
                entity_id: entity.id,
                original_data: entity.data,
                verified_data: verification.corrections.length > 0 
                  ? applyCorrections(entity.data, verification.corrections)
                  : entity.data,
                corrections: verification.corrections,
                photo_url: verification.photoUrl,
                photo_source: verification.photoSource,
                status: verification.verified ? 'verified' : 'needs_review',
                last_synced_at: new Date().toISOString()
              }, {
                onConflict: 'entity_type,entity_id'
              });

            if (error) {
              console.error(`Database error for ${entity.type}/${entity.id}:`, error);
              return { id: entity.id, type: entity.type, success: false, error: error.message };
            }

            return {
              id: entity.id,
              type: entity.type,
              success: true,
              verified: verification.verified,
              correctionsCount: verification.corrections.length,
              hasPhoto: !!verification.photoUrl
            };
          } catch (error) {
            console.error(`Error processing ${entity.type}/${entity.id}:`, error);
            return {
              id: entity.id,
              type: entity.type,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );
      
      results.push(...batchResults);
      
      // Rate limit pause between batches
      if (i + batchSize < entities.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      verified: results.filter(r => r.verified).length,
      needsReview: results.filter(r => r.success && !r.verified).length,
      withPhotos: results.filter(r => r.hasPhoto).length,
      failed: results.filter(r => !r.success).length
    };

    console.log('Content sync completed:', summary);

    return new Response(JSON.stringify({ 
      success: true,
      summary,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in content-sync:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function applyCorrections(
  data: Record<string, unknown>,
  corrections: Array<{ field: string; corrected: string }>
): Record<string, unknown> {
  const corrected = { ...data };
  
  for (const correction of corrections) {
    const parts = correction.field.split('.');
    let current = corrected;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] && typeof current[parts[i]] === 'object') {
        current = current[parts[i]] as Record<string, unknown>;
      }
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = correction.corrected;
  }
  
  return corrected;
}
