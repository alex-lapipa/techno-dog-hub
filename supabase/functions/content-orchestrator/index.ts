import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EntityToAudit {
  type: 'artist' | 'venue' | 'festival' | 'gear' | 'label' | 'release';
  id: string;
  name: string;
  currentData: Record<string, unknown>;
}

interface AuditResult {
  entityId: string;
  entityType: string;
  gaps: string[];
  missingImages: boolean;
  suggestedUpdates: Record<string, unknown>;
  confidenceScore: number;
  sources: string[];
  validationStatus: 'validated' | 'needs_review' | 'conflicting';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, entities, entityType } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Orchestrator] Action: ${action}, Entity type: ${entityType || 'all'}`);

    if (action === "analyze") {
      // Anthropic analyzes what needs to be updated
      const analysisPrompt = `You are a techno music data curator. Analyze these entities and identify:
1. Missing or incomplete fields (bios, labels, gear, images)
2. Potentially outdated information
3. Placeholder or generic content that needs real data
4. Missing image attributions

Entities to analyze:
${JSON.stringify(entities, null, 2)}

Return a JSON array of objects with:
- entityId: string
- entityType: string
- gaps: string[] (list of missing/incomplete fields)
- missingImages: boolean
- priority: 'high' | 'medium' | 'low'
- suggestedSearchQueries: string[] (queries to use for research)

Only return the JSON array, no other text.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{ role: "user", content: analysisPrompt }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Orchestrator] Anthropic error:", error);
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text || "[]";
      
      // Parse the JSON response
      let analysisResults;
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
        analysisResults = JSON.parse(jsonMatch[1].trim());
      } catch (e) {
        console.error("[Orchestrator] Failed to parse analysis:", content);
        analysisResults = [];
      }

      console.log(`[Orchestrator] Analysis complete: ${analysisResults.length} entities need updates`);

      return new Response(
        JSON.stringify({
          success: true,
          action: "analyze",
          results: analysisResults,
          totalEntities: entities?.length || 0,
          needsUpdate: analysisResults.length,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "orchestrate") {
      // Full orchestration: research -> validate -> report
      const results: AuditResult[] = [];
      
      for (const entity of entities.slice(0, 5)) { // Process 5 at a time to avoid timeouts
        console.log(`[Orchestrator] Processing: ${entity.name} (${entity.type})`);
        
        // Step 1: Research via Firecrawl
        const researchResponse = await supabase.functions.invoke("content-researcher", {
          body: {
            entityName: entity.name,
            entityType: entity.type,
            searchQueries: entity.suggestedSearchQueries || [
              `${entity.name} techno artist`,
              `${entity.name} discography`,
              `${entity.name} official website`,
            ],
          },
        });

        if (researchResponse.error) {
          console.error(`[Orchestrator] Research failed for ${entity.name}:`, researchResponse.error);
          continue;
        }

        const researchData = researchResponse.data;
        console.log(`[Orchestrator] Research found ${researchData?.sources?.length || 0} sources for ${entity.name}`);

        // Step 2: Cross-validate with multiple models
        const validationResponse = await supabase.functions.invoke("content-validator", {
          body: {
            entityName: entity.name,
            entityType: entity.type,
            currentData: entity.currentData,
            researchData: researchData?.findings || {},
            sources: researchData?.sources || [],
          },
        });

        if (validationResponse.error) {
          console.error(`[Orchestrator] Validation failed for ${entity.name}:`, validationResponse.error);
          continue;
        }

        const validation = validationResponse.data;
        
        results.push({
          entityId: entity.id,
          entityType: entity.type,
          gaps: validation.gaps || [],
          missingImages: validation.missingImages || false,
          suggestedUpdates: validation.suggestedUpdates || {},
          confidenceScore: validation.confidenceScore || 0,
          sources: validation.sources || [],
          validationStatus: validation.status || 'needs_review',
        });
      }

      // Store results in database for review
      if (results.length > 0) {
        const { error: insertError } = await supabase.from("agent_reports").insert({
          agent_name: "content-orchestrator",
          agent_category: "content",
          title: `Content Audit: ${entityType || 'mixed'} entities`,
          description: `Audited ${results.length} entities for gaps and updates`,
          severity: results.some(r => r.gaps.length > 3) ? "warning" : "info",
          status: "pending",
          details: { results, timestamp: new Date().toISOString() },
        });

        if (insertError) {
          console.error("[Orchestrator] Failed to store report:", insertError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: "orchestrate",
          processed: results.length,
          results,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Orchestrator] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
