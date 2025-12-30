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

// Dancing Dog - animated ears and body movement
export const DancingDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes dance { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-2px) rotate(3deg); } }
      @keyframes earBounce { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
      .dancing { animation: dance 0.4s ease-in-out infinite; transform-origin: center bottom; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "dancing" : ""}>
      <path d="M16 28 Q10 16 18 10 Q24 14 24 24" />
      <path d="M48 28 Q54 16 46 10 Q40 14 40 24" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <path d="M24 34 Q26 30 28 34" />
      <path d="M36 34 Q38 30 40 34" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 48 Q32 54 38 48" />
      <path d="M8 44 L4 52" strokeWidth="3" />
      <path d="M56 44 L60 52" strokeWidth="3" />
      <text x="4" y="16" fontSize="8" fill="hsl(var(--logo-green))">♪</text>
      <text x="52" y="12" fontSize="10" fill="hsl(var(--logo-green))">♫</text>
    </g>
  </svg>
);

// Raving Dog - strobe eyes, wild expression
export const RavingDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes strobe { 0%, 50% { opacity: 1; } 25%, 75% { opacity: 0.3; } }
      @keyframes rave { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .raving { animation: rave 0.3s ease-in-out infinite; transform-origin: center; }
      .strobe { animation: strobe 0.2s ease-in-out infinite; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "raving" : ""}>
      <path d="M14 26 Q8 12 18 6 Q26 12 26 24" />
      <path d="M50 26 Q56 12 46 6 Q38 12 38 24" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <circle cx="26" cy="34" r="4" className={animated ? "strobe" : ""} fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="34" r="4" className={animated ? "strobe" : ""} fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M24 50 Q32 58 40 50" />
      <path d="M6 30 L2 26" opacity="0.7" />
      <path d="M6 38 L2 42" opacity="0.7" />
      <path d="M58 30 L62 26" opacity="0.7" />
      <path d="M58 38 L62 42" opacity="0.7" />
      <text x="2" y="18" fontSize="8" fill="hsl(var(--logo-green))">✦</text>
      <text x="54" y="16" fontSize="8" fill="hsl(var(--logo-green))">✦</text>
    </g>
  </svg>
);

// Crazy Dog - wild eyes, tongue out, chaotic
export const CrazyDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes shake { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
      .crazy { animation: shake 0.1s ease-in-out infinite; transform-origin: center; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "crazy" : ""}>
      <path d="M14 28 Q6 14 16 6 Q24 10 26 22" />
      <path d="M50 28 Q58 14 48 6 Q40 10 38 22" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <circle cx="24" cy="32" r="5" />
      <circle cx="40" cy="34" r="4" />
      <circle cx="23" cy="31" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="41" cy="33" r="1.5" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 48 Q28 56 30 52 Q32 58 34 52 Q36 56 38 48" />
      <path d="M32 52 Q32 62 34 58" fill="hsl(var(--logo-green))" opacity="0.6" />
      <path d="M6 24 L10 20" />
      <path d="M58 24 L54 20" />
    </g>
  </svg>
);

// Fan Dog - with glow sticks and fan gear
export const FanDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <circle cx="26" cy="36" r="2.5" />
      <circle cx="38" cy="36" r="2.5" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 54 38 50" />
      <path d="M26 10 L22 2" strokeWidth="3" opacity="0.8" />
      <path d="M38 10 L42 2" strokeWidth="3" opacity="0.8" />
      <text x="28" y="26" fontSize="8" fill="hsl(var(--logo-green))">♥</text>
      <path d="M8 36 L2 34" opacity="0.5" />
      <path d="M56 36 L62 34" opacity="0.5" />
    </g>
  </svg>
);

// Traveller Dog - with backpack and hat
export const TravellerDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M18 30 Q14 24 18 18 Q22 20 24 26" />
      <path d="M46 30 Q50 24 46 18 Q42 20 40 26" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M22 16 L42 16 L44 10 L20 10 Z" fill="hsl(var(--logo-green))" opacity="0.2" />
      <path d="M18 16 L46 16" />
      <rect x="50" y="34" width="10" height="14" rx="2" fill="hsl(var(--logo-green))" opacity="0.3" />
      <path d="M52 38 L58 38" />
      <path d="M52 42 L58 42" />
    </g>
  </svg>
);

// Zen Dog - meditating, peaceful
export const ZenDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q10 28 14 20 Q18 22 22 28" />
      <path d="M48 32 Q54 28 50 20 Q46 22 42 28" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <path d="M24 34 Q26 36 28 34" />
      <path d="M36 34 Q38 36 40 34" />
      <ellipse cx="32" cy="42" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 50 36 48" />
      <circle cx="32" cy="10" r="6" opacity="0.3" />
      <circle cx="32" cy="10" r="4" opacity="0.2" />
      <text x="28" y="12" fontSize="6" fill="hsl(var(--logo-green))">om</text>
    </g>
  </svg>
);

// Ninja Dog - stealthy, masked
export const NinjaDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <rect x="18" y="30" width="28" height="8" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="26" cy="34" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="34" r="2" fill="hsl(var(--logo-green))" />
      <path d="M48 32 L58 28" />
      <path d="M48 36 L56 40" />
    </g>
  </svg>
);

// Space Dog - astronaut helmet
export const SpaceDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <circle cx="32" cy="34" r="20" opacity="0.3" />
      <circle cx="32" cy="34" r="16" />
      <path d="M20 28 Q18 20 22 16" />
      <path d="M44 28 Q46 20 42 16" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="38" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 44 Q32 48 38 44" />
      <circle cx="8" cy="12" r="2" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="56" cy="8" r="1.5" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="52" cy="54" r="1" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// Chef Dog - wearing chef hat
export const ChefDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M18 32 Q14 26 18 20 Q22 22 24 28" />
      <path d="M46 32 Q50 26 46 20 Q42 22 40 28" />
      <ellipse cx="32" cy="42" rx="16" ry="14" />
      <path d="M24 38 Q26 34 28 38" />
      <path d="M36 38 Q38 34 40 38" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 52 Q32 54 36 52" />
      <path d="M20 18 Q20 6 32 6 Q44 6 44 18 L44 22 L20 22 Z" fill="hsl(var(--logo-green))" opacity="0.2" />
      <path d="M20 22 L44 22" />
      <ellipse cx="26" cy="10" rx="4" ry="4" opacity="0.5" />
      <ellipse cx="38" cy="10" rx="4" ry="4" opacity="0.5" />
      <ellipse cx="32" cy="8" rx="4" ry="4" opacity="0.5" />
    </g>
  </svg>
);

// Pirate Dog - eye patch and bandana
export const PirateDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <ellipse cx="38" cy="36" rx="5" ry="4" fill="hsl(var(--logo-green))" opacity="0.5" />
      <path d="M24 36 Q26 32 28 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M18 22 L46 22" />
      <path d="M14 22 Q32 16 50 22" fill="hsl(var(--logo-green))" opacity="0.2" />
    </g>
  </svg>
);

// Scientist Dog - lab coat and glasses
export const ScientistDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <circle cx="26" cy="34" r="4" />
      <circle cx="38" cy="34" r="4" />
      <path d="M30 34 L34 34" />
      <path d="M14 32 L22 34" />
      <path d="M42 34 L50 32" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 50 36 48" />
      <text x="50" y="20" fontSize="8" fill="hsl(var(--logo-green))">⚗</text>
    </g>
  </svg>
);

