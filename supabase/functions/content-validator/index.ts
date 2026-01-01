import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";

// COST OPTIMIZATION: Single model with fallback chain instead of 3 parallel calls
// Saves ~70% on AI costs per validation

interface ValidationResult {
  status: 'validated' | 'needs_review' | 'conflicting';
  gaps: string[];
  missingImages: boolean;
  suggestedUpdates: Record<string, unknown>;
  confidenceScore: number;
  sources: string[];
  model: string;
}

async function queryLovableAI(prompt: string, model: string = 'google/gemini-2.5-flash'): Promise<{ content: string; model: string } | null> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return null;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      console.error(`${model} error:`, response.status);
      return null;
    }

    const data = await response.json();
    return { content: data.choices?.[0]?.message?.content || "", model };
  } catch (error) {
    console.error(`${model} call failed:`, error);
    return null;
  }
}

function extractJSON(text: string): Record<string, unknown> {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    return JSON.parse(text.trim());
  } catch {
    return {};
  }
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { entityName, entityType, currentData, researchData, sources } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is required");
    }

    console.log(`[Validator] Validating: ${entityName} (${entityType}) - COST OPTIMIZED`);

    const validationPrompt = `You are a techno music data validator. Your task is to validate and extract accurate information.

ENTITY: ${entityName}
TYPE: ${entityType}

CURRENT DATA:
${JSON.stringify(currentData, null, 2)}

RESEARCH FINDINGS:
${JSON.stringify(researchData, null, 2)}

SOURCES:
${sources.map((s: { title?: string; url: string; snippet?: string }) => `- ${s.title || 'Untitled'}: ${s.url}\n  ${s.snippet?.substring(0, 200) || ''}`).join('\n\n')}

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

    // COST OPTIMIZATION: Single model with fallback chain
    // Try Gemini Flash first (free via Lovable), then fall back to Gemini Pro if needed
    const models = ['google/gemini-2.5-flash', 'google/gemini-2.5-pro'];
    let result: { content: string; model: string } | null = null;
    
    for (const model of models) {
      console.log(`[Validator] Trying ${model}...`);
      result = await queryLovableAI(validationPrompt, model);
      if (result && result.content) {
        console.log(`[Validator] Success with ${model}`);
        break;
      }
    }

    if (!result || !result.content) {
      throw new Error("All AI models failed to respond");
    }

    const parsedData = extractJSON(result.content);
    
    const gaps = (parsedData.gaps as string[]) || [];
    const suggestedUpdates = (parsedData.suggestedUpdates as Record<string, unknown>) || {};
    const confidence = typeof parsedData.confidence === 'number' ? parsedData.confidence : 0.7;
    const missingImages = (parsedData.missingImages as boolean) || false;

    // Determine validation status
    let status: 'validated' | 'needs_review' | 'conflicting' = 'validated';
    if (confidence < 0.6) {
      status = 'needs_review';
    }
    if (Object.keys(suggestedUpdates).length === 0 && gaps.length > 3) {
      status = 'conflicting';
    }

    const validationResult: ValidationResult = {
      status,
      gaps,
      missingImages,
      suggestedUpdates,
      confidenceScore: confidence,
      sources: sources.map((s: { url: string }) => s.url),
      model: result.model,
    };

    console.log(`[Validator] Result: ${status}, confidence: ${confidence.toFixed(2)}, gaps: ${gaps.length}, model: ${result.model}`);

    return jsonResponse({ success: true, ...validationResult });
  } catch (error) {
    console.error("[Validator] Error:", error);
    return errorResponse(error instanceof Error ? error.message : "Unknown error");
  }
});
