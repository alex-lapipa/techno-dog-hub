import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Doggy Analytics Insights Agent
 * 
 * Multi-model AI orchestration for analyzing share dynamics
 * Uses: OpenAI, Anthropic, Google Gemini, Groq
 * 
 * Actions:
 * - 'analyze': Run comprehensive share analysis
 * - 'daily-summary': Generate daily insights
 * - 'viral-detection': Detect viral chains
 * - 'platform-performance': Analyze platform effectiveness
 * - 'consensus': Multi-model consensus analysis
 */

interface ShareStats {
  total: number;
  byPlatform: Record<string, number>;
  byDoggy: Record<string, number>;
  reshares: number;
  viralChains: number;
  avgChainDepth: number;
  topPerformers: string[];
}

interface ModelResponse {
  model: string;
  provider: string;
  analysis: string;
  confidence: number;
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, timeRange = '24h' } = await req.json();
    console.log(`[doggy-analytics-insights] Action: ${action}, TimeRange: ${timeRange}`);

    switch (action) {
      case 'analyze':
        return await runFullAnalysis(supabase, timeRange);
      
      case 'daily-summary':
        return await generateDailySummary(supabase);
      
      case 'viral-detection':
        return await detectViralChains(supabase);
      
      case 'platform-performance':
        return await analyzePlatformPerformance(supabase, timeRange);
      
      case 'consensus':
        return await runConsensusAnalysis(supabase, timeRange);
      
      case 'get-insights':
        return await getStoredInsights(supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action', validActions: ['analyze', 'daily-summary', 'viral-detection', 'platform-performance', 'consensus', 'get-insights'] }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[doggy-analytics-insights] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fetch share statistics
async function getShareStats(supabase: any, timeRange: string): Promise<ShareStats> {
  const hoursMap: Record<string, number> = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };
  const hours = hoursMap[timeRange] || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  // Get share events
  const { data: shareEvents, error } = await supabase
    .from('doggy_share_events')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching share events:', error);
    // Fall back to legacy analytics
    const { data: legacyData } = await supabase
      .from('doggy_analytics')
      .select('*')
      .gte('created_at', since);
    
    return processLegacyAnalytics(legacyData || []);
  }
  
  const stats: ShareStats = {
    total: shareEvents?.length || 0,
    byPlatform: {},
    byDoggy: {},
    reshares: 0,
    viralChains: 0,
    avgChainDepth: 0,
    topPerformers: []
  };
  
  let totalChainDepth = 0;
  let chainCount = 0;
  
  (shareEvents || []).forEach((event: any) => {
    // By platform
    stats.byPlatform[event.platform] = (stats.byPlatform[event.platform] || 0) + 1;
    
    // By doggy
    stats.byDoggy[event.doggy_name] = (stats.byDoggy[event.doggy_name] || 0) + 1;
    
    // Reshares
    if (event.share_type === 'reshare' || event.parent_share_id) {
      stats.reshares++;
    }
    
    // Chain tracking
    if (event.chain_depth > 0) {
      stats.viralChains++;
      totalChainDepth += event.chain_depth;
      chainCount++;
    }
  });
  
  stats.avgChainDepth = chainCount > 0 ? totalChainDepth / chainCount : 0;
  
  // Top performers
  stats.topPerformers = Object.entries(stats.byDoggy)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
  
  return stats;
}

function processLegacyAnalytics(data: any[]): ShareStats {
  const stats: ShareStats = {
    total: 0,
    byPlatform: {},
    byDoggy: {},
    reshares: 0,
    viralChains: 0,
    avgChainDepth: 0,
    topPerformers: []
  };
  
  data.forEach((item: any) => {
    if (item.action_type.startsWith('share_')) {
      stats.total++;
      const platform = item.action_type.replace('share_', '');
      stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
      stats.byDoggy[item.variant_name] = (stats.byDoggy[item.variant_name] || 0) + 1;
    }
  });
  
  stats.topPerformers = Object.entries(stats.byDoggy)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
  
  return stats;
}