// Rocker Dog - mohawk and attitude
export const RockerDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      <path d="M16 32 Q12 22 18 16 Q22 18 24 26" />
      <path d="M48 32 Q52 22 46 16 Q42 18 40 26" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M22 30 L28 34" />
      <path d="M36 34 L42 30" />
      <circle cx="26" cy="36" r="2" />
      <circle cx="38" cy="36" r="2" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 54 38 50" />
      <path d="M28 12 L28 4" strokeWidth="3" />
      <path d="M32 14 L32 2" strokeWidth="3" />
      <path d="M36 12 L36 4" strokeWidth="3" />
    </g>
  </svg>
);

// Summer Dog - sunglasses and sun vibes
export const SummerDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M20 34 L28 34 L30 38 L24 38 Z" fill="hsl(var(--logo-green))" opacity="0.4" />
      <path d="M34 34 L44 34 L42 38 L36 38 Z" fill="hsl(var(--logo-green))" opacity="0.4" />
      <path d="M28 36 L36 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 54 38 50" />
      <circle cx="52" cy="10" r="6" opacity="0.3" />
      <path d="M52 2 L52 6" />
      <path d="M58 10 L62 10" />
      <path d="M56 4 L58 6" />
    </g>
  </svg>
);

// Christmas Dog - Santa hat and festive
export const ChristmasDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q12 22 18 16 Q22 18 24 26" />
      <path d="M48 32 Q52 22 46 16 Q42 18 40 26" />
      <ellipse cx="32" cy="42" rx="16" ry="14" />
      <path d="M24 38 Q26 34 28 38" />
      <path d="M36 38 Q38 34 40 38" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 52 Q32 56 38 52" />
      <path d="M20 20 L32 4 L48 16" fill="hsl(var(--logo-green))" opacity="0.3" />
      <path d="M18 20 L48 20" strokeWidth="4" opacity="0.5" />
      <circle cx="32" cy="4" r="3" fill="hsl(var(--logo-green))" />
      <text x="6" y="30" fontSize="8" fill="hsl(var(--logo-green))">❄</text>
      <text x="52" y="36" fontSize="8" fill="hsl(var(--logo-green))">❄</text>
    </g>
  </svg>
);

// Halloween Dog - spooky with bat ears
export const HalloweenDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M12 28 Q8 12 18 6 Q22 8 20 20 L24 26" fill="hsl(var(--logo-green))" opacity="0.2" />
      <path d="M52 28 Q56 12 46 6 Q42 8 44 20 L40 26" fill="hsl(var(--logo-green))" opacity="0.2" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 L26 32 L28 36" />
      <path d="M36 36 L38 32 L40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 L28 48 L30 50 L32 48 L34 50 L36 48 L38 50" />
      <text x="4" y="50" fontSize="10" fill="hsl(var(--logo-green))">🦇</text>
    </g>
  </svg>
);

// Valentine Dog - hearts and love
export const ValentineDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 34 Q24 30 28 34 Q32 38 32 34 Q32 30 36 34 Q40 38 36 42 L32 46 L28 42 Q24 38 24 34" fill="hsl(var(--logo-green))" opacity="0.3" />
      <ellipse cx="32" cy="48" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <text x="6" y="20" fontSize="8" fill="hsl(var(--logo-green))">♥</text>
      <text x="50" y="16" fontSize="10" fill="hsl(var(--logo-green))">♥</text>
      <text x="54" y="50" fontSize="6" fill="hsl(var(--logo-green))">♥</text>
    </g>
  </svg>
);

// Spring Dog - flowers and fresh
export const SpringDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <circle cx="12" cy="12" r="3" opacity="0.5" />
      <circle cx="10" cy="8" r="2" opacity="0.4" />
      <circle cx="14" cy="8" r="2" opacity="0.4" />
      <circle cx="8" cy="12" r="2" opacity="0.4" />
      <circle cx="16" cy="12" r="2" opacity="0.4" />
      <text x="50" y="18" fontSize="10" fill="hsl(var(--logo-green))">✿</text>
    </g>
  </svg>
);

// Autumn Dog - falling leaves
export const AutumnDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M8 16 Q12 12 10 8 Q14 10 16 6 Q14 12 18 14 Q12 14 8 16" fill="hsl(var(--logo-green))" opacity="0.4" />
      <path d="M52 20 Q54 16 52 12 Q56 14 58 10 Q56 16 60 18 Q54 18 52 20" fill="hsl(var(--logo-green))" opacity="0.3" />
      <path d="M4 42 Q6 38 4 34" opacity="0.5" />
    </g>
  </svg>
);

// Winter Dog - scarf and snow
export const WinterDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 50 38 46" />
      <path d="M16 50 L48 50" strokeWidth="4" opacity="0.4" />
      <path d="M44 50 L50 58" strokeWidth="4" opacity="0.4" />
      <circle cx="8" cy="10" r="1.5" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="56" cy="14" r="1" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="52" cy="6" r="1.5" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// New Year Dog - party hat with 2025
export const NewYearDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      <path d="M16 32 Q12 22 18 16 Q22 18 24 26" />
      <path d="M48 32 Q52 22 46 16 Q42 18 40 26" />
      <ellipse cx="32" cy="42" rx="16" ry="14" />
      <path d="M24 38 Q26 34 28 38" />
      <path d="M36 38 Q38 34 40 38" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 52 Q32 56 38 52" />
      <path d="M26 22 L32 4 L38 22" fill="hsl(var(--logo-green))" opacity="0.3" />
      <text x="27" y="18" fontSize="6" fill="hsl(var(--logo-green))">25</text>
      <circle cx="32" cy="4" r="2" fill="hsl(var(--logo-green))" />
      <text x="4" y="20" fontSize="8" fill="hsl(var(--logo-green))">✦</text>
      <text x="52" y="14" fontSize="8" fill="hsl(var(--logo-green))">✦</text>
    </g>
  </svg>
);

// Easter Dog - bunny ears
export const EasterDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M22 24 Q20 4 26 2 Q30 8 28 24" fill="hsl(var(--logo-green))" opacity="0.2" />
      <path d="M42 24 Q44 4 38 2 Q34 8 36 24" fill="hsl(var(--logo-green))" opacity="0.2" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <ellipse cx="8" cy="50" rx="4" ry="3" fill="hsl(var(--logo-green))" opacity="0.3" />
      <ellipse cx="56" cy="48" rx="3" ry="2.5" fill="hsl(var(--logo-green))" opacity="0.3" />
    </g>
  </svg>
);

// Birthday Dog - cake and candle
export const BirthdayDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <rect x="4" y="40" width="12" height="10" rx="2" fill="hsl(var(--logo-green))" opacity="0.3" />
      <path d="M10 40 L10 34" />
      <circle cx="10" cy="32" r="2" fill="hsl(var(--logo-green))" opacity="0.8" />
      <text x="50" y="18" fontSize="10" fill="hsl(var(--logo-green))">🎈</text>
    </g>
  </svg>
);

