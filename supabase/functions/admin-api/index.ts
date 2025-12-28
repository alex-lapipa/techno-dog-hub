import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

// Extended CORS headers for admin API (includes x-api-key)
const adminCorsHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface ApiKeyValidation {
  valid: boolean;
  userId?: string;
  scopes?: string[];
  error?: string;
}

async function validateAdminApiKey(apiKey: string, supabase: any): Promise<ApiKeyValidation> {
  if (!apiKey || !apiKey.startsWith("td_")) {
    return { valid: false, error: "Invalid API key format" };
  }

  const prefix = apiKey.split("_").slice(0, 3).join("_");
  
  // Check API key by prefix (for testing with placeholder hash)
  const { data: keyData, error: keyError } = await supabase
    .from("api_keys")
    .select("id, user_id, scopes, status")
    .eq("prefix", prefix)
    .eq("status", "active")
    .maybeSingle();

  if (keyError || !keyData) {
    console.error("API key lookup failed:", keyError);
    return { valid: false, error: "API key not found or inactive" };
  }

  // Check for admin scopes
  const hasAdminScope = keyData.scopes.some((s: string) => 
    s === "admin:full" || s === "write:admin"
  );

  if (!hasAdminScope) {
    return { valid: false, error: "Insufficient permissions - admin scope required" };
  }

  // Verify user has admin role
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", keyData.user_id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !roleData) {
    return { valid: false, error: "User does not have admin role" };
  }

  // Update last used
  await supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyData.id);

  return {
    valid: true,
    userId: keyData.user_id,
    scopes: keyData.scopes,
  };
}

// User Management Endpoints
async function handleUsers(req: Request, supabase: any, path: string, method: string) {
  const segments = path.split("/").filter(Boolean);
  
  if (method === "GET" && segments.length === 1) {
    // List all users with profiles and roles
    const { data, error } = await supabase
      .from("admin_user_overview")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return { users: data, count: data?.length || 0 };
  }

  if (method === "GET" && segments.length === 2) {
    // Get specific user
    const userId = segments[1];
    const { data, error } = await supabase
      .from("admin_user_overview")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error("User not found");
    return { user: data };
  }

  if (method === "PATCH" && segments.length === 2) {
    // Update user profile/status
    const userId = segments[1];
    const body = await req.json();
    
    const updates: Record<string, any> = {};
    if (body.display_name !== undefined) updates.display_name = body.display_name;
    if (body.status !== undefined) updates.status = body.status;
    if (body.trust_score !== undefined) updates.trust_score = body.trust_score;
    
    const { data, error } = await supabase
      .from("community_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return { updated: true, profile: data };
  }

  if (method === "POST" && segments[1] === "roles") {
    // Manage user roles
    const body = await req.json();
    const { user_id, role, action } = body;
    
    if (action === "grant") {
      const { data, error } = await supabase
        .from("user_roles")
        .insert({ user_id, role })
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { granted: true, role: data };
    } else if (action === "revoke") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", role);
      
      if (error) throw error;
      return { revoked: true };
    }
  }

  throw new Error("Unknown users endpoint");
}

