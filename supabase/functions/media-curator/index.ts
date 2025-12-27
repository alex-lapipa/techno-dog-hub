import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Provider configuration with priority order
const PROVIDERS = [
  { name: 'wikimedia', priority: 1, requiresKey: false },
  { name: 'musicbrainz', priority: 2, requiresKey: false },
  { name: 'discogs', priority: 3, requiresKey: true, keyName: 'DISCOGS_API_KEY' },
  { name: 'web-search', priority: 4, requiresKey: true, keyName: 'FIRECRAWL_API_KEY' },
];

interface CandidateImage {
  url: string;
  provider: string;
  license?: string;
  licenseUrl?: string;
  author?: string;
  sourceUrl?: string;
  width?: number;
  height?: number;
}

// Fetch from Wikimedia Commons
async function fetchWikimediaImages(entityName: string, entityType: string): Promise<CandidateImage[]> {
  const candidates: CandidateImage[] = [];
  
  try {
    // Search Wikimedia Commons for images
    const searchQuery = entityType === 'artist' 
      ? `${entityName} DJ musician` 
      : entityType === 'synth' 
        ? `${entityName} synthesizer`
        : entityType === 'venue'
          ? `${entityName} nightclub concert venue`
          : entityName;
    
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srnamespace=6&srlimit=5&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.query?.search) {
      for (const result of searchData.query.search.slice(0, 5)) {
        const title = result.title;
        
        // Get image info
        const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|extmetadata&format=json&origin=*`;
        const infoResponse = await fetch(infoUrl);
        const infoData = await infoResponse.json();
        
        const pages = infoData.query?.pages;
        if (pages) {
          for (const pageId of Object.keys(pages)) {
            const imageInfo = pages[pageId]?.imageinfo?.[0];
            if (imageInfo?.url) {
              const extmeta = imageInfo.extmetadata || {};
              candidates.push({
                url: imageInfo.url,
                provider: 'wikimedia',
                license: extmeta.LicenseShortName?.value || 'Unknown',
                licenseUrl: extmeta.LicenseUrl?.value,
                author: extmeta.Artist?.value?.replace(/<[^>]*>/g, '') || 'Unknown',
                sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
                width: imageInfo.width,
                height: imageInfo.height,
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Wikimedia fetch error:', error);
  }
  
  return candidates;
}

// Fetch from MusicBrainz (for artists)
async function fetchMusicBrainzImages(entityName: string): Promise<CandidateImage[]> {
  const candidates: CandidateImage[] = [];
  
  try {
    // Search for artist
    const searchUrl = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(entityName)}&fmt=json&limit=3`;
    const headers = { 'User-Agent': 'TechnoDog/1.0 (https://technodog.love)' };
    
    const searchResponse = await fetch(searchUrl, { headers });
    const searchData = await searchResponse.json();
    
    if (searchData.artists) {
      for (const artist of searchData.artists.slice(0, 3)) {
        // Get cover art from releases
        const releasesUrl = `https://musicbrainz.org/ws/2/release?artist=${artist.id}&fmt=json&limit=5`;
        const releasesResponse = await fetch(releasesUrl, { headers });
        const releasesData = await releasesResponse.json();
        
        if (releasesData.releases) {
          for (const release of releasesData.releases.slice(0, 3)) {
            try {
              const coverUrl = `https://coverartarchive.org/release/${release.id}`;
              const coverResponse = await fetch(coverUrl);
              if (coverResponse.ok) {
                const coverData = await coverResponse.json();
                if (coverData.images?.[0]) {
                  const img = coverData.images[0];
                  candidates.push({
                    url: img.thumbnails?.large || img.image,
                    provider: 'musicbrainz',
                    license: 'CC0',
                    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
                    sourceUrl: `https://musicbrainz.org/artist/${artist.id}`,
                  });
                }
              }
            } catch (e) {
              // Cover art not available for this release
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('MusicBrainz fetch error:', error);
  }
  
  return candidates;
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, entityType, entityId, entityName, jobId } = await req.json();

    console.log(`Media curator action: ${action} for ${entityType}/${entityId}`);

    switch (action) {
      case 'enqueue': {
        // Enqueue a new job
        const { data, error } = await supabase.rpc('enqueue_media_job', {
          p_entity_type: entityType,
          p_entity_id: entityId,
          p_entity_name: entityName,
          p_priority: 5,
        });

        if (error) throw error;

        return new Response(JSON.stringify({ 
          success: true, 
          jobId: data,
          message: 'Job enqueued successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'process': {
        // Claim next job from queue
        const { data: jobs, error: claimError } = await supabase.rpc('claim_next_media_job');
        
        if (claimError) throw claimError;
        if (!jobs || jobs.length === 0) {
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'No jobs in queue' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const job = jobs[0];
        console.log(`Processing job ${job.job_id} for ${job.entity_type}/${job.entity_id}`);

        try {
          // Fetch candidates from all providers
          const allCandidates: CandidateImage[] = [];
          
          // Always try Wikimedia first (highest priority, no API key needed)
          const wikimediaCandidates = await fetchWikimediaImages(job.entity_name, job.entity_type);
          allCandidates.push(...wikimediaCandidates);
          
          // Try MusicBrainz for artists
          if (job.entity_type === 'artist') {
            const mbCandidates = await fetchMusicBrainzImages(job.entity_name);
            allCandidates.push(...mbCandidates);
          }

          console.log(`Found ${allCandidates.length} candidate images`);

          if (allCandidates.length === 0) {
            // Mark job as complete with no results
            await supabase
              .from('media_pipeline_jobs')
              .update({
                status: 'complete',
                completed_at: new Date().toISOString(),
                result: { candidatesFound: 0, message: 'No images found' },
              })
              .eq('id', job.job_id);

            return new Response(JSON.stringify({ 
              success: true,
              jobId: job.job_id,
              message: 'No candidates found' 
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          // Store all candidates in media_assets
          for (const candidate of allCandidates) {
            await supabase.from('media_assets').insert({
              entity_type: job.entity_type,
              entity_id: job.entity_id,
              entity_name: job.entity_name,
              source_url: candidate.url,
              provider: candidate.provider,
              license_name: candidate.license,
              license_url: candidate.licenseUrl,
              license_status: candidate.license?.toLowerCase().includes('cc') || 
                             candidate.license?.toLowerCase().includes('public domain') 
                             ? 'safe' : 'unknown',
              meta: {
                width: candidate.width,
                height: candidate.height,
                author: candidate.author,
                sourceUrl: candidate.sourceUrl,
              },
            });
          }

          // Trigger verification (call media-verify function)
          const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/media-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              entityType: job.entity_type,
              entityId: job.entity_id,
              entityName: job.entity_name,
            }),
          });

          const verifyResult = await verifyResponse.json();
          console.log('Verification result:', verifyResult);

          // Update job status
          await supabase
            .from('media_pipeline_jobs')
            .update({
              status: 'complete',
              completed_at: new Date().toISOString(),
              result: { 
                candidatesFound: allCandidates.length,
                verified: verifyResult.verified || false,
                selectedAssetId: verifyResult.selectedAssetId,
              },
            })
            .eq('id', job.job_id);

          return new Response(JSON.stringify({ 
            success: true,
            jobId: job.job_id,
            candidatesFound: allCandidates.length,
            verified: verifyResult.verified,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (processError: unknown) {
          const errorMessage = processError instanceof Error ? processError.message : 'Unknown error';
          console.error('Job processing error:', processError);
          
          // Check if we should retry
          if (job.attempts < 3) {
            await supabase
              .from('media_pipeline_jobs')
              .update({
                status: 'queued',
                error_log: errorMessage,
              })
              .eq('id', job.job_id);
          } else {
            await supabase
              .from('media_pipeline_jobs')
              .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_log: errorMessage,
              })
              .eq('id', job.job_id);
          }

          throw processError;
        }
      }

      case 'status': {
        // Get job status
        const { data, error } = await supabase
          .from('media_pipeline_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, job: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'queue-stats': {
        // Get queue statistics
        const { data: stats, error } = await supabase
          .from('media_pipeline_jobs')
          .select('status')
          .then(({ data, error }) => {
            if (error) return { data: null, error };
            const counts = {
              queued: 0,
              running: 0,
              complete: 0,
              failed: 0,
            };
            data?.forEach(job => {
              counts[job.status as keyof typeof counts]++;
            });
            return { data: counts, error: null };
          });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, stats }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: unknown) {
    console.error('Media curator error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
