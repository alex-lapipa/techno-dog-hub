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
    const { action, bookId } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "restore-single") {
      if (!bookId) {
        return new Response(
          JSON.stringify({ error: "bookId required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: book, error: fetchError } = await supabase
        .from("books")
        .select("id, title, author, isbn")
        .eq("id", bookId)
        .single();

      if (fetchError || !book) {
        return new Response(
          JSON.stringify({ error: "Book not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await findRealCover(supabase, supabaseUrl, book.id, book.title, book.author, book.isbn);
      return new Response(
        JSON.stringify({ ...result, title: book.title }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "restore-all") {
      const { data: books, error } = await supabase
        .from("books")
        .select("id, title, author, isbn, cover_url")
        .eq("status", "published");

      if (error) throw error;

      const results: any[] = [];
      let restored = 0;
      let keptAi = 0;
      
      for (const book of books || []) {
        try {
          console.log(`Processing: ${book.title}`);
          const result = await findRealCover(
            supabase, supabaseUrl, book.id, book.title, book.author, book.isbn
          );
          
          if (result.status === "restored") {
            restored++;
          } else {
            keptAi++;
          }
          
          results.push({ id: book.id, title: book.title, ...result });
          // Rate limiting
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          results.push({ 
            id: book.id, 
            title: book.title, 
            status: "error",
            error: e instanceof Error ? e.message : "Unknown error" 
          });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          total: books?.length || 0,
          restored,
          keptAi,
          results 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use 'restore-single' or 'restore-all'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Restore book covers error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function findRealCover(
  supabase: any,
  supabaseUrl: string,
  bookId: string,
  title: string,
  author?: string,
  isbn?: string
): Promise<{ status: string; newUrl?: string; source?: string; error?: string }> {
  
  // Try multiple sources to find a REAL cover (not AI)
  const sources = [
    { name: "OpenLibrary-ISBN", fn: () => tryOpenLibraryByISBN(isbn) },
    { name: "OpenLibrary-Title", fn: () => tryOpenLibraryByTitle(title, author) },
    { name: "GoogleBooks", fn: () => tryGoogleBooks(title, author) },
  ];

  for (const source of sources) {
    try {
      const imageUrl = await source.fn();
      if (imageUrl) {
        console.log(`Found cover for "${title}" from ${source.name}: ${imageUrl}`);
        
        // Fetch and verify the image
        const response = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; TechnoDogBot/1.0)",
            "Accept": "image/*",
          },
        });

        if (!response.ok) {
          console.log(`Failed to fetch image from ${source.name}: ${response.status}`);
          continue;
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const buffer = await response.arrayBuffer();
        
        // Skip tiny images (likely placeholders or errors)
        if (buffer.byteLength < 5000) {
          console.log(`Image too small from ${source.name}: ${buffer.byteLength} bytes`);
          continue;
        }

        console.log(`Valid image from ${source.name}: ${buffer.byteLength} bytes`);

        let ext = "jpg";
        if (contentType.includes("png")) ext = "png";
        else if (contentType.includes("webp")) ext = "webp";
        else if (contentType.includes("gif")) ext = "gif";

        const fileName = `${bookId}.${ext}`;

        // Upload to storage (overwrites AI cover)
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

        const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        // Update database
        await supabase
          .from("books")
          .update({ cover_url: newUrl })
          .eq("id", bookId);

        return { 
          status: "restored", 
          newUrl, 
          source: source.name 
        };
      }
    } catch (e) {
      console.error(`Error from ${source.name}:`, e);
      continue;
    }
  }

  // No real cover found - keep the AI cover
  return { status: "kept-ai", source: "No real cover available" };
}

async function tryOpenLibraryByISBN(isbn?: string | null): Promise<string | null> {
  if (!isbn) return null;
  
  const cleanISBN = isbn.replace(/[-\s]/g, "");
  const url = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg?default=false`;
  
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    if (response.ok && contentLength && parseInt(contentLength) > 5000) {
      return url;
    }
  } catch (e) {
    console.error("OpenLibrary ISBN error:", e);
  }
  return null;
}

async function tryOpenLibraryByTitle(title: string, author?: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${title} ${author || ""}`);
    const searchUrl = `https://openlibrary.org/search.json?q=${query}&limit=5`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    const docs = data.docs || [];
    
    // Look for exact or close title match
    for (const doc of docs) {
      if (doc.cover_i) {
        const docTitle = (doc.title || "").toLowerCase();
        const searchTitle = title.toLowerCase();
        
        // Accept if titles are similar
        if (docTitle.includes(searchTitle.substring(0, 20)) || 
            searchTitle.includes(docTitle.substring(0, 20))) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
    
    // Fallback: just use first result with cover
    for (const doc of docs) {
      if (doc.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }
  } catch (e) {
    console.error("OpenLibrary title search error:", e);
  }
  return null;
}

async function tryGoogleBooks(title: string, author?: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`intitle:${title} ${author ? `inauthor:${author}` : ""}`);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const items = data.items || [];
    
    for (const item of items) {
      const imageLinks = item.volumeInfo?.imageLinks;
      if (imageLinks?.thumbnail) {
        // Get larger version
        return imageLinks.thumbnail
          .replace("zoom=1", "zoom=2")
          .replace("&edge=curl", "")
          .replace("http://", "https://");
      }
    }
  } catch (e) {
    console.error("Google Books error:", e);
  }
  return null;
}
