import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

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

function createEmbeddingText(artist: DJArtist): string {
  return [
    artist.artist_name,
    artist.real_name ? `(${artist.real_name})` : '',
    artist.nationality ? `from ${artist.nationality}` : '',
    artist.years_active ? `Active: ${artist.years_active}` : '',
    artist.subgenres?.length ? `Genres: ${artist.subgenres.join(', ')}` : '',
    artist.labels?.length ? `Labels: ${artist.labels.join(', ')}` : '',
    artist.top_tracks?.length ? `Top tracks: ${artist.top_tracks.join(', ')}` : '',
    artist.known_for || ''
  ].filter(Boolean).join('. ').trim();
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  try {
    const { startIndex = 0, batchSize = 5 } = await req.json().catch(() => ({}));

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const dataUrl = `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/knowledge/technodog_dj_data.json`;
    
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);

    const data = await response.json();
    const artists: DJArtist[] = data.artists;
    const batch = artists.slice(startIndex, startIndex + batchSize);
    
    if (batch.length === 0) {
      return jsonResponse({ success: true, message: 'All artists uploaded', total: artists.length, processed: startIndex });
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const artist of batch) {
      try {
        const { data: existing } = await supabase.from('dj_artists').select('id').eq('rank', artist.rank).single();
        if (existing) { successCount++; continue; }

        const embeddingText = createEmbeddingText(artist);
        const embResult = await generateVoyageEmbedding(embeddingText);
        
        const insertData: Record<string, unknown> = {
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
        };

        if (embResult) {
          const embStr = formatEmbeddingForStorage(embResult.embedding);
          insertData.voyage_embedding = embStr;
          insertData.embedding = embStr;
        }

        const { error } = await supabase.from('dj_artists').insert(insertData);
        if (error) { errors.push(`${artist.artist_name}: ${error.message}`); }
        else { successCount++; }
      } catch (err) {
        errors.push(`${artist.artist_name}: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    const nextIndex = startIndex + batchSize;
    const hasMore = nextIndex < artists.length;

    return jsonResponse({
      success: true, processed: batch.length, successful: successCount, errors,
      nextIndex: hasMore ? nextIndex : null, total: artists.length, remaining: hasMore ? artists.length - nextIndex : 0,
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
