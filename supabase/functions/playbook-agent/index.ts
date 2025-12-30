import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaybookRequest {
  action: 'research_sources' | 'generate_section' | 'generate_template' | 'audit_practices' | 'create_decision_record' | 'refresh_playbook' | 'ask_playbook';
  sectionKey?: string;
  templateType?: string;
  question?: string;
  context?: string;
  sources?: string[];
}

// Multi-model orchestration
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGrok(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: "You are Grok, a fast trend-aware scanner for open-source community practices. Identify emerging patterns, recent debates, and new governance models." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Grok API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Research open-source best practices
async function researchSources(topic: string): Promise<any> {
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
  
  // If Firecrawl is available, use it for discovery
  let discoveredSources: string[] = [];
  if (firecrawlKey) {
    try {
      const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `open source ${topic} best practices governance community`,
          limit: 10,
        }),
      });
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        discoveredSources = searchData.data?.map((r: any) => r.url) || [];
      }
    } catch (e) {
      console.log("Firecrawl search not available, using AI synthesis");
    }
  }

  // Use Grok for trend scanning
  const trendAnalysis = await callGrok(`
    Scan for the latest trends and emerging best practices in open-source community management related to: ${topic}
    
    Focus on:
    - New governance models being adopted
    - Recent debates in the open-source community
    - Emerging tools and frameworks
    - Shifts in contributor experience practices
    
    Return as JSON: { "trends": [...], "emerging_practices": [...], "recent_debates": [...] }
  `);

  // Use Anthropic for deep analysis
  const deepAnalysis = await callAnthropic(`
    Analyze open-source best practices for: ${topic}
    
    Consider projects like: Go, Rust, Kubernetes, Linux, Mozilla, Apache, Debian
    
    Provide:
    1. Core principles and philosophy
    2. Governance recommendations
    3. Community health factors
    4. Ethical considerations
    5. Application to techno culture documentation
    
    Return structured analysis with citations to known sources.
  `, "You are an expert in open-source governance, community building, and ethical knowledge sharing. Provide deep, nuanced analysis.");

  return {
    discoveredSources,
    trendAnalysis: tryParseJSON(trendAnalysis),
    deepAnalysis,
    topic
  };
}

// Generate playbook section
async function generateSection(sectionKey: string, context?: string): Promise<any> {
  const sectionPrompts: Record<string, string> = {
    philosophy: "open-source philosophy applied to techno culture, transparency, attribution, consent-first documentation",
    governance: "governance models for cultural documentation projects, roles, decision-making, steering committees",
    contribution: "contribution workflows for code and content, review processes, onboarding, mentorship",
    code_of_conduct: "code of conduct, anti-harassment, inclusive language, conflict resolution, moderation",
    licensing: "licensing for code, content, audio, images, Creative Commons, attribution, takedown handling",
    rituals: "community rituals, contributor spotlights, release ceremonies, public roadmaps, transparency culture",
    sustainability: "sustainable funding, donations, sponsorships, grants, avoiding capture, commercial partnerships",
    metrics: "community health metrics, contributor growth, burnout indicators, diversity, documentation freshness"
  };

  const topic = sectionPrompts[sectionKey] || sectionKey;
  
  // Research first
  const research = await researchSources(topic);
  
  // Generate structured content with OpenAI
  const content = await callOpenAI(`
    Generate a comprehensive playbook section for: ${sectionKey}
    
    Topic focus: ${topic}
    ${context ? `Additional context: ${context}` : ''}
    
    Research findings:
    ${JSON.stringify(research.deepAnalysis).substring(0, 2000)}
    
    Create a well-structured markdown section that:
    1. Explains the principles clearly
    2. Provides actionable guidelines
    3. Includes do's and don'ts
    4. Gives concrete examples
    5. Applies to techno culture documentation specifically
    
    Format as clean markdown with headers, lists, and callouts.
  `, "You are an expert technical writer creating open-source community documentation. Write clear, actionable, well-organized content.");

  // Validate with Anthropic
  const validation = await callAnthropic(`
    Review this playbook section for: ${sectionKey}
    
    Content:
    ${content.substring(0, 3000)}
    
    Evaluate:
    1. Ethical soundness
    2. Cultural sensitivity for underground techno scenes
    3. Balance between openness and privacy protection
    4. Practical applicability
    5. Potential gaps or risks
    
    Return: { "score": 0-100, "strengths": [...], "concerns": [...], "suggestions": [...] }
  `, "You are an ethics and community governance expert. Provide critical but constructive review.");

  return {
    sectionKey,
    content,
    validation: tryParseJSON(validation),
    sources: research.discoveredSources,
    generatedAt: new Date().toISOString()
  };
}

// Generate template
async function generateTemplate(templateType: string): Promise<any> {
  const templateDescriptions: Record<string, string> = {
    issue_template: "GitHub issue template for bug reports, feature requests, and content submissions",
    PR_template: "Pull request template for code and content contributions",
    RFC: "Request for Comments template for proposing changes to governance or major features",
    meeting_notes: "Template for community meeting notes and action items",
    contributor_onboarding: "Onboarding guide template for new contributors",
    code_review: "Code review checklist and feedback template",
    content_submission: "Template for submitting artist interviews, scene documentation, or archives",
    release_notes: "Release notes template for version announcements",
    incident_report: "Template for reporting and documenting community incidents"
  };

  const description = templateDescriptions[templateType] || templateType;

  const template = await callOpenAI(`
    Create a professional ${templateType} template for an open-source techno culture documentation project.
    
    Description: ${description}
    
    The template should:
    1. Be clear and easy to fill out
    2. Capture all necessary information
    3. Follow open-source best practices
    4. Be appropriate for the techno/electronic music documentation context
    
    Return the template in markdown format with placeholder text and instructions.
  `, "You are an expert in open-source project management. Create professional, practical templates.");

  const instructions = await callOpenAI(`
    Write usage instructions for this template:
    
    Template type: ${templateType}
    Template content: ${template.substring(0, 1500)}
    
    Explain:
    1. When to use this template
    2. How to fill it out properly
    3. Common mistakes to avoid
    4. Examples of good usage
    
    Keep it concise and practical.
  `, "You are a technical documentation expert.");

  return {
    templateType,
    template,
    instructions,
    generatedAt: new Date().toISOString()
  };
}

