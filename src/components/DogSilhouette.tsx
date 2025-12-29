import { cn } from '@/lib/utils';

interface DogSilhouetteProps {
  className?: string;
  animated?: boolean;
}

const DogSilhouette = ({ className, animated = false }: DogSilhouetteProps) => {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("w-10 h-10", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dog head - front facing */}
      <g 
        stroke="hsl(var(--logo-green))" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        className={animated ? "animate-pulse" : ""}
      >
        {/* Head outline */}
        <path d="M32 52 C22 52 16 46 14 40 C12 34 12 28 14 24 C16 20 20 16 24 14 L20 6 L28 12 C30 11 34 11 36 12 L44 6 L40 14 C44 16 48 20 50 24 C52 28 52 34 50 40 C48 46 42 52 32 52 Z" />
        
        {/* Left ear inner */}
        <path d="M22 10 L26 14" />
        
        {/* Right ear inner */}
        <path d="M42 10 L38 14" />
        
        {/* Left eye */}
        <circle cx="24" cy="30" r="3" />
        <circle cx="24" cy="30" r="1" fill="hsl(var(--logo-green))" />
        
        {/* Right eye */}
        <circle cx="40" cy="30" r="3" />
        <circle cx="40" cy="30" r="1" fill="hsl(var(--logo-green))" />
        
        {/* Nose */}
        <ellipse cx="32" cy="40" rx="4" ry="3" fill="hsl(var(--logo-green))" />
        
        {/* Mouth */}
        <path d="M32 43 L32 46" />
        <path d="M28 48 C30 50 34 50 36 48" />
        
        {/* Whisker dots */}
        <circle cx="22" cy="42" r="0.8" fill="hsl(var(--logo-green))" />
        <circle cx="18" cy="40" r="0.8" fill="hsl(var(--logo-green))" />
        <circle cx="42" cy="42" r="0.8" fill="hsl(var(--logo-green))" />
        <circle cx="46" cy="40" r="0.8" fill="hsl(var(--logo-green))" />
      </g>
      
      {/* Subtle glow effect on eyes */}
      <g fill="hsl(var(--logo-green))" opacity="0.3">
        <circle cx="24" cy="30" r="4" />
        <circle cx="40" cy="30" r="4" />
        <circle cx="32" cy="40" r="5" />
      </g>
    </svg>
  );
};

export default DogSilhouette;
