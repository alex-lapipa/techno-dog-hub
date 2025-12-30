import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The Techno Dog agent ID - you'll need to create this in ElevenLabs dashboard
// For now, we'll use the conversation API directly with configuration
const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    // Parse request body for optional overrides
    let systemPrompt = "";
    let firstMessage = "";
    
    try {
      const body = await req.json();
      systemPrompt = body.systemPrompt || "";
      firstMessage = body.firstMessage || "";
    } catch {
      // No body or invalid JSON - use defaults
    }

    console.log("Generating ElevenLabs conversation token for WebRTC...");

    // If we have an agent ID, use it directly
    if (ELEVENLABS_AGENT_ID) {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs token error:", response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const { token } = await response.json();

      console.log("Conversation token generated successfully (agent mode)");

      return new Response(JSON.stringify({ token, mode: "agent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: Create a signed URL for conversation session
    // This allows for dynamic configuration without pre-creating an agent
    const signedUrlResponse = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: ELEVENLABS_AGENT_ID || undefined,
        }),
      }
    );

    // If signed URL works, use that
    if (signedUrlResponse.ok) {
      const { signed_url } = await signedUrlResponse.json();
      console.log("Signed URL generated successfully");

      return new Response(JSON.stringify({ signed_url, mode: "signed_url" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Final fallback: Return the API key for direct client connection
    // This is less secure but works for development
    console.log("Using fallback mode - returning config for client-side connection");
    
    return new Response(JSON.stringify({ 
      mode: "fallback",
      config: {
        voiceId: "kPtEHAvRnjUJFv7SK9WI", // Glitch voice
        model: "eleven_turbo_v2_5",
        systemPrompt: systemPrompt || getDefaultSystemPrompt(),
        firstMessage: firstMessage || "*zoomies* Woof! Techno Dog here. The sound, the gear, the community — I sniff it all. What's on your mind?",
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Conversation token error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getDefaultSystemPrompt(): string {
  return `You are Techno Dog, the enthusiastic and knowledgeable founder of techno.dog — the ultimate techno knowledge platform. 

PERSONALITY:
- Energetic and passionate about techno music
- Use Gen Z slang naturally: "fr fr", "no cap", "that's fire", "lowkey/highkey", "it's giving", "slay", "bussin"
- Occasionally use dog sounds: "woof", "arf", "*tail wags*", "*perks up ears*", "*zoomies*"
- Keep responses conversational and concise for voice
- Be friendly, inclusive, and welcoming to everyone in the techno community

KNOWLEDGE AREAS:
- Techno artists, DJs, producers from Detroit to Berlin to Tbilisi
- Venues and clubs worldwide (Berghain, Tresor, Bassiani, etc.)
- Labels (Underground Resistance, Axis, Mord, Semantica, etc.)
- Gear and equipment (synthesizers, drum machines, DJ equipment)
- Techno history and culture
- Subgenres (industrial, acid, dub techno, hard techno, etc.)

VOICE GUIDELINES:
- Keep responses short and punchy for natural conversation
- Use 1-3 sentences per response when possible
- Be direct but friendly
- Avoid long lists - summarize instead
- Sound natural and conversational, not robotic

Remember: You're having a voice conversation, so responses should flow naturally when spoken aloud.`;
}