// Disco Dog - disco ball and funky vibes
export const DiscoDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes disco { 0%, 100% { transform: rotate(-5deg) scale(1); } 50% { transform: rotate(5deg) scale(1.02); } }
      @keyframes sparkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
      .disco-move { animation: disco 0.5s ease-in-out infinite; transform-origin: center bottom; }
      .sparkle { animation: sparkle 0.3s ease-in-out infinite; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "disco-move" : ""}>
      {/* Disco ball */}
      <circle cx="32" cy="8" r="6" fill="hsl(var(--logo-green))" opacity="0.4" />
      <line x1="32" y1="2" x2="32" y2="0" />
      <line x1="29" y1="6" x2="35" y2="6" className={animated ? "sparkle" : ""} />
      <line x1="29" y1="10" x2="35" y2="10" className={animated ? "sparkle" : ""} />
      <circle cx="30" cy="8" r="1" fill="hsl(var(--logo-green))" className={animated ? "sparkle" : ""} />
      <circle cx="34" cy="8" r="1" fill="hsl(var(--logo-green))" className={animated ? "sparkle" : ""} />
      {/* Ears */}
      <path d="M16 30 Q10 18 18 12 Q24 16 24 26" />
      <path d="M48 30 Q54 18 46 12 Q40 16 40 26" />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      {/* Funky sunglasses */}
      <ellipse cx="25" cy="36" rx="5" ry="3" fill="hsl(var(--logo-green))" opacity="0.5" />
      <ellipse cx="39" cy="36" rx="5" ry="3" fill="hsl(var(--logo-green))" opacity="0.5" />
      <path d="M30 36 L34 36" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Big smile */}
      <path d="M24 50 Q32 58 40 50" />
      {/* Sparkle rays */}
      <line x1="6" y1="20" x2="10" y2="24" opacity="0.6" className={animated ? "sparkle" : ""} />
      <line x1="58" y1="20" x2="54" y2="24" opacity="0.6" className={animated ? "sparkle" : ""} />
      <line x1="4" y1="36" x2="8" y2="36" opacity="0.4" className={animated ? "sparkle" : ""} />
      <line x1="60" y1="36" x2="56" y2="36" opacity="0.4" className={animated ? "sparkle" : ""} />
    </g>
  </svg>
);

// Thug Dog - cool sunglasses, confident pose
export const ThugDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Ears - slightly tilted back, confident */}
      <path d="M14 28 Q8 16 16 10 Q22 14 22 24" />
      <path d="M50 28 Q56 16 48 10 Q42 14 42 24" />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      {/* Cool sunglasses - thick frames */}
      <rect x="18" y="34" width="12" height="6" rx="1" fill="hsl(var(--logo-green))" opacity="0.8" />
      <rect x="34" y="34" width="12" height="6" rx="1" fill="hsl(var(--logo-green))" opacity="0.8" />
      <path d="M30 37 L34 37" strokeWidth="2" />
      <path d="M18 37 L14 35" strokeWidth="1.5" />
      <path d="M46 37 L50 35" strokeWidth="1.5" />
      {/* Nose */}
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Smirk - confident half smile */}
      <path d="M26 52 Q32 54 38 50" />
      {/* Gold chain hint */}
      <path d="M22 54 Q32 58 42 54" opacity="0.6" strokeWidth="1.5" />
      <circle cx="32" cy="58" r="2" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// Hypnotic Dog - spiral eyes, trance state
export const HypnoticDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .spiral { animation: spin 3s linear infinite; transform-origin: center; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <g className={animated ? "spiral" : ""}>
        <circle cx="25" cy="36" r="4" />
        <path d="M25 32 Q27 34 25 36 Q23 38 25 40" />
      </g>
      <g className={animated ? "spiral" : ""}>
        <circle cx="39" cy="36" r="4" />
        <path d="M39 32 Q41 34 39 36 Q37 38 39 40" />
      </g>
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 52 Q32 50 36 52" />
    </g>
  </svg>
);

// Vinyl Dog - record collector vibes
export const VinylDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <path d="M24 34 Q26 30 28 34" />
      <path d="M36 34 Q38 30 40 34" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 52 36 48" />
      <circle cx="10" cy="42" r="8" fill="hsl(var(--logo-green))" opacity="0.3" />
      <circle cx="10" cy="42" r="5" opacity="0.5" />
      <circle cx="10" cy="42" r="2" fill="hsl(var(--logo-green))" />
    </g>
  </svg>
);

// Synth Dog - keyboard player
export const SynthDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 50 38 46" />
      <rect x="4" y="50" width="20" height="8" rx="1" fill="hsl(var(--logo-green))" opacity="0.2" />
      <line x1="8" y1="50" x2="8" y2="58" />
      <line x1="12" y1="50" x2="12" y2="58" />
      <line x1="16" y1="50" x2="16" y2="58" />
      <line x1="20" y1="50" x2="20" y2="58" />
    </g>
  </svg>
);

// Acid Dog - trippy 303 vibes
export const AcidDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes acid { 0%, 100% { transform: skewX(-3deg); } 50% { transform: skewX(3deg); } }
      .acid-warp { animation: acid 0.5s ease-in-out infinite; transform-origin: center; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "acid-warp" : ""}>
      <path d="M16 28 Q10 16 18 10 Q24 14 24 24" />
      <path d="M48 28 Q54 16 46 10 Q40 14 40 24" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <circle cx="26" cy="34" r="4" />
      <circle cx="38" cy="34" r="4" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M24 50 Q32 56 40 50" />
      <text x="4" y="18" fontSize="12" fill="hsl(var(--logo-green))">~</text>
      <text x="52" y="16" fontSize="12" fill="hsl(var(--logo-green))">~</text>
    </g>
  </svg>
);

// Industrial Dog - hard and mechanical
export const IndustrialDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <rect x="22" y="32" width="6" height="4" fill="hsl(var(--logo-green))" opacity="0.6" />
      <rect x="36" y="32" width="6" height="4" fill="hsl(var(--logo-green))" opacity="0.6" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 L30 48 L34 50 L38 48" />
      <circle cx="8" cy="32" r="4" opacity="0.4" />
      <path d="M6 32 L10 32" />
      <path d="M8 30 L8 34" />
    </g>
  </svg>
);

// Minimal Dog - less is more
export const MinimalDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M18 30 Q16 24 20 20" />
      <path d="M46 30 Q48 24 44 20" />
      <circle cx="32" cy="40" r="14" />
      <circle cx="27" cy="37" r="1" fill="hsl(var(--logo-green))" />
      <circle cx="37" cy="37" r="1" fill="hsl(var(--logo-green))" />
      <path d="M30 44 L34 44" />
    </g>
  </svg>
);

// Dub Dog - deep and dubby
export const DubDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q10 22 16 14 Q22 18 22 26" />
      <path d="M48 30 Q54 22 48 14 Q42 18 42 26" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 L28 36" />
      <path d="M36 36 L40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M4 30 Q8 34 4 38" opacity="0.4" />
      <path d="M8 28 Q14 34 8 40" opacity="0.3" />
      <path d="M60 30 Q56 34 60 38" opacity="0.4" />
    </g>
  </svg>
);

// Gabber Dog - hardcore intensity
export const GabberDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes gabber { 0%, 100% { transform: translateY(0); } 25%, 75% { transform: translateY(-2px); } 50% { transform: translateY(2px); } }
      .gabber-bounce { animation: gabber 0.15s ease-in-out infinite; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "gabber-bounce" : ""}>
      <path d="M14 26 Q6 10 18 4 Q26 10 26 22" />
      <path d="M50 26 Q58 10 46 4 Q38 10 38 22" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <circle cx="26" cy="36" r="3" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="36" r="3" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M24 52 Q32 58 40 52" strokeWidth="3" />
    </g>
  </svg>
);

// Berghain Dog - dark and exclusive
export const BerghainDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <line x1="22" y1="36" x2="28" y2="36" />
      <line x1="36" y1="36" x2="42" y2="36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <line x1="28" y1="50" x2="36" y2="50" />
      <rect x="4" y="28" width="3" height="24" fill="hsl(var(--logo-green))" opacity="0.3" />
    </g>
  </svg>
);

