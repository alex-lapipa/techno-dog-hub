import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrchestrationRequest {
  action: "review" | "implement" | "validate" | "full-pipeline" | "status";
  target?: string; // What to review/implement (e.g., "admin-tools", "media-engine", "user-management")
  context?: string; // Additional context
  previousPlan?: string; // For implementation step
  previousChanges?: string; // For validation step
  dryRun?: boolean;
}

interface PipelineStep {
  step: string;
  agent: "claude" | "gpt" | "lovable";
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
  usedFallback?: boolean;
}

interface PipelineRun {
  id: string;
  target: string;
  status: "running" | "completed" | "failed";
  steps: PipelineStep[];
  startedAt: string;
  completedAt?: string;
  summary?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // At least one AI provider must be configured
    const hasAnthropicKey = !!ANTHROPIC_API_KEY;
    const hasOpenAIKey = !!OPENAI_API_KEY;
    const hasLovableKey = !!LOVABLE_API_KEY;
    
    if (!hasAnthropicKey && !hasLovableKey) {
      throw new Error("No AI provider configured (need ANTHROPIC_API_KEY or LOVABLE_API_KEY)");
    }
    if (!hasOpenAIKey && !hasLovableKey) {
      throw new Error("No implementation AI configured (need OPENAI_API_KEY or LOVABLE_API_KEY)");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { action, target, context, previousPlan, previousChanges, dryRun = false }: OrchestrationRequest = await req.json();

    console.log(`AI Orchestration: action=${action}, target=${target}`);

    switch (action) {
      // ============ CLAUDE: REVIEW & PLAN ============
      case "review": {
        if (!target) throw new Error("Target is required for review");

        const systemPrompt = `You are Claude, the senior AI architect for techno.dog - a techno music encyclopedia and community platform.

Your role is to REVIEW and PLAN improvements safely. You must:
1. Analyze the current state of the target system
2. Identify issues, risks, and improvement opportunities
3. Create a SAFE, INCREMENTAL improvement plan
4. Flag any potential regressions or breaking changes

CRITICAL RULES:
- NEVER suggest removing existing functionality
- Prioritize stability over features
- Consider security implications
- Plan for rollback scenarios

Respond with structured JSON:
{
  "assessment": {
    "currentState": "description of current implementation",
    "issues": ["list of issues found"],
    "risks": ["potential risks"],
    "opportunities": ["improvement opportunities"]
  },
  "plan": {
    "priority": "low|medium|high|critical",
    "steps": [
      {
        "order": 1,
        "action": "what to do",
        "rationale": "why",
        "safetyCheck": "how to verify it didn't break anything"
      }
    ],
    "rollbackPlan": "how to revert if needed"
  },
  "warnings": ["any critical warnings"],
  "approvedForImplementation": true/false
}`;

        const userPrompt = `Review and create an improvement plan for: ${target}

Additional context:
${context || "General review requested"}

Current database statistics:
${await getSystemStats(supabase)}

Analyze the target and provide a safe improvement plan.`;

        console.log("Calling Claude for review (with Lovable AI fallback)...");
        const { result: reviewResult, usedFallback } = await callClaudeWithFallback(
          ANTHROPIC_API_KEY,
          LOVABLE_API_KEY,
          systemPrompt,
          userPrompt
        );
        
        // Log the review to analytics
        await logPipelineEvent(supabase, "review", target, usedFallback ? "lovable" : "claude", reviewResult);

        return new Response(JSON.stringify({
          success: true,
          agent: usedFallback ? "lovable" : "claude",
          action: "review",
          target,
          result: reviewResult,
          usedFallback,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ GPT: IMPLEMENT CHANGES ============
      case "implement": {
        if (!target) throw new Error("Target is required for implementation");
        if (!previousPlan) throw new Error("Previous plan from Claude is required");

        const systemPrompt = `You are GPT, the AI implementer for techno.dog.

Your role is to IMPLEMENT changes exactly as planned by Claude (the architect).
You must:
1. Follow the plan EXACTLY - no improvisation
2. Make minimal, targeted changes
3. Document every change you make
4. Never exceed the scope of the plan

CRITICAL RULES:
- Only implement what's in the plan
- If something is unclear, flag it rather than guess
- Preserve all existing functionality
- Add logging for monitoring

Respond with structured JSON:
{
  "implemented": [
    {
      "step": 1,
      "action": "what was done",
      "changes": ["specific changes made"],
      "verified": true/false
    }
  ],
  "skipped": [
    {
      "step": 2,
      "reason": "why it was skipped"
    }
  ],
  "warnings": ["any issues encountered"],
  "readyForValidation": true/false
}`;

        const userPrompt = `Implement the following plan for: ${target}

PLAN FROM CLAUDE:
${previousPlan}

${dryRun ? "THIS IS A DRY RUN - describe what would be done but don't actually implement" : "Implement the changes now."}

Additional context:
${context || "No additional context"}`;

        console.log("Calling GPT for implementation (with Lovable AI fallback)...");
        const { result: implementResult, usedFallback: implFallback } = await callGPTWithFallback(
          OPENAI_API_KEY,
          LOVABLE_API_KEY,
          systemPrompt,
          userPrompt
        );

        await logPipelineEvent(supabase, "implement", target, implFallback ? "lovable" : "gpt", implementResult);

        return new Response(JSON.stringify({
          success: true,
          agent: implFallback ? "lovable" : "gpt",
          action: "implement",
          target,
          dryRun,
          result: implementResult,
          usedFallback: implFallback,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ CLAUDE: VALIDATE CHANGES ============
      case "validate": {
        if (!target) throw new Error("Target is required for validation");
        if (!previousChanges) throw new Error("Previous changes from GPT are required");

        const systemPrompt = `You are Claude, validating changes made by GPT to techno.dog.

Your role is to VALIDATE that:
1. Changes match the original plan
2. No regressions were introduced
3. Security was not compromised
4. All existing functionality is preserved

Respond with structured JSON:
{
  "validation": {
    "passed": true/false,
    "score": 0-100,
    "checks": [
      {
        "check": "what was verified",
        "passed": true/false,
        "notes": "details"
      }
    ]
  },
  "regressions": ["any regressions found"],
  "securityIssues": ["any security concerns"],
  "recommendations": ["follow-up recommendations"],
  "approved": true/false,
  "rollbackRequired": true/false
}`;

        const userPrompt = `Validate the changes made to: ${target}

CHANGES MADE BY GPT:
${previousChanges}

Verify nothing is broken and the implementation is correct.

Current system state:
${await getSystemStats(supabase)}`;

        console.log("Calling Claude for validation (with Lovable AI fallback)...");
        const { result: validateResult, usedFallback: valFallback } = await callClaudeWithFallback(
          ANTHROPIC_API_KEY,
          LOVABLE_API_KEY,
          systemPrompt,
          userPrompt
        );

        await logPipelineEvent(supabase, "validate", target, valFallback ? "lovable" : "claude", validateResult);

        return new Response(JSON.stringify({
          success: true,
          agent: valFallback ? "lovable" : "claude",
          action: "validate",
          target,
          result: validateResult,
          usedFallback: valFallback,
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ FULL PIPELINE ============
      case "full-pipeline": {
        if (!target) throw new Error("Target is required for full pipeline");

        const pipelineRun: PipelineRun = {
          id: crypto.randomUUID(),
          target,
          status: "running",
          startedAt: new Date().toISOString(),
          steps: [
            { step: "review", agent: "claude", status: "pending" },
            { step: "implement", agent: "gpt", status: "pending" },
            { step: "validate", agent: "claude", status: "pending" },
          ],
        };

        console.log(`Starting full pipeline: ${pipelineRun.id}`);

        // Step 1: Claude Review
        pipelineRun.steps[0].status = "running";
        pipelineRun.steps[0].startedAt = new Date().toISOString();

        const reviewSystemPrompt = `You are Claude, the senior AI architect for techno.dog.
Analyze and create a safe improvement plan. Respond with JSON only.`;

        const reviewUserPrompt = `Review: ${target}\nContext: ${context || "General review"}\nStats: ${await getSystemStats(supabase)}`;

        let reviewResult;
        let reviewFallback = false;
        try {
          const reviewResponse = await callClaudeWithFallback(ANTHROPIC_API_KEY, LOVABLE_API_KEY, reviewSystemPrompt, reviewUserPrompt);
          reviewResult = reviewResponse.result;
          reviewFallback = reviewResponse.usedFallback;
          pipelineRun.steps[0].status = "completed";
          pipelineRun.steps[0].completedAt = new Date().toISOString();
          pipelineRun.steps[0].result = reviewResult;
          pipelineRun.steps[0].usedFallback = reviewFallback;
          if (reviewFallback) pipelineRun.steps[0].agent = "lovable";
        } catch (e) {
          pipelineRun.steps[0].status = "failed";
          pipelineRun.steps[0].error = e instanceof Error ? e.message : "Unknown error";
          pipelineRun.status = "failed";
          return new Response(JSON.stringify({ success: false, pipeline: pipelineRun }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Step 2: GPT Implementation
        pipelineRun.steps[1].status = "running";
        pipelineRun.steps[1].startedAt = new Date().toISOString();

        const implementSystemPrompt = `You are GPT, implementing changes as planned by Claude.
Follow the plan exactly. Respond with JSON only.`;

        const implementUserPrompt = `Implement plan for: ${target}\nPLAN: ${JSON.stringify(reviewResult)}\n${dryRun ? "DRY RUN - describe only" : "Implement now"}`;

        let implementResult;
        let implFallback = false;
        try {
          const implResponse = await callGPTWithFallback(OPENAI_API_KEY, LOVABLE_API_KEY, implementSystemPrompt, implementUserPrompt);
          implementResult = implResponse.result;
          implFallback = implResponse.usedFallback;
          pipelineRun.steps[1].status = "completed";
          pipelineRun.steps[1].completedAt = new Date().toISOString();
          pipelineRun.steps[1].result = implementResult;
          pipelineRun.steps[1].usedFallback = implFallback;
          if (implFallback) pipelineRun.steps[1].agent = "lovable";
        } catch (e) {
          pipelineRun.steps[1].status = "failed";
          pipelineRun.steps[1].error = e instanceof Error ? e.message : "Unknown error";
          pipelineRun.status = "failed";
          return new Response(JSON.stringify({ success: false, pipeline: pipelineRun }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Step 3: Claude Validation
        pipelineRun.steps[2].status = "running";
        pipelineRun.steps[2].startedAt = new Date().toISOString();

        const validateSystemPrompt = `You are Claude, validating GPT's changes.
Check for regressions and security issues. Respond with JSON only.`;

        const validateUserPrompt = `Validate changes to: ${target}\nCHANGES: ${JSON.stringify(implementResult)}\nStats: ${await getSystemStats(supabase)}`;

        let validateResult;
        let valFallback = false;
        try {
          const valResponse = await callClaudeWithFallback(ANTHROPIC_API_KEY, LOVABLE_API_KEY, validateSystemPrompt, validateUserPrompt);
          validateResult = valResponse.result;
          valFallback = valResponse.usedFallback;
          pipelineRun.steps[2].status = "completed";
          pipelineRun.steps[2].completedAt = new Date().toISOString();
          pipelineRun.steps[2].result = validateResult;
          pipelineRun.steps[2].usedFallback = valFallback;
          if (valFallback) pipelineRun.steps[2].agent = "lovable";
        } catch (e) {
          pipelineRun.steps[2].status = "failed";
          pipelineRun.steps[2].error = e instanceof Error ? e.message : "Unknown error";
        }

        pipelineRun.status = pipelineRun.steps.every(s => s.status === "completed") ? "completed" : "failed";
        pipelineRun.completedAt = new Date().toISOString();
        pipelineRun.summary = `Pipeline ${pipelineRun.status}: Review → Implement → Validate for ${target}`;

        // Store pipeline run
        await logPipelineEvent(supabase, "full-pipeline", target, "orchestration", pipelineRun);

        return new Response(JSON.stringify({
          success: pipelineRun.status === "completed",
          pipeline: pipelineRun,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ============ STATUS ============
      case "status": {
        // Get recent pipeline events
        const { data: recentEvents } = await supabase
          .from("analytics_events")
          .select("*")
          .eq("event_type", "ai_pipeline")
          .order("created_at", { ascending: false })
          .limit(20);

        // Get system health
        const stats = await getSystemStats(supabase);

        return new Response(JSON.stringify({
          success: true,
          status: {
            claudeConfigured: !!ANTHROPIC_API_KEY,
            gptConfigured: !!OPENAI_API_KEY,
            lovableConfigured: !!LOVABLE_API_KEY,
            recentPipelineRuns: recentEvents?.length || 0,
            systemStats: stats,
          },
          recentEvents,
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
    console.error("AI Orchestration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    // Handle rate limits
    if (message.includes("429") || message.includes("rate")) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============ HELPER FUNCTIONS ============

const AI_TIMEOUT_MS = 45000; // 45 second timeout before fallback (edge functions have ~60s limit)

async function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    )
  ]);
}

async function callLovableAI(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
  console.log("Calling Lovable AI Gateway (gemini-2.5-flash)...");
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Try to parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw content if not JSON
  }

  return { rawResponse: content };
}

async function callClaudeWithFallback(
  claudeKey: string | undefined,
  lovableKey: string | undefined,
  systemPrompt: string,
  userPrompt: string
): Promise<{ result: any; usedFallback: boolean }> {
  // Try Claude first if configured
  if (claudeKey) {
    try {
      const result = await callWithTimeout(
        callClaude(claudeKey, systemPrompt, userPrompt),
        AI_TIMEOUT_MS
      );
      return { result, usedFallback: false };
    } catch (error) {
      console.warn("Claude failed, attempting Lovable AI fallback:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  // Fallback to Lovable AI
  if (lovableKey) {
    console.log("Using Lovable AI as fallback...");
    const result = await callLovableAI(lovableKey, systemPrompt, userPrompt);
    return { result, usedFallback: true };
  }

  throw new Error("No AI provider available");
}

async function callGPTWithFallback(
  gptKey: string | undefined,
  lovableKey: string | undefined,
  systemPrompt: string,
  userPrompt: string
): Promise<{ result: any; usedFallback: boolean }> {
  // Try GPT first if configured
  if (gptKey) {
    try {
      const result = await callWithTimeout(
        callGPT(gptKey, systemPrompt, userPrompt),
        AI_TIMEOUT_MS
      );
      return { result, usedFallback: false };
    } catch (error) {
      console.warn("GPT failed, attempting Lovable AI fallback:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  // Fallback to Lovable AI
  if (lovableKey) {
    console.log("Using Lovable AI as fallback...");
    const result = await callLovableAI(lovableKey, systemPrompt, userPrompt);
    return { result, usedFallback: true };
  }

  throw new Error("No AI provider available");
}

async function callClaude(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
  console.log("Calling Anthropic Claude...");
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Claude API error:", response.status, errorText);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "";

  // Try to parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw content if not JSON
  }

  return { rawResponse: content };
}

async function callGPT(apiKey: string, systemPrompt: string, userPrompt: string): Promise<any> {
  console.log("Calling OpenAI GPT...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-2025-04-14",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("GPT API error:", response.status, errorText);
    throw new Error(`GPT API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Try to parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw content if not JSON
  }

  return { rawResponse: content };
}

async function getSystemStats(supabase: any): Promise<string> {
  try {
    const [
      { count: usersCount },
      { count: artistsCount },
      { count: assetsCount },
      { count: articlesCount },
      { count: submissionsCount },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("dj_artists").select("*", { count: "exact", head: true }),
      supabase.from("media_assets").select("*", { count: "exact", head: true }),
      supabase.from("td_news_articles").select("*", { count: "exact", head: true }),
      supabase.from("community_submissions").select("*", { count: "exact", head: true }),
    ]);

    return JSON.stringify({
      users: usersCount || 0,
      artists: artistsCount || 0,
      mediaAssets: assetsCount || 0,
      articles: articlesCount || 0,
      submissions: submissionsCount || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return JSON.stringify({ error: "Failed to fetch stats" });
  }
}

async function logPipelineEvent(supabase: any, action: string, target: string, agent: string, result: any) {
  try {
    await supabase.from("analytics_events").insert({
      event_type: "ai_pipeline",
      event_name: `${agent}_${action}`,
      metadata: {
        target,
        agent,
        action,
        result: typeof result === "object" ? result : { content: result },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    console.error("Failed to log pipeline event:", e);
  }
}
