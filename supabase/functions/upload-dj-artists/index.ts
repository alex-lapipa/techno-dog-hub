import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

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
    const { artists, clearExisting = false } = await req.json() as { artists: DJArtist[]; clearExisting?: boolean };

    if (!artists || !Array.isArray(artists)) {
      return errorResponse('artists array required', 400);
    }

    console.log(`Uploading ${artists.length} artists...`);

    if (clearExisting) {
      await supabase.from('dj_artists').delete().neq('id', 0);
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const batchSize = 10;
    for (let i = 0; i < artists.length; i += batchSize) {
      const batch = artists.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (artist) => {
        try {
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
            insertData.embedding = embStr; // dual-write for legacy compatibility
          }

          const { error } = await supabase.from('dj_artists').insert(insertData);

          if (error) {
            errors.push(`${artist.artist_name}: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          errors.push(`${artist.artist_name}: ${err instanceof Error ? err.message : 'Unknown'}`);
          errorCount++;
        }
      }));

      if (i + batchSize < artists.length) await new Promise(r => setTimeout(r, 500));
    }

    return jsonResponse({ success: true, uploaded: successCount, errors: errorCount, errorDetails: errors.slice(0, 10) });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
