import { Play, ExternalLink } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VHSDocumentaryCardProps {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  duration: string | null;
  viewCount: number | null;
  whyWatch: string | null;
  category: Category | null;
  isPlaying: boolean;
  frameNumber?: string;
  onPlay: () => void;
  formatDuration: (iso: string | null) => string | null;
  formatViews: (count: number | null) => string | null;
}

export const VHSDocumentaryCard = ({
  videoId,
  title,
  thumbnailUrl,
  channelName,
  duration,
  viewCount,
  whyWatch,
  category,
  isPlaying,
  frameNumber = "01",
  onPlay,
  formatDuration,
  formatViews
}: VHSDocumentaryCardProps) => {
  const sprocketCount = 3;
  
  return (
    <article className="group">
      {/* VHS Film Strip Container */}
      <div className="relative bg-zinc-900 p-1">
        {/* Sprocket holes left */}
        <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
          {[...Array(sprocketCount)].map((_, i) => (
            <div key={i} className="w-1.5 h-2 bg-black/80 rounded-sm mx-auto" />
          ))}
        </div>
        
        {/* Sprocket holes right */}
        <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
          {[...Array(sprocketCount)].map((_, i) => (
            <div key={i} className="w-1.5 h-2 bg-black/80 rounded-sm mx-auto" />
          ))}
        </div>
        
        {/* Main content area */}
        <div className="mx-2">
          {/* Thumbnail / Video */}
          <div 
            className="relative aspect-video overflow-hidden border transition-all duration-500"
            style={{ borderColor: 'rgba(220,38,38,0.2)' }}
          >
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                {/* VHS overlay */}
                <div 
                  className="absolute inset-0 z-10 pointer-events-none opacity-100 group-hover:opacity-70 transition-opacity duration-500"
                  style={{
                    background: `
                      repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px),
                      radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%),
                      linear-gradient(to top, rgba(220,38,38,0.05), rgba(220,38,38,0.05))
                    `,
                  }}
                />
                
                {/* Base image */}
                <img
                  src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale contrast-110 brightness-105 saturate-0 
                             group-hover:grayscale-[0.7] group-hover:saturate-[0.3] 
                             group-hover:brightness-110 group-hover:scale-110
                             transition-all duration-700"
                  onError={(e) => {
                    // Fallback to hqdefault if maxresdefault fails
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('maxresdefault')) {
                      target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }
                  }}
                />
                
                {/* Red channel offset overlay */}
                <img
                  src={thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-0 group-hover:opacity-30 mix-blend-multiply translate-x-[1px] group-hover:translate-x-[3px] -translate-y-[1px] group-hover:-translate-y-[2px] transition-all duration-700 pointer-events-none"
                  style={{ filter: 'sepia(100%) saturate(300%) hue-rotate(-50deg)' }}
                />
                
                {/* Hover glow */}
                <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-[rgba(220,38,38,0.4)] via-[rgba(220,38,38,0.15)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Frame number */}
                <div className="absolute top-1 left-1 z-20 px-1.5 py-1 bg-black/70 border border-[rgba(220,38,38,0.4)]">
                  <span className="text-[10px] text-crimson tracking-wider font-bold font-mono">{frameNumber}</span>
                </div>
                
                {/* Play Button */}
                <button
                  onClick={onPlay}
                  className="absolute inset-0 z-[12] flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-crimson/90 flex items-center justify-center border-2 border-crimson shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </button>
                
                {/* Duration Badge */}
                {duration && (
                  <div className="absolute bottom-2 right-2 z-20 bg-black/90 text-crimson text-[10px] font-mono px-2 py-0.5 border border-crimson/30">
                    {formatDuration(duration)}
                  </div>
                )}
                
                {/* VHS REC indicator */}
                <div className="absolute top-1 right-1 z-20 flex items-center gap-1 px-1.5 py-0.5 bg-black/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" />
                  <span className="text-[8px] font-mono text-crimson uppercase tracking-widest">VHS</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content - Outside film strip */}
      <div className="p-3 bg-card/30 border-x border-b border-border/30 group-hover:border-crimson/20 transition-colors">
        <h3 className="font-mono text-sm text-foreground leading-tight mb-2 line-clamp-2 group-hover:text-logo-green transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground mb-2">
          {channelName && <span className="text-crimson/80">{channelName}</span>}
          {viewCount && (
            <>
              <span>•</span>
              <span>{formatViews(viewCount)}</span>
            </>
          )}
        </div>

        {whyWatch && (
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3 italic">
            {whyWatch}
          </p>
        )}

        <div className="flex items-center justify-between">
          {category && (
            <span className="inline-block text-[9px] font-mono uppercase tracking-widest text-logo-green border border-logo-green/30 px-2 py-0.5">
              {category.name}
            </span>
          )}
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono text-crimson hover:text-crimson/80 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
};
