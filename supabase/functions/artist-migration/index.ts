import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { handleCors } from "../_shared/cors.ts";

/**
 * Artist Migration Edge Function
 * 
 * Non-destructive migration of artist data from legacy sources to canonical schema.
 * Supports incremental migration with full provenance tracking.
 */

interface MigrationRequest {
  action: 'migrate_legacy' | 'migrate_rag' | 'migrate_content_sync' | 'migrate_all' | 'validate' | 'status';
  dryRun?: boolean;
  batchSize?: number;
  startFrom?: number;
}

interface MigrationResult {
  success: boolean;
  action: string;
  stats: {
    processed: number;
    created: number;
    updated: number;
    merged: number;
    errors: number;
    flaggedForReview: number;
  };
  errors?: string[];
  duration_ms: number;
}

// Source priority levels (higher = more trusted)
const SOURCE_PRIORITY = {
  manual: 100,
  legacy_ts: 80,
  content_sync: 70,
  rag: 60,
  scraped: 40
};

// Helper: Normalize artist name for matching
function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper: Generate sort name (Last, First)
function generateSortName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return name;
  const last = parts.pop();
  return `${last}, ${parts.join(' ')}`;
}

// Helper: Calculate match confidence between two artist names
function calculateNameMatchConfidence(name1: string, name2: string): number {
  const norm1 = normalizeArtistName(name1);
  const norm2 = normalizeArtistName(name2);
  
  // Exact match
  if (norm1 === norm2) return 1.0;
  
  // One contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.85;
  
  // Calculate Levenshtein-based similarity
  const longer = norm1.length > norm2.length ? norm1 : norm2;
  const shorter = norm1.length > norm2.length ? norm2 : norm1;
  
  if (longer.length === 0) return 1.0;
  
  // Simple similarity based on common characters
  let matches = 0;
  for (const char of shorter) {
    if (longer.includes(char)) matches++;
  }
  
  return matches / longer.length;
}

