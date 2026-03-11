/**
 * Shared RAG context retrieval and formatting.
 * Searches across all vector tables (documents, artists, artist_documents, gear)
 * and builds a unified context string for AI prompts.
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface ArtistResult {
  id: number;
  rank: number;
  artist_name: string;
  real_name: string | null;
  nationality: string | null;
  years_active: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
  top_tracks: string[] | null;
  known_for: string | null;
  similarity: number;
}

export interface DocumentResult {
  id?: string;
  title: string;
  content: string;
  source?: string;
  similarity?: number;
}

export interface GearResult {
  name: string;
  brand: string;
  category: string;
  short_description: string;
  similarity: number;
}

export interface LabelDocResult {
  title: string;
  content: string;
  document_type: string;
  similarity: number;
}

export interface RAGContext {
  artists: ArtistResult[];
  documents: DocumentResult[];
  artistDocs: Array<{ title: string; content: string; document_type?: string; similarity: number }>;
  gear: GearResult[];
  labelDocs: LabelDocResult[];
  embeddingProvider: string;
}

/**
 * Retrieve all RAG context in parallel from the 4 vector tables.
 * Uses Voyage 1024d embeddings via _voyage DB functions.
 */
export async function retrieveContext(
  supabase: SupabaseClient,
  embeddingStr: string,
  sanitizedQuery: string
): Promise<RAGContext> {
  // Run all 5 vector searches in parallel
  const [artistsPromise, docsPromise, artistDocsPromise, gearPromise, labelDocsPromise] = await Promise.allSettled([
    supabase.rpc('search_dj_artists_voyage', {
      query_embedding: embeddingStr,
      similarity_threshold: 0.3,
      match_count: 5,
    }),
    supabase.rpc('match_documents_voyage', {
      query_embedding: embeddingStr,
      match_threshold: 0.3,
      match_count: 5,
    }),
    supabase.rpc('search_artist_documents_voyage', {
      query_embedding: embeddingStr,
      match_threshold: 0.4,
      match_count: 3,
    }),
    supabase.rpc('search_gear_by_voyage_embedding', {
      query_embedding: embeddingStr,
      match_threshold: 0.4,
      match_count: 3,
    }),
    supabase.rpc('search_labels_documents_voyage', {
      query_embedding: embeddingStr,
      match_threshold: 0.4,
      match_count: 3,
    }),
  ]);

  const artists: ArtistResult[] =
    artistsPromise.status === 'fulfilled' && !artistsPromise.value.error
      ? artistsPromise.value.data || []
      : [];

  let documents: DocumentResult[] =
    docsPromise.status === 'fulfilled' && !docsPromise.value.error
      ? docsPromise.value.data || []
      : [];

  const artistDocs =
    artistDocsPromise.status === 'fulfilled' && !artistDocsPromise.value.error
      ? artistDocsPromise.value.data || []
      : [];

  const gear: GearResult[] =
    gearPromise.status === 'fulfilled' && !gearPromise.value.error
      ? gearPromise.value.data || []
      : [];

  const labelDocs: LabelDocResult[] =
    labelDocsPromise.status === 'fulfilled' && !labelDocsPromise.value.error
      ? labelDocsPromise.value.data || []
      : [];

  // Log errors
  if (artistsPromise.status === 'fulfilled' && artistsPromise.value.error)
    console.error('Artist search error:', artistsPromise.value.error);
  if (docsPromise.status === 'fulfilled' && docsPromise.value.error)
    console.error('Document search error:', docsPromise.value.error);

  // Fallback: full-text search if no vector documents found
  if (documents.length === 0) {
    console.log('Falling back to full-text search');
    const searchTerms = sanitizedQuery
      .toLowerCase()
      .replace(/[¿?¡!.,;:]/g, '')
      .split(' ')
      .filter((w) => w.length > 2)
      .join(' | ');

    const { data: textResults, error: searchError } = await supabase
      .from('documents')
      .select('id, title, content, source')
      .textSearch('content', searchTerms, { type: 'websearch', config: 'english' })
      .limit(5);

    if (!searchError && textResults) documents = textResults;
  }

  // Final fallback: recent documents
  if (documents.length === 0) {
    console.log('Using fallback: fetching recent documents');
    const { data: fallbackDocs } = await supabase
      .from('documents')
      .select('id, title, content, source')
      .order('created_at', { ascending: false })
      .limit(5);
    documents = fallbackDocs || [];
  }

  console.log(
    `Context: ${artists.length} artists, ${documents.length} docs, ${artistDocs.length} artist_docs, ${gear.length} gear, ${labelDocs.length} label_docs`
  );

  return { artists, documents, artistDocs, gear, labelDocs, embeddingProvider: 'voyage' };
}

