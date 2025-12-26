import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUTHOR_PSEUDONYMS = [
  'K. Vaultkeeper',
  'S. Lowend',
  'M. Strobe',
  'D. Analog',
  'R. Bassweight',
  'A. Darkroom',
  'T. Reverb',
  'L. Concrete'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, publish = false } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const randomAuthor = AUTHOR_PSEUDONYMS[Math.floor(Math.random() * AUTHOR_PSEUDONYMS.length)];

    const prompt = `You are a senior techno journalist for TECHNO.DOG, an underground techno publication.

VOICE:
- Smart, streetwise, knowledgeable
- Not marketing speak - real journalism
- Scene insider perspective
- Global awareness of techno culture

AVOID:
- Clichés: "legendary", "iconic", "groundbreaking", "game-changing"
- Marketing language: "must-see", "unmissable", "essential"
- EDM terminology: "drop", "banger", "fire"

STRUCTURE:
1. Strong opening hook
2. Core news/story
3. Scene context (geographic, cultural, historical)
4. Why it matters section
5. Forward-looking conclusion

Write a 600-1200 word article about this topic: "${topic}"

Return ONLY valid JSON:
{
  "title": "string (headline, no quotes)",
  "subtitle": "string (subheadline)",
  "body_markdown": "string (full article in markdown with ### headers)",
  "city_tags": ["string"],
  "genre_tags": ["string"],
  "entity_tags": ["string (artists, labels, venues mentioned)"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a techno music journalist. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Extract JSON from response
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0].trim();
    }

    const article = JSON.parse(jsonStr);

    // Insert into database
    const { data: insertedArticle, error: insertError } = await supabase
      .from('td_news_articles')
      .insert({
        title: article.title,
        subtitle: article.subtitle,
        body_markdown: article.body_markdown,
        author_pseudonym: randomAuthor,
        city_tags: article.city_tags || [],
        genre_tags: article.genre_tags || [],
        entity_tags: article.entity_tags || [],
        source_urls: [],
        confidence_score: 0.85,
        status: publish ? 'published' : 'draft',
        published_at: publish ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save article' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      article: insertedArticle 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
