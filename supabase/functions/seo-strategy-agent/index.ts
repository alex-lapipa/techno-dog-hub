import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StrategyRequest {
  action: string;
  pageTarget?: string;
  sectionKey?: string;
  question?: string;
  actionId?: string;
}

// Site structure for analysis
const SITE_PAGES = [
  { path: '/', name: 'Homepage', category: 'core' },
  { path: '/news', name: 'News Hub', category: 'content' },
  { path: '/artists', name: 'Artists Directory', category: 'directory' },
  { path: '/artists/gallery', name: 'Artists Gallery', category: 'directory' },
  { path: '/festivals', name: 'Festivals Directory', category: 'directory' },
  { path: '/venues', name: 'Venues Directory', category: 'directory' },
  { path: '/labels', name: 'Labels Directory', category: 'directory' },
  { path: '/gear', name: 'Gear Directory', category: 'directory' },
  { path: '/crews', name: 'Crews Directory', category: 'directory' },
  { path: '/releases', name: 'Releases Directory', category: 'directory' },
  { path: '/books', name: 'Books Directory', category: 'content' },
  { path: '/documentaries', name: 'Documentaries', category: 'content' },
  { path: '/technopedia', name: 'Technopedia Encyclopedia', category: 'content' },
  { path: '/community', name: 'Community Hub', category: 'engagement' },
  { path: '/submit', name: 'Submit Content', category: 'engagement' },
  { path: '/developer', name: 'Developer API', category: 'technical' },
  { path: '/sound-machine', name: 'Sound Machine', category: 'interactive' },
  { path: '/store', name: 'Store', category: 'commerce' },
  { path: '/support', name: 'Support', category: 'utility' },
  { path: '/sitemap', name: 'Sitemap', category: 'technical' },
];

// Strategy sections structure
const STRATEGY_SECTIONS = [
  {
    key: 'technical_seo',
    name: 'Technical SEO Foundation',
    description: 'Core technical optimizations for crawlability, indexability, and performance'
  },
  {
    key: 'on_page_optimization',
    name: 'On-Page Optimization',
    description: 'Title tags, meta descriptions, headings, content optimization per page'
  },
  {
    key: 'structured_data',
    name: 'Structured Data Strategy',
    description: 'Schema.org markup for rich snippets and enhanced SERP presence'
  },
  {
    key: 'content_strategy',
    name: 'Content Strategy',
    description: 'Content pillars, topic clusters, and editorial calendar for organic growth'
  },
  {
    key: 'keyword_strategy',
    name: 'Keyword Strategy',
    description: 'Target keywords, search intent mapping, and ranking opportunities'
  },
  {
    key: 'internal_linking',
    name: 'Internal Linking Architecture',
    description: 'Link structure, hub pages, and PageRank distribution'
  },
  {
    key: 'local_international',
    name: 'Local & International SEO',
    description: 'Geo-targeting, hreflang, and regional optimization'
  },
  {
    key: 'ga4_gtm_setup',
    name: 'GA4 & GTM Implementation',
    description: 'Analytics setup, event tracking, and conversion measurement'
  },
  {
    key: 'search_console',
    name: 'Search Console Optimization',
    description: 'GSC setup, monitoring, and issue resolution'
  },
  {
    key: 'performance_metrics',
    name: 'Performance Metrics & KPIs',
    description: 'Core Web Vitals, rankings, and traffic goals'
  }
];

// Training modules for Alex
const TRAINING_MODULES = [
  {
    key: 'seo_fundamentals',
    name: 'SEO Fundamentals for techno.dog',
    description: 'Understanding how search engines index and rank our techno content',
    objectives: [
      'Understand how Google crawls and indexes techno.dog pages',
      'Learn the key ranking factors for music/culture websites',
      'Identify high-value pages and content opportunities'
    ]
  },
  {
    key: 'ga4_mastery',
    name: 'GA4 Mastery',
    description: 'Deep dive into Google Analytics 4 for traffic analysis',
    objectives: [
      'Navigate the GA4 dashboard confidently',
      'Create custom reports for content performance',
      'Set up and track SEO-specific conversions'
    ]
  },
  {
    key: 'search_console_mastery',
    name: 'Search Console Mastery',
    description: 'Using GSC to monitor and improve organic visibility',
    objectives: [
      'Monitor indexing status and coverage',
      'Analyze search queries and click-through rates',
      'Identify and fix technical issues'
    ]
  },
  {
    key: 'content_optimization',
    name: 'Content Optimization',
    description: 'Creating and optimizing content for search and users',
    objectives: [
      'Write SEO-friendly titles and descriptions',
      'Structure content with proper headings',
      'Optimize images and media for search'
    ]
  },
  {
    key: 'keyword_research',
    name: 'Keyword Research for Techno',
    description: 'Finding and targeting the right keywords for our niche',
    objectives: [
      'Identify high-value techno-related keywords',
      'Understand search intent for music queries',
      'Map keywords to existing and new content'
    ]
  }
];

