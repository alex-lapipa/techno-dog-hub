import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationResult {
  gearId: string;
  gearName: string;
  imageUrl: string;
  status: 'valid' | 'broken' | 'mismatch' | 'error';
  confidence?: number;
  description?: string;
  suggestion?: string;
}

// Check if URL is accessible - use GET with proper User-Agent for Wikimedia
async function checkImageAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TechnoDog/1.0; +https://techno.dog)',
      },
    });
    // Check if response is OK and content-type is an image
    const contentType = response.headers.get('content-type') || '';
    return response.ok && contentType.includes('image');
  } catch {
    return false;
  }
}

// Use Gemini to verify if image matches the gear
async function verifyImageWithGemini(
  imageUrl: string,
  gearName: string,
  gearCategory: string,
  apiKey: string
): Promise<{ isMatch: boolean; confidence: number; description: string; suggestion?: string }> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert in electronic music equipment identification. Your task is to verify if an image shows the correct piece of gear. Be precise and technical.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Verify if this image shows "${gearName}" (category: ${gearCategory}).

Return a JSON object with:
- isMatch: boolean (true if image clearly shows the named gear)
- confidence: number 0-100 (how confident you are)
- description: string (what you see in the image)
- suggestion: string (if not a match, suggest what the image actually shows)

IMPORTANT: Only return the JSON object, no other text.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return { isMatch: false, confidence: 0, description: 'API error', suggestion: error };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          isMatch: result.isMatch ?? false,
          confidence: result.confidence ?? 0,
          description: result.description ?? '',
          suggestion: result.suggestion,
        };
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', content);
    }

    return { isMatch: false, confidence: 0, description: content, suggestion: 'Could not parse response' };
  } catch (error) {
    console.error('Gemini verification error:', error);
    return { 
      isMatch: false, 
      confidence: 0, 
      description: 'Verification failed', 
      suggestion: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { action, gearId, batchSize = 10 } = await req.json();

    // Action: verify-single - Verify a single gear item's image
    if (action === 'verify-single' && gearId) {
      const { data: gear } = await supabase
        .from('gear_catalog')
        .select('id, name, category, image_url')
        .eq('id', gearId)
        .single();

      if (!gear || !gear.image_url) {
        return new Response(
          JSON.stringify({ error: 'Gear not found or no image URL' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // First check if image is accessible
      const isAccessible = await checkImageAccessible(gear.image_url);
      
      if (!isAccessible) {
        return new Response(
          JSON.stringify({
            gearId: gear.id,
            gearName: gear.name,
            imageUrl: gear.image_url,
            status: 'broken',
            description: 'Image URL returns 404 or is inaccessible',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use Gemini to verify if image matches
      const verification = await verifyImageWithGemini(
        gear.image_url,
        gear.name,
        gear.category || 'synth',
        lovableApiKey
      );

      const result: VerificationResult = {
        gearId: gear.id,
        gearName: gear.name,
        imageUrl: gear.image_url,
        status: verification.isMatch ? 'valid' : 'mismatch',
        confidence: verification.confidence,
        description: verification.description,
        suggestion: verification.suggestion,
      };

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: verify-batch - Verify multiple gear items
    if (action === 'verify-batch') {
      const { data: gearItems } = await supabase
        .from('gear_catalog')
        .select('id, name, category, image_url')
        .not('image_url', 'is', null)
        .order('name')
        .limit(batchSize);

      const results: VerificationResult[] = [];
      
      for (const gear of gearItems || []) {
        if (!gear.image_url) continue;

        const isAccessible = await checkImageAccessible(gear.image_url);
        
        if (!isAccessible) {
          results.push({
            gearId: gear.id,
            gearName: gear.name,
            imageUrl: gear.image_url,
            status: 'broken',
            description: 'Image URL not accessible',
          });
          continue;
        }

        // Verify with Gemini
        const verification = await verifyImageWithGemini(
          gear.image_url,
          gear.name,
          gear.category || 'synth',
          lovableApiKey
        );

        results.push({
          gearId: gear.id,
          gearName: gear.name,
          imageUrl: gear.image_url,
          status: verification.isMatch ? 'valid' : 'mismatch',
          confidence: verification.confidence,
          description: verification.description,
          suggestion: verification.suggestion,
        });

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const summary = {
        total: results.length,
        valid: results.filter(r => r.status === 'valid').length,
        broken: results.filter(r => r.status === 'broken').length,
        mismatch: results.filter(r => r.status === 'mismatch').length,
      };

      return new Response(
        JSON.stringify({ summary, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Action: check-accessibility - Quick check which images are broken (no AI)
    if (action === 'check-accessibility') {
      const { data: gearItems } = await supabase
        .from('gear_catalog')
        .select('id, name, image_url')
        .not('image_url', 'is', null)
        .order('name');

      const results: Array<{ id: string; name: string; accessible: boolean; url: string }> = [];
      
      for (const gear of gearItems || []) {
        if (!gear.image_url) continue;
        
        const accessible = await checkImageAccessible(gear.image_url);
        results.push({
          id: gear.id,
          name: gear.name,
          accessible,
          url: gear.image_url,
        });
        
        // Small delay to avoid hammering servers
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const accessible = results.filter(r => r.accessible).length;
      const broken = results.filter(r => !r.accessible).length;

      return new Response(
        JSON.stringify({
          summary: { total: results.length, accessible, broken },
          broken: results.filter(r => !r.accessible),
          accessible: results.filter(r => r.accessible).map(r => ({ id: r.id, name: r.name })),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: verify-single, verify-batch, or check-accessibility' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
