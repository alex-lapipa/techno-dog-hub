import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { handleCors } from "../_shared/cors.ts";

/**
 * Artist Embedding Sync Edge Function
 * 
 * Generates and syncs embeddings for artist documents in the unified vector store.
 * Supports incremental updates - only regenerates embeddings when content changes.
 */

interface SyncRequest {
  action: 'sync_all' | 'sync_artist' | 'generate_documents' | 'status';
  artistId?: string;
  batchSize?: number;
  forceRegenerate?: boolean;
}

interface EmbeddingResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  duration_ms: number;
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[] | null> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    console.error('OPENAI_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000) // Limit input length
      })
    });

    if (!response.ok) {
      console.error('OpenAI embedding error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return null;
  }
}

// Generate RAG documents for an artist
async function generateArtistDocuments(
  supabase: ReturnType<typeof createServiceClient>,
  artistId: string
): Promise<{ documents: Array<{ type: string; title: string; content: string }>; errors: string[] }> {
  const documents: Array<{ type: string; title: string; content: string }> = [];
  const errors: string[] = [];

  // Fetch artist and all related data
  const { data: artist, error: artistError } = await supabase
    .from('canonical_artists')
    .select(`
      *,
      artist_profiles(*),
      artist_aliases(*),
      artist_gear(*)
    `)
    .eq('artist_id', artistId)
    .single();

  if (artistError || !artist) {
    errors.push(`Failed to fetch artist ${artistId}: ${artistError?.message}`);
    return { documents, errors };
  }

  // Get highest priority profile
  const profiles = artist.artist_profiles || [];
  const primaryProfile = profiles.sort((a: any, b: any) => b.source_priority - a.source_priority)[0];

  // Document 1: Core bio
  if (primaryProfile?.bio_long || primaryProfile?.bio_short) {
    const bioContent = `
${artist.canonical_name} is a ${artist.primary_genre || 'techno'} artist from ${artist.city ? artist.city + ', ' : ''}${artist.country || 'Unknown'}.
${primaryProfile.real_name ? `Real name: ${artist.real_name}.` : ''}
${artist.active_years ? `Active: ${artist.active_years}.` : ''}

${primaryProfile.bio_long || primaryProfile.bio_short || ''}

${primaryProfile.known_for ? `Known for: ${primaryProfile.known_for}` : ''}
    `.trim();

    documents.push({
      type: 'bio',
      title: `${artist.canonical_name} - Biography`,
      content: bioContent
    });
  }

  // Document 2: Discography and releases
  const labels = primaryProfile?.labels || [];
  const topTracks = primaryProfile?.top_tracks || [];
  const keyReleases = primaryProfile?.key_releases || [];
  
  if (labels.length > 0 || topTracks.length > 0 || keyReleases.length > 0) {
    let discographyContent = `${artist.canonical_name} discography and label affiliations.\n\n`;
    
    if (labels.length > 0) {
      discographyContent += `Labels: ${labels.join(', ')}.\n\n`;
    }
    
    if (topTracks.length > 0) {
      discographyContent += `Notable tracks: ${topTracks.join(', ')}.\n\n`;
    }
    
    if (keyReleases.length > 0) {
      discographyContent += 'Key releases:\n';
      for (const release of keyReleases) {
        if (typeof release === 'object') {
          discographyContent += `- "${release.title}" (${release.label}, ${release.year})\n`;
        }
      }
    }

    documents.push({
      type: 'discography',
      title: `${artist.canonical_name} - Discography`,
      content: discographyContent.trim()
    });
  }

  // Document 3: Musical style and subgenres
  const subgenres = primaryProfile?.subgenres || [];
  const tags = primaryProfile?.tags || [];
  
  if (subgenres.length > 0 || tags.length > 0) {
    const styleContent = `
${artist.canonical_name} musical style and genres.

${subgenres.length > 0 ? `Subgenres: ${subgenres.join(', ')}.` : ''}
${tags.length > 0 ? `Tags: ${tags.join(', ')}.` : ''}
${primaryProfile?.known_for ? `\nCharacterized by: ${primaryProfile.known_for}` : ''}
    `.trim();

    documents.push({
      type: 'style',
      title: `${artist.canonical_name} - Musical Style`,
      content: styleContent
    });
  }

  // Document 4: Career highlights
  const highlights = primaryProfile?.career_highlights || [];
  const collaborators = primaryProfile?.collaborators || [];
  
  if (highlights.length > 0 || collaborators.length > 0) {
    let careerContent = `${artist.canonical_name} career highlights and achievements.\n\n`;
    
    if (highlights.length > 0) {
      careerContent += 'Highlights:\n';
      for (const highlight of highlights) {
        careerContent += `- ${highlight}\n`;
      }
    }
    
    if (collaborators.length > 0) {
      careerContent += `\nCollaborators: ${collaborators.join(', ')}.`;
    }

    documents.push({
      type: 'career',
      title: `${artist.canonical_name} - Career`,
      content: careerContent.trim()
    });
  }

  // Document 5: Gear and equipment
  const gearData = artist.artist_gear || [];
  if (gearData.length > 0) {
    let gearContent = `${artist.canonical_name} equipment and gear setup.\n\n`;
    
    for (const gear of gearData) {
      gearContent += `${gear.gear_category.toUpperCase()} GEAR:\n`;
      if (gear.gear_items?.length > 0) {
        for (const item of gear.gear_items) {
          gearContent += `- ${item}\n`;
        }
      }
      if (gear.rider_notes) {
        gearContent += `Rider notes: ${gear.rider_notes}\n`;
      }
      gearContent += '\n';
    }

    documents.push({
      type: 'gear',
      title: `${artist.canonical_name} - Equipment`,
      content: gearContent.trim()
    });
  }

  // Document 6: Aliases and alternative names
  const aliases = artist.artist_aliases || [];
  if (aliases.length > 0 || artist.real_name) {
    let aliasContent = `${artist.canonical_name} also known as:\n\n`;
    
    if (artist.real_name) {
      aliasContent += `Real name: ${artist.real_name}\n`;
    }
    
    for (const alias of aliases) {
      aliasContent += `- ${alias.alias_name} (${alias.alias_type})\n`;
    }

    documents.push({
      type: 'aliases',
      title: `${artist.canonical_name} - Aliases`,
      content: aliasContent.trim()
    });
  }

  return { documents, errors };
}

