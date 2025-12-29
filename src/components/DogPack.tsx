import { cn } from '@/lib/utils';

interface DogVariantProps {
  className?: string;
  animated?: boolean;
}

// Happy Dog - tongue out, big smile
export const HappyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 54 38 46" />
      <path d="M30 48 Q32 58 34 48" fill="hsl(var(--logo-green))" opacity="0.6" />
    </g>
  </svg>
);

// Sleepy Dog - closed eyes, droopy ears
export const SleepyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q10 28 14 20 Q18 22 22 28" />
      <path d="M48 32 Q54 28 50 20 Q46 22 42 28" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 34 L28 34" />
      <path d="M36 34 L40 34" />
      <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      <path d="M28 46 Q32 48 36 46" />
      <text x="44" y="18" fontSize="8" fill="hsl(var(--logo-green))">z</text>
      <text x="50" y="12" fontSize="6" fill="hsl(var(--logo-green))">z</text>
    </g>
  </svg>
);

// Excited Dog - ears up, wide eyes, wagging effect
export const ExcitedDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      <path d="M18 26 Q16 10 22 8 Q26 12 26 22" />
      <path d="M46 26 Q48 10 42 8 Q38 12 38 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <circle cx="26" cy="32" r="3" />
      <circle cx="38" cy="32" r="3" />
      <circle cx="27" cy="31" r="1" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="31" r="1" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 52 38 46" />
      <path d="M8 36 L4 34" />
      <path d="M8 40 L4 42" />
      <path d="M56 36 L60 34" />
      <path d="M56 40 L60 42" />
    </g>
  </svg>
);

// Grumpy Dog - furrowed brow, frown
export const GrumpyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q14 22 18 16 Q22 18 24 24" />
      <path d="M48 30 Q50 22 46 16 Q42 18 40 24" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M22 28 L28 30" />
      <path d="M36 30 L42 28" />
      <circle cx="26" cy="34" r="2" />
      <circle cx="38" cy="34" r="2" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 44 36 48" />
    </g>
  </svg>
);

// Curious Dog - head tilted, one ear up
export const CuriousDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""} transform="rotate(-10 32 32)">
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M46 24 Q50 8 44 6 Q40 10 40 20" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <circle cx="26" cy="32" r="2.5" />
      <circle cx="38" cy="32" r="2.5" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 46 Q32 48 36 46" />
      <text x="48" y="16" fontSize="10" fill="hsl(var(--logo-green))">?</text>
    </g>
  </svg>
);

// Party Dog - wearing party hat
export const PartyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 56 38 50" />
      <path d="M26 22 L32 4 L38 22" fill="hsl(var(--logo-green))" opacity="0.3" />
      <circle cx="32" cy="4" r="2" fill="hsl(var(--logo-green))" />
      <path d="M28 14 L36 16" />
      <path d="M27 18 L37 20" />
    </g>
  </svg>
);

// DJ Dog - wearing headphones
export const DJDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q12 22 18 16 Q22 18 24 26" />
      <path d="M48 32 Q52 22 46 16 Q42 18 40 26" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <path d="M24 34 Q26 30 28 34" />
      <path d="M36 34 Q38 30 40 34" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 48 Q32 52 38 48" />
      <path d="M12 28 Q8 20 16 14" />
      <path d="M52 28 Q56 20 48 14" />
      <ellipse cx="12" cy="32" rx="4" ry="6" fill="hsl(var(--logo-green))" opacity="0.3" />
      <ellipse cx="52" cy="32" rx="4" ry="6" fill="hsl(var(--logo-green))" opacity="0.3" />
      <path d="M12 26 Q32 18 52 26" />
    </g>
  </svg>
);

// Puppy Dog - smaller, rounder, bigger eyes
export const PuppyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      <path d="M18 30 Q14 24 18 18 Q22 20 24 26" />
      <path d="M46 30 Q50 24 46 18 Q42 20 40 26" />
      <circle cx="32" cy="38" r="16" />
      <circle cx="26" cy="34" r="4" />
      <circle cx="38" cy="34" r="4" />
      <circle cx="27" cy="33" r="1.5" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="33" r="1.5" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="42" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 52 36 48" />
    </g>
  </svg>
);

// Old Dog - saggy features, wise look
export const OldDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 34 Q8 30 12 22 Q18 24 22 30" />
      <path d="M48 34 Q56 30 52 22 Q46 24 42 30" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <path d="M24 32 L28 34" />
      <path d="M36 34 L40 32" />
      <circle cx="26" cy="36" r="2" />
      <circle cx="38" cy="36" r="2" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 50 36 48" />
      <path d="M22 30 Q26 28 30 30" opacity="0.5" />
      <path d="M34 30 Q38 28 42 30" opacity="0.5" />
    </g>
  </svg>
);

// Techno Dog - with glitch effect lines
export const TechnoDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 52 38 46" />
      <line x1="8" y1="32" x2="14" y2="32" opacity="0.5" />
      <line x1="50" y1="36" x2="58" y2="36" opacity="0.5" />
      <line x1="10" y1="40" x2="16" y2="40" opacity="0.3" />
      <line x1="48" y1="28" x2="56" y2="28" opacity="0.3" />
    </g>
  </svg>
);

export const dogVariants = [
  { name: 'Happy', Component: HappyDog, personality: 'Always wagging, never lagging', status: 'good boy' },
  { name: 'Sleepy', Component: SleepyDog, personality: 'Dreaming of infinite loops', status: 'zzz mode' },
  { name: 'Excited', Component: ExcitedDog, personality: 'SQUIRREL! I mean... DATA!', status: 'maximum bork' },
  { name: 'Grumpy', Component: GrumpyDog, personality: 'Has opinions about your code', status: 'judging' },
  { name: 'Curious', Component: CuriousDog, personality: 'Sniffing out bugs since 2024', status: 'investigating' },
  { name: 'Party', Component: PartyDog, personality: 'Every deploy is a celebration', status: 'vibing' },
  { name: 'DJ', Component: DJDog, personality: 'Drops beats and database tables', status: 'mixing' },
  { name: 'Puppy', Component: PuppyDog, personality: 'New to the pack, lots to learn', status: 'training' },
  { name: 'Old', Component: OldDog, personality: 'Remembers when we used jQuery', status: 'wise' },
  { name: 'Techno', Component: TechnoDog, personality: 'Glitches are just features', status: 'hacking' },
];