// Afterhours Dog - sunrise survivor
export const AfterhoursDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q10 26 14 18 Q20 22 22 28" />
      <path d="M48 32 Q54 26 50 18 Q44 22 42 28" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 L28 36" />
      <path d="M36 36 L40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <circle cx="52" cy="10" r="8" opacity="0.2" />
      <path d="M52 2 L52 6" opacity="0.5" />
      <path d="M58 10 L62 10" opacity="0.5" />
      <text x="2" y="18" fontSize="8" fill="hsl(var(--logo-green))">z</text>
    </g>
  </svg>
);

// Promoter Dog - knows everyone
export const PromoterDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 54 38 50" />
      <rect x="48" y="32" width="12" height="8" rx="1" fill="hsl(var(--logo-green))" opacity="0.3" />
      <line x1="50" y1="36" x2="58" y2="36" opacity="0.6" />
      <text x="6" y="20" fontSize="8" fill="hsl(var(--logo-green))">✓</text>
    </g>
  </svg>
);

// Bouncer Dog - tough but fair
export const BouncerDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M14 30 Q10 20 16 14 Q22 18 22 26" />
      <path d="M50 30 Q54 20 48 14 Q42 18 42 26" />
      <ellipse cx="32" cy="40" rx="18" ry="16" />
      <line x1="22" y1="34" x2="26" y2="36" />
      <line x1="38" y1="36" x2="42" y2="34" />
      <circle cx="27" cy="38" r="2" />
      <circle cx="37" cy="38" r="2" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <line x1="28" y1="52" x2="36" y2="52" />
    </g>
  </svg>
);

// Security Dog - watchful guardian with earpiece
export const SecurityDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M14 30 Q10 20 16 14 Q22 18 22 26" />
      <path d="M50 30 Q54 20 48 14 Q42 18 42 26" />
      <ellipse cx="32" cy="40" rx="18" ry="16" />
      {/* Serious focused eyes */}
      <line x1="24" y1="35" x2="30" y2="35" />
      <line x1="34" y1="35" x2="40" y2="35" />
      <circle cx="27" cy="38" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="37" cy="38" r="2.5" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="46" rx="3" ry="2" fill="hsl(var(--logo-green))" />
      {/* Earpiece */}
      <circle cx="48" cy="36" r="3" fill="hsl(var(--logo-green))" opacity="0.6" />
      <path d="M48 39 L48 44" strokeWidth="2" />
      {/* Neutral mouth */}
      <line x1="29" y1="51" x2="35" y2="51" />
    </g>
  </svg>
);

// Bartender Dog - shaking cocktails
export const BartenderDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Friendly eyes */}
      <circle cx="26" cy="34" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="34" r="2" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="40" rx="3" ry="2" fill="hsl(var(--logo-green))" />
      {/* Happy smile */}
      <path d="M26 44 Q32 50 38 44" />
      {/* Cocktail shaker */}
      <g className={animated ? "animate-bounce" : ""}>
        <rect x="46" y="26" width="8" height="16" rx="2" fill="hsl(var(--logo-green))" opacity="0.4" />
        <rect x="47" y="22" width="6" height="4" rx="1" fill="hsl(var(--logo-green))" opacity="0.6" />
      </g>
      {/* Bowtie */}
      <path d="M28 50 L32 52 L36 50 L32 54 Z" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// Sven Marquardt Dog - legendary Berghain doorman with tattoos
export const SvenMarquardtDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Ears */}
      <path d="M14 30 Q10 20 16 14 Q22 18 22 26" />
      <path d="M50 30 Q54 20 48 14 Q42 18 42 26" />
      {/* Head */}
      <ellipse cx="32" cy="40" rx="18" ry="16" />
      {/* Intense piercing eyes */}
      <circle cx="25" cy="36" r="3" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="36" r="3" fill="hsl(var(--logo-green))" />
      <circle cx="25" cy="36" r="1.5" fill="hsl(var(--background))" />
      <circle cx="39" cy="36" r="1.5" fill="hsl(var(--background))" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Stern mouth */}
      <line x1="28" y1="50" x2="36" y2="50" strokeWidth="2" />
      {/* Facial tattoos - tribal lines */}
      <path d="M18 34 L22 32" strokeWidth="1.5" opacity="0.7" />
      <path d="M18 38 L21 37" strokeWidth="1.5" opacity="0.7" />
      <path d="M46 34 L42 32" strokeWidth="1.5" opacity="0.7" />
      <path d="M46 38 L43 37" strokeWidth="1.5" opacity="0.7" />
      {/* Eyebrow piercings */}
      <circle cx="22" cy="32" r="1" fill="hsl(var(--logo-green))" />
      <circle cx="42" cy="32" r="1" fill="hsl(var(--logo-green))" />
      {/* Lip piercing */}
      <circle cx="32" cy="52" r="1" fill="hsl(var(--logo-green))" />
    </g>
  </svg>
);

// Producer Dog - laptop warrior
export const ProducerDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 50 38 46" />
      <rect x="18" y="52" width="28" height="4" rx="1" fill="hsl(var(--logo-green))" opacity="0.3" />
      <rect x="20" y="48" width="24" height="4" opacity="0.5" />
    </g>
  </svg>
);

// Resident Dog - knows every corner
export const ResidentDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M32 6 L30 12 L34 12 Z" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="32" cy="4" r="2" fill="hsl(var(--logo-green))" opacity="0.7" />
    </g>
  </svg>
);

// Warm Up Dog - setting the vibe
export const WarmUpDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 22 18 16 Q22 18 24 26" />
      <path d="M48 30 Q52 22 46 16 Q42 18 40 26" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 34 28 36" />
      <path d="M36 36 Q38 34 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M6 36 Q10 32 6 28" opacity="0.3" />
      <path d="M10 38 Q16 32 10 26" opacity="0.4" />
    </g>
  </svg>
);

// Peak Time Dog - maximum energy
export const PeakTimeDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes peak { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      .peak-pulse { animation: peak 0.3s ease-in-out infinite; transform-origin: center; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "peak-pulse" : ""}>
      <path d="M14 26 Q8 12 18 6 Q24 12 24 22" />
      <path d="M50 26 Q56 12 46 6 Q40 12 40 22" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <circle cx="26" cy="34" r="4" fill="hsl(var(--logo-green))" opacity="0.6" />
      <circle cx="38" cy="34" r="4" fill="hsl(var(--logo-green))" opacity="0.6" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M24 52 Q32 60 40 52" />
      <text x="4" y="14" fontSize="12" fill="hsl(var(--logo-green))">!</text>
      <text x="52" y="14" fontSize="12" fill="hsl(var(--logo-green))">!</text>
    </g>
  </svg>
);

// Closing Dog - last track energy
export const ClosingDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q10 26 14 18 Q20 22 22 28" />
      <path d="M48 32 Q54 26 50 18 Q44 22 42 28" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 34 28 36" />
      <path d="M36 36 Q38 34 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 54 36 50" />
      <text x="50" y="16" fontSize="8" fill="hsl(var(--logo-green))">☀</text>
      <path d="M4 40 L12 40" opacity="0.4" />
      <path d="M6 36 L10 36" opacity="0.3" />
    </g>
  </svg>
);

// Modular Dog - patch cables everywhere
export const ModularDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <circle cx="26" cy="34" r="2" />
      <circle cx="38" cy="34" r="2" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 50 36 48" />
      <path d="M4 20 Q20 30 32 20" opacity="0.4" />
      <path d="M60 24 Q44 34 32 24" opacity="0.4" />
      <circle cx="4" cy="20" r="2" fill="hsl(var(--logo-green))" opacity="0.6" />
      <circle cx="60" cy="24" r="2" fill="hsl(var(--logo-green))" opacity="0.6" />
    </g>
  </svg>
);

