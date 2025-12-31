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
    const { action, bookId, title, author, isbn } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "fetch-single") {
      if (!bookId) {
        return new Response(
          JSON.stringify({ error: "bookId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await findAndStoreCover(supabase, supabaseUrl, bookId, title, author, isbn);
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "fetch-all") {
      const { data: books, error } = await supabase
        .from("books")
        .select("id, title, author, isbn, cover_url")
        .eq("status", "published");

      if (error) throw error;

      const results: any[] = [];
      
      for (const book of books || []) {
        // Skip if already using our storage
        if (book.cover_url?.includes(supabaseUrl)) {
          results.push({ id: book.id, status: "already-stored" });
          continue;
        }

        try {
          const result = await findAndStoreCover(
            supabase, supabaseUrl, book.id, book.title, book.author, book.isbn
          );
          results.push({ id: book.id, title: book.title, ...result });
          await new Promise(r => setTimeout(r, 300));
        } catch (e) {
          results.push({ id: book.id, title: book.title, error: e instanceof Error ? e.message : "Unknown error" });
        }
      }

      return new Response(
        JSON.stringify({ success: true, processed: results.length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Book cover proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function findAndStoreCover(
  supabase: any,
  supabaseUrl: string,
  bookId: string,
  title?: string,
  author?: string,
  isbn?: string
): Promise<{ status: string; newUrl?: string; source?: string; error?: string }> {
  
  // Try multiple sources in order
  const sources = [
    () => tryOpenLibraryByISBN(isbn),
    () => tryOpenLibraryByTitle(title, author),
    () => tryGoogleBooks(title, author),
  ];

  for (const trySource of sources) {
    try {
      const imageUrl = await trySource();
      if (imageUrl) {
        // Fetch and store the image
        const response = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TechnoDogBot/1.0)",
            "Accept": "image/*",
          },
        });

        if (!response.ok) continue;

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const buffer = await response.arrayBuffer();
        
        // Skip tiny images (likely placeholders)
        if (buffer.byteLength < 5000) continue;

        let ext = "jpg";
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("gif")) ext = "gif";

        const fileName = `${bookId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("book-covers")
          .upload(fileName, buffer, {
            contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("book-covers")
          .getPublicUrl(fileName);

        const newUrl = urlData.publicUrl;

        await supabase
          .from("books")
          .update({ cover_url: newUrl })
          .eq("id", bookId);

        return { status: "success", newUrl, source: imageUrl };
      }
    } catch (e) {
      console.error("Source error:", e);
      continue;
    }
  }

  return { status: "no-cover-found" };
}

async function tryOpenLibraryByISBN(isbn?: string | null): Promise<string | null> {
  if (!isbn) return null;
  
  const cleanISBN = isbn.replace(/[-\s]/g, "");
  const url = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg?default=false`;
  
  const response = await fetch(url, { method: "HEAD" });
  if (response.ok && response.headers.get("content-length") !== "0") {
    return url;
  }
  return null;
}

async function tryOpenLibraryByTitle(title?: string, author?: string): Promise<string | null> {
  if (!title) return null;
  
  const query = encodeURIComponent(`${title} ${author || ""}`);
  const searchUrl = `https://openlibrary.org/search.json?q=${query}&limit=3`;
  
  const response = await fetch(searchUrl);
  if (!response.ok) return null;
  
  const data = await response.json();
  const docs = data.docs || [];
  
  for (const doc of docs) {
    if (doc.cover_i) {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    }
  }
  return null;
}

async function tryGoogleBooks(title?: string, author?: string): Promise<string | null> {
  if (!title) return null;
  
  const query = encodeURIComponent(`${title} ${author || ""}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`;
  
  const response = await fetch(url);
  if (!response.ok) return null;
  
  const data = await response.json();
  const items = data.items || [];
  
  for (const item of items) {
    const imageLinks = item.volumeInfo?.imageLinks;
    if (imageLinks?.thumbnail) {
      // Get larger version by modifying the URL
      return imageLinks.thumbnail
        .replace("zoom=1", "zoom=3")
        .replace("&edge=curl", "")
        .replace("http://", "https://");
    }
  }
  return null;
}