async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

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
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API error:", response.status, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function analyzeFullSite(supabase: any): Promise<any> {
  const systemPrompt = `You are an expert SEO strategist specializing in music, culture, and community websites. 
You're analyzing techno.dog - an open-source archive of underground techno culture featuring artists, labels, festivals, venues, gear, and community content.

The site targets a global audience with focus on Europe (especially Berlin, UK), North America (Detroit), Asia (Tokyo), and Latin America.

Provide detailed, actionable SEO analysis in JSON format.`;

  const prompt = `Analyze this site structure for comprehensive SEO optimization:

SITE PAGES:
${JSON.stringify(SITE_PAGES, null, 2)}

CURRENT FEATURES:
- PageSEO component with structured data on all pages
- GA4 and GTM integration
- Multi-language support (hreflang tags)
- Geographic targeting (Berlin-centric with global reach)
- FAQ schema on homepage
- Organization and WebSite schema throughout

Provide a complete SEO strategy analysis as JSON with this structure:
{
  "overallAssessment": {
    "score": number (0-100),
    "summary": "string",
    "topPriorities": ["string", "string", "string"]
  },
  "pageByPageAnalysis": [
    {
      "path": "string",
      "name": "string",
      "seoScore": number,
      "titleRecommendation": "string",
      "metaDescriptionRecommendation": "string",
      "h1Recommendation": "string",
      "keywordOpportunities": ["string"],
      "structuredDataNeeded": ["string"],
      "contentGaps": ["string"],
      "actions": [
        {
          "name": "string",
          "type": "implement|audit|optimize|monitor|research|content",
          "priority": "critical|high|medium|low",
          "estimatedImpact": "string",
          "implementationNotes": "string"
        }
      ]
    }
  ],
  "keywordStrategy": [
    {
      "keyword": "string",
      "type": "primary|secondary|long_tail|branded|local",
      "searchVolumeEstimate": "string",
      "competition": "low|medium|high",
      "targetPages": ["string"],
      "contentStrategy": "string"
    }
  ],
  "technicalChecks": [
    {
      "check": "string",
      "status": "pass|warning|fail",
      "details": "string",
      "action": "string"
    }
  ],
  "contentCalendar": [
    {
      "contentType": "blog_post|landing_page|feature_page|update|optimization",
      "title": "string",
      "targetKeywords": ["string"],
      "targetPage": "string",
      "seoObjective": "string",
      "priority": "critical|high|medium|low"
    }
  ],
  "ga4Recommendations": {
    "eventsToTrack": ["string"],
    "conversionsToSetup": ["string"],
    "customDimensions": ["string"],
    "audiencesToCreate": ["string"]
  },
  "searchConsoleRecommendations": {
    "priorityActions": ["string"],
    "monitoringCadence": "string",
    "alertsToSetup": ["string"]
  }
}`;

  const response = await callGemini(prompt, systemPrompt);
  
  // Parse the JSON from the response
  try {
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return { error: "Failed to parse AI response", rawResponse: response };
  }
}

async function generateSectionStrategy(supabase: any, sectionKey: string): Promise<any> {
  const section = STRATEGY_SECTIONS.find(s => s.key === sectionKey);
  if (!section) {
    throw new Error(`Unknown section: ${sectionKey}`);
  }

  const systemPrompt = `You are an expert SEO strategist creating a detailed playbook section for techno.dog - an open-source archive of underground techno culture.

This section is: ${section.name}
Description: ${section.description}

Create comprehensive, actionable content that serves as both documentation AND training material for an admin named Alex who is learning SEO.`;

  const prompt = `Generate a complete strategy section for "${section.name}" with:

1. OVERVIEW: 2-3 paragraphs explaining this aspect of SEO in the context of techno.dog
2. CURRENT STATE: Assessment of what's likely already implemented
3. BEST PRACTICES: 5-7 specific best practices with examples
4. ACTION ITEMS: 10+ specific, actionable tasks with:
   - Clear task name
   - Type (implement/audit/optimize/monitor/research/content)
   - Priority (critical/high/medium/low)
   - Estimated impact
   - Step-by-step implementation notes
5. METRICS TO TRACK: KPIs for measuring success
6. RESOURCES: Links or references for deeper learning

Format as JSON:
{
  "overview": "string",
  "currentState": "string", 
  "bestPractices": ["string"],
  "actionItems": [
    {
      "name": "string",
      "type": "string",
      "priority": "string",
      "estimatedImpact": "string",
      "implementationNotes": "string",
      "pageTarget": "string or null"
    }
  ],
  "metricsToTrack": ["string"],
  "resources": ["string"]
}`;

  const response = await callGemini(prompt, systemPrompt);
  
  try {
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    return { content: response };
  }
}

