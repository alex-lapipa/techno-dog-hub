import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice options for the dog - inclusive voice selection
const DOG_VOICES = {
  // She - warm, friendly feminine voice (Jessica)
  she: "cgSgspJ2msm6clMCkdW9",
  // He - energetic masculine voice (George)
  he: "JBFqnCBsd6RMkjVDRZzb",
  // They - balanced, neutral voice (River - androgynous)
  they: "SAz9YHcvj6GT2YYXdXww",
  // It - robotic/glitchy voice (Glitch)
  it: "kPtEHAvRnjUJFv7SK9WI"
};

// Dog sounds to occasionally sprinkle in
const DOG_SOUNDS = {
  excited: ["Woof!", "Arf arf!", "Yip yip!", "*happy panting*", "Awoo!"],
  thinking: ["Hmm... *sniff sniff*", "*tilts head*", "Rrrruff..."],
  agreeing: ["Woof woof!", "Arf!", "*tail wagging sounds*"],
  laughing: ["*happy panting* heh heh", "Woof haha!", "*playful growl*"],
  ending: ["Woof!", "*happy tippy taps*", "Arf! 🐾", "*tail wagging*"]
};

// Inject dog sounds into text occasionally (not too much!)
function addDogSounds(text: string, voice: string): string {
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
    const { text, voice = 'they' } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    // Get the voice ID based on selection
    const voiceId = DOG_VOICES[voice as keyof typeof DOG_VOICES] || DOG_VOICES.they;

    // Clean the text - remove emojis and asterisks for cleaner speech
    let cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*[^*]+\*/g, '') // Remove *actions*
      .replace(/\s+/g, ' ')
      .trim();

    // Add occasional dog sounds
    cleanText = addDogSounds(cleanText, voice);

    console.log(`Generating ${voice} voice for:`, cleanText.substring(0, 100) + "...");

    // Adjust voice settings based on voice type
    const voiceSettings: Record<string, { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean; speed: number }> = {
      she: {
        stability: 0.45,
        similarity_boost: 0.8,
        style: 0.55,
        use_speaker_boost: true,
        speed: 1.05,
      },
      he: {
        stability: 0.4,
        similarity_boost: 0.75,
        style: 0.6,
        use_speaker_boost: true,
        speed: 1.1,
      },
      they: {
        stability: 0.5,
        similarity_boost: 0.7,
        style: 0.5,
        use_speaker_boost: true,
        speed: 1.0,
      },
      it: {
        stability: 0.3,
        similarity_boost: 0.6,
        style: 0.7,
        use_speaker_boost: false,
        speed: 0.95,
      }
    };
    
    const settings = voiceSettings[voice] || voiceSettings.they;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
          voice_settings: settings,
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
