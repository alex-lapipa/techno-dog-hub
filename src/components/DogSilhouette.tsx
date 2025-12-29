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
      {/* Happy dog face - minimal lines */}
      <g 
        stroke="hsl(var(--logo-green))" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        className={animated ? "animate-pulse" : ""}
      >
        {/* Left ear - floppy */}
        <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
        
        {/* Right ear - floppy */}
        <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
        
        {/* Face outline */}
        <ellipse cx="32" cy="36" rx="16" ry="14" />
        
        {/* Left eye - happy closed arc */}
        <path d="M24 32 Q26 28 28 32" />
        
        {/* Right eye - happy closed arc */}
        <path d="M36 32 Q38 28 40 32" />
        
        {/* Nose */}
        <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
        
        {/* Happy smile */}
        <path d="M26 46 Q32 52 38 46" />
        
        {/* Tongue sticking out */}
        <path d="M30 48 Q32 54 34 48" fill="hsl(var(--logo-green))" opacity="0.6" />
      </g>
    </svg>
  );
};

export default DogSilhouette;
