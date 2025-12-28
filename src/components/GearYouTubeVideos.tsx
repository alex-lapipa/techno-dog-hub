import { useState, useEffect } from "react";
import { Play, ExternalLink, Loader2, AlertCircle, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";

interface GearVideo {
  title: string;
  url: string;
  channel: string;
}

interface VerifiedVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  isValid: boolean;
  originalUrl: string;
}

interface GearYouTubeVideosProps {
  videos: GearVideo[];
  gearName: string;
}

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
  // Handle standard watch URLs
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&\s]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle short URLs
  const shortMatch = url.match(/(?:youtu\.be\/)([^?\s]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle embed URLs
  const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?\s]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
};

const GearYouTubeVideos = ({ videos, gearName }: GearYouTubeVideosProps) => {
  const [verifiedVideos, setVerifiedVideos] = useState<VerifiedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const verifyVideos = async () => {
      setLoading(true);
      
      // Extract video IDs from static data
      const videoIds = videos
        .map(v => ({ ...v, id: getYouTubeId(v.url) }))
        .filter(v => v.id !== null);

      if (videoIds.length === 0) {
        setVerifiedVideos([]);
        setLoading(false);
        return;
      }

      try {
        // Verify videos via YouTube API edge function
        const { data, error } = await supabase.functions.invoke('youtube-verify', {
          body: { 
            videoIds: videoIds.map(v => v.id),
            gearName 
          }
        });

        if (error) {
          console.error('Video verification error:', error);
          // Fallback to using static data with thumbnails
          setVerifiedVideos(videoIds.map(v => ({
            id: v.id!,
            title: v.title,
            channel: v.channel,
            thumbnail: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
            isValid: true, // Assume valid if API fails
            originalUrl: v.url
          })));
        } else if (data?.videos) {
          // Map verified videos back to original data
          setVerifiedVideos(data.videos.map((verified: any) => {
            const original = videoIds.find(v => v.id === verified.id);
            return {
              id: verified.id,
              title: verified.title || original?.title || 'Unknown',
              channel: verified.channelTitle || original?.channel || 'Unknown',
              thumbnail: verified.thumbnail || `https://img.youtube.com/vi/${verified.id}/hqdefault.jpg`,
              isValid: verified.isValid,
              originalUrl: original?.url || ''
            };
          }));
        }
      } catch (err) {
        console.error('Error verifying videos:', err);
        // Fallback to static data
        setVerifiedVideos(videoIds.map(v => ({
          id: v.id!,
          title: v.title,
          channel: v.channel,
          thumbnail: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
          isValid: true,
          originalUrl: v.url
        })));
      } finally {
        setLoading(false);
      }
    };

    verifyVideos();
  }, [videos, gearName]);

  // Filter to only valid videos
  const validVideos = verifiedVideos.filter(v => v.isValid);

  if (loading) {
    return (
      <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
        <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-crimson" />
          Media & Demos
        </h2>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 font-mono text-xs sm:text-sm text-muted-foreground">
            Verifying videos...
          </span>
        </div>
      </section>
    );
  }

  if (validVideos.length === 0) {
    return null; // Hide section if no valid videos
  }

  return (
    <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
      <GlitchSVGFilter />
      <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-crimson" />
        Media & Demos
      </h2>

      {/* Embedded Player */}
      {selectedVideo && (
        <div className="mb-4 sm:mb-6">
          <div className="relative aspect-video w-full border border-border bg-black overflow-hidden">
            {/* VHS overlay on player */}
            <div 
              className="absolute inset-0 z-10 pointer-events-none opacity-30"
              style={{
                background: `
                  repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                  linear-gradient(to top, rgba(220,38,38,0.05), transparent 10%)
                `,
              }}
            />
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <button
            onClick={() => setSelectedVideo(null)}
            className="mt-2 font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Close player
          </button>
        </div>
      )}

      {/* Video Grid with VHS Design System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {validVideos.map((video, i) => (
          <div
            key={video.id}
            className={`group cursor-pointer ${
              selectedVideo === video.id ? 'ring-2 ring-crimson' : ''
            }`}
            onClick={() => setSelectedVideo(video.id)}
          >
            {/* VHS-styled thumbnail */}
            <div className="relative bg-zinc-800 p-1">
              {/* Sprocket holes left */}
              <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1 h-1.5 bg-[hsl(0,0%,4%)]/80 rounded-sm mx-auto" />
                ))}
              </div>
              
              {/* Sprocket holes right */}
              <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1 h-1.5 bg-[hsl(0,0%,4%)]/80 rounded-sm mx-auto" />
                ))}
              </div>

              {/* Thumbnail container */}
              <div 
                className="relative overflow-hidden mx-2 border transition-all duration-500 aspect-video"
                style={{ 
                  borderColor: 'rgba(220,38,38,0.2)',
                  width: 'calc(100% - 16px)'
                }}
              >
                {/* VHS scanline overlay */}
                <div 
                  className="absolute inset-0 z-10 pointer-events-none opacity-100 group-hover:opacity-50 transition-opacity duration-500"
                  style={{
                    background: `
                      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
                      radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%),
                      linear-gradient(to top, rgba(220,38,38,0.08), rgba(220,38,38,0.02))
                    `,
                  }}
                />
                
                {/* Thumbnail image */}
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover grayscale contrast-110 brightness-105 saturate-0 
                             group-hover:grayscale-[0.5] group-hover:saturate-[0.4] 
                             group-hover:brightness-110 group-hover:scale-105
                             transition-all duration-700"
                  loading="lazy"
                />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/60 border border-crimson/50 flex items-center justify-center
                                  opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-crimson/80 
                                  transition-all duration-300">
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-1" />
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-[rgba(220,38,38,0.4)] via-[rgba(220,38,38,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Frame number */}
                <div className="absolute top-1 left-1 z-20 px-1.5 py-0.5 bg-black/70 border border-[rgba(220,38,38,0.4)]">
                  <span className="text-[9px] sm:text-[10px] text-crimson tracking-wider font-bold font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* YouTube badge */}
                <div className="absolute bottom-1 right-1 z-20 px-1.5 py-0.5 bg-black/80 border border-border/50 flex items-center gap-1">
                  <Youtube className="w-3 h-3 text-crimson" />
                  <span className="text-[8px] sm:text-[9px] text-white font-mono uppercase">Play</span>
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="p-3 sm:p-4 border border-t-0 border-border bg-card/30">
              <h3 className="font-mono text-xs sm:text-sm uppercase tracking-wide line-clamp-2 mb-1 sm:mb-2 group-hover:text-crimson transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] sm:text-xs text-muted-foreground truncate max-w-[70%]">
                  {video.channel}
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GearYouTubeVideos;