// Sync embeddings for a single artist
async function syncArtistEmbeddings(
  supabase: ReturnType<typeof createServiceClient>,
  artistId: string,
  forceRegenerate: boolean = false
): Promise<{ created: number; updated: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  // Generate documents
  const { documents, errors: docErrors } = await generateArtistDocuments(supabase, artistId);
  errors.push(...docErrors);

  if (documents.length === 0) {
    errors.push(`No documents generated for artist ${artistId}`);
    return { created, updated, errors };
  }

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    const chunkId = `${artistId}-${doc.type}-${i}`;

    // Check if document already exists and hasn't changed
    const { data: existing } = await supabase
      .from('artist_documents')
      .select('document_id, content')
      .eq('artist_id', artistId)
      .eq('document_type', doc.type)
      .eq('chunk_index', i)
      .single();

    const contentChanged = !existing || existing.content !== doc.content;

    if (existing && !contentChanged && !forceRegenerate) {
      // Skip - content unchanged and embedding exists
      continue;
    }

    // Generate embedding
    const embedding = await generateEmbedding(doc.content);
    
    if (!embedding) {
      errors.push(`Failed to generate embedding for ${doc.title}`);
      continue;
    }

    // Upsert document with embedding
    const documentData = {
      artist_id: artistId,
      document_type: doc.type,
      title: doc.title,
      content: doc.content,
      chunk_index: i,
      embedding: `[${embedding.join(',')}]`,
      metadata: { generated_at: new Date().toISOString() },
      source_system: 'auto_generated'
    };

    if (existing) {
      const { error: updateError } = await supabase
        .from('artist_documents')
        .update(documentData)
        .eq('document_id', existing.document_id);
      
      if (updateError) {
        errors.push(`Failed to update document: ${updateError.message}`);
      } else {
        updated++;
      }
    } else {
      const { error: insertError } = await supabase
        .from('artist_documents')
        .insert(documentData);
      
      if (insertError) {
        errors.push(`Failed to insert document: ${insertError.message}`);
      } else {
        created++;
      }
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { created, updated, errors };
}

// Sync all artists' embeddings
async function syncAllEmbeddings(
  supabase: ReturnType<typeof createServiceClient>,
  batchSize: number = 10,
  forceRegenerate: boolean = false
): Promise<EmbeddingResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalCreated = 0;
  let totalUpdated = 0;
  let processed = 0;

  // Get all canonical artists
  const { data: artists, error: fetchError } = await supabase
    .from('canonical_artists')
    .select('artist_id')
    .order('rank', { ascending: true, nullsFirst: false });

  if (fetchError) {
    return {
      success: false,
      processed: 0,
      created: 0,
      updated: 0,
      errors: [`Failed to fetch artists: ${fetchError.message}`],
      duration_ms: Date.now() - startTime
    };
  }

  // Process in batches
  for (let i = 0; i < (artists?.length || 0); i += batchSize) {
    const batch = artists!.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (artist) => {
      const result = await syncArtistEmbeddings(supabase, artist.artist_id, forceRegenerate);
      totalCreated += result.created;
      totalUpdated += result.updated;
      errors.push(...result.errors);
      processed++;
    }));

    // Delay between batches
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return {
    success: errors.length === 0,
    processed,
    created: totalCreated,
    updated: totalUpdated,
    errors,
    duration_ms: Date.now() - startTime
  };
}