// Migrate legacy TypeScript artists
async function migrateLegacyArtists(
  supabase: ReturnType<typeof createServiceClient>,
  dryRun: boolean
): Promise<{ created: number; updated: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;
  let updated = 0;

  // Fetch legacy artists from the static file via API or embed directly
  // For now, we'll read from the documents table which should have the data
  // In production, this would be a separate import job
  
  // First, check what's already migrated
  const { data: existingMaps } = await supabase
    .from('artist_source_map')
    .select('source_record_id')
    .eq('source_system', 'legacy_ts');
  
  const alreadyMigrated = new Set(existingMaps?.map(m => m.source_record_id) || []);
  
  // Get legacy artists from a known source (we'll use a predefined list for migration)
  // This would normally come from parsing the TypeScript file
  const legacyArtistIds = [
    'jeff-mills', 'robert-hood', 'underground-resistance', 'surgeon', 'ben-klock',
    'marcel-dettmann', 'helena-hauff', 'dax-j', 'rodhad', 'paula-temple',
    'blawan', 'rebekah', 'perc', 'i-hate-models', 'oscar-mulero', 'rrose',
    'speedy-j', 'luke-slater', 'planetary-assault-systems', 'kobosil', 'reeko',
    'exium', 'token', 'len-faki', 'drumcell', 'ancient-methods', 'phase-fatale',
    'silent-servant', 'developer', 'pfirter', 'ness', 'wata-igarashi', 'dj-nobu',
    'takaaki-itoh', 'go-hiyama', 'yuki-matsumura', 'juan-atkins', 'derrick-may',
    'kevin-saunderson', 'drexciya', 'carl-craig', 'richie-hawtin', 'basic-channel',
    'aphex-twin', 'autechre', 'carl-cox', 'laurent-garnier', 'dave-clarke',
    'chris-liebing', 'adam-beyer', 'amelie-lens', 'charlotte-de-witte', 'jeff-rushin'
  ];

  for (const legacyId of legacyArtistIds) {
    if (alreadyMigrated.has(legacyId)) continue;
    
    try {
      // Check if artist with this slug already exists
      const { data: existing } = await supabase
        .from('canonical_artists')
        .select('artist_id')
        .eq('slug', legacyId)
        .single();
      
      if (existing) {
        // Update source map to link existing artist
        if (!dryRun) {
          await supabase.from('artist_source_map').upsert({
            source_system: 'legacy_ts',
            source_table: 'artists',
            source_record_id: legacyId,
            artist_id: existing.artist_id,
            match_confidence: 1.0,
            match_method: 'slug_match'
          });
        }
        updated++;
      } else {
        // Artist would need to be created - this would come from the actual legacy data
        // For now we skip creation as we need the full artist data
        errors.push(`Legacy artist ${legacyId} needs full data for creation`);
      }
    } catch (err: unknown) {
      errors.push(`Error processing ${legacyId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { created, updated, errors };
}

// Migrate RAG artists from dj_artists table
async function migrateRagArtists(
  supabase: ReturnType<typeof createServiceClient>,
  dryRun: boolean,
  batchSize: number = 50,
  startFrom: number = 0
): Promise<{ created: number; updated: number; merged: number; flaggedForReview: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;
  let updated = 0;
  let merged = 0;
  let flaggedForReview = 0;

  // Fetch RAG artists
  const { data: ragArtists, error: fetchError } = await supabase
    .from('dj_artists')
    .select('*')
    .order('rank', { ascending: true })
    .range(startFrom, startFrom + batchSize - 1);

  if (fetchError) {
    errors.push(`Failed to fetch RAG artists: ${fetchError.message}`);
    return { created, updated, merged, flaggedForReview, errors };
  }

  // Check existing mappings
  const { data: existingMaps } = await supabase
    .from('artist_source_map')
    .select('source_record_id, artist_id')
    .eq('source_system', 'dj_artists');
  
  const mappedArtists = new Map(
    existingMaps?.map(m => [m.source_record_id, m.artist_id]) || []
  );

  for (const ragArtist of ragArtists || []) {
    const sourceRecordId = ragArtist.id.toString();
    
    if (mappedArtists.has(sourceRecordId)) {
      // Already migrated, update profile data only
      const artistId = mappedArtists.get(sourceRecordId);
      if (!dryRun) {
        await supabase.from('artist_profiles').upsert({
          artist_id: artistId,
          source_system: 'rag',
          source_record_id: sourceRecordId,
          labels: ragArtist.labels,
          subgenres: ragArtist.subgenres,
          top_tracks: ragArtist.top_tracks,
          known_for: ragArtist.known_for,
          source_payload: ragArtist,
          source_priority: SOURCE_PRIORITY.rag,
          confidence_score: 0.8
        }, { onConflict: 'artist_id,source_system' });
      }
      updated++;
      continue;
    }

    // Try to match with existing canonical artist
    const slug = generateSlug(ragArtist.artist_name);
    const { data: existingBySlug } = await supabase
      .from('canonical_artists')
      .select('artist_id, canonical_name')
      .eq('slug', slug)
      .single();

    if (existingBySlug) {
      // Found by slug - high confidence match
      if (!dryRun) {
        // Link to existing
        await supabase.from('artist_source_map').insert({
          source_system: 'dj_artists',
          source_table: 'dj_artists',
          source_record_id: sourceRecordId,
          artist_id: existingBySlug.artist_id,
          match_confidence: 0.95,
          match_method: 'slug_match'
        });
        
        // Add RAG profile data
        await supabase.from('artist_profiles').insert({
          artist_id: existingBySlug.artist_id,
          bio_short: ragArtist.known_for,
          labels: ragArtist.labels,
          subgenres: ragArtist.subgenres,
          top_tracks: ragArtist.top_tracks,
          known_for: ragArtist.known_for,
          source_system: 'rag',
          source_record_id: sourceRecordId,
          source_payload: ragArtist,
          source_priority: SOURCE_PRIORITY.rag,
          confidence_score: 0.8
        });
      }
      merged++;
      continue;
    }

    // Try fuzzy match on name
    const normalizedName = normalizeArtistName(ragArtist.artist_name);
    const { data: candidates } = await supabase
      .from('canonical_artists')
      .select('artist_id, canonical_name, slug');

    let bestMatch: { artist_id: string; confidence: number } | null = null;
    
    for (const candidate of candidates || []) {
      const confidence = calculateNameMatchConfidence(ragArtist.artist_name, candidate.canonical_name);
      if (confidence >= 0.85 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { artist_id: candidate.artist_id, confidence };
      } else if (confidence >= 0.60 && confidence < 0.85) {
        // Flag for review
        if (!dryRun) {
          await supabase.from('artist_merge_candidates').insert({
            artist_a_id: candidate.artist_id,
            artist_b_id: candidate.artist_id, // Placeholder - will be updated after creation
            match_score: confidence,
            match_reasons: [{ type: 'fuzzy_name', rag_name: ragArtist.artist_name, canonical_name: candidate.canonical_name }],
            status: 'pending'
          });
        }
        flaggedForReview++;
      }
    }

    if (bestMatch) {
      // High confidence match - merge
      if (!dryRun) {
        await supabase.from('artist_source_map').insert({
          source_system: 'dj_artists',
          source_table: 'dj_artists',
          source_record_id: sourceRecordId,
          artist_id: bestMatch.artist_id,
          match_confidence: bestMatch.confidence,
          match_method: 'fuzzy_name'
        });
        
        await supabase.from('artist_profiles').insert({
          artist_id: bestMatch.artist_id,
          bio_short: ragArtist.known_for,
          labels: ragArtist.labels,
          subgenres: ragArtist.subgenres,
          top_tracks: ragArtist.top_tracks,
          known_for: ragArtist.known_for,
          source_system: 'rag',
          source_record_id: sourceRecordId,
          source_payload: ragArtist,
          source_priority: SOURCE_PRIORITY.rag,
          confidence_score: bestMatch.confidence
        });
      }
      merged++;
    } else {
      // No match - create new canonical artist
      if (!dryRun) {
        // Parse nationality for city/country
        let city = '';
        let country = '';
        let region = '';
        
        if (ragArtist.nationality) {
          const parts = ragArtist.nationality.split(',').map((p: string) => p.trim());
          if (parts.length >= 2) {
            city = parts[0].replace(/^American \(|\)$/g, '');
            country = parts[parts.length - 1];
          } else {
            country = ragArtist.nationality.replace(/^American \(|\)|British \(|\)/g, '');
          }
          
          // Determine region
          if (['USA', 'United States', 'American', 'Detroit', 'NYC', 'Chicago'].some(r => ragArtist.nationality.includes(r))) {
            region = 'North America';
          } else if (['Germany', 'UK', 'British', 'Spain', 'France', 'Italy', 'Netherlands', 'Belgium'].some(r => ragArtist.nationality.includes(r))) {
            region = 'Europe';
          } else if (['Japan', 'China', 'Korea'].some(r => ragArtist.nationality.includes(r))) {
            region = 'Asia';
          }
        }

        const { data: newArtist, error: insertError } = await supabase
          .from('canonical_artists')
          .insert({
            canonical_name: ragArtist.artist_name,
            sort_name: generateSortName(ragArtist.artist_name),
            slug: slug,
            real_name: ragArtist.real_name,
            city: city,
            country: country,
            region: region,
            active_years: ragArtist.years_active,
            rank: ragArtist.rank
          })
          .select('artist_id')
          .single();

        if (insertError) {
          errors.push(`Failed to create artist ${ragArtist.artist_name}: ${insertError.message}`);
          continue;
        }

        // Add source mapping
        await supabase.from('artist_source_map').insert({
          source_system: 'dj_artists',
          source_table: 'dj_artists',
          source_record_id: sourceRecordId,
          artist_id: newArtist.artist_id,
          match_confidence: 1.0,
          match_method: 'new_creation'
        });

        // Add profile
        await supabase.from('artist_profiles').insert({
          artist_id: newArtist.artist_id,
          bio_short: ragArtist.known_for,
          labels: ragArtist.labels,
          subgenres: ragArtist.subgenres,
          top_tracks: ragArtist.top_tracks,
          known_for: ragArtist.known_for,
          source_system: 'rag',
          source_record_id: sourceRecordId,
          source_payload: ragArtist,
          source_priority: SOURCE_PRIORITY.rag,
          confidence_score: 0.9
        });

        // Add alias for real name if different
        if (ragArtist.real_name && ragArtist.real_name !== ragArtist.artist_name) {
          await supabase.from('artist_aliases').insert({
            artist_id: newArtist.artist_id,
            alias_name: ragArtist.real_name,
            alias_type: 'real_name',
            source_system: 'rag'
          });
        }

        // Log migration
        await supabase.from('artist_migration_log').insert({
          operation: 'import',
          source_system: 'dj_artists',
          source_record_id: sourceRecordId,
          target_artist_id: newArtist.artist_id,
          details: { artist_name: ragArtist.artist_name, rank: ragArtist.rank }
        });
      }
      created++;
    }
  }

  return { created, updated, merged, flaggedForReview, errors };
}

// Migrate content_sync photos
async function migrateContentSync(
  supabase: ReturnType<typeof createServiceClient>,
  dryRun: boolean
): Promise<{ updated: number; errors: string[] }> {
  const errors: string[] = [];
  let updated = 0;

  // Fetch content_sync records for artists
  const { data: syncRecords, error: fetchError } = await supabase
    .from('content_sync')
    .select('*')
    .eq('entity_type', 'artist');

  if (fetchError) {
    errors.push(`Failed to fetch content_sync: ${fetchError.message}`);
    return { updated, errors };
  }

  for (const record of syncRecords || []) {
    // Find matching canonical artist by slug (entity_id is the slug)
    const { data: artist } = await supabase
      .from('canonical_artists')
      .select('artist_id')
      .eq('slug', record.entity_id)
      .single();

    if (!artist) {
      // Try to find by source map
      const { data: mapped } = await supabase
        .from('artist_source_map')
        .select('artist_id')
        .eq('source_system', 'legacy_ts')
        .eq('source_record_id', record.entity_id)
        .single();

      if (!mapped) {
        errors.push(`No canonical artist found for content_sync entity_id: ${record.entity_id}`);
        continue;
      }
    }

    const artistId = artist?.artist_id;

    if (artistId && record.photo_url && !dryRun) {
      // Add or update photo asset
      await supabase.from('artist_assets').upsert({
        artist_id: artistId,
        asset_type: 'photo',
        url: record.photo_url,
        source_name: record.photo_source || 'Unknown',
        is_primary: true,
        source_system: 'content_sync',
        source_record_id: record.id,
        copyright_status: record.status === 'verified' ? 'clear' : 'unknown'
      }, { onConflict: 'artist_id,source_system,source_record_id' });

      // Add source mapping
      await supabase.from('artist_source_map').upsert({
        source_system: 'content_sync',
        source_table: 'content_sync',
        source_record_id: record.id,
        artist_id: artistId,
        match_confidence: 1.0,
        match_method: 'slug_match'
      });

      updated++;
    }
  }

  return { updated, errors };
}

// Get migration status
async function getMigrationStatus(
  supabase: ReturnType<typeof createServiceClient>
): Promise<object> {
  const [
    { count: canonicalCount },
    { count: profileCount },
    { count: mappingCount },
    { count: documentCount },
    { count: pendingReviewCount },
    { data: sourceCounts }
  ] = await Promise.all([
    supabase.from('canonical_artists').select('*', { count: 'exact', head: true }),
    supabase.from('artist_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('artist_source_map').select('*', { count: 'exact', head: true }),
    supabase.from('artist_documents').select('*', { count: 'exact', head: true }),
    supabase.from('artist_merge_candidates').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('artist_source_map').select('source_system')
  ]);

  // Get legacy source counts for comparison
  const [
    { count: ragSourceCount },
    { count: contentSyncCount }
  ] = await Promise.all([
    supabase.from('dj_artists').select('*', { count: 'exact', head: true }),
    supabase.from('content_sync').select('*', { count: 'exact', head: true }).eq('entity_type', 'artist')
  ]);

  return {
    canonical: {
      artists: canonicalCount,
      profiles: profileCount,
      sourceMappings: mappingCount,
      documents: documentCount,
      pendingReviews: pendingReviewCount
    },
    sources: {
      dj_artists: ragSourceCount,
      content_sync: contentSyncCount,
      legacy_ts: 70 // Known count from file
    },
    migrationProgress: sourceCounts
  };
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();
    const request: MigrationRequest = await req.json();
    const startTime = Date.now();
    
    const dryRun = request.dryRun ?? false;
    const batchSize = request.batchSize ?? 50;
    const startFrom = request.startFrom ?? 0;

    let result: MigrationResult;

    switch (request.action) {
      case 'status': {
        const status = await getMigrationStatus(supabase);
        return new Response(JSON.stringify({ success: true, status }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      case 'migrate_rag': {
        const ragResult = await migrateRagArtists(supabase, dryRun, batchSize, startFrom);
        result = {
          success: ragResult.errors.length === 0,
          action: 'migrate_rag',
          stats: {
            processed: ragResult.created + ragResult.updated + ragResult.merged,
            created: ragResult.created,
            updated: ragResult.updated,
            merged: ragResult.merged,
            errors: ragResult.errors.length,
            flaggedForReview: ragResult.flaggedForReview
          },
          errors: ragResult.errors.length > 0 ? ragResult.errors : undefined,
          duration_ms: Date.now() - startTime
        };
        break;
      }

      case 'migrate_content_sync': {
        const syncResult = await migrateContentSync(supabase, dryRun);
        result = {
          success: syncResult.errors.length === 0,
          action: 'migrate_content_sync',
          stats: {
            processed: syncResult.updated,
            created: 0,
            updated: syncResult.updated,
            merged: 0,
            errors: syncResult.errors.length,
            flaggedForReview: 0
          },
          errors: syncResult.errors.length > 0 ? syncResult.errors : undefined,
          duration_ms: Date.now() - startTime
        };
        break;
      }

      case 'migrate_all': {
        // Run all migrations in sequence
        const ragResult = await migrateRagArtists(supabase, dryRun, 100, 0);
        const syncResult = await migrateContentSync(supabase, dryRun);
        
        result = {
          success: ragResult.errors.length === 0 && syncResult.errors.length === 0,
          action: 'migrate_all',
          stats: {
            processed: ragResult.created + ragResult.updated + ragResult.merged + syncResult.updated,
            created: ragResult.created,
            updated: ragResult.updated + syncResult.updated,
            merged: ragResult.merged,
            errors: ragResult.errors.length + syncResult.errors.length,
            flaggedForReview: ragResult.flaggedForReview
          },
          errors: [...ragResult.errors, ...syncResult.errors].length > 0 
            ? [...ragResult.errors, ...syncResult.errors] 
            : undefined,
          duration_ms: Date.now() - startTime
        };
        break;
      }

      case 'validate': {
        // Run validation checks
        const status = await getMigrationStatus(supabase);
        const validationErrors: string[] = [];
        
        // Check for orphaned source mappings
        const { data: orphanedMaps } = await supabase
          .from('artist_source_map')
          .select('mapping_id, source_record_id')
          .is('artist_id', null);
        
        if (orphanedMaps && orphanedMaps.length > 0) {
          validationErrors.push(`Found ${orphanedMaps.length} orphaned source mappings`);
        }

        // Check for artists without profiles
        const { data: noProfiles } = await supabase
          .from('canonical_artists')
          .select('artist_id, canonical_name')
          .not('artist_id', 'in', 
            supabase.from('artist_profiles').select('artist_id')
          );
        
        result = {
          success: validationErrors.length === 0,
          action: 'validate',
          stats: {
            processed: 0,
            created: 0,
            updated: 0,
            merged: 0,
            errors: validationErrors.length,
            flaggedForReview: 0
          },
          errors: validationErrors.length > 0 ? validationErrors : undefined,
          duration_ms: Date.now() - startTime
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${request.action}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
