import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdminContext {
  healthAlerts: number;
  pendingSubmissions: number;
  totalApiRequests: number;
  recentAgentReports: any[];
  gearGaps: number;
  artistCount: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, context, query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createServiceClient();

    // Gather admin context for AI
    const gatherContext = async (): Promise<AdminContext> => {
      const [
        { count: healthAlerts },
        { count: pendingSubmissions },
        { data: apiUsage },
        { data: agentReports },
        { data: gearWithGaps },
        { count: artistCount }
      ] = await Promise.all([
        supabase.from('health_alerts').select('*', { count: 'exact', head: true }).is('resolved_at', null),
        supabase.from('community_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('api_usage').select('request_count').limit(100),
        supabase.from('agent_reports').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('gear_catalog').select('id').or('short_description.is.null,notable_artists.is.null'),
        supabase.from('canonical_artists').select('*', { count: 'exact', head: true })
      ]);

      return {
        healthAlerts: healthAlerts || 0,
        pendingSubmissions: pendingSubmissions || 0,
        totalApiRequests: apiUsage?.reduce((sum, u) => sum + (u.request_count || 0), 0) || 0,
        recentAgentReports: agentReports || [],
        gearGaps: gearWithGaps?.length || 0,
        artistCount: artistCount || 0
      };
    };

    if (action === "status") {
      const ctx = await gatherContext();
      return new Response(JSON.stringify({ 
        success: true, 
        context: ctx,
        message: "Admin context gathered successfully"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "analyze") {
      const ctx = await gatherContext();
      
      const systemPrompt = `You are an AI admin assistant for techno.dog, a platform dedicated to techno music culture.
You analyze system health, data quality, and provide actionable recommendations.

Current System Status:
- Health Alerts (unresolved): ${ctx.healthAlerts}
- Pending Submissions: ${ctx.pendingSubmissions}
- Total API Requests: ${ctx.totalApiRequests.toLocaleString()}
- Gear Items with Missing Data: ${ctx.gearGaps}
- Total Artists in Database: ${ctx.artistCount}

Recent Agent Reports:
${ctx.recentAgentReports.map(r => `- ${r.agent_name}: ${r.title} (${r.severity})`).join('\n')}

Provide concise, actionable insights. Focus on:
1. Critical issues that need immediate attention
2. Data quality improvements
3. Performance optimizations
4. Growth opportunities`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query || "Analyze the current system status and provide recommendations." }
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const aiData = await response.json();
      const analysis = aiData.choices?.[0]?.message?.content || "Unable to generate analysis.";

      return new Response(JSON.stringify({ 
        success: true, 
        analysis,
        context: ctx
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === "chat") {
      const ctx = context || await gatherContext();
      
      const systemPrompt = `You are an expert admin assistant for techno.dog platform.
You help admins understand system status, troubleshoot issues, and optimize operations.
Be concise, technical when needed, and always actionable.

Current context:
- ${ctx.healthAlerts} unresolved health alerts
- ${ctx.pendingSubmissions} pending submissions
- ${ctx.gearGaps} gear items need data enrichment
- ${ctx.artistCount} artists in database`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query }
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw new Error("AI gateway error");
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    if (action === "quick-actions") {
      // Return suggested quick actions based on current state
      const ctx = await gatherContext();
      const actions = [];

      if (ctx.healthAlerts > 0) {
        actions.push({
          id: "resolve-alerts",
          label: "Review Health Alerts",
          description: `${ctx.healthAlerts} unresolved alerts need attention`,
          severity: "high",
          path: "/admin/health-monitor"
        });
      }

      if (ctx.pendingSubmissions > 0) {
        actions.push({
          id: "review-submissions",
          label: "Review Submissions",
          description: `${ctx.pendingSubmissions} pending community submissions`,
          severity: ctx.pendingSubmissions > 10 ? "high" : "medium",
          path: "/admin/submissions-triage"
        });
      }

      if (ctx.gearGaps > 0) {
        actions.push({
          id: "enrich-gear",
          label: "Enrich Gear Data",
          description: `${ctx.gearGaps} gear items have missing information`,
          severity: "low",
          path: "/admin/gear-agent"
        });
      }

      // Always suggest running health check
      actions.push({
        id: "run-health-check",
        label: "Run Health Check",
        description: "Verify all systems are operational",
        severity: "info",
        action: "health-monitor"
      });

      return new Response(JSON.stringify({ 
        success: true, 
        actions,
        context: ctx
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Admin AI Assistant ready",
      availableActions: ["status", "analyze", "chat", "quick-actions"]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Admin AI Assistant error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