// Analog Dog - no digital allowed
export const AnalogDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <circle cx="8" cy="36" r="4" opacity="0.4" />
      <path d="M6 34 L10 38" />
    </g>
  </svg>
);

// VJ Dog - visual artist
export const VJDog = ({ className, animated = true }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <style>{`
      @keyframes vj { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
      .vj-flash { animation: vj 0.5s ease-in-out infinite; }
    `}</style>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <rect x="22" y="32" width="8" height="6" fill="hsl(var(--logo-green))" opacity="0.4" className={animated ? "vj-flash" : ""} />
      <rect x="34" y="32" width="8" height="6" fill="hsl(var(--logo-green))" opacity="0.4" className={animated ? "vj-flash" : ""} />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 52 Q32 54 36 52" />
    </g>
  </svg>
);

// Underground Dog - knows the secret spots
export const UndergroundDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      <path d="M4 58 L60 58" opacity="0.3" />
      <path d="M8 54 L12 58" opacity="0.2" />
      <path d="M52 54 L56 58" opacity="0.2" />
    </g>
  </svg>
);

// Purist Dog - only real techno
export const PuristDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <line x1="24" y1="36" x2="28" y2="36" />
      <line x1="36" y1="36" x2="40" y2="36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 50 36 50" />
    </g>
  </svg>
);

// Tourist Dog - first time at the club
export const TouristDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="42" rx="16" ry="14" />
      <circle cx="26" cy="38" r="4" />
      <circle cx="38" cy="38" r="4" />
      <ellipse cx="32" cy="48" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 54 Q32 56 36 54" />
      <rect x="20" y="6" width="24" height="16" rx="2" fill="hsl(var(--logo-green))" opacity="0.2" />
      <circle cx="32" cy="14" r="4" opacity="0.5" />
    </g>
  </svg>
);

// Legend Dog - true OG
export const LegendDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q10 24 16 16 Q22 20 22 28" />
      <path d="M48 32 Q54 24 48 16 Q42 20 42 28" />
      <ellipse cx="32" cy="42" rx="16" ry="14" />
      <path d="M24 38 Q26 34 28 38" />
      <path d="M36 38 Q38 34 40 38" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 52 Q32 54 36 52" />
      <path d="M26 8 L32 2 L38 8 L32 6 Z" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="32" cy="6" r="2" fill="hsl(var(--logo-green))" />
    </g>
  </svg>
);

// Nerdy Dog - glasses, bowtie, knows all the BPMs
export const NerdyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      {/* Glasses */}
      <rect x="20" y="34" width="10" height="8" rx="2" fill="hsl(var(--logo-green))" opacity="0.2" />
      <rect x="34" y="34" width="10" height="8" rx="2" fill="hsl(var(--logo-green))" opacity="0.2" />
      <path d="M30 38 L34 38" />
      <path d="M20 38 L16 36" />
      <path d="M44 38 L48 36" />
      {/* Eyes behind glasses */}
      <circle cx="25" cy="38" r="1.5" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="38" r="1.5" fill="hsl(var(--logo-green))" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 52 Q32 54 36 52" />
      {/* Bowtie */}
      <path d="M26 56 L32 54 L38 56 L32 58 Z" fill="hsl(var(--logo-green))" opacity="0.4" />
      {/* Binary/code floating */}
      <text x="4" y="16" fontSize="6" fill="hsl(var(--logo-green))" opacity="0.6">01</text>
      <text x="52" y="12" fontSize="6" fill="hsl(var(--logo-green))" opacity="0.6">10</text>
    </g>
  </svg>
);

// VENUE DOGS - Each venue has its own character

// Tresor Dog - vault vibes, Detroit connection
export const TresorDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* Vault door */}
      <circle cx="32" cy="10" r="8" opacity="0.3" />
      <circle cx="32" cy="10" r="4" opacity="0.5" />
      <path d="M28 10 L36 10" />
      <path d="M32 6 L32 14" />
    </g>
  </svg>
);

// About Blank Dog - garden vibes, queer-friendly
export const AboutBlankDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 54 36 50" />
      {/* Flowers/garden */}
      <path d="M8 20 Q10 14 12 20" fill="hsl(var(--logo-green))" opacity="0.4" />
      <path d="M52 18 Q54 12 56 18" fill="hsl(var(--logo-green))" opacity="0.4" />
      <text x="4" y="30" fontSize="8" fill="hsl(var(--logo-green))" opacity="0.5">://</text>
    </g>
  </svg>
);

// Bassiani Dog - swimming pool, resistance vibes
export const BassianiDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      <path d="M24 34 Q26 30 28 34" />
      <path d="M36 34 Q38 30 40 34" />
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 48 Q32 52 36 48" />
      {/* Wave patterns - swimming pool */}
      <path d="M4 54 Q8 50 12 54 Q16 58 20 54" opacity="0.4" />
      <path d="M44 54 Q48 50 52 54 Q56 58 60 54" opacity="0.4" />
      <text x="28" y="12" fontSize="8" fill="hsl(var(--logo-green))" opacity="0.6">✊</text>
    </g>
  </svg>
);

// Khidi Dog - raw industrial
export const KhidiDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <line x1="24" y1="36" x2="28" y2="36" />
      <line x1="36" y1="36" x2="40" y2="36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 50 36 50" />
      {/* Dark/raw aesthetic */}
      <rect x="4" y="6" width="8" height="12" opacity="0.2" />
      <rect x="52" y="6" width="8" height="12" opacity="0.2" />
    </g>
  </svg>
);

// Concrete Dog - barge on Seine, daylight
export const ConcreteDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 46 Q32 50 38 46" />
      {/* Boat/barge shape */}
      <path d="M8 54 Q16 58 32 58 Q48 58 56 54 L52 50 L12 50 Z" opacity="0.3" />
      <text x="50" y="16" fontSize="8" fill="hsl(var(--logo-green))" opacity="0.5">☀</text>
    </g>
  </svg>
);

// De School Dog - former school vibes
export const DeSchoolDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 32 Q12 22 18 16 Q22 18 24 26" />
      <path d="M48 32 Q52 22 46 16 Q42 18 40 26" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* School/book */}
      <rect x="24" y="6" width="16" height="12" rx="1" opacity="0.3" />
      <path d="M32 6 L32 18" opacity="0.5" />
    </g>
  </svg>
);

// Fold Dog - warehouse darkness
export const FoldDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <circle cx="26" cy="36" r="3" fill="hsl(var(--logo-green))" opacity="0.8" />
      <circle cx="38" cy="36" r="3" fill="hsl(var(--logo-green))" opacity="0.8" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* 24+ hours indicator */}
      <text x="4" y="14" fontSize="6" fill="hsl(var(--logo-green))" opacity="0.5">24+</text>
      <text x="48" y="12" fontSize="8" fill="hsl(var(--logo-green))" opacity="0.4">h</text>
    </g>
  </svg>
);

// Fuse Dog - low ceiling, vinyl
export const FuseDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M18 34 Q14 28 18 22 Q22 24 24 30" />
      <path d="M46 34 Q50 28 46 22 Q42 24 40 30" />
      <ellipse cx="32" cy="42" rx="16" ry="12" />
      <path d="M24 38 Q26 34 28 38" />
      <path d="M36 38 Q38 34 40 38" />
      <ellipse cx="32" cy="44" rx="3" ry="2" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* Low ceiling line */}
      <path d="M8 18 L56 18" opacity="0.4" />
      {/* Vinyl record */}
      <circle cx="32" cy="8" r="6" opacity="0.3" />
      <circle cx="32" cy="8" r="2" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// Instytut Dog - Polish industrial