// Content Management Endpoints
async function handleContent(req: Request, supabase: any, path: string, method: string) {
  const segments = path.split("/").filter(Boolean);
  const contentType = segments[1]; // articles, submissions, entities, dj-artists
  
  if (contentType === "articles") {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const status = url.searchParams.get("status") || "";
    const search = url.searchParams.get("search") || "";

    // List all articles with filters
    if (method === "GET" && segments.length === 2) {
      let query = supabase
        .from("td_news_articles")
        .select("id, title, subtitle, status, author_pseudonym, city_tags, genre_tags, entity_tags, confidence_score, created_at, updated_at, published_at")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,body_markdown.ilike.%${search}%`);
      }

      const { data, error } = await query.range(offset, offset + limit - 1);
      
      if (error) throw error;

      // Get counts by status
      const [totalRes, draftRes, publishedRes, archivedRes] = await Promise.all([
        supabase.from("td_news_articles").select("*", { count: "exact", head: true }),
        supabase.from("td_news_articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("td_news_articles").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("td_news_articles").select("*", { count: "exact", head: true }).eq("status", "archived"),
      ]);

      return { 
        articles: data, 
        count: data?.length || 0,
        total: totalRes.count || 0,
        stats: {
          draft: draftRes.count || 0,
          published: publishedRes.count || 0,
          archived: archivedRes.count || 0,
        },
        offset,
        limit,
      };
    }

    // Get single article with full content
    if (method === "GET" && segments.length === 3) {
      const articleId = segments[2];
      const { data, error } = await supabase
        .from("td_news_articles")
        .select("*")
        .eq("id", articleId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Article not found");
      return { article: data };
    }

    // Create new article
    if (method === "POST" && segments.length === 2) {
      const body = await req.json();
      
      if (!body.title || !body.body_markdown) {
        throw new Error("title and body_markdown are required");
      }

      const insertData = {
        title: body.title,
        subtitle: body.subtitle || null,
        body_markdown: body.body_markdown,
        author_pseudonym: body.author_pseudonym || "TechnoDog Editorial",
        status: body.status || "draft",
        city_tags: body.city_tags || [],
        genre_tags: body.genre_tags || [],
        entity_tags: body.entity_tags || [],
        source_urls: body.source_urls || [],
        source_snapshots: body.source_snapshots || [],
        confidence_score: body.confidence_score || 0,
        published_at: body.status === "published" ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("td_news_articles")
        .insert(insertData)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { created: true, article: data };
    }
    
    // Update article
    if (method === "PATCH" && segments.length === 3) {
      const articleId = segments[2];
      const body = await req.json();
      
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) updates.title = body.title;
      if (body.subtitle !== undefined) updates.subtitle = body.subtitle;
      if (body.body_markdown !== undefined) updates.body_markdown = body.body_markdown;
      if (body.author_pseudonym !== undefined) updates.author_pseudonym = body.author_pseudonym;
      if (body.status !== undefined) updates.status = body.status;
      if (body.city_tags !== undefined) updates.city_tags = body.city_tags;
      if (body.genre_tags !== undefined) updates.genre_tags = body.genre_tags;
      if (body.entity_tags !== undefined) updates.entity_tags = body.entity_tags;
      if (body.source_urls !== undefined) updates.source_urls = body.source_urls;
      if (body.source_snapshots !== undefined) updates.source_snapshots = body.source_snapshots;
      if (body.confidence_score !== undefined) updates.confidence_score = body.confidence_score;
      
      const { data, error } = await supabase
        .from("td_news_articles")
        .update(updates)
        .eq("id", articleId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Article not found");
      return { updated: true, article: data };
    }
    
    // Delete article
    if (method === "DELETE" && segments.length === 3) {
      const articleId = segments[2];
      
      const { data: existing } = await supabase
        .from("td_news_articles")
        .select("id, title")
        .eq("id", articleId)
        .maybeSingle();
      
      if (!existing) throw new Error("Article not found");

      const { error } = await supabase
        .from("td_news_articles")
        .delete()
        .eq("id", articleId);
      
      if (error) throw error;
      return { deleted: true, title: existing.title };
    }

    // Publish article
    if (method === "POST" && segments[2] === "publish") {
      const body = await req.json();
      const articleId = body.article_id;
      
      if (!articleId) throw new Error("article_id is required");

      const { data, error } = await supabase
        .from("td_news_articles")
        .update({ 
          status: "published", 
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Article not found");
      return { published: true, article: data };
    }

    // Unpublish article (revert to draft)
    if (method === "POST" && segments[2] === "unpublish") {
      const body = await req.json();
      const articleId = body.article_id;
      
      if (!articleId) throw new Error("article_id is required");

      const { data, error } = await supabase
        .from("td_news_articles")
        .update({ 
          status: "draft", 
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Article not found");
      return { unpublished: true, article: data };
    }

    // Archive article
    if (method === "POST" && segments[2] === "archive") {
      const body = await req.json();
      const articleId = body.article_id;
      
      if (!articleId) throw new Error("article_id is required");

      const { data, error } = await supabase
        .from("td_news_articles")
        .update({ 
          status: "archived", 
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Article not found");
      return { archived: true, article: data };
    }

    // Bulk operations
    if (method === "POST" && segments[2] === "bulk") {
      const body = await req.json();
      const { action, article_ids } = body;

      if (!article_ids || !Array.isArray(article_ids) || article_ids.length === 0) {
        throw new Error("article_ids array is required");
      }

      if (action === "publish") {
        const { data, error } = await supabase
          .from("td_news_articles")
          .update({ 
            status: "published", 
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .in("id", article_ids)
          .select();
        
        if (error) throw error;
        return { published: true, count: data?.length || 0 };
      }

      if (action === "unpublish") {
        const { data, error } = await supabase
          .from("td_news_articles")
          .update({ 
            status: "draft", 
            published_at: null,
            updated_at: new Date().toISOString(),
          })
          .in("id", article_ids)
          .select();
        
        if (error) throw error;
        return { unpublished: true, count: data?.length || 0 };
      }

      if (action === "archive") {
        const { data, error } = await supabase
          .from("td_news_articles")
          .update({ 
            status: "archived", 
            updated_at: new Date().toISOString(),
          })
          .in("id", article_ids)
          .select();
        
        if (error) throw error;
        return { archived: true, count: data?.length || 0 };
      }

      if (action === "delete") {
        const { error } = await supabase
          .from("td_news_articles")
          .delete()
          .in("id", article_ids);
        
        if (error) throw error;
        return { deleted: true, count: article_ids.length };
      }

      throw new Error("Invalid bulk action. Use: publish, unpublish, archive, delete");
    }
  }
  
  if (contentType === "submissions") {
    if (method === "GET") {
      const { data, error } = await supabase
        .from("community_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return { submissions: data };
    }
    
    if (method === "PATCH" && segments.length === 3) {
      const submissionId = segments[2];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("community_submissions")
        .update({
          status: body.status,
          admin_notes: body.admin_notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { updated: true, submission: data };
    }
  }
  
  if (contentType === "entities") {
    if (method === "GET") {
      const { data, error } = await supabase
        .from("td_knowledge_entities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return { entities: data };
    }
    
    if (method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("td_knowledge_entities")
        .insert(body)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { created: true, entity: data };
    }
    
    if (method === "PATCH" && segments.length === 3) {
      const entityId = segments[2];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("td_knowledge_entities")
        .update(body)
        .eq("id", entityId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { updated: true, entity: data };
    }
    
    if (method === "DELETE" && segments.length === 3) {
      const entityId = segments[2];
      const { error } = await supabase
        .from("td_knowledge_entities")
        .delete()
        .eq("id", entityId);
      
      if (error) throw error;
      return { deleted: true };
    }
  }
  
  if (contentType === "dj-artists") {
    if (method === "GET") {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const search = url.searchParams.get("search") || "";

      let query = supabase
        .from("dj_artists")
        .select("*")
        .order("rank", { ascending: true })
        .limit(limit);

      if (search) {
        query = query.or(`artist_name.ilike.%${search}%,real_name.ilike.%${search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { artists: data, count: data?.length || 0 };
    }

    if (method === "GET" && segments.length === 3) {
      const artistId = segments[2];
      const { data, error } = await supabase
        .from("dj_artists")
        .select("*")
        .eq("id", artistId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Artist not found");
      return { artist: data };
    }

    if (method === "POST") {
      const body = await req.json();
      const { data, error } = await supabase
        .from("dj_artists")
        .insert(body)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { created: true, artist: data };
    }

    if (method === "PATCH" && segments.length === 3) {
      const artistId = segments[2];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("dj_artists")
        .update(body)
        .eq("id", artistId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { updated: true, artist: data };
    }

    if (method === "DELETE" && segments.length === 3) {
      const artistId = segments[2];
      const { error } = await supabase
        .from("dj_artists")
        .delete()
        .eq("id", artistId);
      
      if (error) throw error;
      return { deleted: true };
    }
  }

  if (contentType === "media") {
    if (method === "GET") {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const entityType = url.searchParams.get("entity_type") || "";

      let query = supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return { assets: data, count: data?.length || 0 };
    }

    if (method === "PATCH" && segments.length === 3) {
      const assetId = segments[2];
      const body = await req.json();
      
      const { data, error } = await supabase
        .from("media_assets")
        .update(body)
        .eq("id", assetId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { updated: true, asset: data };
    }

    if (method === "DELETE" && segments.length === 3) {
      const assetId = segments[2];
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", assetId);
      
      if (error) throw error;
      return { deleted: true };
    }
  }
  
  throw new Error("Unknown content endpoint");
}

// System Management Endpoints
async function handleSystem(req: Request, supabase: any, path: string, method: string) {
  const segments = path.split("/").filter(Boolean);
  const systemType = segments[1];
  
  if (systemType === "health") {
    const checks = await Promise.all([
      supabase.from("td_news_articles").select("id", { count: "exact", head: true }),
      supabase.from("community_submissions").select("id", { count: "exact", head: true }),
      supabase.from("dj_artists").select("id", { count: "exact", head: true }),
      supabase.from("agent_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      counts: {
        articles: checks[0].count || 0,
        submissions: checks[1].count || 0,
        artists: checks[2].count || 0,
        pending_reports: checks[3].count || 0,
      }
    };
  }
  
  if (systemType === "analytics") {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_type, event_name, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);
    
    if (error) throw error;
    
    // Aggregate by event type
    const byType: Record<string, number> = {};
    for (const event of data || []) {
      byType[event.event_type] = (byType[event.event_type] || 0) + 1;
    }
    
    return { events: data, summary: byType, days };
  }
  
  if (systemType === "api-usage") {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from("api_usage")
      .select("endpoint, request_count, window_start, api_key_id")
      .gte("window_start", since)
      .order("window_start", { ascending: false })
      .limit(500);
    
    if (error) throw error;
    
    // Aggregate by endpoint
    const byEndpoint: Record<string, number> = {};
    for (const usage of data || []) {
      byEndpoint[usage.endpoint] = (byEndpoint[usage.endpoint] || 0) + usage.request_count;
    }
    
    return { usage: data, summary: byEndpoint, days };
  }

  if (systemType === "audit-log") {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const actionType = url.searchParams.get("action_type") || "";

    let query = supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (actionType) {
      query = query.eq("action_type", actionType);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { logs: data, count: data?.length || 0 };
  }

  if (systemType === "agent-reports") {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const status = url.searchParams.get("status") || "";
    const severity = url.searchParams.get("severity") || "";

    let query = supabase
      .from("agent_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }
    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { reports: data, count: data?.length || 0 };
  }
  
  throw new Error("Unknown system endpoint");
}

// Log admin action
async function logAdminAction(
  supabase: any,
  userId: string,
  actionType: string,
  entityType: string,
  entityId: string | null,
  details: any,
  req: Request
) {
  try {
    await supabase.from("admin_audit_log").insert({
      admin_user_id: userId,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      details,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
      user_agent: req.headers.get("user-agent"),
    });
  } catch (e) {
    console.error("Failed to log admin action:", e);
  }
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: adminCorsHeaders });
  }

  try {
    const supabase = createServiceClient();
    const url = new URL(req.url);
    const path = url.pathname.replace("/admin-api", "");
    const method = req.method;

    console.log(`Admin API: ${method} ${path}`);

    // Simple health check (no auth required)
    if (path === "/ping" || path === "/") {
      return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
        headers: { ...adminCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate API key
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key required" }), {
        status: 401,
        headers: { ...adminCorsHeaders, "Content-Type": "application/json" },
      });
    }

    const validation = await validateAdminApiKey(apiKey, supabase);
    
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 403,
        headers: { ...adminCorsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any;
    let entityType = "unknown";
    let actionType = method;

    // Route to appropriate handler
    if (path.startsWith("/users")) {
      entityType = "users";
      result = await handleUsers(req, supabase, path, method);
    } else if (path.startsWith("/content")) {
      entityType = "content";
      result = await handleContent(req, supabase, path, method);
    } else if (path.startsWith("/system")) {
      entityType = "system";
      result = await handleSystem(req, supabase, path, method);
    } else {
      return new Response(JSON.stringify({ error: "Unknown endpoint" }), {
        status: 404,
        headers: { ...adminCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the action
    await logAdminAction(
      supabase,
      validation.userId!,
      actionType,
      entityType,
      null,
      { path, result: result ? "success" : "unknown" },
      req
    );

    return new Response(JSON.stringify(result), {
      headers: { ...adminCorsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Admin API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...adminCorsHeaders, "Content-Type": "application/json" },
    });
  }
});
