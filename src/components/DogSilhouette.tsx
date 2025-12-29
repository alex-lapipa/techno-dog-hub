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
      {/* Dog silhouette - greyhound/whippet style facing right */}
      <g 
        stroke="hsl(var(--logo-green))" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        className={animated ? "animate-pulse" : ""}
      >
        {/* Head */}
        <path d="M48 20 L54 18 L56 16" /> {/* Snout */}
        <path d="M48 20 C46 18 44 17 42 18" /> {/* Top of head to ear start */}
        <path d="M42 18 L40 12 L44 17" /> {/* Ear */}
        
        {/* Neck and back */}
        <path d="M44 17 C46 20 47 22 46 26" /> {/* Neck curve */}
        <path d="M46 26 C44 30 40 34 36 38 C32 42 26 44 20 44" /> {/* Back curve */}
        
        {/* Tail */}
        <path d="M20 44 C18 42 16 38 14 34 C12 32 10 32 8 34" /> {/* Tail up */}
        
        {/* Rear leg */}
        <path d="M20 44 L22 50 L20 54 L22 56" /> {/* Back leg */}
        
        {/* Belly */}
        <path d="M22 50 C28 50 34 48 40 46" /> {/* Belly line */}
        
        {/* Front legs */}
        <path d="M40 46 L42 52 L40 56" /> {/* Front leg 1 */}
        <path d="M44 44 L46 52 L44 56" /> {/* Front leg 2 */}
        
        {/* Chest */}
        <path d="M46 26 C48 30 48 36 46 42 C45 44 44 45 44 44" /> {/* Chest curve */}
        
        {/* Eye */}
        <circle cx="50" cy="18" r="1" fill="hsl(var(--logo-green))" />
        
        {/* Nose */}
        <circle cx="56" cy="16" r="1" fill="hsl(var(--logo-green))" />
      </g>
      
      {/* Subtle glow effect on key points */}
      <g fill="hsl(var(--logo-green))" opacity="0.3">
        <circle cx="50" cy="18" r="2" />
        <circle cx="56" cy="16" r="2" />
      </g>
    </svg>
  );
};

export default DogSilhouette;