async function generateTrainingContent(supabase: any, moduleKey: string): Promise<any> {
  const module = TRAINING_MODULES.find(m => m.key === moduleKey);
  if (!module) {
    throw new Error(`Unknown module: ${moduleKey}`);
  }

  const systemPrompt = `You are creating an SEO training module for Alex, an admin learning to manage SEO for techno.dog - an underground techno culture archive.

Module: ${module.name}
Description: ${module.description}
Learning Objectives: ${module.objectives.join(', ')}

Make the content practical, engaging, and specific to techno.dog's context.`;

  const prompt = `Create a complete training module with:

1. INTRODUCTION (2-3 paragraphs)
2. KEY CONCEPTS (5-7 concepts with explanations)
3. STEP-BY-STEP TUTORIALS (3-5 practical tutorials)
4. EXERCISES (3-5 hands-on exercises for techno.dog)
5. QUIZ (5-7 questions with correct answers)
6. NEXT STEPS

Format as JSON:
{
  "introduction": "string",
  "keyConcepts": [
    {"concept": "string", "explanation": "string", "example": "string"}
  ],
  "tutorials": [
    {"title": "string", "steps": ["string"], "outcome": "string"}
  ],
  "exercises": [
    {"title": "string", "description": "string", "expectedOutcome": "string"}
  ],
  "quiz": [
    {"question": "string", "options": ["string"], "correctAnswer": number, "explanation": "string"}
  ],
  "nextSteps": ["string"]
}`;

  const response = await callGemini(prompt, systemPrompt);
  
  try {
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    return { content: response };
  }
}

async function answerQuestion(question: string, supabase: any): Promise<string> {
  // Fetch relevant context
  const { data: sections } = await supabase
    .from('seo_strategy_sections')
    .select('section_name, content')
    .limit(5);

  const { data: actions } = await supabase
    .from('seo_strategy_actions')
    .select('action_name, description, status')
    .limit(10);

  const context = {
    sections: sections || [],
    actions: actions || [],
    sitePages: SITE_PAGES,
    strategySections: STRATEGY_SECTIONS
  };

  const systemPrompt = `You are an SEO expert assistant for techno.dog. Answer questions about the site's SEO strategy, Google Analytics, Tag Manager, and Search Console.

Context about the site:
${JSON.stringify(context, null, 2)}

Be specific, actionable, and reference techno.dog's actual pages and content when possible.`;

  return await callGemini(question, systemPrompt);
}

async function markActionComplete(supabase: any, actionId: string): Promise<void> {
  await supabase
    .from('seo_strategy_actions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: 'Alex'
    })
    .eq('id', actionId);
}

