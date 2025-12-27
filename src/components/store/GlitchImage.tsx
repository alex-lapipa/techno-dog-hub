interface GlitchImageProps {
  src: string;
  alt: string;
  className?: string;
  frameNumber?: string;
  size?: 'default' | 'thumbnail';
}

export const GlitchImage = ({ src, alt, className = "", frameNumber = "01", size = 'default' }: GlitchImageProps) => {
  const isThumbnail = size === 'thumbnail';
  const sprocketCount = isThumbnail ? 2 : 4;
  
  return (
    <div className={`relative bg-zinc-800 p-1 ${className}`}>
      {/* Sprocket holes left */}
      <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-1">
        {[...Array(sprocketCount)].map((_, i) => (
          <div key={i} className={`${isThumbnail ? 'w-1 h-1.5' : 'w-1.5 h-2'} bg-[hsl(0,0%,4%)]/80 rounded-sm mx-auto`} />
        ))}
      </div>
      
      {/* Sprocket holes right */}
      <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-1">
        {[...Array(sprocketCount)].map((_, i) => (
          <div key={i} className={`${isThumbnail ? 'w-1 h-1.5' : 'w-1.5 h-2'} bg-[hsl(0,0%,4%)]/80 rounded-sm mx-auto`} />
        ))}
      </div>
      
      {/* Image container */}
      <div 
        className="group/film relative overflow-hidden mx-2 border transition-all duration-500"
        style={{ 
          borderColor: 'rgba(220,38,38,0.2)',
          width: 'calc(100% - 16px)'
        }}
      >
        {/* VHS overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-100 group-hover/film:opacity-70 transition-opacity duration-500"
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
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover grayscale contrast-110 brightness-105 saturate-0 
                     group-hover/film:grayscale-[0.7] group-hover/film:saturate-[0.3] 
                     group-hover/film:brightness-110 group-hover/film:scale-110
                     transition-all duration-700"
        />
        
        {/* Red channel offset overlay */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-0 group-hover/film:opacity-30 mix-blend-multiply translate-x-[1px] group-hover/film:translate-x-[3px] -translate-y-[1px] group-hover/film:-translate-y-[2px] transition-all duration-700 pointer-events-none"
          style={{ filter: 'url(#red-channel)' }}
        />
        
        {/* Hover glow */}
        <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-[rgba(220,38,38,0.4)] via-[rgba(220,38,38,0.15)] to-transparent opacity-0 group-hover/film:opacity-100 transition-opacity duration-500" />
        
        {/* Frame number */}
        <div className={`absolute top-1 left-1 z-20 ${isThumbnail ? 'px-1 py-0.5' : 'px-1.5 py-1'} bg-black/70 border border-[rgba(220,38,38,0.4)]`}>
          <span className={`${isThumbnail ? 'text-[8px]' : 'text-xs'} text-[hsl(348,75%,52%)] tracking-wider font-bold font-mono`}>{frameNumber}</span>
        </div>
      </div>
    </div>
  );
};

// SVG Filter component - render once in the app
export const GlitchSVGFilter = () => (
  <svg className="absolute w-0 h-0" aria-hidden="true">
    <defs>
      <filter id="red-channel">
        <feColorMatrix 
          type="matrix" 
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" 
        />
      </filter>
    </defs>
  </svg>
);
