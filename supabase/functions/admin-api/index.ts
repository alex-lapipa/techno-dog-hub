import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
  }

  // DJ Artists Management
  if (contentType === "dj-artists") {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const search = url.searchParams.get("search") || "";

    if (method === "GET" && segments.length === 2) {
      // List all DJ artists with pagination and search
      let query = supabase
        .from("dj_artists")
        .select("id, rank, artist_name, real_name, nationality, years_active, subgenres, labels, top_tracks, known_for, created_at")
        .order("rank", { ascending: true });

      if (search) {
        query = query.or(`artist_name.ilike.%${search}%,real_name.ilike.%${search}%,known_for.ilike.%${search}%`);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);
      
      if (error) throw error;

      // Get total count
      const { count: totalCount } = await supabase
        .from("dj_artists")
        .select("*", { count: "exact", head: true });

      return { 
        artists: data, 
        count: data?.length || 0,
        total: totalCount || 0,
        offset,
        limit,
      };
    }

    if (method === "GET" && segments.length === 3) {
      // Get specific DJ artist by ID
      const artistId = segments[2];
      const { data, error } = await supabase
        .from("dj_artists")
        .select("*")
        .eq("id", artistId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("DJ artist not found");
      return { artist: data };
    }

    if (method === "POST") {
      // Create new DJ artist
      const body = await req.json();
      
      // Validate required fields
      if (!body.artist_name) {
        throw new Error("artist_name is required");
      }

      const insertData = {
        artist_name: body.artist_name,
        real_name: body.real_name || null,
        nationality: body.nationality || null,
        born: body.born || null,
        died: body.died || null,
        years_active: body.years_active || null,
        subgenres: body.subgenres || [],
        labels: body.labels || [],
        top_tracks: body.top_tracks || [],
        known_for: body.known_for || null,
        rank: body.rank || 9999,
      };

      const { data, error } = await supabase
        .from("dj_artists")
        .insert(insertData)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { created: true, artist: data };
    }

    if (method === "PATCH" && segments.length === 3) {
      // Update existing DJ artist
      const artistId = segments[2];
      const body = await req.json();
      
      const updates: Record<string, any> = {};
      if (body.artist_name !== undefined) updates.artist_name = body.artist_name;
      if (body.real_name !== undefined) updates.real_name = body.real_name;
      if (body.nationality !== undefined) updates.nationality = body.nationality;
      if (body.born !== undefined) updates.born = body.born;
      if (body.died !== undefined) updates.died = body.died;
      if (body.years_active !== undefined) updates.years_active = body.years_active;
      if (body.subgenres !== undefined) updates.subgenres = body.subgenres;
      if (body.labels !== undefined) updates.labels = body.labels;
      if (body.top_tracks !== undefined) updates.top_tracks = body.top_tracks;
      if (body.known_for !== undefined) updates.known_for = body.known_for;
      if (body.rank !== undefined) updates.rank = body.rank;

      const { data, error } = await supabase
        .from("dj_artists")
        .update(updates)
        .eq("id", artistId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("DJ artist not found");
      return { updated: true, artist: data };
    }

    if (method === "DELETE" && segments.length === 3) {
      // Delete DJ artist
      const artistId = segments[2];
      
      // First check if artist exists
      const { data: existing } = await supabase
        .from("dj_artists")
        .select("id, artist_name")
        .eq("id", artistId)
        .maybeSingle();
      
      if (!existing) throw new Error("DJ artist not found");

      const { error } = await supabase
        .from("dj_artists")
        .delete()
        .eq("id", artistId);
      
      if (error) throw error;
      return { deleted: true, artist_name: existing.artist_name };
    }

    // Bulk operations
    if (method === "POST" && segments[2] === "bulk") {
      const body = await req.json();
      const { action, artist_ids, updates } = body;

      if (action === "update" && artist_ids && updates) {
        const { data, error } = await supabase
          .from("dj_artists")
          .update(updates)
          .in("id", artist_ids)
          .select();
        
        if (error) throw error;
        return { updated: true, count: data?.length || 0 };
      }

      if (action === "delete" && artist_ids) {
        const { error } = await supabase
          .from("dj_artists")
          .delete()
          .in("id", artist_ids);
        
        if (error) throw error;
        return { deleted: true, count: artist_ids.length };
      }

      throw new Error("Invalid bulk action");
    }
  }

  // Media Assets Management
  if (contentType === "media-assets") {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const entityType = url.searchParams.get("entity_type") || "";
    const entityId = url.searchParams.get("entity_id") || "";
    const finalSelected = url.searchParams.get("final_selected");

    if (method === "GET" && segments.length === 2) {
      // List media assets with filters
      let query = supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });

      if (entityType) {
        query = query.eq("entity_type", entityType);
      }
      if (entityId) {
        query = query.eq("entity_id", entityId);
      }
      if (finalSelected !== null && finalSelected !== "") {
        query = query.eq("final_selected", finalSelected === "true");
      }

      const { data, error } = await query.range(offset, offset + limit - 1);
      
      if (error) throw error;

      // Get total count
      let countQuery = supabase
        .from("media_assets")
        .select("*", { count: "exact", head: true });
      
      if (entityType) countQuery = countQuery.eq("entity_type", entityType);
      if (entityId) countQuery = countQuery.eq("entity_id", entityId);
      
      const { count: totalCount } = await countQuery;

      return { 
        assets: data, 
        count: data?.length || 0,
        total: totalCount || 0,
        offset,
        limit,
      };
    }

    if (method === "GET" && segments.length === 3) {
      // Get specific media asset
      const assetId = segments[2];
      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("id", assetId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Media asset not found");
      return { asset: data };
    }

    if (method === "POST" && segments.length === 2) {
      // Create new media asset
      const body = await req.json();
      
      if (!body.entity_type || !body.entity_id || !body.entity_name) {
        throw new Error("entity_type, entity_id, and entity_name are required");
      }

      const insertData = {
        entity_type: body.entity_type,
        entity_id: body.entity_id,
        entity_name: body.entity_name,
        source_url: body.source_url || null,
        storage_url: body.storage_url || null,
        storage_path: body.storage_path || null,
        provider: body.provider || null,
        license_status: body.license_status || "unknown",
        license_name: body.license_name || null,
        license_url: body.license_url || null,
        copyright_risk: body.copyright_risk || "unknown",
        alt_text: body.alt_text || null,
        tags: body.tags || [],
        meta: body.meta || {},
        match_score: body.match_score || 0,
        quality_score: body.quality_score || 0,
        openai_verified: body.openai_verified || false,
        final_selected: body.final_selected || false,
        reasoning_summary: body.reasoning_summary || null,
      };

      const { data, error } = await supabase
        .from("media_assets")
        .insert(insertData)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return { created: true, asset: data };
    }

    if (method === "PATCH" && segments.length === 3) {
      // Update media asset
      const assetId = segments[2];
      const body = await req.json();
      
      const updates: Record<string, any> = {};
      if (body.source_url !== undefined) updates.source_url = body.source_url;
      if (body.storage_url !== undefined) updates.storage_url = body.storage_url;
      if (body.storage_path !== undefined) updates.storage_path = body.storage_path;
      if (body.provider !== undefined) updates.provider = body.provider;
      if (body.license_status !== undefined) updates.license_status = body.license_status;
      if (body.license_name !== undefined) updates.license_name = body.license_name;
      if (body.license_url !== undefined) updates.license_url = body.license_url;
      if (body.copyright_risk !== undefined) updates.copyright_risk = body.copyright_risk;
      if (body.alt_text !== undefined) updates.alt_text = body.alt_text;
      if (body.tags !== undefined) updates.tags = body.tags;
      if (body.meta !== undefined) updates.meta = body.meta;
      if (body.match_score !== undefined) updates.match_score = body.match_score;
      if (body.quality_score !== undefined) updates.quality_score = body.quality_score;
      if (body.openai_verified !== undefined) updates.openai_verified = body.openai_verified;
      if (body.final_selected !== undefined) updates.final_selected = body.final_selected;
      if (body.reasoning_summary !== undefined) updates.reasoning_summary = body.reasoning_summary;
      
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("media_assets")
        .update(updates)
        .eq("id", assetId)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("Media asset not found");
      return { updated: true, asset: data };
    }

    if (method === "DELETE" && segments.length === 3) {
      // Delete media asset
      const assetId = segments[2];
      
      const { data: existing } = await supabase
        .from("media_assets")
        .select("id, entity_name, storage_path")
        .eq("id", assetId)
        .maybeSingle();
      
      if (!existing) throw new Error("Media asset not found");

      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", assetId);
      
      if (error) throw error;
      return { deleted: true, entity_name: existing.entity_name };
    }

    // Bulk operations
    if (method === "POST" && segments[2] === "bulk") {
      const body = await req.json();
      const { action, asset_ids, updates } = body;

      if (action === "update" && asset_ids && updates) {
        updates.updated_at = new Date().toISOString();
        const { data, error } = await supabase
          .from("media_assets")
          .update(updates)
          .in("id", asset_ids)
          .select();
        
        if (error) throw error;
        return { updated: true, count: data?.length || 0 };
      }

      if (action === "delete" && asset_ids) {
        const { error } = await supabase
          .from("media_assets")
          .delete()
          .in("id", asset_ids);
        
        if (error) throw error;
        return { deleted: true, count: asset_ids.length };
      }

      if (action === "select_final" && asset_ids) {
        // Mark assets as final selected (and unmark others for same entity)
        const { data: assets } = await supabase
          .from("media_assets")
          .select("entity_type, entity_id")
          .in("id", asset_ids);
        
        if (assets && assets.length > 0) {
          // Unmark all other assets for same entities
          for (const asset of assets) {
            await supabase
              .from("media_assets")
              .update({ final_selected: false, updated_at: new Date().toISOString() })
              .eq("entity_type", asset.entity_type)
              .eq("entity_id", asset.entity_id)
              .not("id", "in", `(${asset_ids.join(",")})`);
          }
        }

        // Mark selected assets
        const { data, error } = await supabase
          .from("media_assets")
          .update({ final_selected: true, updated_at: new Date().toISOString() })
          .in("id", asset_ids)
          .select();
        
        if (error) throw error;
        return { selected: true, count: data?.length || 0 };
      }

      throw new Error("Invalid bulk action");
    }

    // Get assets by entity
    if (method === "GET" && segments[2] === "by-entity") {
      const url = new URL(req.url);
      const type = url.searchParams.get("type");
      const id = url.searchParams.get("id");
      
      if (!type || !id) {
        throw new Error("type and id query params are required");
      }

      const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .eq("entity_type", type)
        .eq("entity_id", id)
        .order("final_selected", { ascending: false })
        .order("quality_score", { ascending: false });
      
      if (error) throw error;
      return { assets: data, count: data?.length || 0 };
    }
  }

  throw new Error("Unknown content endpoint");
}

