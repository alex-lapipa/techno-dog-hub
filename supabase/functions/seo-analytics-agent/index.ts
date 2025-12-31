import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// All site pages for SEO audit
const SITE_PAGES = [
  { path: '/', priority: 1.0, name: 'Homepage' },
  { path: '/technopedia', priority: 0.9, name: 'Technopedia' },
  { path: '/artists', priority: 0.9, name: 'Artists' },
  { path: '/gear', priority: 0.9, name: 'Gear' },
  { path: '/festivals', priority: 0.9, name: 'Festivals' },
  { path: '/venues', priority: 0.9, name: 'Venues' },
  { path: '/labels', priority: 0.8, name: 'Labels' },
  { path: '/crews', priority: 0.8, name: 'Crews' },
  { path: '/books', priority: 0.8, name: 'Books' },
  { path: '/documentaries', priority: 0.8, name: 'Documentaries' },
  { path: '/news', priority: 0.8, name: 'News' },
  { path: '/releases', priority: 0.7, name: 'Releases' },
  { path: '/doggies', priority: 0.7, name: 'Doggies' },
  { path: '/developer', priority: 0.6, name: 'Developer API' },
  { path: '/community', priority: 0.6, name: 'Community' },
  { path: '/submit', priority: 0.6, name: 'Submit' },
  { path: '/support', priority: 0.5, name: 'Support' },
  { path: '/store', priority: 0.7, name: 'Store' },
];

// Target keywords by category
const TARGET_KEYWORDS = {
  global: [
    'techno music', 'techno DJs', 'techno artists', 'underground techno',
    'techno festivals', 'techno clubs', 'techno venues', 'techno labels',
    'DJ gear', 'synthesizers', 'drum machines', 'techno equipment',
    'electronic music', 'dance music', 'rave culture', 'open source techno'
  ],
  regional: {
    europe: ['Berlin techno', 'European techno festivals', 'Berghain', 'Tresor', 'Dekmantel'],
    uk: ['UK techno', 'London techno clubs', 'Fabric', 'British techno DJs'],
    northAmerica: ['Detroit techno', 'American techno', 'Movement festival', 'techno USA'],
    asia: ['Japanese techno', 'Asian techno scene', 'Tokyo techno clubs'],
    latam: ['Latin American techno', 'Mexico techno', 'South American electronic music']
  }
};

interface AuditResult {
  timestamp: string;
  pagesAudited: number;
  issues: SEOIssue[];
  recommendations: string[];
  keywordAnalysis: KeywordAnalysis;
  contentGaps: string[];
  technicalSEO: TechnicalSEOCheck[];
  score: number;
}

interface SEOIssue {
  page: string;
  severity: 'critical' | 'warning' | 'info';
  issue: string;
  recommendation: string;
}

interface KeywordAnalysis {
  targetKeywords: string[];
  coverage: number;
  missingKeywords: string[];
  opportunities: string[];
}

interface TechnicalSEOCheck {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { action } = await req.json().catch(() => ({ action: 'audit' }));

    console.log(`SEO Analytics Agent running: ${action}`);

    // Fetch analytics data for the past 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const [
      { data: analyticsEvents },
      { data: artistsCount },
      { data: festivalsCount },
      { data: venuesCount },
      { data: gearCount },
      { data: labelsCount },
      { data: newsArticles },
    ] = await Promise.all([
      supabase.from('analytics_events').select('*').gte('created_at', sevenDaysAgo).limit(1000),
      supabase.from('canonical_artists').select('artist_id', { count: 'exact', head: true }),
      supabase.from('festivals').select('id', { count: 'exact', head: true }),
      supabase.from('venues').select('id', { count: 'exact', head: true }),
      supabase.from('gear').select('id', { count: 'exact', head: true }),
      supabase.from('labels').select('id', { count: 'exact', head: true }),
      supabase.from('news_articles').select('id, title, status').eq('status', 'published').limit(50),
    ]);

    // Aggregate analytics data
    const pageViews = analyticsEvents?.filter(e => e.event_type === 'page_view') || [];
    const searches = analyticsEvents?.filter(e => e.event_type === 'search') || [];
    const errors = analyticsEvents?.filter(e => e.event_type === 'error') || [];

    const topPages = pageViews.reduce((acc: Record<string, number>, event) => {
      const path = event.page_path || '/';
      acc[path] = (acc[path] || 0) + 1;
      return acc;
    }, {});

    const searchTerms = searches.map(s => s.metadata?.query).filter(Boolean);

    // Build context for Gemini analysis
    const siteContext = {
      contentCounts: {
        artists: artistsCount || 0,
        festivals: festivalsCount || 0,
        venues: venuesCount || 0,
        gear: gearCount || 0,
        labels: labelsCount || 0,
        publishedArticles: newsArticles?.length || 0,
      },
      analytics: {
        totalPageViews: pageViews.length,
        uniquePages: Object.keys(topPages).length,
        topPages: Object.entries(topPages).sort((a, b) => b[1] - a[1]).slice(0, 10),
        searchTerms: [...new Set(searchTerms)].slice(0, 20),
        errorCount: errors.length,
      },
      targetKeywords: TARGET_KEYWORDS,
      sitePages: SITE_PAGES,
    };

    // Call Gemini for SEO analysis
    const geminiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert SEO analyst specializing in music and entertainment websites. Your job is to analyze techno.dog, an open-source archive of underground techno culture.

