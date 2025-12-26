import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DJArtist {
  rank: number;
  artist_name: string;
  real_name?: string;
  nationality?: string;
  born?: string;
  died?: string;
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
    console.error('OpenAI embedding error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
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
    const { artists, clearExisting = false } = await req.json() as { 
      artists: DJArtist[]; 
      clearExisting?: boolean;
    };

    if (!artists || !Array.isArray(artists)) {
      return new Response(JSON.stringify({ error: 'artists array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Uploading ${artists.length} artists...`);

    // Optionally clear existing data
    if (clearExisting) {
      console.log('Clearing existing artists...');
      await supabase.from('dj_artists').delete().neq('id', 0);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (artist) => {
        try {
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
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error processing ${artist.artist_name}:`, err);
          errors.push(`${artist.artist_name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          errorCount++;
        }
      }));

      // Small delay between batches
      if (i + batchSize < artists.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`Upload complete: ${successCount} success, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      uploaded: successCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Limit error details
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
