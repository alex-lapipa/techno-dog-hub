import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "validate_contribution":
        // Validate and improve user's contribution
        systemPrompt = `You are a content quality reviewer for techno.dog, an underground techno music archive. 
Your role is to help users submit high-quality contributions. 
You should:
1. Check if the contribution is relevant to underground techno culture
2. Identify any missing important details
3. Suggest improvements to make the contribution more valuable
4. Flag if content seems commercial/mainstream rather than underground

Respond in JSON format:
{
  "isValid": boolean,
  "quality": "excellent" | "good" | "needs_improvement" | "not_suitable",
  "feedback": "Brief helpful feedback",
  "suggestions": ["Specific improvement suggestions"],
  "missingFields": ["Fields that should be filled"]
}`;
        userPrompt = `Review this contribution:
Type: ${data.contributionType}
Action: ${data.actionType}
Name: ${data.name || "Not provided"}
Description: ${data.description || "Not provided"}
Location: ${data.location || "Not provided"}
Additional Info: ${data.additionalInfo || "Not provided"}`;
        break;

      case "enhance_description":
        // Help improve user's description
        systemPrompt = `You are a helpful assistant for techno.dog, an underground techno music archive.
Help users write better descriptions for their contributions. 
Keep the underground, non-commercial spirit. Be concise but informative.
Focus on what makes this entity significant to the techno scene.
Return only the enhanced description text, nothing else.`;
        userPrompt = `Improve this description for a ${data.entityType}:
Name: ${data.name}
Current description: ${data.description}
Additional context: ${data.context || "None"}

Provide an enhanced version that's more informative while keeping the user's intent.`;
        break;

      case "suggest_tags":
        // Suggest relevant tags for the contribution
        systemPrompt = `You are a techno music classification expert.
Suggest relevant tags for techno-related content.
Return a JSON array of 3-5 relevant tags.
Tags should be lowercase, single words or hyphenated phrases.
Example: ["industrial-techno", "berlin", "hardware-live", "underground"]`;
        userPrompt = `Suggest tags for:
Type: ${data.entityType}
Name: ${data.name}
Description: ${data.description}
Location: ${data.location || "Unknown"}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    // Try to parse JSON responses
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      parsedContent = { result: content };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: parsedContent 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in contribute-assist function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