async function initializePlaybook(supabase: any): Promise<any> {
  // Create strategy sections
  for (const section of STRATEGY_SECTIONS) {
    await supabase
      .from('seo_strategy_sections')
      .upsert({
        section_key: section.key,
        section_name: section.name,
        description: section.description,
        status: 'draft'
      }, { onConflict: 'section_key' });
  }

  // Create training modules
  for (const module of TRAINING_MODULES) {
    await supabase
      .from('seo_training_modules')
      .upsert({
        module_key: module.key,
        module_name: module.name,
        description: module.description,
        learning_objectives: module.objectives,
        completion_status: 'not_started'
      }, { onConflict: 'module_key' });
  }

  // Create initial page analysis entries
  for (const page of SITE_PAGES) {
    await supabase
      .from('seo_page_analysis')
      .upsert({
        page_path: page.path,
        page_name: page.name,
        seo_score: null,
        recommendations: []
      }, { onConflict: 'page_path' });
  }

  return {
    sectionsCreated: STRATEGY_SECTIONS.length,
    modulesCreated: TRAINING_MODULES.length,
    pagesRegistered: SITE_PAGES.length
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, pageTarget, sectionKey, question, actionId }: StrategyRequest = await req.json();

    // Log the run
    const { data: run } = await supabase
      .from('seo_strategy_agent_runs')
      .insert({ run_type: action, status: 'running' })
      .select()
      .single();

    let result: any;

    switch (action) {
      case 'initialize':
        result = await initializePlaybook(supabase);
        break;

      case 'full_analysis':
        result = await analyzeFullSite(supabase);
        
        // Store page analysis results
        if (result.pageByPageAnalysis) {
          for (const page of result.pageByPageAnalysis) {
            await supabase
              .from('seo_page_analysis')
              .upsert({
                page_path: page.path,
                page_name: page.name,
                seo_score: page.seoScore,
                title_analysis: { recommendation: page.titleRecommendation },
                meta_description_analysis: { recommendation: page.metaDescriptionRecommendation },
                heading_analysis: { h1Recommendation: page.h1Recommendation },
                keyword_opportunities: { keywords: page.keywordOpportunities },
                structured_data_analysis: { needed: page.structuredDataNeeded },
                content_analysis: { gaps: page.contentGaps },
                recommendations: page.actions?.map((a: any) => a.name) || [],
                last_analyzed_at: new Date().toISOString()
              }, { onConflict: 'page_path' });

            // Store actions
            if (page.actions) {
              const { data: sectionData } = await supabase
                .from('seo_strategy_sections')
                .select('id')
                .eq('section_key', 'on_page_optimization')
                .single();

              for (const actionItem of page.actions) {
                await supabase
                  .from('seo_strategy_actions')
                  .insert({
                    section_id: sectionData?.id,
                    action_name: actionItem.name,
                    description: actionItem.implementationNotes,
                    action_type: actionItem.type,
                    priority: actionItem.priority,
                    estimated_impact: actionItem.estimatedImpact,
                    implementation_notes: actionItem.implementationNotes,
                    page_target: page.path
                  });
              }
            }
          }
        }

        // Store keyword strategy
        if (result.keywordStrategy) {
          for (const kw of result.keywordStrategy) {
            await supabase
              .from('seo_keyword_strategy')
              .insert({
                keyword: kw.keyword,
                keyword_type: kw.type,
                search_volume_estimate: kw.searchVolumeEstimate,
                competition_level: kw.competition,
                target_pages: kw.targetPages,
                content_strategy: kw.contentStrategy
              });
          }
        }

        // Store content calendar items
        if (result.contentCalendar) {
          for (const item of result.contentCalendar) {
            await supabase
              .from('seo_content_calendar')
              .insert({
                content_type: item.contentType,
                title: item.title,
                target_keywords: item.targetKeywords,
                target_page: item.targetPage,
                seo_objective: item.seoObjective
              });
          }
        }
        break;

      case 'generate_section':
        if (!sectionKey) throw new Error('sectionKey required');
        result = await generateSectionStrategy(supabase, sectionKey);
        
        // Update section content
        await supabase
          .from('seo_strategy_sections')
          .update({
            content: JSON.stringify(result),
            status: 'active',
            last_analyzed_at: new Date().toISOString()
          })
          .eq('section_key', sectionKey);

        // Store action items
        if (result.actionItems) {
          const { data: sectionData } = await supabase
            .from('seo_strategy_sections')
            .select('id')
            .eq('section_key', sectionKey)
            .single();

          for (const actionItem of result.actionItems) {
            await supabase
              .from('seo_strategy_actions')
              .insert({
                section_id: sectionData?.id,
                action_name: actionItem.name,
                description: actionItem.implementationNotes,
                action_type: actionItem.type,
                priority: actionItem.priority,
                estimated_impact: actionItem.estimatedImpact,
                implementation_notes: actionItem.implementationNotes,
                page_target: actionItem.pageTarget
              });
          }
        }
        break;

      case 'generate_training':
        if (!sectionKey) throw new Error('moduleKey required');
        result = await generateTrainingContent(supabase, sectionKey);
        
        await supabase
          .from('seo_training_modules')
          .update({
            content: JSON.stringify(result),
            exercises: result.exercises,
            quiz_results: { quiz: result.quiz }
          })
          .eq('module_key', sectionKey);
        break;

      case 'ask_question':
        if (!question) throw new Error('question required');
        result = { answer: await answerQuestion(question, supabase) };
        break;

      case 'complete_action':
        if (!actionId) throw new Error('actionId required');
        await markActionComplete(supabase, actionId);
        result = { completed: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update run status
    await supabase
      .from('seo_strategy_agent_runs')
      .update({
        status: 'completed',
        finished_at: new Date().toISOString(),
        results: result
      })
      .eq('id', run.id);

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("SEO Strategy Agent error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
