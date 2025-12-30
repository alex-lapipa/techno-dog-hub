import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationResult {
  matchScore: number;
  qualityScore: number;
  copyrightRisk: 'low' | 'medium' | 'high';
  licenseStatus: 'safe' | 'unknown' | 'rejected';
  tags: string[];
  altText: string;
  reasoning: string;
}

async function verifyImageWithOpenAI(
  imageUrl: string,
  entityName: string,
  entityType: string,
  openaiKey: string
): Promise<VerificationResult | null> {
  try {
    console.log(`Verifying image for ${entityType}: ${entityName}`);
    
    const systemPrompt = `You are an image verification expert for a techno music encyclopedia. 
Your job is to analyze images and determine:
1. If the image matches the entity (${entityType}: ${entityName})
2. The quality and relevance of the image
3. Copyright risk assessment
4. Generate appropriate tags and alt text

Be strict about matching - the image should clearly represent the entity.
For artists, look for recognizable features, DJ equipment, or performance settings.
For synthesizers, verify the exact model matches.
For venues, look for distinctive architectural features or signage.

IMPORTANT: Images with watermarks (Getty, Shutterstock, iStock, etc.) should be marked as HIGH copyright risk.
Press agency photos should be marked as MEDIUM risk.
Wikimedia Commons, public domain, or CC-licensed images are LOW risk.`;

    const userPrompt = `Analyze this image for: ${entityType} named "${entityName}"

Return a JSON object with:
{
  "matchScore": 0-100 (how well does this match the entity?),
  "qualityScore": 0-100 (image clarity, composition, resolution),
  "copyrightRisk": "low" | "medium" | "high",
  "licenseStatus": "safe" | "unknown" | "rejected",
  "tags": ["tag1", "tag2", ...] (genre, era, style, equipment visible),
  "altText": "descriptive alt text for accessibility",
  "reasoning": "brief explanation of your assessment"
}

Be conservative - if unsure, score lower. Reject obvious mismatches.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            ],
          },
        ],
        max_completion_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in OpenAI response');
      return null;
    }

    const result = JSON.parse(content);
    console.log('Verification result:', result);
    
    return {
      matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
      qualityScore: Math.min(100, Math.max(0, result.qualityScore || 0)),
      copyrightRisk: result.copyrightRisk || 'unknown',
      licenseStatus: result.licenseStatus || 'unknown',
      tags: result.tags || [],
      altText: result.altText || `Image of ${entityName}`,
      reasoning: result.reasoning || '',
    };
  } catch (error) {
    console.error('Image verification error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { entityType, entityId, entityName, assetId } = await req.json();

    console.log(`Verifying images for ${entityType}/${entityId}`);

    // Get unverified candidates for this entity
    let query = supabase
      .from('media_assets')
      .select('*')
      .eq('openai_verified', false);
    
    if (assetId) {
      query = query.eq('id', assetId);
    } else {
      query = query.eq('entity_type', entityType).eq('entity_id', entityId);
    }

    const { data: candidates, error: fetchError } = await query;

    if (fetchError) throw fetchError;
    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        verified: false,
        message: 'No candidates to verify' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${candidates.length} candidates to verify`);

    let bestCandidate = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      const result = await verifyImageWithOpenAI(
        candidate.source_url,
        entityName || candidate.entity_name,
        entityType || candidate.entity_type,
        openaiKey
      );

      if (result) {
        // Update the asset with verification results
        const updateData = {
          openai_verified: true,
          match_score: result.matchScore,
          quality_score: result.qualityScore,
          copyright_risk: result.copyrightRisk,
          license_status: result.licenseStatus === 'safe' ? 'safe' : 
                         result.licenseStatus === 'rejected' ? 'rejected' : 'unknown',
          tags: result.tags,
          alt_text: result.altText,
          reasoning_summary: result.reasoning,
        };

        await supabase
          .from('media_assets')
          .update(updateData)
          .eq('id', candidate.id);

        // Calculate combined score for selection
        const combinedScore = (result.matchScore * 0.6) + (result.qualityScore * 0.4);
        
        // Only consider for selection if:
        // - Match score >= 60
        // - Copyright risk is not high
        // - License is not rejected
        if (result.matchScore >= 60 && 
            result.copyrightRisk !== 'high' && 
            result.licenseStatus !== 'rejected' &&
            combinedScore > bestScore) {
          bestScore = combinedScore;
          bestCandidate = { ...candidate, ...result };
        }
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Select the best candidate
    if (bestCandidate) {
      // Unselect any previously selected assets for this entity
      await supabase
        .from('media_assets')
        .update({ final_selected: false })
        .eq('entity_type', entityType || bestCandidate.entity_type)
        .eq('entity_id', entityId || bestCandidate.entity_id);

      // Mark the best one as selected
      await supabase
        .from('media_assets')
        .update({ final_selected: true })
        .eq('id', bestCandidate.id);

      console.log(`Selected best candidate: ${bestCandidate.id} with score ${bestScore}`);

      // Download and store in Supabase Storage
      try {
        const imageResponse = await fetch(bestCandidate.source_url);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          const extension = bestCandidate.source_url.split('.').pop()?.split('?')[0] || 'jpg';
          const storagePath = `${entityType || bestCandidate.entity_type}/${entityId || bestCandidate.entity_id}.${extension}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media-assets')
            .upload(storagePath, imageBlob, {
              contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
              upsert: true,
            });

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('media-assets')
              .getPublicUrl(storagePath);

            await supabase
              .from('media_assets')
              .update({ 
                storage_url: publicUrl,
                storage_path: storagePath,
              })
              .eq('id', bestCandidate.id);

            console.log(`Stored image at: ${publicUrl}`);
          } else {
            console.error('Upload error:', uploadError);
          }
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
        // Continue even if storage fails - we still have the source URL
      }

      return new Response(JSON.stringify({ 
        success: true, 
        verified: true,
        selectedAssetId: bestCandidate.id,
        matchScore: bestCandidate.matchScore,
        qualityScore: bestCandidate.qualityScore,
        storageUrl: bestCandidate.storage_url,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      verified: false,
      message: 'No suitable candidates found after verification' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Media verify error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
