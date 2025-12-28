import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationResult {
  status: 'validated' | 'needs_review' | 'conflicting';
  gaps: string[];
  missingImages: boolean;
  suggestedUpdates: Record<string, unknown>;
  confidenceScore: number;
  sources: string[];
  modelAgreement: {
    anthropic: boolean;
    openai: boolean;
    lovable: boolean;
  };
}

async function queryAnthropic(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}

async function queryOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

async function queryLovableAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

function extractJSON(text: string): Record<string, unknown> {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    // Try direct parse
    return JSON.parse(text.trim());
  } catch {
    return {};
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entityName, entityType, currentData, researchData, sources } = await req.json();
    
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!ANTHROPIC_API_KEY || !OPENAI_API_KEY || !LOVABLE_API_KEY) {
      throw new Error("Missing required API keys for validation");
    }

    console.log(`[Validator] Cross-validating: ${entityName} (${entityType})`);

    const validationPrompt = `You are a techno music data validator. Your task is to validate and extract accurate information.

ENTITY: ${entityName}
TYPE: ${entityType}

CURRENT DATA:
${JSON.stringify(currentData, null, 2)}

RESEARCH FINDINGS:
${JSON.stringify(researchData, null, 2)}

SOURCES:
${sources.map((s: any) => `- ${s.title}: ${s.url}\n  ${s.snippet?.substring(0, 200)}`).join('\n\n')}

TASK:
1. Identify any GAPS in the current data (missing fields, incomplete info)
2. Check if the current data contains PLACEHOLDER or generic content
3. Verify ACCURACY of current data against research
4. Suggest UPDATES based on verified research findings
5. Note if IMAGES are missing or lack proper attribution

Return JSON with:
{
  "gaps": ["list of missing or incomplete fields"],
  "placeholders": ["list of fields with placeholder/generic content"],
  "inaccuracies": ["list of potentially inaccurate fields"],
  "suggestedUpdates": { "field": "new value" },
  "missingImages": true/false,
  "confidence": 0.0-1.0
}

Be conservative - only suggest updates you're confident about. Return ONLY the JSON.`;

    // Query all three models in parallel
    const [anthropicResult, openaiResult, lovableResult] = await Promise.allSettled([
      queryAnthropic(validationPrompt, ANTHROPIC_API_KEY),
      queryOpenAI(validationPrompt, OPENAI_API_KEY),
      queryLovableAI(validationPrompt, LOVABLE_API_KEY),
    ]);

    const anthropicData = anthropicResult.status === 'fulfilled' ? extractJSON(anthropicResult.value) : {};
    const openaiData = openaiResult.status === 'fulfilled' ? extractJSON(openaiResult.value) : {};
    const lovableData = lovableResult.status === 'fulfilled' ? extractJSON(lovableResult.value) : {};

    console.log(`[Validator] Anthropic: ${anthropicResult.status}, OpenAI: ${openaiResult.status}, Lovable: ${lovableResult.status}`);

    // Merge and cross-validate results
    const allGaps = new Set<string>([
      ...(anthropicData.gaps as string[] || []),
      ...(openaiData.gaps as string[] || []),
      ...(lovableData.gaps as string[] || []),
    ]);

    // Only include suggested updates where at least 2 models agree
    const suggestedUpdates: Record<string, unknown> = {};
    const allSuggestions = [
      anthropicData.suggestedUpdates || {},
      openaiData.suggestedUpdates || {},
      lovableData.suggestedUpdates || {},
    ];

    for (const field of Object.keys(allSuggestions[0] || {})) {
      const values = allSuggestions.map(s => (s as Record<string, unknown>)[field]).filter(Boolean);
      if (values.length >= 2) {
        // Check if values are similar enough
        const firstValue = String(values[0]);
        const agreeing = values.filter(v => {
          const strV = String(v);
          return strV === firstValue || 
                 strV.toLowerCase().includes(firstValue.toLowerCase().substring(0, 20)) ||
                 firstValue.toLowerCase().includes(strV.toLowerCase().substring(0, 20));
        });
        
        if (agreeing.length >= 2) {
          suggestedUpdates[field] = values[0];
        }
      }
    }

    // Calculate confidence based on model agreement
    const confidences = [
      anthropicData.confidence,
      openaiData.confidence,
      lovableData.confidence,
    ].filter(c => typeof c === 'number') as number[];
    
    const avgConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0.5;

    const missingImages = 
      (anthropicData.missingImages as boolean) ||
      (openaiData.missingImages as boolean) ||
      (lovableData.missingImages as boolean) ||
      false;

    // Determine validation status
    let status: 'validated' | 'needs_review' | 'conflicting' = 'validated';
    if (avgConfidence < 0.6) {
      status = 'needs_review';
    }
    if (Object.keys(suggestedUpdates).length === 0 && allGaps.size > 3) {
      status = 'conflicting';
    }

    const result: ValidationResult = {
      status,
      gaps: Array.from(allGaps),
      missingImages,
      suggestedUpdates,
      confidenceScore: avgConfidence,
      sources: sources.map((s: any) => s.url),
      modelAgreement: {
        anthropic: anthropicResult.status === 'fulfilled',
        openai: openaiResult.status === 'fulfilled',
        lovable: lovableResult.status === 'fulfilled',
      },
    };

    console.log(`[Validator] Result: ${status}, confidence: ${avgConfidence.toFixed(2)}, gaps: ${allGaps.size}`);

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Validator] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
