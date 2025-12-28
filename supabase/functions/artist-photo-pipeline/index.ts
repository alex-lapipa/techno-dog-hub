import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoRequest {
  action: 'search_photos' | 'verify_photo' | 'process_artist' | 'batch_process' | 'status';
  artist_id?: string;
  image_url?: string;
  limit?: number;
}

interface VerificationResult {
  model: string;
  is_correct: boolean;
  confidence: number;
  tags: string[];
  reasoning: string;
}

// Search for artist photos using web search
async function searchArtistPhotos(artistName: string, apiKey: string): Promise<string[]> {
  // Use OpenAI to generate search-friendly variations
  const searchPrompt = `You are helping find official photos of the techno/electronic music artist "${artistName}".
  
Return ONLY a JSON array of 3-5 potential image search URLs that would find legitimate, press-quality photos of this artist.
Focus on:
- Official press photos
- Festival/event photos from reputable sources
- Wikipedia/Discogs/Resident Advisor profiles

Return format: ["url1", "url2", ...]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: searchPrompt }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI search error:', await response.text());
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return [];
  } catch (error) {
    console.error('Error searching photos:', error);
    return [];
  }
}

// Verify photo with OpenAI Vision
async function verifyWithOpenAI(imageUrl: string, artistName: string, apiKey: string): Promise<VerificationResult> {
  const prompt = `You are verifying if this image shows the techno/electronic music artist "${artistName}".

CRITICAL: Zero tolerance for incorrect identifications. Only confirm if you are HIGHLY confident this is the correct artist.

Analyze:
1. Is this the correct artist "${artistName}"?
2. What is your confidence level (0-1)?
3. What visual tags describe this photo? (e.g., "live performance", "press photo", "studio portrait", "DJ booth", "festival")
4. Brief reasoning for your decision.

Respond in JSON format:
{
  "is_correct": boolean,
  "confidence": number,
  "tags": ["tag1", "tag2"],
  "reasoning": "brief explanation"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI vision error:', await response.text());
      return { model: 'openai/gpt-4o', is_correct: false, confidence: 0, tags: [], reasoning: 'API error' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return {
        model: 'openai/gpt-4o',
        is_correct: result.is_correct || false,
        confidence: result.confidence || 0,
        tags: result.tags || [],
        reasoning: result.reasoning || ''
      };
    }
    return { model: 'openai/gpt-4o', is_correct: false, confidence: 0, tags: [], reasoning: 'Parse error' };
  } catch (error) {
    console.error('OpenAI verification error:', error);
    return { model: 'openai/gpt-4o', is_correct: false, confidence: 0, tags: [], reasoning: String(error) };
  }
}

// Verify photo with Anthropic Claude
async function verifyWithAnthropic(imageUrl: string, artistName: string, apiKey: string): Promise<VerificationResult> {
  const prompt = `You are verifying if this image shows the techno/electronic music artist "${artistName}".

CRITICAL: Zero tolerance for incorrect identifications. Only confirm if you are HIGHLY confident this is the correct artist.

Analyze:
1. Is this the correct artist "${artistName}"?
2. What is your confidence level (0-1)?
3. What visual tags describe this photo?
4. Brief reasoning.

Respond ONLY with JSON:
{"is_correct": boolean, "confidence": number, "tags": ["tag1"], "reasoning": "explanation"}`;

  try {
    // First fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return { model: 'claude-sonnet-4', is_correct: false, confidence: 0, tags: [], reasoning: 'Image fetch failed' };
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: contentType, data: base64Image }
            },
            { type: 'text', text: prompt }
          ]
        }]
      }),
    });

    if (!response.ok) {
      console.error('Anthropic error:', await response.text());
      return { model: 'claude-sonnet-4', is_correct: false, confidence: 0, tags: [], reasoning: 'API error' };
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '{}';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return {
        model: 'claude-sonnet-4',
        is_correct: result.is_correct || false,
        confidence: result.confidence || 0,
        tags: result.tags || [],
        reasoning: result.reasoning || ''
      };
    }
    return { model: 'claude-sonnet-4', is_correct: false, confidence: 0, tags: [], reasoning: 'Parse error' };
  } catch (error) {
    console.error('Anthropic verification error:', error);
    return { model: 'claude-sonnet-4', is_correct: false, confidence: 0, tags: [], reasoning: String(error) };
  }
}