Target audience regions in priority order:
1. Europe (especially Germany, Netherlands, UK)
2. North America (Detroit, NYC, LA)
3. Asia (Japan, South Korea)
4. Latin America (Mexico, Brazil, Argentina)

Focus areas:
- Techno music, DJs, artists, labels
- Music production gear (synthesizers, drum machines)
- Festivals and venues
- Underground culture and history

Your analysis must be actionable, specific, and data-driven.`
          },
          {
            role: "user",
            content: `Analyze this SEO data and provide a comprehensive audit report:

${JSON.stringify(siteContext, null, 2)}

Provide your response as a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence executive summary>",
  "criticalIssues": [
    {"page": "<path>", "issue": "<description>", "recommendation": "<fix>"}
  ],
  "warnings": [
    {"page": "<path>", "issue": "<description>", "recommendation": "<fix>"}
  ],
  "keywordOpportunities": [
    {"keyword": "<term>", "searchVolume": "<high/medium/low>", "competition": "<high/medium/low>", "recommendation": "<action>"}
  ],
  "contentGaps": ["<gap description>"],
  "technicalChecks": [
    {"check": "<name>", "status": "<pass/fail/warning>", "details": "<explanation>"}
  ],
  "weeklyPriorities": ["<priority 1>", "<priority 2>", "<priority 3>"],
  "competitorInsights": "<brief competitive analysis>",
  "regionalOptimization": {
    "europe": "<recommendation>",
    "northAmerica": "<recommendation>",
    "asia": "<recommendation>",
    "latam": "<recommendation>"
  }
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const analysisText = geminiData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown wrapping)
    let analysis;
    try {
      const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        analysisText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      analysis = {
        overallScore: 70,
        summary: "Analysis completed with parsing issues. Review raw data.",
        criticalIssues: [],
        warnings: [],
        keywordOpportunities: [],
        contentGaps: [],
        technicalChecks: [],
        weeklyPriorities: ["Review SEO meta tags", "Optimize page load speed", "Add structured data"],
        competitorInsights: "Unable to parse full analysis.",
        regionalOptimization: {},
        rawAnalysis: analysisText,
      };
    }

    // Store the audit report
    const report = {
      ...analysis,
      timestamp: new Date().toISOString(),
      siteMetrics: siteContext.contentCounts,
      analyticsSnapshot: {
        pageViews: pageViews.length,
        searches: searchTerms.length,
        errors: errors.length,
      },
    };

    // Store in analytics_insights table
    await supabase.from('analytics_insights').insert({
      insight_type: 'seo_audit',
      title: `Weekly SEO Audit - ${new Date().toLocaleDateString()}`,
      content: analysis.summary || 'SEO audit completed',
      data: report,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    // Create agent report for admin dashboard
    await supabase.from('agent_reports').insert({
      agent_name: 'SEO Analytics Agent',
      agent_category: 'Growth',
      title: `SEO Audit Report - Score: ${analysis.overallScore || 'N/A'}`,
      description: analysis.summary || 'Weekly SEO audit completed',
      severity: analysis.overallScore >= 80 ? 'info' : analysis.overallScore >= 60 ? 'warning' : 'critical',
      report_type: 'seo_audit',
      details: report,
    });

    // Update agent status
    await supabase.from('agent_status').upsert({
      agent_name: 'SEO Analytics Agent',
      function_name: 'seo-analytics-agent',
      status: 'idle',
      category: 'Growth',
      last_run_at: new Date().toISOString(),
      last_success_at: new Date().toISOString(),
    }, { onConflict: 'function_name' });

    console.log("SEO audit completed successfully. Score:", analysis.overallScore);

    return new Response(JSON.stringify({
      success: true,
      report,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("SEO Analytics Agent error:", error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