// Audit current practices
async function auditPractices(context: string): Promise<any> {
  const audit = await callAnthropic(`
    Audit the following practices against open-source best practices:
    
    ${context}
    
    Compare against standards from: Go, Rust, Kubernetes, Linux Foundation, Apache, Mozilla, Debian
    
    Evaluate:
    1. Governance structure
    2. Contribution processes
    3. Documentation quality
    4. Community health
    5. Licensing and attribution
    6. Moderation and safety
    7. Sustainability
    
    Return: {
      "overallScore": 0-100,
      "categories": [
        { "name": "...", "score": 0-100, "status": "good|needs_work|critical", "findings": [...], "recommendations": [...] }
      ],
      "topPriorities": [...],
      "implementationPlan": [...]
    }
  `, "You are an open-source community auditor. Provide thorough, actionable assessment.");

  return tryParseJSON(audit);
}

// Answer playbook questions
async function askPlaybook(question: string, supabase: any): Promise<any> {
  // Fetch relevant playbook content
  const { data: sections } = await supabase
    .from('playbook_sections')
    .select('section_key, section_title, section_content_markdown')
    .eq('status', 'active')
    .limit(10);

  const { data: principles } = await supabase
    .from('principles_values')
    .select('principle_name, principle_summary, do_list, dont_list')
    .limit(10);

  const { data: policies } = await supabase
    .from('policies')
    .select('policy_name, policy_type, policy_content_markdown')
    .limit(5);

  const context = {
    sections: sections || [],
    principles: principles || [],
    policies: policies || []
  };

  const answer = await callAnthropic(`
    Answer this question about our open-source operating system / playbook:
    
    Question: ${question}
    
    Available playbook content:
    ${JSON.stringify(context).substring(0, 4000)}
    
    Provide:
    1. Direct answer to the question
    2. Relevant principles or policies that apply
    3. Recommended actions or next steps
    4. Any caveats or considerations
    
    Be practical and specific to our techno culture documentation context.
  `, "You are the playbook assistant for a techno culture documentation project. Provide helpful, actionable guidance based on our open-source operating system.");

  return {
    question,
    answer,
    relevantSections: sections?.map((s: any) => s.section_key) || [],
    relevantPolicies: policies?.map((p: any) => p.policy_name) || []
  };
}

function tryParseJSON(str: string): any {
  try {
    const jsonMatch = str.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { raw: str };
  } catch {
    return { raw: str };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, sectionKey, templateType, question, context, sources }: PlaybookRequest = await req.json();

    // Log the run
    const { data: run } = await supabase
      .from('playbook_agent_runs')
      .insert({
        run_type: action,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    let result: any;

    switch (action) {
      case 'research_sources':
        result = await researchSources(context || 'open-source community governance');
        break;

      case 'generate_section':
        if (!sectionKey) throw new Error("sectionKey required");
        result = await generateSection(sectionKey, context);
        
        // Save to database
        await supabase
          .from('playbook_sections')
          .upsert({
            section_key: sectionKey,
            section_title: sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            section_content_markdown: result.content,
            sources_json: result.sources,
            status: 'draft',
            last_updated_at: new Date().toISOString()
          }, { onConflict: 'section_key' });
        break;

      case 'generate_template':
        if (!templateType) throw new Error("templateType required");
        result = await generateTemplate(templateType);
        
        // Save to database
        await supabase
          .from('templates_assets')
          .insert({
            template_name: templateType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            template_type: templateType,
            template_content_markdown: result.template,
            usage_instructions: result.instructions,
            last_verified_at: new Date().toISOString()
          });
        break;

      case 'audit_practices':
        result = await auditPractices(context || 'Current project practices');
        break;

      case 'ask_playbook':
        if (!question) throw new Error("question required");
        result = await askPlaybook(question, supabase);
        break;

      case 'refresh_playbook':
        // Refresh all active sections
        const { data: activeSections } = await supabase
          .from('playbook_sections')
          .select('section_key')
          .eq('status', 'active');

        const refreshResults = [];
        for (const section of activeSections || []) {
          const refreshed = await generateSection(section.section_key);
          
          await supabase
            .from('playbook_sections')
            .update({
              section_content_markdown: refreshed.content,
              sources_json: refreshed.sources,
              version_number: supabase.rpc('increment_version', { key: section.section_key }),
              last_updated_at: new Date().toISOString()
            })
            .eq('section_key', section.section_key);

          refreshResults.push({ section: section.section_key, status: 'refreshed' });
        }
        result = { refreshed: refreshResults };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update run status
    await supabase
      .from('playbook_agent_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        stats: { action, result: typeof result === 'object' ? 'success' : result }
      })
      .eq('id', run?.id);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Playbook agent error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
