import { useState, useEffect } from "react";
import { Play, ExternalLink, Loader2, Youtube, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlitchSVGFilter } from "@/components/store/GlitchImage";

interface CuratedVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  playlist: string;
  publishedAt: string;
  isFeatured: boolean;
  reason: string;
}

interface CuratedChannelVideosProps {
  pageType: 'crew' | 'venue' | 'festival' | 'artist' | 'doggies' | 'homepage' | 'technopedia' | 'gear';
  entitySlug?: string;
  title?: string;
  maxVideos?: number;
}

const CuratedChannelVideos = ({ 
  pageType, 
  entitySlug, 
  title = "From Our Archive",
  maxVideos = 4 
}: CuratedChannelVideosProps) => {
  const [videos, setVideos] = useState<CuratedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('youtube-channel-curator', {
          body: { 
            action: 'get-page-videos',
            pageType,
            entitySlug: entitySlug || null,
          }
        });

        if (error) {
          console.error('Error fetching curated videos:', error);
          setVideos([]);
        } else if (data?.videos) {
          setVideos(data.videos.slice(0, maxVideos));
        }
      } catch (err) {
        console.error('Error:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [pageType, entitySlug, maxVideos]);

  // Don't render if no videos
  if (!loading && videos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
        <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-crimson" />
          {title}
        </h2>
        <div className="flex items-center justify-center py-8 sm:py-12">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 font-mono text-xs sm:text-sm text-muted-foreground">
            Loading archive...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
      <GlitchSVGFilter />
      
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide flex items-center gap-2 sm:gap-3">
          <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-crimson" />
          {title}
        </h2>
        <a
          href="https://www.youtube.com/@lapipaislapipa"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] sm:text-xs text-muted-foreground hover:text-crimson transition-colors flex items-center gap-1"
        >
          <Youtube className="w-3 h-3" />
          LA PIPA Channel
        </a>
      </div>

      {/* VHS Tape Label */}
      <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-crimson/30">
        <div className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
        <span className="font-mono text-[9px] sm:text-[10px] text-crimson uppercase tracking-widest">
          Curated Archive • LA PIPA is LA PIPA
        </span>
      </div>

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
            {/* REC indicator */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-crimson animate-pulse" />
              <span className="font-mono text-[10px] text-crimson uppercase tracking-wider">Playing</span>
            </div>
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
        {videos.map((video, i) => (
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
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-1 h-1.5 bg-[hsl(0,0%,4%)]/80 rounded-sm mx-auto" />
                ))}
              </div>
              
              {/* Sprocket holes right */}
              <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-1">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-1 h-1.5 bg-[hsl(0,0%,4%)]/80 rounded-sm mx-auto" />
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

                {/* Featured badge */}
                {video.isFeatured && (
                  <div className="absolute top-1 right-1 z-20 px-1.5 py-0.5 bg-crimson/90 border border-crimson">
                    <span className="text-[8px] sm:text-[9px] text-white font-mono uppercase">Featured</span>
                  </div>
                )}

                {/* Playlist badge */}
                <div className="absolute bottom-1 left-1 z-20 px-1.5 py-0.5 bg-black/80 border border-border/50 max-w-[60%]">
                  <span className="text-[8px] sm:text-[9px] text-muted-foreground font-mono uppercase truncate block">
                    {video.playlist}
                  </span>
                </div>

                {/* YouTube play badge */}
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
                  {video.reason || 'Archive footage'}
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

export default CuratedChannelVideos;
