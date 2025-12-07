import { useState, useRef, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = "",
  placeholderColor = "hsl(var(--muted))"
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: placeholderColor }}
    >
      {/* Blur placeholder */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{ 
          background: `linear-gradient(135deg, ${placeholderColor}, hsl(var(--card)))`,
          filter: "blur(20px)",
          transform: "scale(1.1)"
        }}
      />
      
      {/* Shimmer effect while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse">
          <div 
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(var(--foreground) / 0.05) 50%, transparent 100%)",
              animation: "shimmer 1.5s infinite"
            }}
          />
        </div>
      )}

      {/* Actual image - only load when in view */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
};

export default LazyImage;