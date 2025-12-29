import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Blocked terms - anything negative, harmful, or off-brand
const blockedTerms = [
  'bite', 'biting', 'attack', 'aggressive', 'angry', 'mean', 'evil', 'bad', 'scary',
  'violent', 'weapon', 'fight', 'kill', 'death', 'dead', 'blood', 'gore', 'war',
  'hate', 'racist', 'nazi', 'terrorist', 'drug', 'cocaine', 'heroin', 'meth',
  'naked', 'nude', 'sexual', 'porn', 'nsfw', 'explicit', 'inappropriate',
  'gun', 'knife', 'bomb', 'explosion', 'destruction', 'chaos', 'demon', 'devil',
  'sad', 'depressed', 'crying', 'miserable', 'suffering', 'pain', 'hurt',
  'ugly', 'disgusting', 'gross', 'vomit', 'sick', 'disease', 'infection',
  'stupid', 'idiot', 'dumb', 'loser', 'failure', 'worthless', 'pathetic'
];

// Required positive vibes
const positiveEnforcement = [
  'friendly', 'happy', 'joyful', 'cute', 'adorable', 'loving', 'kind',
  'dancing', 'musical', 'techno', 'rave', 'festival', 'community', 'unity',
  'creative', 'artistic', 'colorful', 'glowing', 'neon', 'electronic'
];

function containsBlockedContent(prompt: string): { blocked: boolean; reason?: string } {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const term of blockedTerms) {
    if (lowerPrompt.includes(term)) {
      return { 
        blocked: true, 
        reason: `Our doggies are all about positivity! Let's keep it friendly and fun. Try describing a happy, musical, or dancing doggy instead.` 
      };
    }
  }
  
  return { blocked: false };
}

function buildSafePrompt(userPrompt: string): string {
  // Always enforce positive, techno-themed doggy style
  return `A cute, friendly, happy techno dog character in a minimalist line art style using bright green neon lines on dark background. The dog should look joyful, musical, and part of a loving pack. Style: SVG-like, clean lines, rave/festival vibes. The dog is: ${userPrompt}. The overall mood must be positive, welcoming, and community-focused. No aggressive features, only happy expressions.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userName } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Please describe your doggy!' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check prompt length
    if (prompt.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Keep it short and sweet! Max 200 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Content moderation
    const modCheck = containsBlockedContent(prompt);
    if (modCheck.blocked) {
      console.log(`Blocked prompt from ${userName || 'anonymous'}: ${prompt}`);
      return new Response(
        JSON.stringify({ error: modCheck.reason }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating doggy for ${userName || 'anonymous'}: ${prompt}`);

    // Build the safe, enforced prompt
    const safePrompt = buildSafePrompt(prompt);

    // Use Lovable AI gateway for image generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: safePrompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', errorText);
      throw new Error('Failed to generate doggy image');
    }

    const data = await response.json();
    
    // Extract the generated image
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image was generated. Try a different description!');
    }

    console.log(`Successfully generated doggy for prompt: ${prompt.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl,
        message: textResponse || `Your ${prompt} doggy is ready!`,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong generating your doggy. Try again!';
    console.error('Error generating doggy:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