// Call OpenAI
async function callOpenAI(prompt: string, systemPrompt: string): Promise<ModelResponse> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_completion_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI API error');
  
  return {
    model: 'gpt-5-mini',
    provider: 'openai',
    analysis: data.choices[0].message.content,
    confidence: 0.85,
    recommendations: []
  };
}

// Call Anthropic
async function callAnthropic(prompt: string, systemPrompt: string): Promise<ModelResponse> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Anthropic API error');
  
  return {
    model: 'claude-sonnet-4-20250514',
    provider: 'anthropic',
    analysis: data.content[0].text,
    confidence: 0.88,
    recommendations: []
  };
}

// Call Gemini
async function callGemini(prompt: string, systemPrompt: string): Promise<ModelResponse> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
      }],
      generationConfig: { maxOutputTokens: 1000 }
    }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');
  
  return {
    model: 'gemini-1.5-flash',
    provider: 'gemini',
    analysis: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    confidence: 0.82,
    recommendations: []
  };
}

// Call Groq
async function callGroq(prompt: string, systemPrompt: string): Promise<ModelResponse> {
  const apiKey = Deno.env.get('GROQ_API_KEY');
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
    }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Groq API error');
  
  return {
    model: 'llama-3.1-70b-versatile',
    provider: 'groq',
    analysis: data.choices[0].message.content,
    confidence: 0.80,
    recommendations: []
  };
}

