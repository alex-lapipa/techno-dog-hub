import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://techno.dog";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Static pages with priorities
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/artists", priority: "0.9", changefreq: "daily" },
      { url: "/technopedia", priority: "0.9", changefreq: "weekly" },
      { url: "/gear", priority: "0.8", changefreq: "weekly" },
      { url: "/news", priority: "0.8", changefreq: "daily" },
      { url: "/venues", priority: "0.8", changefreq: "weekly" },
      { url: "/festivals", priority: "0.8", changefreq: "weekly" },
      { url: "/labels", priority: "0.8", changefreq: "weekly" },
      { url: "/crews", priority: "0.7", changefreq: "weekly" },
      { url: "/books", priority: "0.7", changefreq: "weekly" },
      { url: "/documentaries", priority: "0.7", changefreq: "weekly" },
      { url: "/store", priority: "0.7", changefreq: "weekly" },
      { url: "/about", priority: "0.5", changefreq: "monthly" },
      { url: "/privacy", priority: "0.3", changefreq: "monthly" },
      { url: "/cookies", priority: "0.3", changefreq: "monthly" },
      { url: "/terms", priority: "0.3", changefreq: "monthly" },
      { url: "/sitemap", priority: "0.3", changefreq: "monthly" },
    ];

    // Fetch dynamic content
    const [artistsRes, booksRes, newsRes] = await Promise.all([
      supabase.from("canonical_artists").select("slug, updated_at").limit(1000),
      supabase.from("books").select("id, updated_at").eq("status", "published").limit(500),
      supabase.from("news_items").select("slug, published_at").eq("status", "published").limit(500),
    ]);

    const today = new Date().toISOString().split("T")[0];

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add artist pages
    if (artistsRes.data) {
      for (const artist of artistsRes.data) {
        const lastmod = artist.updated_at ? new Date(artist.updated_at).toISOString().split("T")[0] : today;
        xml += `  <url>
    <loc>${SITE_URL}/artists/${encodeURIComponent(artist.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add book pages
    if (booksRes.data) {
      for (const book of booksRes.data) {
        const lastmod = book.updated_at ? new Date(book.updated_at).toISOString().split("T")[0] : today;
        xml += `  <url>
    <loc>${SITE_URL}/books/${encodeURIComponent(book.id)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add news pages
    if (newsRes.data) {
      for (const news of newsRes.data) {
        const lastmod = news.published_at ? new Date(news.published_at).toISOString().split("T")[0] : today;
        xml += `  <url>
    <loc>${SITE_URL}/news/${encodeURIComponent(news.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>`,
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/xml" },
      }
    );
  }
});
