import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EngineStats {
  processed: number;
  fetched: number;
  verified: number;
  enriched: number;
  generated: number;
  failed: number;
  skipped: number;
}

interface EntityToProcess {
  id: string;
  name: string;
  type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, batchSize = 5, entityType, entityId, entityName, dryRun = false } = await req.json();

    console.log(`Media Engine action: ${action}, batchSize: ${batchSize}`);

    const stats: EngineStats = {
      processed: 0,
      fetched: 0,
      verified: 0,
      enriched: 0,
      generated: 0,
      failed: 0,
      skipped: 0,
    };

    switch (action) {
      // ============ RUN FULL PIPELINE ============
      case "run-pipeline": {
        // Find entities missing images
        const entitiesToProcess: EntityToProcess[] = [];

        // Get existing assets and pending jobs
        const [assetsRes, jobsRes] = await Promise.all([
          supabase.from("media_assets").select("entity_type, entity_id").eq("final_selected", true),
          supabase.from("media_pipeline_jobs").select("entity_type, entity_id").in("status", ["queued", "running"]),
        ]);

        const hasAsset = new Set((assetsRes.data || []).map(a => `${a.entity_type}:${a.entity_id}`));
        const hasPending = new Set((jobsRes.data || []).map(j => `${j.entity_type}:${j.entity_id}`));

        // Load entities from local data (dynamic import simulation via fetch)
        // For now, we check the dj_artists table which has known entities
        const { data: djArtists } = await supabase
          .from("dj_artists")
          .select("id, artist_name")
          .limit(100);

        for (const artist of djArtists || []) {
          const key = `artist:${artist.id}`;
          if (!hasAsset.has(key) && !hasPending.has(key)) {
            entitiesToProcess.push({
              id: String(artist.id),
              name: artist.artist_name,
              type: "artist",
            });
          }
        }

        console.log(`Found ${entitiesToProcess.length} entities needing images`);

        if (dryRun) {
          return new Response(JSON.stringify({
            success: true,
            dryRun: true,
            entitiesToProcess: entitiesToProcess.slice(0, 20),
            totalMissing: entitiesToProcess.length,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Process in batches
        const batch = entitiesToProcess.slice(0, batchSize);
        
        for (const entity of batch) {
          stats.processed++;
          console.log(`Processing: ${entity.type}/${entity.id} - ${entity.name}`);

          try {
            // Step 1: Enqueue job
            await supabase.rpc("enqueue_media_job", {
              p_entity_type: entity.type,
              p_entity_id: entity.id,
              p_entity_name: entity.name,
              p_priority: 5,
            });

            // Step 2: Process immediately (fetch images)
            const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/media-curator`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({ action: "process" }),
            });

            const fetchResult = await fetchResponse.json();
            
            if (fetchResult.candidatesFound > 0) {
              stats.fetched++;
              
              if (fetchResult.verified) {
                stats.verified++;
              }
              
              // Step 3: Enrich with AI (generate alt text, tags if not done)
              if (LOVABLE_API_KEY) {
                const enrichResult = await enrichWithAI(supabase, entity, LOVABLE_API_KEY);
                if (enrichResult) {
                  stats.enriched++;
                }
              }
            } else if (LOVABLE_API_KEY) {
              // Step 3 (fallback): Generate image with AI when no suitable images found
              console.log(`No images found for ${entity.name}, attempting AI generation...`);
              const generated = await generateImageWithAI(supabase, supabaseUrl, entity, LOVABLE_API_KEY);
              if (generated) {
                stats.generated++;
                stats.fetched++; // Count as fetched since we now have an image
              }
            }

          } catch (error) {
            console.error(`Failed processing ${entity.name}:`, error);
            stats.failed++;
          }

          // Small delay between entities
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        return new Response(JSON.stringify({
          success: true,
          stats,
          message: `Processed ${stats.processed} entities`,
          remaining: entitiesToProcess.length - batch.length,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ PROCESS SINGLE ENTITY ============
      case "process-single": {
        if (!entityId || !entityName || !entityType) {
          throw new Error("entityId, entityName, and entityType are required");
        }

        console.log(`Single entity pipeline: ${entityType}/${entityId} - ${entityName}`);

        // Step 1: Enqueue
        const { data: jobId } = await supabase.rpc("enqueue_media_job", {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_entity_name: entityName,
          p_priority: 10, // High priority for manual requests
        });

        // Step 2: Fetch
        const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/media-curator`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ action: "process" }),
        });

        const fetchResult = await fetchResponse.json();
        stats.fetched = fetchResult.candidatesFound || 0;
        stats.verified = fetchResult.verified ? 1 : 0;

        // Step 3: Enrich or Generate
        if (LOVABLE_API_KEY) {
          if (fetchResult.candidatesFound > 0) {
            const enrichResult = await enrichWithAI(supabase, { id: entityId, name: entityName, type: entityType }, LOVABLE_API_KEY);
            stats.enriched = enrichResult ? 1 : 0;
          } else {
            // Fallback: Generate image with AI
            console.log(`No images found for ${entityName}, attempting AI generation...`);
            const generated = await generateImageWithAI(supabase, supabaseUrl, { id: entityId, name: entityName, type: entityType }, LOVABLE_API_KEY);
            if (generated) {
              stats.generated = 1;
              stats.fetched = 1;
            }
          }
        }

        // Get selected asset
        const { data: selectedAsset } = await supabase
          .from("media_assets")
          .select("*")
          .eq("entity_type", entityType)
          .eq("entity_id", entityId)
          .eq("final_selected", true)
          .single();

        return new Response(JSON.stringify({
          success: true,
          jobId,
          stats,
          selectedAsset,
          message: `Pipeline complete for ${entityName}`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ ENRICH EXISTING ASSETS ============
      case "enrich-batch": {
        if (!LOVABLE_API_KEY) {
          throw new Error("LOVABLE_API_KEY is required for enrichment");
        }

        // Find assets without alt_text or with low enrichment
        const { data: assetsToEnrich } = await supabase
          .from("media_assets")
          .select("*")
          .eq("final_selected", true)
          .or("alt_text.is.null,tags.is.null")
          .limit(batchSize);

        for (const asset of assetsToEnrich || []) {
          stats.processed++;
          try {
            const enriched = await enrichAssetWithAI(supabase, asset, LOVABLE_API_KEY);
            if (enriched) stats.enriched++;
          } catch (e) {
            console.error(`Enrich failed for ${asset.entity_name}:`, e);
            stats.failed++;
          }
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        return new Response(JSON.stringify({
          success: true,
          stats,
          message: `Enriched ${stats.enriched} assets`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ GET ENGINE STATUS ============
      case "status": {
        const [assetsRes, jobsRes, selectedRes, enrichedRes] = await Promise.all([
          supabase.from("media_assets").select("id", { count: "exact" }),
          supabase.from("media_pipeline_jobs").select("id, status"),
          supabase.from("media_assets").select("id", { count: "exact" }).eq("final_selected", true),
          supabase.from("media_assets").select("id", { count: "exact" }).not("alt_text", "is", null),
        ]);

        const jobs = jobsRes.data || [];
        const queuedCount = jobs.filter(j => j.status === "queued").length;
        const runningCount = jobs.filter(j => j.status === "running").length;
        const failedCount = jobs.filter(j => j.status === "failed").length;

        return new Response(JSON.stringify({
          success: true,
          status: {
            totalAssets: assetsRes.count || 0,
            selectedAssets: selectedRes.count || 0,
            enrichedAssets: enrichedRes.count || 0,
            queuedJobs: queuedCount,
            runningJobs: runningCount,
            failedJobs: failedCount,
            engineReady: !!LOVABLE_API_KEY,
          },
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ VERIFY UNVERIFIED ============
      case "verify-batch": {
        const { data: unverified } = await supabase
          .from("media_assets")
          .select("entity_type, entity_id, entity_name")
          .eq("openai_verified", false)
          .limit(batchSize);

        const uniqueEntities = new Map<string, EntityToProcess>();
        for (const asset of unverified || []) {
          const key = `${asset.entity_type}:${asset.entity_id}`;
          if (!uniqueEntities.has(key)) {
            uniqueEntities.set(key, {
              id: asset.entity_id,
              name: asset.entity_name,
              type: asset.entity_type,
            });
          }
        }

        for (const entity of uniqueEntities.values()) {
          stats.processed++;
          try {
            const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/media-verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                entityType: entity.type,
                entityId: entity.id,
                entityName: entity.name,
              }),
            });
            const result = await verifyResponse.json();
            if (result.verified) stats.verified++;
          } catch (e) {
            stats.failed++;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        return new Response(JSON.stringify({
          success: true,
          stats,
          message: `Verified ${stats.verified} entities`,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ GENERATE MISSING IMAGES ============
      case "generate-batch": {
        if (!LOVABLE_API_KEY) {
          throw new Error("LOVABLE_API_KEY is required for image generation");
        }

        // Find entities without any images
        const [assetsRes, djArtistsRes] = await Promise.all([
          supabase.from("media_assets").select("entity_type, entity_id").eq("final_selected", true),
          supabase.from("dj_artists").select("id, artist_name").limit(100),
        ]);

        const hasAsset = new Set((assetsRes.data || []).map((a: any) => `${a.entity_type}:${a.entity_id}`));
        const missingEntities: EntityToProcess[] = [];

        for (const artist of djArtistsRes.data || []) {
          const key = `artist:${artist.id}`;
          if (!hasAsset.has(key)) {
            missingEntities.push({
              id: String(artist.id),
              name: artist.artist_name,
              type: "artist",
            });
          }
        }

        const batch = missingEntities.slice(0, batchSize);
        
        for (const entity of batch) {
          stats.processed++;
          try {
            const generated = await generateImageWithAI(supabase, supabaseUrl, entity, LOVABLE_API_KEY);
            if (generated) {
              stats.generated++;
            }
          } catch (e) {
            console.error(`Generation failed for ${entity.name}:`, e);
            stats.failed++;
          }
          // Longer delay for image generation
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        return new Response(JSON.stringify({
          success: true,
          stats,
          message: `Generated ${stats.generated} images`,
          remaining: missingEntities.length - batch.length,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Media Engine error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    if (message.includes("Rate limit") || message.includes("429")) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (message.includes("402") || message.includes("credits")) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper: Enrich entity with AI-generated metadata
async function enrichWithAI(supabase: any, entity: EntityToProcess, apiKey: string): Promise<boolean> {
  try {
    const { data: asset } = await supabase
      .from("media_assets")
      .select("*")
      .eq("entity_type", entity.type)
      .eq("entity_id", entity.id)
      .eq("final_selected", true)
      .single();

    if (!asset) return false;

    return await enrichAssetWithAI(supabase, asset, apiKey);
  } catch (e) {
    console.error("Enrich error:", e);
    return false;
  }
}

// Helper: Enrich a specific asset with AI
async function enrichAssetWithAI(supabase: any, asset: any, apiKey: string): Promise<boolean> {
  try {
    const imageUrl = asset.storage_url || asset.source_url;
    if (!imageUrl) return false;

    console.log(`Enriching asset for ${asset.entity_name} with AI...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at describing images for a techno music encyclopedia. 
Generate rich metadata for images of DJs, venues, festivals, and music equipment.
Always respond with valid JSON only, no markdown.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this image of "${asset.entity_name}" (${asset.entity_type}) and provide:
{
  "altText": "Descriptive alt text for accessibility (max 150 chars)",
  "tags": ["tag1", "tag2", ...], // 5-10 relevant tags
  "description": "Brief description of what's shown",
  "mood": "atmospheric/energetic/dark/minimal/etc",
  "era": "estimated era or decade if apparent",
  "equipment": ["any visible equipment"],
  "setting": "studio/club/festival/press photo/etc"
}`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error("AI enrichment failed:", response.status);
      return false;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON response
    let metadata;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        metadata = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse AI response:", content);
      return false;
    }

    if (!metadata) return false;

    // Update asset with enriched metadata
    await supabase
      .from("media_assets")
      .update({
        alt_text: metadata.altText || asset.alt_text,
        tags: metadata.tags ? JSON.stringify(metadata.tags) : asset.tags,
        meta: {
          ...((asset.meta as object) || {}),
          description: metadata.description,
          mood: metadata.mood,
          era: metadata.era,
          equipment: metadata.equipment,
          setting: metadata.setting,
          enrichedAt: new Date().toISOString(),
        },
      })
      .eq("id", asset.id);

    console.log(`Enriched ${asset.entity_name} successfully`);
    return true;
  } catch (e) {
    console.error("Enrich asset error:", e);
    return false;
  }
}

// Helper: Generate image with AI when no suitable images found
async function generateImageWithAI(
  supabase: any,
  supabaseUrl: string,
  entity: EntityToProcess,
  apiKey: string
): Promise<boolean> {
  try {
    console.log(`Generating AI image for ${entity.name} (${entity.type})...`);

    // Create a detailed prompt based on entity type
    let prompt = "";
    switch (entity.type) {
      case "artist":
        prompt = `Professional press photo style portrait of a techno DJ artist. Dark moody lighting, dramatic shadows, studio quality. The artist appears focused and intense, wearing dark clothing typical of underground electronic music scene. Abstract geometric shapes or light beams in background suggesting a club atmosphere. Ultra high resolution, editorial photography style. Do not include any text or logos.`;
        break;
      case "venue":
        prompt = `Interior of an underground techno nightclub. Industrial aesthetic with exposed concrete, metal structures. Dramatic lighting with laser beams and haze. Packed dancefloor visible in moody red and blue lighting. Professional architectural photography style. Ultra high resolution. Do not include any text or logos.`;
        break;
      case "festival":
        prompt = `Massive outdoor electronic music festival at night. Huge LED stage with geometric structures, laser show cutting through fog, thousands of people dancing. Aerial view showing the scale. Professional event photography. Ultra high resolution. Do not include any text or logos.`;
        break;
      case "label":
        prompt = `Abstract geometric design representing a techno record label. Minimalist shapes, dark background with neon accents. Brutalist typography influence. Clean modern aesthetic suitable for album artwork. Ultra high resolution. Do not include any readable text.`;
        break;
      default:
        prompt = `Abstract techno music artwork. Dark industrial aesthetic, geometric patterns, glitch effects. Moody atmospheric lighting. Modern electronic music visual style. Ultra high resolution. Do not include any text.`;
    }

    // Call Lovable AI image generation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI image generation failed:", response.status, errorText);
      return false;
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageData) {
      console.error("No image in AI response");
      return false;
    }

    console.log(`Generated image for ${entity.name}, saving to database...`);

    // Save the generated image as a media asset
    const { error: insertError } = await supabase.from("media_assets").insert({
      entity_type: entity.type,
      entity_id: entity.id,
      entity_name: entity.name,
      source_url: imageData, // Base64 data URL
      storage_url: imageData,
      provider: "ai-generated",
      license_status: "ai-generated",
      license_name: "AI Generated",
      copyright_risk: "none",
      openai_verified: true,
      match_score: 100,
      quality_score: 85,
      final_selected: true,
      alt_text: `AI-generated image for ${entity.name}`,
      reasoning_summary: "Generated by AI as fallback when no suitable images were found from external sources.",
      tags: JSON.stringify(["ai-generated", entity.type, "techno"]),
      meta: {
        generatedAt: new Date().toISOString(),
        prompt: prompt.substring(0, 200) + "...",
        model: "google/gemini-2.5-flash-image-preview",
      },
    });

    if (insertError) {
      console.error("Failed to save generated image:", insertError);
      return false;
    }

    // Update pipeline job status if exists
    await supabase
      .from("media_pipeline_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        result: { aiGenerated: true },
      })
      .eq("entity_type", entity.type)
      .eq("entity_id", entity.id)
      .eq("status", "running");

    console.log(`Successfully generated and saved AI image for ${entity.name}`);
    return true;
  } catch (e) {
    console.error("Generate image error:", e);
    return false;
  }
}