// Run full analysis with single model
async function runFullAnalysis(supabase: any, timeRange: string) {
  const stats = await getShareStats(supabase, timeRange);
  
  const systemPrompt = `You are an analytics expert specializing in viral content and social sharing dynamics for a techno music community website. Analyze share data and provide actionable insights. Focus on:
- Platform performance
- Viral potential
- User engagement patterns
- Growth opportunities
Be concise and data-driven.`;
  
  const prompt = `Analyze these sharing statistics for Techno Doggies (shareable dog avatars):

Total Shares: ${stats.total}
Reshares: ${stats.reshares}
Viral Chains: ${stats.viralChains}
Avg Chain Depth: ${stats.avgChainDepth.toFixed(2)}

By Platform:
${Object.entries(stats.byPlatform).map(([p, c]) => `- ${p}: ${c}`).join('\n')}

Top Performing Doggies:
${stats.topPerformers.map((d, i) => `${i + 1}. ${d}: ${stats.byDoggy[d]} shares`).join('\n')}

Provide:
1. Key insights (3-5 points)
2. Platform recommendations
3. Growth opportunities
4. Potential issues to address`;

  // Try models in order of preference
  let result: ModelResponse | null = null;
  const errors: string[] = [];
  
  for (const callModel of [callOpenAI, callAnthropic, callGemini, callGroq]) {
    try {
      result = await callModel(prompt, systemPrompt);
      break;
    } catch (err) {
      errors.push(`${callModel.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  
  if (!result) {
    return new Response(
      JSON.stringify({ error: 'All models failed', details: errors }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Store insight
  await supabase.from('doggy_analytics_insights').insert({
    insight_type: 'full_analysis',
    model_used: result.provider,
    model_name: result.model,
    title: `Share Analysis (${timeRange})`,
    summary: result.analysis.slice(0, 500),
    detailed_analysis: result.analysis,
    data_snapshot: stats,
    confidence_score: result.confidence,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
  
  return new Response(
    JSON.stringify({ success: true, stats, analysis: result }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Generate daily summary
async function generateDailySummary(supabase: any) {
  const stats = await getShareStats(supabase, '24h');
  
  const systemPrompt = `Generate a brief, engaging daily summary for a techno dog avatar sharing platform. Be fun but data-driven. Use underground techno culture references.`;
  
  const prompt = `Daily stats:
- ${stats.total} shares today
- Top platform: ${Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
- Most shared doggy: ${stats.topPerformers[0] || 'None'}
- Reshare rate: ${stats.total > 0 ? ((stats.reshares / stats.total) * 100).toFixed(1) : 0}%

Write a 2-3 sentence summary.`;

  try {
    const result = await callOpenAI(prompt, systemPrompt);
    
    await supabase.from('doggy_analytics_insights').insert({
      insight_type: 'daily_summary',
      model_used: 'openai',
      model_name: 'gpt-4o-mini',
      title: `Daily Summary - ${new Date().toISOString().split('T')[0]}`,
      summary: result.analysis,
      data_snapshot: stats,
      confidence_score: 0.9,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
    
    return new Response(
      JSON.stringify({ success: true, summary: result.analysis, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate summary' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Detect viral chains
async function detectViralChains(supabase: any) {
  const { data: chains } = await supabase
    .from('doggy_share_events')
    .select('*')
    .not('parent_share_id', 'is', null)
    .order('chain_depth', { ascending: false })
    .limit(50);
  
  const viralEvents = chains?.filter((c: any) => c.chain_depth >= 2) || [];
  
  return new Response(
    JSON.stringify({
      success: true,
      viralChains: viralEvents.length,
      topChains: viralEvents.slice(0, 10),
      avgDepth: viralEvents.length > 0 
        ? viralEvents.reduce((sum: number, c: any) => sum + c.chain_depth, 0) / viralEvents.length 
        : 0
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Analyze platform performance
async function analyzePlatformPerformance(supabase: any, timeRange: string) {
  const stats = await getShareStats(supabase, timeRange);
  
  const platformAnalysis = Object.entries(stats.byPlatform)
    .map(([platform, count]) => ({
      platform,
      shares: count,
      percentage: stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0',
      rank: 0
    }))
    .sort((a, b) => b.shares - a.shares)
    .map((p, i) => ({ ...p, rank: i + 1 }));
  
  return new Response(
    JSON.stringify({
      success: true,
      timeRange,
      totalShares: stats.total,
      platforms: platformAnalysis
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Multi-model consensus analysis
async function runConsensusAnalysis(supabase: any, timeRange: string) {
  const stats = await getShareStats(supabase, timeRange);
  
  const systemPrompt = `Analyze social sharing data. Provide exactly 3 key recommendations as a JSON array.`;
  
  const prompt = `Stats: ${JSON.stringify(stats)}. Return JSON: { "recommendations": ["rec1", "rec2", "rec3"], "sentiment": "positive|neutral|negative" }`;
  
  const results: ModelResponse[] = [];
  const modelCalls = [
    { fn: callOpenAI, name: 'openai' },
    { fn: callAnthropic, name: 'anthropic' },
    { fn: callGemini, name: 'gemini' },
    { fn: callGroq, name: 'groq' }
  ];
  
  // Call all models in parallel
  const promises = modelCalls.map(async ({ fn, name }) => {
    try {
      const result = await fn(prompt, systemPrompt);
      return { ...result, success: true };
    } catch (err) {
      console.log(`[consensus] ${name} failed:`, err);
      return null;
    }
  });
  
  const responses = await Promise.all(promises);
  const successfulResponses = responses.filter(Boolean) as ModelResponse[];
  
  // Calculate consensus
  const consensusModels = successfulResponses.map(r => r.provider);
  const avgConfidence = successfulResponses.length > 0
    ? successfulResponses.reduce((sum, r) => sum + r.confidence, 0) / successfulResponses.length
    : 0;
  
  // Store consensus insight
  await supabase.from('doggy_analytics_insights').insert({
    insight_type: 'consensus_analysis',
    model_used: 'multi-model',
    model_name: consensusModels.join(', '),
    title: `Consensus Analysis (${timeRange})`,
    summary: `${successfulResponses.length}/${modelCalls.length} models analyzed successfully`,
    detailed_analysis: JSON.stringify(successfulResponses.map(r => ({ provider: r.provider, analysis: r.analysis }))),
    data_snapshot: stats,
    confidence_score: avgConfidence,
    consensus_models: consensusModels,
    expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
  });
  
  return new Response(
    JSON.stringify({
      success: true,
      modelsResponded: successfulResponses.length,
      consensusModels,
      avgConfidence,
      analyses: successfulResponses
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Get stored insights
async function getStoredInsights(supabase: any) {
  const { data, error } = await supabase
    .from('doggy_analytics_insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify({ success: true, insights: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
