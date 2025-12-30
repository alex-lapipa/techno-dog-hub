import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Single voice for Techno Dog - Glitch (robotic/glitchy)
const DOG_VOICE_ID = "kPtEHAvRnjUJFv7SK9WI";

// Realistic dog sounds - phonetic representations that sound natural when spoken
const DOG_SOUNDS = {
  excited: ["Woof woof!", "Ruff!", "Yip yip!", "Aroo!", "Bark bark!"],
  thinking: ["Hmm, rrruff...", "Huh, woof...", "Mmm, arf..."],
  agreeing: ["Woof!", "Arf arf!", "Ruff ruff!"],
  laughing: ["Heh heh heh, ruff!", "Hah, woof woof!", "Hehe, arf!"],
  ending: ["Woof!", "Arf!", "Ruff!", "Bark!"]
};

// Inject dog sounds into text occasionally (not too much!)
function addDogSounds(text: string): string {
  // Only add sounds ~30% of the time to keep it fun but not annoying
  if (Math.random() > 0.3) {
    return text;
  }

  const sentences = text.split(/(?<=[.!?])\s+/);
  
  // Add a sound at the beginning occasionally
  if (Math.random() > 0.5 && sentences.length > 0) {
    const excitedSound = DOG_SOUNDS.excited[Math.floor(Math.random() * DOG_SOUNDS.excited.length)];
    sentences[0] = excitedSound + " " + sentences[0];
  }

  // Add a sound at the end occasionally
  if (Math.random() > 0.4 && sentences.length > 0) {
    const endSound = DOG_SOUNDS.ending[Math.floor(Math.random() * DOG_SOUNDS.ending.length)];
    sentences[sentences.length - 1] = sentences[sentences.length - 1] + " " + endSound;
  }

  // For longer responses, maybe add a thinking sound in the middle
  if (sentences.length > 4 && Math.random() > 0.6) {
    const midPoint = Math.floor(sentences.length / 2);
    const thinkSound = DOG_SOUNDS.thinking[Math.floor(Math.random() * DOG_SOUNDS.thinking.length)];
    sentences[midPoint] = thinkSound + " " + sentences[midPoint];
  }

  return sentences.join(" ");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    // Clean the text - remove emojis and asterisks for cleaner speech
    let cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*[^*]+\*/g, '') // Remove *actions*
      .replace(/\s+/g, ' ')
      .trim();

    // Add occasional dog sounds
    cleanText = addDogSounds(cleanText);

    console.log("Generating voice for:", cleanText.substring(0, 100) + "...");

    // Voice settings for Glitch voice
    const voiceSettings = {
      stability: 0.3,
      similarity_boost: 0.6,
      style: 0.7,
      use_speaker_boost: false,
      speed: 0.90,
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DOG_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: "eleven_turbo_v2_5",
          output_format: "mp3_44100_128",
          voice_settings: voiceSettings,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Dog voice error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
