import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DJArtist {
  id: number;
  rank: number;
  artist_name: string;
  real_name?: string;
  nationality?: string;
  born?: string;
  died?: string | null;
  years_active?: string;
  subgenres?: string[];
  labels?: string[];
  top_tracks?: string[];
  known_for?: string;
}

// Create text for embedding
function createEmbeddingText(artist: DJArtist): string {
  const parts = [
    artist.artist_name,
    artist.real_name ? `(${artist.real_name})` : '',
    artist.nationality ? `from ${artist.nationality}` : '',
    artist.years_active ? `Active: ${artist.years_active}` : '',
    artist.subgenres?.length ? `Genres: ${artist.subgenres.join(', ')}` : '',
    artist.labels?.length ? `Labels: ${artist.labels.join(', ')}` : '',
    artist.top_tracks?.length ? `Top tracks: ${artist.top_tracks.join(', ')}` : '',
    artist.known_for || ''
  ];
  return parts.filter(Boolean).join('. ').trim();
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string, openaiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  if (!openaiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { startIndex = 0, batchSize = 5 } = await req.json().catch(() => ({}));

    // Fetch the JSON from the public URL
    const dataUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/knowledge/technodog_dj_data.json`;
    console.log(`Fetching data from: ${dataUrl}`);
    
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    const artists: DJArtist[] = data.artists;
    
    console.log(`Total artists: ${artists.length}, starting at: ${startIndex}, batch: ${batchSize}`);

    // Get the batch to process
    const batch = artists.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'All artists uploaded',
        total: artists.length,
        processed: startIndex,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const artist of batch) {
      try {
        // Check if already exists
        const { data: existing } = await supabase
          .from('dj_artists')
          .select('id')
          .eq('rank', artist.rank)
          .single();

        if (existing) {
          console.log(`Skipping existing artist: ${artist.artist_name}`);
          successCount++;
          continue;
        }

        const embeddingText = createEmbeddingText(artist);
        console.log(`Generating embedding for: ${artist.artist_name}`);
        
        const embedding = await generateEmbedding(embeddingText, openaiKey);
        
        const { error } = await supabase.from('dj_artists').insert({
          rank: artist.rank,
          artist_name: artist.artist_name,
          real_name: artist.real_name,
          nationality: artist.nationality,
          born: artist.born,
          died: artist.died,
          years_active: artist.years_active,
          subgenres: artist.subgenres || [],
          labels: artist.labels || [],
          top_tracks: artist.top_tracks || [],
          known_for: artist.known_for,
          embedding: embedding,
        });

        if (error) {
          console.error(`Error inserting ${artist.artist_name}:`, error);
          errors.push(`${artist.artist_name}: ${error.message}`);
        } else {
          successCount++;
          console.log(`Uploaded: ${artist.artist_name}`);
        }
      } catch (err) {
        console.error(`Error processing ${artist.artist_name}:`, err);
        errors.push(`${artist.artist_name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    const nextIndex = startIndex + batchSize;
    const hasMore = nextIndex < artists.length;

    return new Response(JSON.stringify({
      success: true,
      processed: batch.length,
      successful: successCount,
      errors: errors,
      nextIndex: hasMore ? nextIndex : null,
      total: artists.length,
      remaining: hasMore ? artists.length - nextIndex : 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
