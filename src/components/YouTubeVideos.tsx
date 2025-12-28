import { useState, useEffect } from "react";
import { Youtube, Play, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  aiVerified?: boolean;
}

interface YouTubeVideosProps {
  artistName: string;
}

const YouTubeVideos = ({ artistName }: YouTubeVideosProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [aiVerified, setAiVerified] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke('youtube-search', {
          body: { artistName, maxResults: 6 }
        });

        if (fnError) {
          console.error('Function error:', fnError);
          setError(fnError.message);
          return;
        }

        if (data?.error) {
          console.error('API error:', data.error);
          setError(data.error);
          return;
        }

        setVideos(data?.videos || []);
        setAiVerified(data?.aiVerified || false);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    if (artistName) {
      fetchVideos();
    }
  }, [artistName]);

  if (loading) {
    return (
      <section className="mb-12 border-t border-border pt-8">
        <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
          <Youtube className="w-5 h-5 text-red-500" />
          DJ Sets & Live Performances
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-3 font-mono text-sm text-muted-foreground">
            Loading and verifying videos...
          </span>
        </div>
      </section>
    );
  }

  if (error || videos.length === 0) {
    return null; // Silently hide if no videos or error
  }

  const verifiedCount = videos.filter(v => v.aiVerified).length;

  return (
    <section className="mb-12 border-t border-border pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-xl uppercase tracking-wide flex items-center gap-3">
          <Youtube className="w-5 h-5 text-red-500" />
          DJ Sets & Live Performances
        </h2>
        {aiVerified && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground border border-border px-2 py-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  AI Verified ({verifiedCount}/{videos.length})
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono text-xs">Videos verified by AI to be from this artist</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Embedded Player */}
      {selectedVideo && (
        <div className="mb-6">
          <div className="relative aspect-video w-full border border-border bg-black">
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
            className="mt-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕ Close player
          </button>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className={`border border-border hover:bg-card transition-colors group cursor-pointer relative ${
              selectedVideo === video.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedVideo(video.id)}
          >
            {/* Verification Badge */}
            {aiVerified && (
              <div className="absolute top-2 left-2 z-10">
                {video.aiVerified ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-green-500/90 text-white px-1.5 py-0.5 rounded-sm">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">AI verified: Confirmed {artistName} content</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-yellow-500/90 text-white px-1.5 py-0.5 rounded-sm">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">Unverified: May not be from this artist</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}

            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs font-mono text-white">
                <Youtube className="w-3 h-3 inline mr-1" />
                Play
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-mono text-xs uppercase tracking-wide line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[60%]">
                  {video.channelTitle}
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="font-mono text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
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

export default YouTubeVideos;