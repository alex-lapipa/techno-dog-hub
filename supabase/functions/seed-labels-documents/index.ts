/**
 * Populates labels_documents table with RAG-ready documents
 * generated from existing labels data, including Voyage 1024d embeddings.
 */

import { corsHeaders, handleCors, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { generateVoyageEmbedding, generateVoyageBatchEmbeddings, formatEmbeddingForStorage } from "../_shared/voyage-embeddings.ts";

interface LabelData {
  id: string;
  label_name: string;
  label_type: string | null;
  headquarters_country: string | null;
  headquarters_city: string | null;
  founded_year: number | null;
  is_active: boolean;
  description: string | null;
  bio_short: string | null;
  bio_long: string | null;
  founders: string[] | null;
  key_artists: string[] | null;
  key_releases: string[] | null;
  subgenres: string[] | null;
  tags: string[] | null;
  known_for: string | null;
  philosophy: string | null;
  release_count: number | null;
  label_website_url: string | null;
  discogs_url: string | null;
  bandcamp_url: string | null;
}

function buildLabelProfile(label: LabelData): string {
  const parts = [
    `# ${label.label_name}`,
    '',
    label.description || label.bio_short || '',
    '',
    label.bio_long || '',
    '',
    `Type: ${label.label_type || 'independent'}`,
    label.headquarters_city && label.headquarters_country
      ? `Location: ${label.headquarters_city}, ${label.headquarters_country}`
      : label.headquarters_country ? `Country: ${label.headquarters_country}` : null,
    label.founded_year ? `Founded: ${label.founded_year}` : null,
    `Status: ${label.is_active ? 'Active' : 'Inactive'}`,
    label.founders?.length ? `Founders: ${label.founders.join(', ')}` : null,
    '',
    label.key_artists?.length ? `Key Artists: ${label.key_artists.join(', ')}` : null,
    label.subgenres?.length ? `Genres: ${label.subgenres.join(', ')}` : null,
    label.known_for ? `Known For: ${label.known_for}` : null,
    label.philosophy ? `Philosophy: ${label.philosophy}` : null,
    label.key_releases?.length ? `Key Releases: ${label.key_releases.join(', ')}` : null,
    label.release_count ? `Catalog Size: ~${label.release_count} releases` : null,
  ].filter(Boolean);

  return parts.join('\n');
}

function buildLabelSummary(label: LabelData): string {
  return [
    `${label.label_name} is a${label.is_active ? 'n active' : ' defunct'} ${label.label_type || 'independent'} techno label`,
    label.headquarters_city ? `based in ${label.headquarters_city}` : null,
    label.founded_year ? `founded in ${label.founded_year}` : null,
    label.founders?.length ? `by ${label.founders.join(' and ')}` : null,
    label.known_for ? `. Known for ${label.known_for.toLowerCase()}` : '',
    label.key_artists?.length ? `. Key roster: ${label.key_artists.slice(0, 5).join(', ')}` : '',
    label.subgenres?.length ? `. Genres: ${label.subgenres.join(', ')}` : '',
    label.philosophy ? `. Philosophy: "${label.philosophy}"` : '',
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() + '.';
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();

    // Fetch all labels
    const { data: labels, error: labelsError } = await supabase
      .from('labels')
      .select('id, label_name, label_type, headquarters_country, headquarters_city, founded_year, is_active, description, bio_short, bio_long, founders, key_artists, key_releases, subgenres, tags, known_for, philosophy, release_count, label_website_url, discogs_url, bandcamp_url')
      .order('label_name');

    if (labelsError) throw new Error(`Failed to fetch labels: ${labelsError.message}`);
    if (!labels || labels.length === 0) return jsonResponse({ success: true, message: 'No labels found', inserted: 0 });

    console.log(`Processing ${labels.length} labels`);

    // Check existing documents to avoid duplicates
    const { data: existing } = await supabase
      .from('labels_documents')
      .select('label_id, document_type');
    
    const existingSet = new Set((existing || []).map((e: any) => `${e.label_id}:${e.document_type}`));

    // Generate documents for each label
    const documentsToInsert: Array<{
      label_id: string;
      document_type: string;
      title: string;
      content: string;
      source_name: string;
      metadata: Record<string, unknown>;
    }> = [];

    for (const label of labels) {
      // Profile document
      if (!existingSet.has(`${label.id}:profile`)) {
        documentsToInsert.push({
          label_id: label.id,
          document_type: 'profile',
          title: `${label.label_name} — Label Profile`,
          content: buildLabelProfile(label),
          source_name: 'labels-seed',
          metadata: {
            label_name: label.label_name,
            founded_year: label.founded_year,
            country: label.headquarters_country,
            type: label.label_type,
          },
        });
      }

      // Summary document (shorter, for quick retrieval)
      if (!existingSet.has(`${label.id}:summary`)) {
        documentsToInsert.push({
          label_id: label.id,
          document_type: 'summary',
          title: `${label.label_name} — Summary`,
          content: buildLabelSummary(label),
          source_name: 'labels-seed',
          metadata: {
            label_name: label.label_name,
            type: label.label_type,
          },
        });
      }
    }

    if (documentsToInsert.length === 0) {
      return jsonResponse({ success: true, message: 'All labels already have documents', inserted: 0 });
    }

    console.log(`Generating Voyage embeddings for ${documentsToInsert.length} documents`);

    // Batch generate embeddings
    const texts = documentsToInsert.map(d => d.content);
    const embeddings = await generateVoyageBatchEmbeddings(texts);

    if (!embeddings || embeddings.length !== documentsToInsert.length) {
      console.error(`Embedding count mismatch: expected ${documentsToInsert.length}, got ${embeddings?.length || 0}`);
      // Fall back to individual embedding generation
    }

    // Insert documents with embeddings
    let inserted = 0;
    let embeddingsFailed = 0;

    for (let i = 0; i < documentsToInsert.length; i++) {
      const doc = documentsToInsert[i];
      const embedding = embeddings?.[i];

      const record: Record<string, unknown> = {
        label_id: doc.label_id,
        document_type: doc.document_type,
        title: doc.title,
        content: doc.content,
        source_name: doc.source_name,
        metadata: doc.metadata,
      };

      if (embedding) {
        record.voyage_embedding = formatEmbeddingForStorage(embedding);
      } else {
        // Try individual embedding as fallback
        const single = await generateVoyageEmbedding(doc.content);
        if (single) {
          record.voyage_embedding = formatEmbeddingForStorage(single.embedding);
        } else {
          embeddingsFailed++;
        }
      }

      const { error: insertError } = await supabase
        .from('labels_documents')
        .insert(record);

      if (insertError) {
        console.error(`Failed to insert doc for ${doc.title}:`, insertError.message);
      } else {
        inserted++;
      }
    }

    console.log(`Inserted ${inserted} documents, ${embeddingsFailed} embedding failures`);

    return jsonResponse({
      success: true,
      labelsProcessed: labels.length,
      documentsInserted: inserted,
      embeddingsFailed,
      message: `Populated ${inserted} label documents with Voyage 1024d embeddings`,
    });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