export const InstytutDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* Industrial chimneys - Silesia */}
      <rect x="6" y="4" width="4" height="14" opacity="0.3" />
      <rect x="54" y="6" width="4" height="12" opacity="0.3" />
      <path d="M8 4 Q8 0 8 2" opacity="0.2" />
    </g>
  </svg>
);

// Marble Bar Dog - Detroit birthplace
export const MarbleBarDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 54 38 50" />
      {/* Detroit star/origin */}
      <path d="M32 4 L34 10 L40 10 L35 14 L37 20 L32 16 L27 20 L29 14 L24 10 L30 10 Z" fill="hsl(var(--logo-green))" opacity="0.4" />
    </g>
  </svg>
);

// Vent Dog - Tokyo intimacy
export const VentDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 34 28 36" />
      <path d="M36 36 Q38 34 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* Japanese character hint */}
      <text x="6" y="16" fontSize="10" fill="hsl(var(--logo-green))" opacity="0.5">音</text>
    </g>
  </svg>
);

// Video Club Dog - Bogotá underground
export const VideoClubDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* Video/play button */}
      <rect x="22" y="4" width="20" height="14" rx="2" opacity="0.3" />
      <path d="M30 8 L36 11 L30 14 Z" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// D-Edge Dog - São Paulo marathon
export const DEdgeDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M26 50 Q32 54 38 50" />
      {/* LED/lights */}
      <circle cx="12" cy="12" r="2" fill="hsl(var(--logo-green))" opacity="0.6" />
      <circle cx="52" cy="10" r="2" fill="hsl(var(--logo-green))" opacity="0.6" />
      <circle cx="32" cy="6" r="2" fill="hsl(var(--logo-green))" opacity="0.6" />
    </g>
  </svg>
);

// MUTEK Dog - audiovisual experimental
export const MutekDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <rect x="22" y="32" width="8" height="8" fill="hsl(var(--logo-green))" opacity="0.3" />
      <rect x="34" y="32" width="8" height="8" fill="hsl(var(--logo-green))" opacity="0.3" />
      <ellipse cx="32" cy="46" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 52 Q32 54 36 52" />
      {/* Glitch lines */}
      <line x1="4" y1="20" x2="12" y2="20" opacity="0.4" />
      <line x1="52" y1="24" x2="60" y2="24" opacity="0.4" />
      <line x1="6" y1="16" x2="10" y2="16" opacity="0.3" />
    </g>
  </svg>
);

// Sub Club Melbourne Dog - Australian underground
export const SubClubDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      <path d="M16 30 Q12 20 18 14 Q22 16 24 24" />
      <path d="M48 30 Q52 20 46 14 Q42 16 40 24" />
      <ellipse cx="32" cy="40" rx="16" ry="14" />
      <path d="M24 36 Q26 32 28 36" />
      <path d="M36 36 Q38 32 40 36" />
      <ellipse cx="32" cy="44" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      <path d="M28 50 Q32 52 36 50" />
      {/* Southern cross stars hint */}
      <circle cx="10" cy="10" r="1.5" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="16" cy="8" r="1" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="12" cy="16" r="1" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="8" cy="14" r="1" fill="hsl(var(--logo-green))" opacity="0.4" />
    </g>
  </svg>
);

// Aquasella Dog - Asturian festival, river Sella, mountains, nature
export const AquasellaDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'geometricPrecision' }}>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Ears */}
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      {/* Face */}
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      {/* Happy eyes */}
      <path d="M24 34 Q26 30 28 34" />
      <path d="M36 34 Q38 30 40 34" />
      {/* Nose */}
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Big smile - festival vibes */}
      <path d="M26 48 Q32 54 38 48" />
      {/* Mountain peaks - Asturian landscape */}
      <path d="M4 20 L10 8 L16 18" opacity="0.5" />
      <path d="M48 20 L54 10 L60 18" opacity="0.5" />
      {/* River waves - Sella river */}
      <path d="M8 56 Q14 52 20 56 Q26 60 32 56 Q38 52 44 56 Q50 60 56 56" opacity="0.4" />
      {/* Sun - outdoor festival */}
      <circle cx="32" cy="6" r="3" fill="hsl(var(--logo-green))" opacity="0.6" />
      <path d="M32 1 L32 3" opacity="0.4" />
      <path d="M27 6 L29 6" opacity="0.4" />
      <path d="M35 6 L37 6" opacity="0.4" />
    </g>
  </svg>
);

// Dawless Dog - hardware only, no DAW, pure analog/digital synths and drum machines
export const DawlessDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'geometricPrecision' }}>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Ears */}
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      {/* Face */}
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      {/* Focused eyes - dialing in patches */}
      <circle cx="26" cy="34" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="34" r="2" fill="hsl(var(--logo-green))" />
      {/* Nose */}
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Slight smile - in the zone */}
      <path d="M28 48 Q32 51 36 48" />
      {/* Patch cables - modular synth */}
      <path d="M4 8 Q8 14 12 8" opacity="0.5" />
      <path d="M52 8 Q56 14 60 8" opacity="0.5" />
      <circle cx="8" cy="8" r="2" opacity="0.6" />
      <circle cx="56" cy="8" r="2" opacity="0.6" />
      {/* Sequencer grid */}
      <rect x="22" y="54" width="4" height="4" opacity="0.4" />
      <rect x="28" y="54" width="4" height="4" fill="hsl(var(--logo-green))" opacity="0.6" />
      <rect x="34" y="54" width="4" height="4" opacity="0.4" />
      <rect x="40" y="54" width="4" height="4" opacity="0.4" />
      {/* Knobs */}
      <circle cx="10" cy="56" r="3" opacity="0.3" />
      <circle cx="54" cy="56" r="3" opacity="0.3" />
    </g>
  </svg>
);

// Aquia Real Raver Dog - La Real + Aquasella hybrid, party legend, hands in the air
export const AquiaRealRaverDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'geometricPrecision' }}>
    <g stroke="hsl(var(--logo-green))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      {/* Ears UP - maximum excitement */}
      <path d="M18 24 Q14 6 22 4 Q26 10 26 20" />
      <path d="M46 24 Q50 6 42 4 Q38 10 38 20" />
      {/* Face - slightly tilted from dancing */}
      <ellipse cx="32" cy="38" rx="16" ry="14" />
      {/* Star eyes - starstruck by the music */}
      <path d="M26 32 L24 34 L26 36 L28 34 Z" fill="hsl(var(--logo-green))" opacity="0.8" />
      <path d="M38 32 L36 34 L38 36 L40 34 Z" fill="hsl(var(--logo-green))" opacity="0.8" />
      {/* Nose */}
      <ellipse cx="32" cy="42" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* HUGE smile - living the best life */}
      <path d="M24 48 Q32 58 40 48" />
      {/* Tongue out from dancing */}
      <path d="M30 50 Q32 56 34 50" fill="hsl(var(--logo-green))" opacity="0.5" />
      {/* Arms/paws up - hands in the air */}
      <path d="M4 28 L8 18 L12 24" strokeWidth="3" />
      <path d="M52 28 L56 18 L60 24" strokeWidth="3" />
      {/* Sweat drops - been dancing for hours */}
      <circle cx="14" cy="36" r="1.5" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="50" cy="36" r="1.5" fill="hsl(var(--logo-green))" opacity="0.4" />
      {/* LA REAL text on collar */}
      <rect x="22" y="52" width="20" height="5" rx="1" opacity="0.3" />
      <text x="24" y="56" fontSize="3.5" fill="hsl(var(--logo-green))" fontWeight="bold">LA REAL</text>
      {/* Mountain silhouette - Asturias */}
      <path d="M2 62 L8 54 L14 60 L20 52 L26 58" opacity="0.3" />
      {/* River wave - Sella */}
      <path d="M38 58 Q44 54 50 58 Q56 62 62 58" opacity="0.3" />
    </g>
  </svg>
);