// System Management Endpoints
async function handleSystem(req: Request, supabase: any, path: string, method: string) {
  const segments = path.split("/").filter(Boolean);
  const systemType = segments[1];
  
  if (systemType === "health") {
    // Get system health overview
    const [alerts, jobs, agents] = await Promise.all([
      supabase.from("health_alerts").select("*").is("resolved_at", null).limit(10),
      supabase.from("media_pipeline_jobs").select("status").in("status", ["queued", "running"]),
      supabase.from("agent_reports").select("*").eq("status", "pending").limit(10),
    ]);
    
    return {
      health: {
        active_alerts: alerts.data?.length || 0,
        pending_jobs: jobs.data?.length || 0,
        pending_reports: agents.data?.length || 0,
        alerts: alerts.data,
      },
    };
  }
  
  if (systemType === "analytics") {
    // Get analytics summary
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from("analytics_events")
      .select("event_type, event_name")
      .gte("created_at", dayAgo.toISOString());
    
    if (error) throw error;
    
    const eventCounts: Record<string, number> = {};
    data?.forEach((e: any) => {
      eventCounts[e.event_name] = (eventCounts[e.event_name] || 0) + 1;
    });
    
    return {
      analytics: {
        period: "24h",
        total_events: data?.length || 0,
        by_event: eventCounts,
      },
    };
  }
  
  if (systemType === "api-usage") {
    // Get API usage stats
    const { data, error } = await supabase
      .from("api_usage")
      .select("endpoint, request_count, window_start")
      .gte("window_start", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("window_start", { ascending: false })
      .limit(100);
    
    if (error) throw error;
    
    const totalRequests = data?.reduce((sum: number, r: any) => sum + r.request_count, 0) || 0;
    
    return {
      api_usage: {
        period: "24h",
        total_requests: totalRequests,
        recent: data?.slice(0, 20),
      },
    };
  }
  
  if (systemType === "audit") {
    // Get recent audit logs
    const { data, error } = await supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return { audit_logs: data };
  }

  if (systemType === "agents" && method === "GET") {
    // Get agent status
    const { data, error } = await supabase
      .from("agent_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return { agent_reports: data };
  }

  throw new Error("Unknown system endpoint");
}

// Log admin action
async function logAdminAction(
  supabase: any,
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, any>
) {
  await supabase.from("admin_audit_log").insert({
    admin_user_id: adminUserId,
    action_type: action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/admin-api", "");
  const method = req.method;

  console.log(`[Admin API] ${method} ${path}`);

  try {
    // Get API key from header
    const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing API key", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate API key
    const validation = await validateAdminApiKey(apiKey, supabase);
    
    if (!validation.valid) {
      console.error(`[Admin API] Auth failed: ${validation.error}`);
      return new Response(
        JSON.stringify({ error: validation.error, code: "FORBIDDEN" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Admin API] Authenticated user: ${validation.userId}`);

    let result: any;
    const segments = path.split("/").filter(Boolean);
    const resource = segments[0];

    // Route to appropriate handler
    switch (resource) {
      case "users":
        result = await handleUsers(req, supabase, path, method);
        break;
      case "content":
        result = await handleContent(req, supabase, path, method);
        break;
      case "system":
        result = await handleSystem(req, supabase, path, method);
        break;
      case "ping":
        result = { 
          status: "ok", 
          timestamp: new Date().toISOString(),
          user_id: validation.userId,
          scopes: validation.scopes,
        };
        break;
      default:
        return new Response(
          JSON.stringify({ 
            error: "Unknown endpoint",
            available_endpoints: [
              "GET /ping - Test authentication",
              "GET /users - List all users",
              "GET /users/:id - Get user details",
              "PATCH /users/:id - Update user",
              "POST /users/roles - Grant/revoke roles",
              "GET /content/articles - List articles (?status=&search=&limit=&offset=)",
              "GET /content/articles/:id - Get full article",
              "POST /content/articles - Create article",
              "PATCH /content/articles/:id - Update article",
              "DELETE /content/articles/:id - Delete article",
              "POST /content/articles/publish - Publish article",
              "POST /content/articles/unpublish - Unpublish article",
              "POST /content/articles/archive - Archive article",
              "POST /content/articles/bulk - Bulk publish/unpublish/archive/delete",
              "GET /content/submissions - List submissions",
              "PATCH /content/submissions/:id - Review submission",
              "GET /content/entities - List entities",
              "POST /content/entities - Create entity",
              "PATCH /content/entities/:id - Update entity",
              "GET /content/dj-artists - List DJ artists (?search=&limit=&offset=)",
              "GET /content/dj-artists/:id - Get DJ artist details",
              "POST /content/dj-artists - Create DJ artist",
              "PATCH /content/dj-artists/:id - Update DJ artist",
              "DELETE /content/dj-artists/:id - Delete DJ artist",
              "POST /content/dj-artists/bulk - Bulk update/delete artists",
              "GET /content/media-assets - List media assets (?entity_type=&entity_id=&final_selected=&limit=&offset=)",
              "GET /content/media-assets/:id - Get media asset details",
              "GET /content/media-assets/by-entity - Get assets by entity (?type=&id=)",
              "POST /content/media-assets - Create media asset",
              "PATCH /content/media-assets/:id - Update media asset",
              "DELETE /content/media-assets/:id - Delete media asset",
              "POST /content/media-assets/bulk - Bulk update/delete/select_final assets",
              "GET /system/health - System health overview",
              "GET /system/analytics - Analytics summary",
              "GET /system/api-usage - API usage stats",
              "GET /system/audit - Audit logs",
              "GET /system/agents - Agent reports",
            ]
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Log the action
    await logAdminAction(
      supabase,
      validation.userId!,
      `${method} ${path}`,
      resource,
      segments[2] || null,
      { scopes: validation.scopes }
    );

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Admin API] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error",
        code: "ERROR"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
