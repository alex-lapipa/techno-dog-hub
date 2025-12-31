import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get("url");

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Missing url parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode and validate URL
    const decodedUrl = decodeURIComponent(imageUrl);
    
    // Basic URL validation
    if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Proxying image: ${decodedUrl}`);

    // Fetch the image with appropriate headers
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BookCoverProxy/1.0)",
        "Accept": "image/*",
        "Referer": new URL(decodedUrl).origin,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return new Response(JSON.stringify({ error: "Failed to fetch image" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await response.arrayBuffer();

    // Return proxied image with caching headers
    return new Response(imageBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "X-Proxied-From": new URL(decodedUrl).hostname,
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new Response(JSON.stringify({ error: "Proxy error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