// Get sync status
async function getSyncStatus(
  supabase: ReturnType<typeof createServiceClient>
): Promise<object> {
  const [
    { count: artistCount },
    { count: documentCount },
    { count: embeddingCount },
    { data: documentStats }
  ] = await Promise.all([
    supabase.from('canonical_artists').select('*', { count: 'exact', head: true }),
    supabase.from('artist_documents').select('*', { count: 'exact', head: true }),
    supabase.from('artist_documents').select('*', { count: 'exact', head: true }).not('embedding', 'is', null),
    supabase.from('artist_documents')
      .select('document_type')
      .then(({ data }) => {
        const counts: Record<string, number> = {};
        for (const doc of data || []) {
          counts[doc.document_type] = (counts[doc.document_type] || 0) + 1;
        }
        return { data: counts };
      })
  ]);

  // Artists without documents
  const { data: artistsWithDocs } = await supabase
    .from('artist_documents')
    .select('artist_id')
    .limit(1000);
  
  const artistsWithDocsSet = new Set(artistsWithDocs?.map(d => d.artist_id) || []);
  const artistsWithoutDocs = (artistCount || 0) - artistsWithDocsSet.size;

  return {
    totalArtists: artistCount,
    totalDocuments: documentCount,
    documentsWithEmbeddings: embeddingCount,
    artistsWithoutDocuments: artistsWithoutDocs,
    documentsByType: documentStats
  };
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    const request: SyncRequest = await req.json();

    switch (request.action) {
      case 'status': {
        const status = await getSyncStatus(supabase);
        return new Response(JSON.stringify({ success: true, status }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'sync_artist': {
        if (!request.artistId) {
          return new Response(
            JSON.stringify({ error: 'artistId required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const startTime = Date.now();
        const result = await syncArtistEmbeddings(
          supabase, 
          request.artistId, 
          request.forceRegenerate ?? false
        );
        
        return new Response(JSON.stringify({
          success: result.errors.length === 0,
          ...result,
          duration_ms: Date.now() - startTime
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'sync_all': {
        const result = await syncAllEmbeddings(
          supabase,
          request.batchSize ?? 10,
          request.forceRegenerate ?? false
        );
        
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'generate_documents': {
        if (!request.artistId) {
          return new Response(
            JSON.stringify({ error: 'artistId required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        const { documents, errors } = await generateArtistDocuments(supabase, request.artistId);
        
        return new Response(JSON.stringify({
          success: errors.length === 0,
          documents,
          errors
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${request.action}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    console.error('Embedding sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