// Eulogio Dog - Asturian legend with sideburns, bald head with 3 hairs, Ray-Ban Wayfarers
export const EulogioDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Floppy ears - wise old selector */}
      <path d="M16 34 Q8 30 10 20 Q16 22 20 28" />
      <path d="M48 34 Q56 30 54 20 Q48 22 44 28" />
      {/* Three tiny hairs on bald head - iconic */}
      <path d="M30 22 Q30 18 29 14" strokeWidth="1.5" />
      <path d="M32 22 Q32 16 32 12" strokeWidth="1.5" />
      <path d="M34 22 Q34 18 35 14" strokeWidth="1.5" />
      {/* Head - round and friendly */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Eyes - knowing, experienced */}
      <circle cx="26" cy="32" r="2" />
      <circle cx="38" cy="32" r="2" />
      <circle cx="26.5" cy="31.5" r="0.8" fill="hsl(var(--logo-green))" />
      <circle cx="38.5" cy="31.5" r="0.8" fill="hsl(var(--logo-green))" />
      {/* Ray-Ban Wayfarer glasses - rectangular, thicker top frame */}
      <rect x="21" y="29" width="10" height="7" rx="1" strokeWidth="1" opacity="0.7" />
      <rect x="33" y="29" width="10" height="7" rx="1" strokeWidth="1" opacity="0.7" />
      <line x1="31" y1="32" x2="33" y2="32" strokeWidth="1" opacity="0.7" />
      {/* Wayfarer thick top edge */}
      <line x1="21" y1="29" x2="31" y2="29" strokeWidth="1.5" opacity="0.8" />
      <line x1="33" y1="29" x2="43" y2="29" strokeWidth="1.5" opacity="0.8" />
      {/* Temple arms going to ears */}
      <line x1="21" y1="30" x2="17" y2="28" strokeWidth="1" opacity="0.5" />
      <line x1="43" y1="30" x2="47" y2="28" strokeWidth="1" opacity="0.5" />
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Slight knowing smile */}
      <path d="M27 46 Q32 50 37 46" />
      {/* Sideburns/cheek beard - thin lines */}
      <path d="M17 36 Q15 40 16 44 Q17 46 18 44" strokeWidth="1" opacity="0.5" />
      <path d="M18 38 Q16 42 17 45" strokeWidth="1" opacity="0.4" />
      <path d="M47 36 Q49 40 48 44 Q47 46 46 44" strokeWidth="1" opacity="0.5" />
      <path d="M46 38 Q48 42 47 45" strokeWidth="1" opacity="0.4" />
      {/* "E" collar tag - iconic */}
      <rect x="28" y="52" width="8" height="5" rx="1" opacity="0.3" />
      <text x="30.5" y="56" fontSize="4" fill="hsl(var(--logo-green))" fontWeight="bold">E</text>
      {/* Crate of vinyl records */}
      <rect x="4" y="52" width="10" height="8" opacity="0.4" />
      <line x1="6" y1="52" x2="6" y2="60" opacity="0.3" />
      <line x1="9" y1="52" x2="9" y2="60" opacity="0.3" />
      <line x1="12" y1="52" x2="12" y2="60" opacity="0.3" />
      {/* Small sidra bottle (Asturian cider) */}
      <path d="M52 54 L54 54 L54 60 Q53 62 52 60 L52 54" opacity="0.5" />
      <ellipse cx="53" cy="53" rx="1.5" ry="1" opacity="0.3" />
    </g>
  </svg>
);

// M.E.N Dog - Barcelona Moog resident with hypnotic swirl eyes
export const MENDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-spin-slow" : ""}>
      {/* Pointed ears - alert and focused */}
      <path d="M18 26 Q14 10 20 6 Q24 12 26 22" />
      <path d="M46 26 Q50 10 44 6 Q40 12 38 22" />
      {/* Head */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Hypnotic spiral eyes - deep in the groove */}
      <circle cx="26" cy="32" r="4" />
      <path d="M26 28 Q28 30 26 32 Q24 34 26 36" opacity="0.7" />
      <circle cx="38" cy="32" r="4" />
      <path d="M38 28 Q40 30 38 32 Q36 34 38 36" opacity="0.7" />
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Mysterious half-smile */}
      <path d="M28 46 Q32 48 36 46" />
      {/* Beard/goatee - distinguished */}
      <path d="M30 50 Q32 54 34 50" opacity="0.4" />
      {/* M.E.N text collar */}
      <rect x="24" y="52" width="16" height="5" rx="1" opacity="0.3" />
      <text x="25" y="56" fontSize="4" fill="hsl(var(--logo-green))" fontWeight="bold">M.E.N</text>
      {/* Moog synth knobs around */}
      <circle cx="8" cy="32" r="3" opacity="0.3" />
      <circle cx="8" cy="32" r="1" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="56" cy="32" r="3" opacity="0.3" />
      <circle cx="56" cy="32" r="1" fill="hsl(var(--logo-green))" opacity="0.5" />
      {/* Bass waves emanating */}
      <path d="M4 46 Q6 44 8 46" opacity="0.4" />
      <path d="M56 46 Q58 44 60 46" opacity="0.4" />
    </g>
  </svg>
);

