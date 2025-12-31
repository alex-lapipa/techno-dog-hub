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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get books without covers
    const { data: booksWithoutCovers, error: fetchError } = await supabase
      .from("books")
      .select("id, title, author, year_published")
      .is("cover_url", null)
      .eq("status", "published")
      .limit(10);

    if (fetchError) throw fetchError;

    if (!booksWithoutCovers || booksWithoutCovers.length === 0) {
      return new Response(
        JSON.stringify({ message: "All books have covers", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${booksWithoutCovers.length} books without covers`);

    const results: { id: string; title: string; cover_url: string | null; error?: string }[] = [];

    for (const book of booksWithoutCovers) {
      try {
        console.log(`Searching cover for: ${book.title} by ${book.author}`);

        // Use Gemini to find a reliable cover URL
        const prompt = `Find the book cover image URL for this book:
Title: "${book.title}"
Author: ${book.author}
${book.year_published ? `Year: ${book.year_published}` : ""}

Return ONLY a valid, working image URL for the book cover. Prefer these sources in order:
1. Amazon product images (images-na.ssl-images-amazon.com)
2. Goodreads cover images (images.gr-assets.com or images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com)
3. Publisher websites
4. MIT Press, Velocity Press, or other academic publishers

The URL must:
- Be a direct link to an image file (ends in .jpg, .jpeg, .png, or contains /images/)
- Be publicly accessible without authentication
- Be the actual book cover, not a placeholder

Return ONLY the URL, nothing else. If you cannot find a reliable cover URL, respond with "NOT_FOUND".`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: "You are a librarian assistant that finds book cover image URLs. Return only valid, working image URLs. No explanations, no markdown, just the URL."
              },
              { role: "user", content: prompt }
            ],
            max_tokens: 500,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Gemini API error for ${book.title}:`, errorText);
          results.push({ id: book.id, title: book.title, cover_url: null, error: "API error" });
          continue;
        }

        const data = await response.json();
        const coverUrl = data.choices?.[0]?.message?.content?.trim();

        if (coverUrl && coverUrl !== "NOT_FOUND" && (coverUrl.startsWith("http://") || coverUrl.startsWith("https://"))) {
          // Validate the URL is accessible
          try {
            const checkResponse = await fetch(coverUrl, { method: "HEAD" });
            if (checkResponse.ok) {
              // Update the book with the cover URL
              const { error: updateError } = await supabase
                .from("books")
                .update({ cover_url: coverUrl })
                .eq("id", book.id);

              if (updateError) {
                console.error(`Failed to update ${book.title}:`, updateError);
                results.push({ id: book.id, title: book.title, cover_url: null, error: "Update failed" });
              } else {
                console.log(`Updated cover for: ${book.title}`);
                results.push({ id: book.id, title: book.title, cover_url: coverUrl });
              }
            } else {
              console.log(`Cover URL not accessible for ${book.title}: ${coverUrl}`);
              results.push({ id: book.id, title: book.title, cover_url: null, error: "URL not accessible" });
            }
          } catch (checkError) {
            console.log(`Failed to verify cover URL for ${book.title}:`, checkError);
            results.push({ id: book.id, title: book.title, cover_url: null, error: "Verification failed" });
          }
        } else {
          console.log(`No valid cover found for: ${book.title}`);
          results.push({ id: book.id, title: book.title, cover_url: null, error: "Not found" });
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (bookError) {
        console.error(`Error processing ${book.title}:`, bookError);
        results.push({ id: book.id, title: book.title, cover_url: null, error: String(bookError) });
      }
    }

    const updated = results.filter(r => r.cover_url).length;

    return new Response(
      JSON.stringify({
        message: `Processed ${booksWithoutCovers.length} books, updated ${updated} covers`,
        results,
        updated
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in librarian-fetch-covers:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