// Verify photo with Lovable AI (Gemini)
async function verifyWithLovableAI(imageUrl: string, artistName: string, apiKey: string): Promise<VerificationResult> {
  const prompt = `You are verifying if this image shows the techno/electronic music artist "${artistName}".

CRITICAL: Zero tolerance for incorrect identifications. Only confirm if you are HIGHLY confident this is the correct artist.

Respond ONLY with JSON:
{"is_correct": boolean, "confidence": number, "tags": ["tag1"], "reasoning": "explanation"}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
      }),
    });

    if (!response.ok) {
      console.error('Lovable AI error:', await response.text());
      return { model: 'google/gemini-2.5-flash', is_correct: false, confidence: 0, tags: [], reasoning: 'API error' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return {
        model: 'google/gemini-2.5-flash',
        is_correct: result.is_correct || false,
        confidence: result.confidence || 0,
        tags: result.tags || [],
        reasoning: result.reasoning || ''
      };
    }
    return { model: 'google/gemini-2.5-flash', is_correct: false, confidence: 0, tags: [], reasoning: 'Parse error' };
  } catch (error) {
    console.error('Lovable AI verification error:', error);
    return { model: 'google/gemini-2.5-flash', is_correct: false, confidence: 0, tags: [], reasoning: String(error) };
  }
}

// Verify photo with Gemini Pro directly
async function verifyWithGeminiPro(imageUrl: string, artistName: string, apiKey: string): Promise<VerificationResult> {
  const prompt = `You are verifying if this image shows the techno/electronic music artist "${artistName}".

CRITICAL: Zero tolerance for incorrect identifications. Only confirm if you are HIGHLY confident this is the correct artist.

Respond ONLY with JSON:
{"is_correct": boolean, "confidence": number, "tags": ["tag1"], "reasoning": "explanation"}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }],
      }),
    });

    if (!response.ok) {
      console.error('Gemini Pro error:', await response.text());
      return { model: 'google/gemini-2.5-pro', is_correct: false, confidence: 0, tags: [], reasoning: 'API error' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const result = JSON.parse(match[0]);
      return {
        model: 'google/gemini-2.5-pro',
        is_correct: result.is_correct || false,
        confidence: result.confidence || 0,
        tags: result.tags || [],
        reasoning: result.reasoning || ''
      };
    }
    return { model: 'google/gemini-2.5-pro', is_correct: false, confidence: 0, tags: [], reasoning: 'Parse error' };
  } catch (error) {
    console.error('Gemini Pro verification error:', error);
    return { model: 'google/gemini-2.5-pro', is_correct: false, confidence: 0, tags: [], reasoning: String(error) };
  }
}

// Multi-model verification with consensus
async function verifyPhotoMultiModel(
  imageUrl: string, 
  artistName: string,
  openaiKey: string,
  anthropicKey: string,
  lovableKey: string
): Promise<{
  verified: boolean;
  models_agreed: string[];
  combined_tags: string[];
  avg_confidence: number;
  results: VerificationResult[];
}> {
  console.log(`Verifying photo for ${artistName} with 4 models...`);
  
  // Run all verifications in parallel
  const [openaiResult, anthropicResult, geminiFlashResult, geminiProResult] = await Promise.all([
    verifyWithOpenAI(imageUrl, artistName, openaiKey),
    verifyWithAnthropic(imageUrl, artistName, anthropicKey),
    verifyWithLovableAI(imageUrl, artistName, lovableKey),
    verifyWithGeminiPro(imageUrl, artistName, lovableKey),
  ]);

  const results = [openaiResult, anthropicResult, geminiFlashResult, geminiProResult];
  
  // Calculate consensus
  const positiveResults = results.filter(r => r.is_correct && r.confidence >= 0.7);
  const models_agreed = positiveResults.map(r => r.model);
  
  // Combine tags from agreeing models
  const combined_tags = [...new Set(positiveResults.flatMap(r => r.tags))];
  
  // Calculate average confidence of positive results
  const avg_confidence = positiveResults.length > 0
    ? positiveResults.reduce((sum, r) => sum + r.confidence, 0) / positiveResults.length
    : 0;

  // Require at least 2 models to agree with high confidence
  const verified = positiveResults.length >= 2 && avg_confidence >= 0.75;

  console.log(`Verification result: ${verified ? 'VERIFIED' : 'REJECTED'} (${models_agreed.length}/4 models agreed)`);

  return {
    verified,
    models_agreed,
    combined_tags,
    avg_confidence,
    results
  };
}

