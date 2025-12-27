import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FilmFrameProps {
  src: string;
  alt: string;
  frameNumber?: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  showSprockets?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FilmFrame = ({ 
  src, 
  alt, 
  frameNumber = '01',
  className,
  aspectRatio = 'auto',
  showSprockets = true,
  size = 'md'
}: FilmFrameProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sprocketCount = size === 'sm' ? 3 : size === 'lg' ? 6 : 4;

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
    auto: ''
  };

  if (imageError) {
    return (
      <div className={cn("relative bg-zinc-800 p-1", className)}>
        <div className="mx-2 flex items-center justify-center bg-zinc-900 border border-crimson/20" 
             style={{ minHeight: '120px' }}>
          <span className="text-xs text-muted-foreground font-mono">NO SIGNAL</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-zinc-800 p-1", className)}>
      {/* SVG Filter for chromatic aberration */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="red-channel">
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      {/* Sprocket holes left */}
      {showSprockets && (
        <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
          {[...Array(sprocketCount)].map((_, i) => (
            <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
          ))}
        </div>
      )}
      
      {/* Sprocket holes right */}
      {showSprockets && (
        <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
          {[...Array(sprocketCount)].map((_, i) => (
            <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
          ))}
        </div>
      )}
      
      {/* Image container */}
      <div 
        className={cn(
          "group relative overflow-hidden border border-crimson/20 transition-all duration-500 hover:border-crimson/60",
          showSprockets ? "mx-2" : "",
          aspectClasses[aspectRatio]
        )}
        style={{ 
          width: showSprockets ? 'calc(100% - 16px)' : '100%',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}
      >
        {/* VHS/Film overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-100 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
              radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%),
              linear-gradient(to top, rgba(220,38,38,0.05), rgba(220,38,38,0.05))
            `,
          }}
        />
        
        {/* Chromatic aberration layer (red channel offset) */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:opacity-40 mix-blend-multiply translate-x-[1px] group-hover:translate-x-[2px] -translate-y-[1px] group-hover:-translate-y-[2px] transition-all duration-700"
          style={{ filter: 'url(#red-channel)' }}
        />
        
        {/* Main image with B&W filter */}
        <img 
          src={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={cn(
            "w-full h-full object-cover",
            "grayscale contrast-[1.1] brightness-[1.05] saturate-0",
            "group-hover:grayscale-[0.7] group-hover:saturate-[0.3] group-hover:brightness-110 group-hover:scale-110",
            "transition-all duration-700 ease-out",
            !imageLoaded && "opacity-0"
          )}
        />
        
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
        )}
        
        {/* Hover glow overlay */}
        <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-crimson/40 via-crimson/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 z-[9] pointer-events-none" 
             style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }} />
        
        {/* Frame number badge */}
        <div className="absolute top-2 left-2 z-20 px-1.5 py-1 bg-black/70 border border-crimson/40 backdrop-blur-sm">
          <span className="text-xs text-crimson tracking-wider font-bold font-mono">{frameNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default FilmFrame;
