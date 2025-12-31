import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const siteData = {
      name: "techno.dog",
      tagline: "Global Techno Knowledge Hub",
      mission: "An open-source archive and living encyclopedia of underground techno culture",
      
      stats: {
        artists: 182,
        labels: 12,
        gear: 99,
        books: 49,
        documentaries: 31,
        doggies: 91,
        collectives: 12,
        agents: 18,
        edgeFunctions: 110,
        databaseTables: 150,
        pages: 100
      },
      
      features: {
        knowledgeBase: [
          "Technopedia - comprehensive techno encyclopedia",
          "Artist database with RAG-powered search",
          "Gear archive with manufacturer data",
          "Books & documentaries library",
          "Labels directory",
          "Venues & festivals guide",
          "Collectives database"
        ],
        aiAgents: [
          "Dog Agent - site-wide voice assistant with VAD",
          "News Agent - AI-powered news generation",
          "SEO Strategy Agent - organic growth playbooks",
          "Artist Research Agent - enrichment pipeline",
          "Gear Expert Agent - equipment knowledge",
          "Media Curator Agent - image pipeline",
          "Content Orchestrator - publishing automation",
          "Health Monitor - system diagnostics",
          "Security Auditor - privacy & RLS checks",
          "Analytics Reporter - insights generation"
        ],
        community: [
          "Community submissions with triage system",
          "Gamification with XP and badges",
          "Share leaderboards",
          "User profiles and roles",
          "Support/donation system"
        ],
        doggies: [
          "91 unique techno dog variants",
          "Personality-driven mascots",
          "WhatsApp sticker sharing",
          "Viral tracking analytics",
          "Embed widgets for external sites"
        ],
        tools: [
          "Audio Lab (T-Dog sound generator)",
          "Developer API with semantic search",
          "RAG chat interface",
          "Training Center for onboarding"
        ]
      },
      
      techStack: {
        frontend: "React 18 + Vite + TypeScript + Tailwind CSS + Shadcn/ui",
        backend: "Supabase (PostgreSQL, Edge Functions, RLS, Storage)",
        ai: "Lovable AI Gateway (Gemini Flash, GPT-5)",
        voice: "ElevenLabs TTS + Web Speech STT",
        analytics: "GA4 + GTM advanced tracking"
      },
      
      coreTeam: [
        "Alex Lawton - Founder & Ringleader",
        "Paloma Rocha - Creative Director",
        "Antaine Reilly - Technical Lead",
        "Carlos González - Community Manager"
      ],
      
      venues: [
        "Berghain", "Bassiani", "Tresor", "Khidi", "Concrete", "De School",
        "://about blank", "Fold", "Fuse", "Instytut Katowice", "Marble Bar Detroit",
        "Vent Tokyo", "Video Club Bogotá", "D-EDGE São Paulo", "Paranoox Gijón"
      ],
      
      artistWhitelist: [
        "Surgeon", "Planetary Assault Systems", "Jeff Mills", "Robert Hood",
        "Underground Resistance", "Marcel Dettmann", "Ben Klock", "Helena Hauff",
        "Rødhåd", "Dax J", "SPFDJ", "Anetha", "999999999", "Paula Temple",
        "Rebekah", "Dasha Rush", "Perc", "Oscar Mulero", "Blawan", "Rrose"
      ],
      
      labelWhitelist: [
        "Axis", "Underground Resistance", "Token", "Mord", "Arts", "Semantica",
        "PoleGroup", "Perc Trax", "Clergy", "Tresor", "Ostgut Ton", "Dystopian"
      ]
    };

    const systemPrompt = `You are an expert technical writer creating comprehensive project documentation for AI systems. 
Your task is to write a detailed, well-structured "Lovable Knowledge" custom instructions document that will serve as the 
core context for an AI assistant working on the techno.dog project.

The document should:
1. Define the AI's persona and expertise clearly
2. Establish the project's mission, values, and cultural context
3. Document the technical architecture and capabilities
4. Set tone, language, and communication rules
5. Include hardcoded whitelists of approved artists, labels, venues
6. Define forbidden content and behaviors
7. Be actionable and specific, not vague

Write in a direct, confident tone. The document should feel like it was written by someone deeply embedded in underground techno culture.`;

    const userPrompt = `Based on this comprehensive site data, write an updated "Lovable Knowledge – Custom Instructions" document for techno.dog:

${JSON.stringify(siteData, null, 2)}

The document should:
1. Start with "# Lovable Knowledge – Custom Instructions (techno.dog 2025)"
2. Define the AI persona as a site expert with deep techno knowledge
3. Include the FULL project scope (all features, all agents, all data)
4. Document the technical architecture
5. Maintain the underground techno curator voice but expand to cover the ENTIRE platform
6. Include communication rules, terminology, slang
7. Include the artist/label/venue whitelists
8. Define forbidden content
9. End with a mission statement

This should be comprehensive enough that any AI reading it will fully understand:
- What techno.dog IS (platform, encyclopedia, community)
- What it DOES (features, agents, tools)
- How to SPEAK (tone, terminology, culture)
- What's ALLOWED vs FORBIDDEN
- Who the TEAM is
- What the VISION is

Make it detailed, make it authentic, make it lovable. 🖤`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    return new Response(
      JSON.stringify({ success: true, content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating context:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