/** Format a single artist into readable context */
function formatArtistContext(artist: ArtistResult): string {
  const parts = [
    `**#${artist.rank} ${artist.artist_name}**`,
    artist.real_name ? `Real name: ${artist.real_name}` : null,
    artist.nationality ? `Nationality: ${artist.nationality}` : null,
    artist.years_active ? `Active: ${artist.years_active}` : null,
    artist.subgenres?.length ? `Genres: ${artist.subgenres.join(', ')}` : null,
    artist.labels?.length ? `Labels: ${artist.labels.join(', ')}` : null,
    artist.top_tracks?.length ? `Key tracks: ${artist.top_tracks.join(', ')}` : null,
    artist.known_for ? `Known for: ${artist.known_for}` : null,
    `Relevance: ${(artist.similarity * 100).toFixed(1)}%`,
  ].filter(Boolean);

  return parts.join('\n');
}

/** Build the combined context string from all retrieval results */
export function buildContextString(ctx: RAGContext): string {
  const sections: string[] = [];

  if (ctx.artists.length > 0) {
    sections.push(
      '## DJ ARTISTS DATABASE:\n\n' +
        ctx.artists.map(formatArtistContext).join('\n\n---\n\n')
    );
  }

  if (ctx.documents.length > 0) {
    sections.push(
      '## KNOWLEDGE BASE DOCUMENTS:\n\n' +
        ctx.documents
          .map(
            (doc) =>
              `[${doc.title}${doc.similarity ? ` (relevance: ${(doc.similarity * 100).toFixed(1)}%)` : ''}]\n${doc.content}`
          )
          .join('\n\n---\n\n')
    );
  }

  if (ctx.artistDocs.length > 0) {
    sections.push(
      '## ARTIST DEEP KNOWLEDGE:\n\n' +
        ctx.artistDocs
          .map(
            (d: any) =>
              `[${d.title || d.document_type} (relevance: ${(d.similarity * 100).toFixed(1)}%)]\n${d.content?.slice(0, 500)}`
          )
          .join('\n\n---\n\n')
    );
  }

  if (ctx.gear.length > 0) {
    sections.push(
      '## GEAR CATALOG:\n\n' +
        ctx.gear
          .map(
            (g) =>
              `**${g.name}** (${g.brand}, ${g.category}) — relevance: ${(g.similarity * 100).toFixed(1)}%\n${g.short_description || ''}`
          )
          .join('\n\n---\n\n')
    );
  }

  if (ctx.labelDocs.length > 0) {
    sections.push(
      '## RECORD LABELS:\n\n' +
        ctx.labelDocs
          .map(
            (l) =>
              `[${l.title} (relevance: ${(l.similarity * 100).toFixed(1)}%)]\n${l.content}`
          )
          .join('\n\n---\n\n')
    );
  }

  return sections.join('\n\n');
}

/** Build artist metadata for streaming SSE metadata event */
export function buildArtistMeta(artists: ArtistResult[]) {
  return artists.map((a) => ({
    name: a.artist_name,
    rank: a.rank,
    nationality: a.nationality,
    subgenres: a.subgenres,
    labels: a.labels,
  }));
}
