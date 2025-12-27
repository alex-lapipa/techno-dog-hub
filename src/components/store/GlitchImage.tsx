interface GlitchImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const GlitchImage = ({ src, alt, className = "" }: GlitchImageProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Base image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Red channel offset overlay */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover grayscale opacity-0 group-hover:opacity-30 mix-blend-multiply translate-x-[1px] group-hover:translate-x-[3px] -translate-y-[1px] group-hover:-translate-y-[2px] transition-all duration-700 pointer-events-none"
        style={{ filter: 'url(#red-channel)' }}
      />
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
