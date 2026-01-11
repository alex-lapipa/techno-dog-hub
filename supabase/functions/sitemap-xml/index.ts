import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://techno.dog";

// Escape special XML characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Format date to W3C datetime format (YYYY-MM-DD)
function formatDate(date: string | null, fallback: string): string {
  if (!date) return fallback;
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return fallback;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[sitemap-xml] Generating sitemap...");

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Static pages with priorities - comprehensive list for Google Search Console
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/artists", priority: "0.9", changefreq: "daily" },
      { url: "/artists/gallery", priority: "0.8", changefreq: "weekly" },
      { url: "/technopedia", priority: "0.9", changefreq: "weekly" },
      { url: "/gear", priority: "0.8", changefreq: "weekly" },
      { url: "/news", priority: "0.9", changefreq: "daily" },
      { url: "/news/archive", priority: "0.7", changefreq: "daily" },
      { url: "/venues", priority: "0.8", changefreq: "weekly" },
      { url: "/festivals", priority: "0.8", changefreq: "weekly" },
      { url: "/labels", priority: "0.8", changefreq: "weekly" },
      { url: "/crews", priority: "0.7", changefreq: "weekly" },
      { url: "/books", priority: "0.7", changefreq: "weekly" },
      { url: "/documentaries", priority: "0.7", changefreq: "weekly" },
      { url: "/releases", priority: "0.7", changefreq: "weekly" },
      { url: "/store", priority: "0.7", changefreq: "weekly" },
      { url: "/store/lookbook", priority: "0.6", changefreq: "monthly" },
      { url: "/doggies", priority: "0.6", changefreq: "weekly" },
      { url: "/community", priority: "0.7", changefreq: "weekly" },
      { url: "/developer", priority: "0.6", changefreq: "monthly" },
      { url: "/api-docs", priority: "0.6", changefreq: "monthly" },
      { url: "/search", priority: "0.7", changefreq: "daily" },
      { url: "/about", priority: "0.5", changefreq: "monthly" },
      { url: "/support", priority: "0.5", changefreq: "monthly" },
      { url: "/training", priority: "0.5", changefreq: "monthly" },
      { url: "/privacy", priority: "0.3", changefreq: "yearly" },
      { url: "/cookies", priority: "0.3", changefreq: "yearly" },
      { url: "/terms", priority: "0.3", changefreq: "yearly" },
      { url: "/sitemap", priority: "0.4", changefreq: "weekly" },
    ];

    // Fetch all dynamic content in parallel (including new gear and collectives)
    const [artistsRes, booksRes, newsRes, venuesRes, festivalsRes, labelsRes, documentariesRes, gearRes, collectivesRes] = await Promise.all([
      supabase.from("canonical_artists").select("slug, updated_at").limit(5000),
      supabase.from("books").select("id, updated_at").eq("status", "published").limit(1000),
      supabase.from("td_news_articles").select("slug, updated_at").eq("status", "published").limit(1000),
      supabase.from("venues").select("slug, updated_at").limit(2000),
      supabase.from("festivals").select("slug, updated_at").limit(500),
      supabase.from("labels").select("slug, updated_at").limit(2000),
      supabase.from("documentaries").select("slug, updated_at").eq("status", "published").limit(500),
      supabase.from("gear_catalog").select("slug, updated_at").limit(1000),
      supabase.from("collectives").select("slug, updated_at").limit(500),
    ]);

    // Build XML sitemap - Google Search Console compliant format
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
      console.log(`[sitemap-xml] Adding ${artistsRes.data.length} artists`);
      for (const artist of artistsRes.data) {
        if (!artist.slug) continue;
        const lastmod = formatDate(artist.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/artists/${escapeXml(encodeURIComponent(artist.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add venue pages
    if (venuesRes.data) {
      console.log(`[sitemap-xml] Adding ${venuesRes.data.length} venues`);
      for (const venue of venuesRes.data) {
        if (!venue.slug) continue;
        const lastmod = formatDate(venue.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/venues/${escapeXml(encodeURIComponent(venue.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add festival pages
    if (festivalsRes.data) {
      console.log(`[sitemap-xml] Adding ${festivalsRes.data.length} festivals`);
      for (const festival of festivalsRes.data) {
        if (!festival.slug) continue;
        const lastmod = formatDate(festival.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/festivals/${escapeXml(encodeURIComponent(festival.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add label pages
    if (labelsRes.data) {
      console.log(`[sitemap-xml] Adding ${labelsRes.data.length} labels`);
      for (const label of labelsRes.data) {
        if (!label.slug) continue;
        const lastmod = formatDate(label.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/labels/${escapeXml(encodeURIComponent(label.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add book pages
    if (booksRes.data) {
      console.log(`[sitemap-xml] Adding ${booksRes.data.length} books`);
      for (const book of booksRes.data) {
        if (!book.id) continue;
        const lastmod = formatDate(book.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/books/${escapeXml(encodeURIComponent(book.id))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
    }

    // Add documentary pages
    if (documentariesRes.data) {
      console.log(`[sitemap-xml] Adding ${documentariesRes.data.length} documentaries`);
      for (const doc of documentariesRes.data) {
        if (!doc.slug) continue;
        const lastmod = formatDate(doc.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/documentaries/${escapeXml(encodeURIComponent(doc.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
    }

    // Add news pages
    if (newsRes.data) {
      console.log(`[sitemap-xml] Adding ${newsRes.data.length} news articles`);
      for (const news of newsRes.data) {
        if (!news.slug) continue;
        const lastmod = formatDate(news.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/news/${escapeXml(encodeURIComponent(news.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add gear pages
    if (gearRes.data) {
      console.log(`[sitemap-xml] Adding ${gearRes.data.length} gear items`);
      for (const gear of gearRes.data) {
        if (!gear.slug) continue;
        const lastmod = formatDate(gear.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/gear/${escapeXml(encodeURIComponent(gear.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
    }

    // Add collective pages
    if (collectivesRes.data) {
      console.log(`[sitemap-xml] Adding ${collectivesRes.data.length} collectives`);
      for (const collective of collectivesRes.data) {
        if (!collective.slug) continue;
        const lastmod = formatDate(collective.updated_at, today);
        xml += `  <url>
    <loc>${SITE_URL}/crews/${escapeXml(encodeURIComponent(collective.slug))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
      }
    }

    xml += `</urlset>`;

    const totalUrls = staticPages.length + 
      (artistsRes.data?.length || 0) + 
      (venuesRes.data?.length || 0) + 
      (festivalsRes.data?.length || 0) + 
      (labelsRes.data?.length || 0) + 
      (booksRes.data?.length || 0) + 
      (documentariesRes.data?.length || 0) + 
      (newsRes.data?.length || 0) +
      (gearRes.data?.length || 0) +
      (collectivesRes.data?.length || 0);

    console.log(`[sitemap-xml] Generated sitemap with ${totalUrls} URLs`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Robots-Tag": "noindex", // Sitemap itself shouldn't be indexed
      },
    });
  } catch (error) {
    console.error("[sitemap-xml] Generation error:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>\n</urlset>`,
      {
        status: 200, // Return valid minimal sitemap instead of error
        headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
});