export const dogVariants = [
  { name: 'Happy', Component: HappyDog, personality: 'Always wagging, never lagging', status: 'good boy' },
  { name: 'Sleepy', Component: SleepyDog, personality: 'Dreaming of infinite loops', status: 'zzz mode' },
  { name: 'Excited', Component: ExcitedDog, personality: 'SQUIRREL! I mean... DATA!', status: 'maximum bark' },
  { name: 'Grumpy', Component: GrumpyDog, personality: 'Has opinions about your code', status: 'judging' },
  { name: 'Curious', Component: CuriousDog, personality: 'Sniffing out bugs since 2024', status: 'investigating' },
  { name: 'Party', Component: PartyDog, personality: 'Every deploy is a celebration', status: 'vibing' },
  { name: 'DJ', Component: DJDog, personality: 'Drops beats and database tables', status: 'mixing' },
  { name: 'Puppy', Component: PuppyDog, personality: 'New to the pack, lots to learn', status: 'training' },
  { name: 'Old', Component: OldDog, personality: 'Remembers when we used jQuery', status: 'wise' },
  { name: 'Techno', Component: TechnoDog, personality: 'Glitches are just features', status: 'hacking' },
  { name: 'Dancing', Component: DancingDog, personality: 'Never stops moving to the beat', status: 'grooving' },
  { name: 'Raving', Component: RavingDog, personality: 'Lives for the drop', status: 'peak hour' },
  { name: 'Crazy', Component: CrazyDog, personality: 'Unpredictable energy levels', status: 'unhinged' },
  { name: 'Fan', Component: FanDog, personality: 'Ultimate supporter of the scene', status: 'front row' },
  { name: 'Traveller', Component: TravellerDog, personality: 'Chasing festivals worldwide', status: 'on tour' },
  { name: 'Zen', Component: ZenDog, personality: 'Finding peace in the bass', status: 'meditating' },
  { name: 'Ninja', Component: NinjaDog, personality: 'Silent but deadly on the floor', status: 'stealth' },
  { name: 'Space', Component: SpaceDog, personality: 'Lost in cosmic soundscapes', status: 'orbiting' },
  { name: 'Chef', Component: ChefDog, personality: 'Cooking up fresh beats', status: 'serving' },
  { name: 'Pirate', Component: PirateDog, personality: 'Sailing the underground seas', status: 'raiding' },
  { name: 'Scientist', Component: ScientistDog, personality: 'Experimenting with frequencies', status: 'researching' },
  { name: 'Rocker', Component: RockerDog, personality: 'Punk attitude, techno heart', status: 'shredding' },
  { name: 'Summer', Component: SummerDog, personality: 'Beach vibes and sunset sets', status: 'chillin' },
  { name: 'Christmas', Component: ChristmasDog, personality: 'Festive warehouse sessions', status: 'festive' },
  { name: 'Halloween', Component: HalloweenDog, personality: 'Spooky beats after dark', status: 'haunting' },
  { name: 'Valentine', Component: ValentineDog, personality: 'Spreading love on the floor', status: 'smitten' },
  { name: 'Spring', Component: SpringDog, personality: 'Fresh blooms, fresh tunes', status: 'blooming' },
  { name: 'Autumn', Component: AutumnDog, personality: 'Cozy warehouse sessions', status: 'falling' },
  { name: 'Winter', Component: WinterDog, personality: 'Cold outside, fire inside', status: 'wrapped up' },
  { name: 'New Year', Component: NewYearDog, personality: 'Counting down to the drop', status: 'celebrating' },
  { name: 'Easter', Component: EasterDog, personality: 'Hopping through the beats', status: 'egg hunting' },
  { name: 'Birthday', Component: BirthdayDog, personality: 'Every day is a party', status: 'making wishes' },
  { name: 'Disco', Component: DiscoDog, personality: 'Retro-futurist on the floor', status: 'groovy' },
  { name: 'Thug', Component: ThugDog, personality: 'Too cool for the mainstream', status: 'gangsta' },
  { name: 'Hypnotic', Component: HypnoticDog, personality: 'Lost in the loop', status: 'mesmerized' },
  { name: 'Vinyl', Component: VinylDog, personality: 'Only spins wax', status: 'crate digging' },
  { name: 'Synth', Component: SynthDog, personality: 'Analog soul in digital times', status: 'patching' },
  { name: 'Acid', Component: AcidDog, personality: 'Squelchy and proud', status: '303 mode' },
  { name: 'Industrial', Component: IndustrialDog, personality: 'Hard as steel', status: 'grinding' },
  { name: 'Minimal', Component: MinimalDog, personality: 'Less is more, woof is woof', status: 'reduced' },
  { name: 'Dub', Component: DubDog, personality: 'Deep in the echo chamber', status: 'dubbed out' },
  { name: '909', Component: GabberDog, personality: 'Roland rhythm machine soul', status: 'booming' },
  { name: 'Berghain', Component: BerghainDog, personality: 'Maybe you get in, maybe not', status: 'queueing' },
  { name: 'Afterhours', Component: AfterhoursDog, personality: 'Sunrise is just the beginning', status: 'surviving' },
  { name: 'Promoter', Component: PromoterDog, personality: 'List + 1 always', status: 'networking' },
  { name: 'Bouncer', Component: BouncerDog, personality: 'Reads energy not outfits', status: 'selecting' },
  { name: 'Producer', Component: ProducerDog, personality: 'Ableton is life', status: 'rendering' },
  { name: 'Resident', Component: ResidentDog, personality: 'This is my club', status: 'at home' },
  { name: 'Warm Up', Component: WarmUpDog, personality: 'Building the vibe slowly', status: 'setting mood' },
  { name: 'Peak Time', Component: PeakTimeDog, personality: 'Maximum energy unlocked', status: 'banging' },
  { name: 'Closing', Component: ClosingDog, personality: 'Last track best track', status: 'emotional' },
  { name: 'Modular', Component: ModularDog, personality: 'Patch cables are life', status: 'euroracked' },
  { name: 'Analog', Component: AnalogDog, personality: 'Warm and fuzzy signals', status: 'no laptops' },
  { name: 'VJ', Component: VJDog, personality: 'Visuals on point', status: 'projecting' },
  { name: 'Underground', Component: UndergroundDog, personality: 'Knows the secret spots', status: 'hidden' },
  { name: 'Purist', Component: PuristDog, personality: 'Only real techno allowed', status: 'gatekeeping' },
  { name: 'Tourist', Component: TouristDog, personality: 'First time at the club', status: 'amazed' },
  { name: 'Legend', Component: LegendDog, personality: 'Been there since day one', status: 'iconic' },
  { name: 'Nerdy', Component: NerdyDog, personality: 'Knows every BPM by heart', status: 'calculating' },
  // VENUE DOGS
  { name: 'Tresor', Component: TresorDog, personality: 'Detroit-Berlin axis forever', status: 'in the vault' },
  { name: 'About Blank', Component: AboutBlankDog, personality: 'Garden party til sunrise', status: 'collective' },
  { name: 'Bassiani', Component: BassianiDog, personality: 'Dancing for freedom', status: 'resisting' },
  { name: 'Khidi', Component: KhidiDog, personality: 'Raw and uncompromising', status: 'tbilisi dark' },
  { name: 'Concrete', Component: ConcreteDog, personality: 'Sunrise on the Seine', status: 'legendary' },
  { name: 'De School', Component: DeSchoolDog, personality: 'Class is in session', status: 'amsterdam' },
  { name: 'Fold', Component: FoldDog, personality: '24+ hours of darkness', status: 'east london' },
  { name: 'Fuse', Component: FuseDog, personality: 'Low ceiling, high energy', status: 'brussels' },
  { name: 'Instytut', Component: InstytutDog, personality: 'Silesian steel', status: 'katowice' },
  { name: 'Marble Bar', Component: MarbleBarDog, personality: 'Birthplace of techno', status: 'detroit' },
  { name: 'Vent', Component: VentDog, personality: 'Tokyo intimacy', status: 'quality sound' },
  { name: 'Video Club', Component: VideoClubDog, personality: 'Bogotá underground', status: 'colombian' },
  { name: 'D-Edge', Component: DEdgeDog, personality: 'São Paulo marathon', status: 'south america' },
  { name: 'MUTEK', Component: MutekDog, personality: 'Audiovisual experiment', status: 'glitching' },
  { name: 'Sub Club', Component: SubClubDog, personality: 'Melbourne underground', status: 'australian' },
  { name: 'Security', Component: SecurityDog, personality: 'Eyes on the floor always', status: 'watching' },
  { name: 'Bartender', Component: BartenderDog, personality: 'Shaken not stirred', status: 'mixing' },
  { name: 'Sven Marquardt', Component: SvenMarquardtDog, personality: 'You shall not pass', status: 'judging' },
  // FESTIVAL DOGS
  { name: 'Aquasella', Component: AquasellaDog, personality: 'River raving in Asturias', status: 'outdoor vibes' },
  { name: 'Aquia Real Raver', Component: AquiaRealRaverDog, personality: 'La Real til sunrise, hands up always', status: 'peak festival mode' },
  // GEAR/STYLE DOGS
  { name: 'Dawless', Component: DawlessDog, personality: 'No laptop, just hardware', status: 'patching' },
  // SPANISH LEGENDS
  { name: 'Eulogio', Component: EulogioDog, personality: 'Asturian crate-digger, Wayfarers on, sideburns fresh', status: 'la real forever' },
  { name: 'M.E.N', Component: MENDog, personality: 'Moog Barcelona basement dweller', status: 'deep hypnotic' },
];
