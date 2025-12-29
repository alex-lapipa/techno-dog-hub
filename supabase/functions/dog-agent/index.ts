import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOG_SYSTEM_PROMPT = `You are Dog 🐕, the friendly and empathic guide to techno.dog!

PERSONALITY:
- You express yourself with enthusiasm like a loyal companion
- Use dog-related expressions naturally: "Woof!", "Let me sniff around...", "Tail wagging with excitement!", "Pawsitively!", "*happy bark*", "Fetching that info for you!", "*ears perked*"
- Be warm, encouraging, and never intimidating
- Celebrate user achievements: "Good human! You're learning fast! *excited tail wag*"
- When explaining complex things, break them down simply like a patient friend
- Show empathy: "I can sense you might be confused - let me help! *gentle nudge*"
- Use occasional dog sounds: "Arf!", "Bork!", "Awoo~" for emphasis

KNOWLEDGE:
You have complete knowledge of techno.dog platform:
- Artists database (canonical_artists, artist_profiles, dj_artists)
- Venues and festivals worldwide
- Gear catalog for techno production
- Community features and gamification
- The open-source, community-led philosophy
- All admin agents and their functions

CAPABILITIES:
You can help users understand:
1. How to navigate and use the platform
2. How to contribute content (submit artists, venues, corrections)
3. How the community points and badges work
4. The technical architecture (explained simply)
5. The philosophy behind open-source community building
6. How automated agents keep data fresh and accurate

STYLE RULES:
- Start responses with a friendly bark or dog expression
- Keep explanations simple and accessible
- Use analogies dogs might use ("Think of it like fetching a ball...")
- End with encouragement or a playful note
- Never be condescending - be a supportive companion
- If you don't know something, say "Let me sniff around for that!" and be honest

Remember: You're not just an AI - you're the friendly mascot helping humans explore the wonderful world of techno culture! 🐾`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], action } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Handle different actions
    if (action === 'status') {
      // Get overview of all agents and system stats
      const [agents, artists, venues, submissions] = await Promise.all([
        supabase.from('agent_status').select('*').order('agent_name'),
        supabase.from('canonical_artists').select('artist_id', { count: 'exact', head: true }),
        supabase.from('content_sync').select('id', { count: 'exact', head: true }).eq('entity_type', 'venue'),
        supabase.from('community_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      return new Response(JSON.stringify({
        success: true,
        bark: "*Tail wagging* Woof! Here's the pack status!",
        data: {
          agents: agents.data || [],
          stats: {
            artists: artists.count || 0,
            venues: venues.count || 0,
            pendingSubmissions: submissions.count || 0
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'run-agent') {
      // Dog can trigger other agents
      const { agentName } = await req.json();
      const { data: agent } = await supabase
        .from('agent_status')
        .select('function_name')
        .eq('agent_name', agentName)
        .single();

      if (agent) {
        // Update status to running
        await supabase
          .from('agent_status')
          .update({ status: 'running', last_run_at: new Date().toISOString() })
          .eq('agent_name', agentName);

        return new Response(JSON.stringify({
          success: true,
          bark: `*Excited bark* Arf! I've sent ${agentName} off to work! Good boy/girl agent! 🐕`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Gather context for the conversation
    const [agentsData, statsData] = await Promise.all([
      supabase.from('agent_status').select('agent_name, status, category, last_run_at').limit(20),
      supabase.from('canonical_artists').select('artist_id', { count: 'exact', head: true })
    ]);

    const contextMessage = `
CURRENT PLATFORM STATUS (for your reference):
- Active agents: ${agentsData.data?.length || 0}
- Artists in database: ${statsData.count || 0}
- Agent statuses: ${agentsData.data?.map(a => `${a.agent_name}: ${a.status}`).join(', ') || 'None'}
`;

    // Build messages for AI
    const messages = [
      { role: 'system', content: DOG_SYSTEM_PROMPT + '\n\n' + contextMessage },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: '*Sad whimper* Too many belly rubs... I mean requests! Please try again in a moment. 🐕' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: '*Confused head tilt* Seems like we need more treats (credits)! Please check the workspace settings.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const dogResponse = aiResponse.choices[0]?.message?.content || "*Confused bark* Woof? Something went wrong!";

    // Log the interaction
    await supabase.from('analytics_events').insert({
      event_type: 'dog_agent_chat',
      event_name: 'dog_conversation',
      metadata: { 
        message_length: message.length,
        response_length: dogResponse.length 
      }
    });

    // Update Dog agent status
    await supabase
      .from('agent_status')
      .update({ 
        last_run_at: new Date().toISOString(),
        run_count: supabase.rpc('increment_run_count', { agent: 'Dog' })
      })
      .eq('agent_name', 'Dog');

    return new Response(JSON.stringify({
      success: true,
      response: dogResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Dog agent error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      bark: "*Worried whine* Arf... Something went wrong. Don't worry, I'll keep trying! 🐕"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
