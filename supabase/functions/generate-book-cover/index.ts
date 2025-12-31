import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId, title, author, yearPublished } = await req.json();

    if (!bookId || !title) {
      return new Response(
        JSON.stringify({ error: "bookId and title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a unique, evocative cover using AI
    const prompt = buildCoverPrompt(title, author, yearPublished);
    console.log(`Generating cover for "${title}" with prompt: ${prompt.substring(0, 100)}...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data).substring(0, 500));
      throw new Error("No image generated");
    }

    // Extract base64 data
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Invalid image data format");
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to storage
    const fileName = `${bookId}.${imageFormat}`;
    const { error: uploadError } = await supabase.storage
      .from("book-covers")
      .upload(fileName, buffer, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("book-covers")
      .getPublicUrl(fileName);

    const coverUrl = urlData.publicUrl;

    // Update book record
    const { error: updateError } = await supabase
      .from("books")
      .update({ cover_url: coverUrl })
      .eq("id", bookId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`Successfully generated cover for "${title}": ${coverUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        bookId, 
        title, 
        coverUrl,
        message: `AI-generated cover created for "${title}"` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate book cover error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Failed to generate AI book cover"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildCoverPrompt(title: string, author?: string, year?: number): string {
  // Analyze the title to determine the book's theme
  const lowerTitle = title.toLowerCase();
  
  let themeHints = "";
  let styleHints = "professional book cover design, high contrast, bold typography integration space";
  
  // Detect themes from title keywords
  if (lowerTitle.includes("synth") || lowerTitle.includes("moog") || lowerTitle.includes("korg") || lowerTitle.includes("modular")) {
    themeHints = "synthesizer hardware, knobs, patch cables, modular synthesis, electronic music equipment";
    styleHints = "technical aesthetic, circuit board patterns, waveform visualizations, analog warmth";
  } else if (lowerTitle.includes("mixing") || lowerTitle.includes("studio") || lowerTitle.includes("production")) {
    themeHints = "recording studio, mixing console, audio engineering, soundwaves, equalizer";
    styleHints = "professional studio environment, sleek modern design, technical precision";
  } else if (lowerTitle.includes("acoustic") || lowerTitle.includes("sound")) {
    themeHints = "sound waves, acoustic patterns, frequency visualization, audio physics";
    styleHints = "scientific elegance, wave patterns, gradient backgrounds";
  } else if (lowerTitle.includes("dance") || lowerTitle.includes("music") || lowerTitle.includes("electronic")) {
    themeHints = "electronic music, club lighting, pulsing rhythms, DJ equipment";
    styleHints = "dynamic energy, neon accents, dark background with vibrant highlights";
  } else if (lowerTitle.includes("patch") || lowerTitle.includes("tweak")) {
    themeHints = "modular synthesizer patches, colorful cables, hardware knobs and buttons";
    styleHints = "detailed technical beauty, organized complexity, gear photography style";
  } else if (lowerTitle.includes("secret") || lowerTitle.includes("manual") || lowerTitle.includes("handbook")) {
    themeHints = "educational reference, professional guide, authoritative knowledge";
    styleHints = "clean design, structured layout, premium textbook aesthetic";
  } else {
    themeHints = "electronic music technology, synthesizers, audio production";
    styleHints = "modern minimalist, professional, music technology aesthetic";
  }

  return `Generate a professional book cover for a music production/synthesizer book.

Book Title: "${title}"
${author ? `Author: ${author}` : ""}
${year ? `Year: ${year}` : ""}

Theme elements: ${themeHints}

Visual style: ${styleHints}

Requirements:
- Vertical book cover format (2:3 aspect ratio)
- Dark, moody background typical of techno/electronic music aesthetics
- INCLUDE THE BOOK TITLE "${title}" prominently displayed on the cover in bold, stylish typography
- ${author ? `Include author name "${author}" in smaller text below the title` : ""}
- High quality, detailed, professional looking
- Abstract or semi-abstract imagery that evokes the book's subject matter
- Colors should include deep blacks, dark grays, with accent colors like crimson red, electric blue, or neon green
- Typography should be modern, clean, and readable - white or light colored text works best against dark backgrounds
- Should feel premium and authoritative like a real published book`;
}
