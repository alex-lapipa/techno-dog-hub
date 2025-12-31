import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

function buildFallbackUrl(title: string, author?: string, locale = "es"): string {
  const query = encodeURIComponent(`${title} ${author || ""}`.trim());
  const domain =
    locale === "uk" ? "amazon.co.uk" :
    locale === "us" ? "amazon.com" :
    "amazon.es";
  return `https://${domain}/s?k=${query}&i=stripbooks`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { title, author } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: "Missing title" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback if no API key
    if (!OPENAI_API_KEY) {
      console.log("No OpenAI API key, using fallback URL");
      return new Response(
        JSON.stringify({ amazon_url: buildFallbackUrl(title, author, "es") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are generating Amazon book purchase links.
Return JSON ONLY with:
- locale: "es" | "uk" | "us"
- amazon_url: a stable Amazon SEARCH URL (not a product shortlink).

Use the title and author to build the query. Prefer "es" locale for Spanish language books, "uk" for British authors, "us" for American authors.

TITLE: ${title}
AUTHOR: ${author || "Unknown"}`;

    console.log(`Generating Amazon link for: ${title} by ${author || "Unknown"}`);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini-2025-04-14",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ amazon_url: buildFallbackUrl(title, author, "es") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    console.log("OpenAI response:", content);

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    const parsed = JSON.parse(jsonStr);
    const url = parsed?.amazon_url;
    const locale = parsed?.locale;

    if (typeof url === "string" && url.includes("amazon.")) {
      console.log(`Generated Amazon URL: ${url} (locale: ${locale})`);
      return new Response(
        JSON.stringify({ amazon_url: url, locale }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback if parsing fails
    return new Response(
      JSON.stringify({ amazon_url: buildFallbackUrl(title, author, "es") }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Amazon link generation error:", error);
    return new Response(
      JSON.stringify({ amazon_url: buildFallbackUrl("", "", "es"), error: "Generation failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
