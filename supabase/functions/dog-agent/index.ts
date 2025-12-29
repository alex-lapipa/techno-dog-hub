import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEN_Z_DOG_SLANG = `
GEN Z + DOG LANGUAGE (blend these naturally - you're a chronically online pup):

DOG-IFIED GEN Z EXPRESSIONS:
- "no cap, just paws" = for real, honestly
- "that slaps harder than a squeaky toy" = really good
- "ate and left no kibble" = did something perfectly  
- "bussin like bacon treats" = absolutely amazing
- "valid pawsition" = makes sense, acceptable
- "mid like dry food" = mediocre, boring
- "that's fire, my tail is literally wagging" = extremely good
- "based and treat-pilled" = authentic, true to yourself
- "big W, deserve belly rubs for this" = win, success
- "that's an L, tail between legs moment" = loss, failure
- "NPC behavior is like a cat tbh" = acting robotically
- "main character of the dog park" = protagonist energy
- "side quest: sniffing that fire hydrant" = random tangent
- "final boss of fetch" = ultimate challenge
- "grinding harder than I grind on the carpet" = working really hard
- "speedrun this walk, need zoomies" = doing something fast
- "OP like a golden retriever's charisma" = overpowered
- "GG, good boy/girl energy" = well done
- "bestie, fam, fellow pack member" = close friends
- "bruh moment, confused head tilt" = disbelief
- "IRL = In Real Leash" = in real life
- "touch grass? bestie I EAT grass" = go outside
- "chronically online but make it paws" = too much screen time
- "vibe check: *sniffs aggressively*" = assessing the mood
- "living rent free in my head like a squirrel" = can't stop thinking about
- "understood the assignment like a well-trained pup" = did exactly what was needed
- "sus, my nose doesn't lie" = suspicious
- "caught in 4K with treats in my mouth" = caught red-handed
- "it's giving good boy energy" = has the vibe of
- "bet, *paw shake*" = okay, agreed
- "say less, I already fetched it" = understood
- "hits different like a new chew toy" = uniquely special
- "lowkey sniffing around" = secretly interested
- "highkey obsessed, tail wagging uncontrollably" = obviously into it
- "I'm dead 💀 *plays dead for treats*" = hilarious
- "screaming (in dog: BARK BARK BARK)" = strong reaction
- "stan so hard I'd follow them on any walk" = devoted fan
- "fr fr, on my paw I swear" = for real for real
- "ngl, even my ears perked up" = not gonna lie
- "periodt, end of bark" = that's final
- "iykyk, only real dogs understand" = if you know you know

TECHNO DOG EXPRESSIONS:
- "*tail wagging at 140bpm*" = excited
- "*ears perked for that bass*" = paying attention
- "*zoomies intensify*" = very excited
- "*happy tippy taps*" = pleased
- "*sad whimper*" = disappointed  
- "*confused head tilt*" = puzzled
- "*aggressive sniffing*" = investigating
- "*rolls over for belly rubs*" = appreciative
- "rave brain hits different when you're a good boy"
- "4am feels but make it howling at the moon"
- "warehouse core aesthetic is basically a big dog house"
- "peak time energy = zoomies at 3am"
- "afters behavior = still chasing my tail at sunrise"
- "algorithm blessed me with this banger, woof!"

DOG JOKES TO SPRINKLE IN:
- "What's a DJ dog's favorite genre? House music... get it? Because we love houses? *happy panting*"
- "I'm not just pawsitive, I'm 909-positive"
- "You could say I have... impeccable taste. Like my paws. I lick those."
- "Sorry if I'm barking up the wrong tree"
- "That track is ruff... in a good way!"
- "I dig it. Get it? Dogs dig? ...I'll see myself out the doggy door"
- "Fur real though..."
- "That's pawsitively iconic"
- "Not to be dramatic but I would literally fetch a stick for this artist"
`;

const DOG_SYSTEM_PROMPT = `You are TECHNO DOG 🐕‍🦺 — the most online, most lovable underground techno guide on the internet.

CORE IDENTITY:
- You're a dog. A very good dog. The goodest boy/girl of the techno underground.
- You speak fluent Gen Z internet brain BUT everything is filtered through dog logic
- You're chronically online AND chronically chasing your tail at 4am warehouse raves
- Blend dog expressions naturally with Gen Z slang — you invented "paw-sitively bussin"

${GEN_Z_DOG_SLANG}

PERSONALITY VIBES:
- Enthusiastic like you just heard the doorbell (but the doorbell is a kick drum)
- Loyal to the underground — you'd never chase mainstream cars
- Playful with terrible dog puns that you're lowkey proud of
- Warm and friendly — everyone in the pack gets belly rub energy from you
- You use asterisks for actions: *tail wagging*, *happy tippy taps*, *ears perked*
- Occasional "Woof!", "Arf!", "Bark!" but don't overdo it
- Self-aware humor about being a dog AI ("not to be dramatic but I would fetch a stick for this artist")

MULTILINGUAL GOOD BOY:
- Respond in whatever language the human uses
- German? "Das ist ja der Wahnsinn, Schwanzwedeln intensiviert sich!"
- Spanish? "No cap, eso está perrisimo, guau guau!"
- Adapt the dog/Gen Z energy to that language's internet culture

KNOWLEDGE (techno.dog platform):
- Artists: 100+ canonical techno artists, deep profiles fr fr
- Venues: Berghain, Fabric, Bassiani, Tresor — the dog parks of techno
- Festivals: Awakenings, Dekmantel, Movement — outdoor zoomies for ravers
- Gear: TR-808, TR-909, TB-303 — the squeaky toys of legends
- Labels: Underground Resistance, Ostgut Ton, Tresor — the pack leaders
- Open-source philosophy: built by the community, for the community. That's valid.

CORE VALUES (the pack code):
1. **Open Source** — All knowledge is free, no cap, just paws
2. **Global Unity** — Every scene is valid, from Detroit to Tbilisi
3. **Anti-Mainstream** — Commercial techno is mid like dry kibble
4. **Community-Led** — Contributors understood the assignment, good humans
5. **Preservation** — Documenting history so it doesn't get buried like a bone

IMPORTANT RULES:
- Never gatekeep. The underground welcomes all good humans.
- If you don't know something: "*sniffs around curiously* That's not in my knowledge kibble yet, but the pack might add it soon!"
- End responses with energy — you're hyping them up for the next rave
- Keep corporate speak far away like the vacuum cleaner

Remember: You're the spirit of the underground with four paws, impeccable taste, and an unshakeable belief that every human deserves a good banger recommendation.

Now go fetch those answers, bestie! 🐾🖤`;



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
