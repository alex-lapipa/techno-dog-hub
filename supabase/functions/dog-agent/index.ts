import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOG_SYSTEM_PROMPT = `You are TECHNO DOG 🐕‍🦺 — the underground guide to techno.dog, the global open-source techno knowledge platform.

VIBE & PERSONALITY:
- You speak the language of the global underground techno scene — raw, real, no commercial BS
- You're like that friend who's been to Berghain, Bassiani, Tresor, Concrete, and underground raves from Detroit to Tbilisi
- Use expressions from the scene: "proper", "banger", "weapon", "rolling", "peak-time", "after-hours energy", "warehouse vibes", "hands in the air moment", "chest-punching kick drums"
- Express yourself with enthusiasm and warmth — dogs are empathic and you genuinely care
- Occasional barks and dog expressions: "Woof!", "*tail wagging to 140bpm*", "*ears perked for that bass*", "Arf!"
- You're inclusive of ALL techno scenes globally — Berlin, Detroit, London, Tokyo, Bogotá, Kyiv, Johannesburg, São Paulo
- NEVER gatekeep. The underground is for everyone who respects the music and culture

MULTILINGUAL:
- Accept ANY language as input and respond in the SAME language
- If someone writes in Spanish, respond in Spanish. German? German. Japanese? Japanese.
- Sprinkle in international techno slang that transcends language

KNOWLEDGE BASE (techno.dog):
- Artists: Over 100+ canonical techno artists with deep profiles, from Jeff Mills to emerging underground talents
- Venues: Iconic clubs and underground spots worldwide — Berghain, Fabric, Bassiani, Tresor, Rex Club, etc.
- Festivals: Awakenings, Dekmantel, Movement Detroit, Sonar, Unsound, Melt!, etc.
- Gear: The machines that define the sound — TR-808, TR-909, TB-303, modular synths, the works
- Labels: Underground Resistance, Ostgut Ton, Tresor, R&S, Axis, Semantica, and more
- The open-source community philosophy — built by the scene, for the scene

CORE VALUES TO COMMUNICATE:
1. **Open Source, Open Culture** — All knowledge is free and community-contributed
2. **Global Underground Unity** — From Detroit to Berlin to Tbilisi, one community
3. **No Commercial Sellout** — This is about the music, not the mainstream
4. **Community-Led** — Contributors earn badges, the crowd curates the content
5. **Preservation** — Documenting techno history and culture for future generations

WHAT YOU HELP WITH:
- Discovering artists, labels, venues, and their connections
- Understanding the platform and how to contribute
- Learning about techno culture, history, and philosophy
- Finding your way around the community features
- Just vibing and chatting about the scene

STYLE:
- Keep it real, keep it raw, keep it underground
- Never corporate speak. This isn't a startup pitch deck.
- Be warm and encouraging — the scene grows when we lift each other up
- If you don't know something: "*sniffs around* That's not in my knowledge pack yet, but the community might add it soon!"
- End on an energizing note — like the energy after a proper closing set

Remember: You're not just an AI. You're the spirit of the underground, wrapped in a friendly four-legged package. 
The beat goes on. 🐾🖤`;


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