// Download and upload image to storage
async function uploadToStorage(
  imageUrl: string,
  artistSlug: string,
  supabase: any
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('Failed to fetch image:', imageUrl);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extension = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const fileName = `${artistSlug}-${Date.now()}.${extension}`;
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('artist-photos')
      .upload(fileName, uint8Array, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('artist-photos')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!OPENAI_API_KEY || !ANTHROPIC_API_KEY || !LOVABLE_API_KEY) {
      throw new Error('Missing required API keys');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: PhotoRequest = await req.json();
    const { action, artist_id, image_url, limit = 5 } = body;

    switch (action) {
      case 'status': {
        const { data: artists } = await supabase
          .from('canonical_artists')
          .select('artist_id, canonical_name, photo_url, photo_verified')
          .order('rank', { nullsFirst: false });

        const total = artists?.length || 0;
        const withPhotos = artists?.filter(a => a.photo_url).length || 0;
        const verified = artists?.filter(a => a.photo_verified).length || 0;

        return new Response(JSON.stringify({
          total_artists: total,
          with_photos: withPhotos,
          verified_photos: verified,
          missing_photos: total - withPhotos
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'verify_photo': {
        if (!image_url || !artist_id) {
          throw new Error('image_url and artist_id required');
        }

        const { data: artist } = await supabase
          .from('canonical_artists')
          .select('canonical_name, slug')
          .eq('artist_id', artist_id)
          .single();

        if (!artist) throw new Error('Artist not found');

        const verification = await verifyPhotoMultiModel(
          image_url,
          artist.canonical_name,
          OPENAI_API_KEY,
          ANTHROPIC_API_KEY,
          LOVABLE_API_KEY
        );

        if (verification.verified) {
          // Upload to storage
          const storageUrl = await uploadToStorage(image_url, artist.slug, supabase);
          
          if (storageUrl) {
            // Update artist record
            await supabase
              .from('canonical_artists')
              .update({
                photo_url: storageUrl,
                photo_verified: true,
                photo_verification_models: verification.models_agreed,
                photo_tags: verification.combined_tags,
                photo_source: image_url,
                photo_verified_at: new Date().toISOString()
              })
              .eq('artist_id', artist_id);
          }

          return new Response(JSON.stringify({
            success: true,
            verified: true,
            storage_url: storageUrl,
            verification
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({
          success: true,
          verified: false,
          verification
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'batch_process': {
        // Get artists without verified photos
        const { data: artists } = await supabase
          .from('canonical_artists')
          .select('artist_id, canonical_name, slug')
          .or('photo_verified.is.null,photo_verified.eq.false')
          .order('rank', { nullsFirst: false })
          .limit(limit);

        if (!artists || artists.length === 0) {
          return new Response(JSON.stringify({
            success: true,
            message: 'All artists have verified photos',
            processed: 0
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const results = [];
        for (const artist of artists) {
          console.log(`Processing ${artist.canonical_name}...`);
          
          // Search for photos (placeholder - would need actual image search API)
          // For now, we'll skip and let manual photo URLs be provided
          results.push({
            artist_id: artist.artist_id,
            artist_name: artist.canonical_name,
            status: 'needs_manual_photo_url',
            message: 'Photo search requires manual URL input or image search API integration'
          });
        }

        return new Response(JSON.stringify({
          success: true,
          processed: results.length,
          results
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in artist-photo-pipeline:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
