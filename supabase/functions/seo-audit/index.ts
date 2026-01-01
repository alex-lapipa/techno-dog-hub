import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://techno.dog";

// Key pages to audit
const PAGES_TO_AUDIT = [
  "/",
  "/artists",
  "/gear",
  "/labels",
  "/festivals",
  "/venues",
  "/news",
  "/books",
  "/documentaries",
  "/technopedia",
  "/collectives",
  "/contribute",
  "/doggies"
];

interface PageSpeedResult {
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  coreWebVitals: {
    lcp: { value: number; rating: string };
    fid: { value: number; rating: string };
    cls: { value: number; rating: string };
    fcp: { value: number; rating: string };
    ttfb: { value: number; rating: string };
  };
  issues: string[];
  opportunities: string[];
}

interface TagAuditResult {
  url: string;
  title: { present: boolean; value: string | null; length: number; issues: string[] };
  metaDescription: { present: boolean; value: string | null; length: number; issues: string[] };
  h1: { present: boolean; count: number; values: string[]; issues: string[] };
  canonical: { present: boolean; value: string | null; issues: string[] };
  ogTags: { present: boolean; missing: string[] };
  twitterTags: { present: boolean; missing: string[] };
  structuredData: { present: boolean; types: string[] };
  robots: { indexable: boolean; issues: string[] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("SEO Audit: Starting comprehensive audit...");

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { pages = PAGES_TO_AUDIT, strategy = "mobile" } = await req.json().catch(() => ({}));

    const pageSpeedResults: PageSpeedResult[] = [];
    const tagAuditResults: TagAuditResult[] = [];
    const overallIssues: { severity: string; issue: string; page: string; recommendation: string }[] = [];

    // Audit each page
    for (const page of pages.slice(0, 10)) { // Limit to 10 pages per audit
      const fullUrl = `${SITE_URL}${page}`;
      console.log(`Auditing: ${fullUrl}`);

      try {
        // 1. PageSpeed Insights API for performance & SEO scores
        const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${GOOGLE_API_KEY}`;
        
        const psiResponse = await fetch(psiUrl);
        
        if (psiResponse.ok) {
          const psiData = await psiResponse.json();
          const lighthouse = psiData.lighthouseResult;
          const categories = lighthouse?.categories || {};
          const audits = lighthouse?.audits || {};

          // Extract scores
          const scores = {
            performance: Math.round((categories.performance?.score || 0) * 100),
            accessibility: Math.round((categories.accessibility?.score || 0) * 100),
            bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
            seo: Math.round((categories.seo?.score || 0) * 100),
          };

          // Extract Core Web Vitals
          const coreWebVitals = {
            lcp: {
              value: audits['largest-contentful-paint']?.numericValue || 0,
              rating: audits['largest-contentful-paint']?.score >= 0.9 ? 'good' : audits['largest-contentful-paint']?.score >= 0.5 ? 'needs-improvement' : 'poor'
            },
            fid: {
              value: audits['max-potential-fid']?.numericValue || 0,
              rating: audits['max-potential-fid']?.score >= 0.9 ? 'good' : audits['max-potential-fid']?.score >= 0.5 ? 'needs-improvement' : 'poor'
            },
            cls: {
              value: audits['cumulative-layout-shift']?.numericValue || 0,
              rating: audits['cumulative-layout-shift']?.score >= 0.9 ? 'good' : audits['cumulative-layout-shift']?.score >= 0.5 ? 'needs-improvement' : 'poor'
            },
            fcp: {
              value: audits['first-contentful-paint']?.numericValue || 0,
              rating: audits['first-contentful-paint']?.score >= 0.9 ? 'good' : audits['first-contentful-paint']?.score >= 0.5 ? 'needs-improvement' : 'poor'
            },
            ttfb: {
              value: audits['server-response-time']?.numericValue || 0,
              rating: audits['server-response-time']?.score >= 0.9 ? 'good' : audits['server-response-time']?.score >= 0.5 ? 'needs-improvement' : 'poor'
            }
          };

          // Extract issues and opportunities
          const issues: string[] = [];
          const opportunities: string[] = [];

          // Check SEO-specific audits
          const seoAudits = [
            'document-title',
            'meta-description',
            'http-status-code',
            'link-text',
            'crawlable-anchors',
            'is-crawlable',
            'robots-txt',
            'hreflang',
            'canonical',
            'structured-data'
          ];

          for (const auditKey of seoAudits) {
            const audit = audits[auditKey];
            if (audit && audit.score !== null && audit.score < 1) {
              issues.push(`${audit.title}: ${audit.description?.substring(0, 100)}`);
            }
          }

          // Check for opportunities
          const opportunityAudits = [
            'render-blocking-resources',
            'uses-responsive-images',
            'offscreen-images',
            'unminified-css',
            'unminified-javascript',
            'unused-css-rules',
            'unused-javascript'
          ];

          for (const auditKey of opportunityAudits) {
            const audit = audits[auditKey];
            if (audit && audit.score !== null && audit.score < 1 && audit.details?.overallSavingsMs > 100) {
              opportunities.push(`${audit.title}: Save ~${Math.round(audit.details.overallSavingsMs)}ms`);
            }
          }

          pageSpeedResults.push({
            url: page,
            scores,
            coreWebVitals,
            issues,
            opportunities
          });

          // Add to overall issues
          if (scores.seo < 90) {
            overallIssues.push({
              severity: scores.seo < 70 ? 'error' : 'warning',
              issue: `Low SEO score: ${scores.seo}/100`,
              page,
              recommendation: 'Review Lighthouse SEO audit for specific improvements'
            });
          }

          if (scores.performance < 50) {
            overallIssues.push({
              severity: 'error',
              issue: `Poor performance score: ${scores.performance}/100`,
              page,
              recommendation: 'Optimize images, reduce JavaScript, enable compression'
            });
          }

          if (coreWebVitals.lcp.rating === 'poor') {
            overallIssues.push({
              severity: 'error',
              issue: `LCP is poor: ${(coreWebVitals.lcp.value / 1000).toFixed(2)}s`,
              page,
              recommendation: 'Optimize largest content element, use image CDN, preload critical assets'
            });
          }

          if (coreWebVitals.cls.rating === 'poor') {
            overallIssues.push({
              severity: 'error',
              issue: `CLS is poor: ${coreWebVitals.cls.value.toFixed(3)}`,
              page,
              recommendation: 'Add explicit dimensions to images and embeds, avoid dynamic content injection'
            });
          }
        } else {
          console.error(`PageSpeed API error for ${page}:`, await psiResponse.text());
        }

        // 2. Fetch page HTML for tag analysis
        const htmlResponse = await fetch(fullUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechnoDogBot/1.0)' }
        });

        if (htmlResponse.ok) {
          const html = await htmlResponse.text();
          
          // Parse tags
          const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
          const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
          const h1Matches = html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi);
          const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
          const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
          
          // OG tags
          const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
          const ogDescription = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
          const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
          const ogUrl = html.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([^"']*)["']/i);
          
          // Twitter tags
          const twitterCard = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i);
          const twitterTitle = html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)["']/i);
          
          // Structured data
          const structuredDataMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
          const structuredDataTypes: string[] = [];
          for (const match of structuredDataMatches) {
            try {
              const data = JSON.parse(match[1]);
              structuredDataTypes.push(data['@type'] || 'Unknown');
            } catch { }
          }

          const h1Values: string[] = [];
          for (const match of h1Matches) {
            h1Values.push(match[1].replace(/<[^>]*>/g, '').trim());
          }

          const titleValue = titleMatch?.[1]?.trim() || null;
          const metaDescValue = metaDescMatch?.[1]?.trim() || null;

          // Analyze issues
          const titleIssues: string[] = [];
          if (!titleValue) titleIssues.push('Missing title tag');
          else if (titleValue.length < 30) titleIssues.push('Title too short (<30 chars)');
          else if (titleValue.length > 60) titleIssues.push('Title too long (>60 chars)');

          const metaDescIssues: string[] = [];
          if (!metaDescValue) metaDescIssues.push('Missing meta description');
          else if (metaDescValue.length < 120) metaDescIssues.push('Meta description too short (<120 chars)');
          else if (metaDescValue.length > 160) metaDescIssues.push('Meta description too long (>160 chars)');

          const h1Issues: string[] = [];
          if (h1Values.length === 0) h1Issues.push('Missing H1 tag');
          else if (h1Values.length > 1) h1Issues.push(`Multiple H1 tags (${h1Values.length})`);

          const canonicalIssues: string[] = [];
          if (!canonicalMatch) canonicalIssues.push('Missing canonical tag');

          const missingOg: string[] = [];
          if (!ogTitle) missingOg.push('og:title');
          if (!ogDescription) missingOg.push('og:description');
          if (!ogImage) missingOg.push('og:image');
          if (!ogUrl) missingOg.push('og:url');

          const missingTwitter: string[] = [];
          if (!twitterCard) missingTwitter.push('twitter:card');
          if (!twitterTitle) missingTwitter.push('twitter:title');

          const robotsContent = robotsMatch?.[1]?.toLowerCase() || '';
          const indexable = !robotsContent.includes('noindex');
          const robotsIssues: string[] = [];
          if (!indexable) robotsIssues.push('Page is set to noindex');
          if (robotsContent.includes('nofollow')) robotsIssues.push('Page is set to nofollow');

          tagAuditResults.push({
            url: page,
            title: { present: !!titleValue, value: titleValue, length: titleValue?.length || 0, issues: titleIssues },
            metaDescription: { present: !!metaDescValue, value: metaDescValue, length: metaDescValue?.length || 0, issues: metaDescIssues },
            h1: { present: h1Values.length > 0, count: h1Values.length, values: h1Values, issues: h1Issues },
            canonical: { present: !!canonicalMatch, value: canonicalMatch?.[1] || null, issues: canonicalIssues },
            ogTags: { present: missingOg.length === 0, missing: missingOg },
            twitterTags: { present: missingTwitter.length === 0, missing: missingTwitter },
            structuredData: { present: structuredDataTypes.length > 0, types: structuredDataTypes },
            robots: { indexable, issues: robotsIssues }
          });

          // Add tag issues to overall
          if (titleIssues.length > 0) {
            overallIssues.push({
              severity: !titleValue ? 'error' : 'warning',
              issue: titleIssues.join(', '),
              page,
              recommendation: 'Ensure title is 30-60 characters with primary keyword'
            });
          }

          if (metaDescIssues.length > 0) {
            overallIssues.push({
              severity: !metaDescValue ? 'error' : 'warning',
              issue: metaDescIssues.join(', '),
              page,
              recommendation: 'Add compelling meta description 120-160 characters'
            });
          }

          if (h1Issues.length > 0) {
            overallIssues.push({
              severity: h1Values.length === 0 ? 'error' : 'warning',
              issue: h1Issues.join(', '),
              page,
              recommendation: 'Each page should have exactly one H1 tag'
            });
          }

          if (missingOg.length > 0) {
            overallIssues.push({
              severity: 'warning',
              issue: `Missing OG tags: ${missingOg.join(', ')}`,
              page,
              recommendation: 'Add Open Graph tags for social sharing'
            });
          }

          if (!structuredDataTypes.length) {
            overallIssues.push({
              severity: 'info',
              issue: 'No structured data found',
              page,
              recommendation: 'Add JSON-LD structured data for rich snippets'
            });
          }
        }

        // Add delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 1000));

      } catch (pageError) {
        console.error(`Error auditing ${page}:`, pageError);
      }
    }

    // Calculate summary scores
    const avgScores = {
      performance: pageSpeedResults.length > 0 
        ? Math.round(pageSpeedResults.reduce((a, b) => a + b.scores.performance, 0) / pageSpeedResults.length) 
        : 0,
      accessibility: pageSpeedResults.length > 0 
        ? Math.round(pageSpeedResults.reduce((a, b) => a + b.scores.accessibility, 0) / pageSpeedResults.length) 
        : 0,
      bestPractices: pageSpeedResults.length > 0 
        ? Math.round(pageSpeedResults.reduce((a, b) => a + b.scores.bestPractices, 0) / pageSpeedResults.length) 
        : 0,
      seo: pageSpeedResults.length > 0 
        ? Math.round(pageSpeedResults.reduce((a, b) => a + b.scores.seo, 0) / pageSpeedResults.length) 
        : 0,
    };

    const errorCount = overallIssues.filter(i => i.severity === 'error').length;
    const warningCount = overallIssues.filter(i => i.severity === 'warning').length;
    const infoCount = overallIssues.filter(i => i.severity === 'info').length;

    const auditReport = {
      timestamp: new Date().toISOString(),
      strategy,
      pagesAudited: pages.length,
      summary: {
        averageScores: avgScores,
        overallHealth: avgScores.seo >= 90 && avgScores.performance >= 70 ? 'good' 
          : avgScores.seo >= 70 && avgScores.performance >= 50 ? 'needs-improvement' 
          : 'poor',
        issueCount: { errors: errorCount, warnings: warningCount, info: infoCount }
      },
      pageSpeedResults,
      tagAuditResults,
      issues: overallIssues
    };

    // Store audit report
    await supabase.from('analytics_insights').insert({
      insight_type: 'seo_audit',
      title: `SEO Audit: ${new Date().toLocaleDateString()}`,
      content: `Audited ${pages.length} pages. Avg SEO: ${avgScores.seo}/100, Performance: ${avgScores.performance}/100. Found ${errorCount} errors, ${warningCount} warnings.`,
      data: auditReport,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Create agent report
    await supabase.from('agent_reports').insert({
      agent_name: 'SEO Auditor',
      agent_category: 'seo',
      report_type: 'audit',
      severity: errorCount > 5 ? 'critical' : errorCount > 0 ? 'warning' : 'info',
      title: `SEO Audit: ${errorCount} errors, ${warningCount} warnings`,
      description: `Avg scores - SEO: ${avgScores.seo}, Performance: ${avgScores.performance}, Accessibility: ${avgScores.accessibility}`,
      details: auditReport
    });

    console.log("SEO Audit: Complete");

    return new Response(
      JSON.stringify(auditReport),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SEO Audit error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
