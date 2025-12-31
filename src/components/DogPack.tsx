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

// Alex Dog - Scruffy Irish madman founder with wild hair, big eyes, and friendly smile
export const AlexDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Wild scruffy ears - floppy and Irish */}
      <path d="M16 28 Q10 18 12 8 Q16 12 20 20 Q18 24 18 28" />
      <path d="M48 28 Q54 18 52 8 Q48 12 44 20 Q46 24 46 28" />
      {/* Messy wild hair on top - proper scruffy madman */}
      <path d="M22 14 Q24 8 28 12" />
      <path d="M26 12 Q30 4 34 10" />
      <path d="M32 8 Q36 2 40 8" />
      <path d="M38 10 Q42 6 44 14" />
      <path d="M20 18 Q18 12 22 10" />
      <path d="M44 18 Q46 12 42 10" />
      {/* Head - slightly elongated for character */}
      <ellipse cx="32" cy="36" rx="16" ry="15" />
      {/* BIG expressive eyes - wide open and friendly */}
      <circle cx="25" cy="32" r="5" />
      <circle cx="25" cy="31" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="24" cy="30" r="1" fill="hsl(var(--background))" />
      <circle cx="39" cy="32" r="5" />
      <circle cx="39" cy="31" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="30" r="1" fill="hsl(var(--background))" />
      {/* Eyebrows - expressive and slightly raised */}
      <path d="M20 26 Q25 24 28 26" strokeWidth="1.5" />
      <path d="M36 26 Q39 24 44 26" strokeWidth="1.5" />
      {/* Irish nose */}
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Big friendly smile - proper Irish grin */}
      <path d="M24 46 Q32 54 40 46" strokeWidth="2.5" />
      {/* Slight stubble dots - scruffy */}
      <circle cx="22" cy="44" r="0.5" opacity="0.3" />
      <circle cx="24" cy="48" r="0.5" opacity="0.3" />
      <circle cx="42" cy="44" r="0.5" opacity="0.3" />
      <circle cx="40" cy="48" r="0.5" opacity="0.3" />
      {/* Extra scruff tufts */}
      <path d="M14 32 Q12 30 14 28" opacity="0.5" />
      <path d="M50 32 Q52 30 50 28" opacity="0.5" />
    </g>
  </svg>
);

// La Pipa Dog - Eclectic, brutalist, confusing living question with UFO/skull vibes
export const LaPipaDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Asymmetric ears - one up, one sideways - confusing */}
      <path d="M16 24 Q8 12 14 4 Q20 10 22 20" />
      <path d="M48 30 Q58 26 60 18 Q52 22 46 28" />
      {/* Head - slightly irregular shape */}
      <ellipse cx="32" cy="36" rx="15" ry="14" />
      {/* One eye is a question mark - living question */}
      <circle cx="25" cy="32" r="4" />
      <text x="23" y="35" fontSize="8" fill="hsl(var(--logo-green))" fontWeight="bold">?</text>
      {/* Other eye is a star/asterisk - beyond the obvious */}
      <circle cx="39" cy="32" r="4" />
      <path d="M39 28 L39 36 M35 32 L43 32 M36 29 L42 35 M42 29 L36 35" strokeWidth="1" />
      {/* Nose - small UFO shape */}
      <ellipse cx="32" cy="41" rx="4" ry="2" />
      <path d="M30 40 Q32 38 34 40" strokeWidth="1" />
      <circle cx="32" cy="39" r="0.5" fill="hsl(var(--logo-green))" />
      {/* Enigmatic non-smile - is it happy? confused? who knows */}
      <path d="M27 47 L32 45 L37 47" />
      {/* Floating skull icon on one side */}
      <circle cx="10" cy="20" r="4" opacity="0.6" />
      <path d="M8 19 L8 18 M12 19 L12 18" strokeWidth="1" opacity="0.6" />
      <path d="M8 22 L10 21 L12 22" strokeWidth="1" opacity="0.6" />
      {/* Floating UFO icon on other side */}
      <ellipse cx="54" cy="18" rx="5" ry="2" opacity="0.6" />
      <path d="M51 16 Q54 12 57 16" opacity="0.6" />
      <circle cx="54" cy="14" r="0.5" fill="hsl(var(--logo-green))" opacity="0.6" />
      {/* Random geometric elements - brutalist */}
      <rect x="4" cy="40" width="4" height="4" opacity="0.3" transform="rotate(15 6 42)" />
      <path d="M56 44 L60 44 L58 48 Z" opacity="0.3" />
      {/* "North of the South" - star burst */}
      <path d="M32 6 L32 2" strokeWidth="1" opacity="0.5" />
      <path d="M28 7 L26 4" strokeWidth="1" opacity="0.5" />
      <path d="M36 7 L38 4" strokeWidth="1" opacity="0.5" />
      {/* Eccentric collar with symbols */}
      <rect x="22" y="52" width="20" height="6" rx="2" opacity="0.4" />
      <text x="24" y="57" fontSize="4" fill="hsl(var(--logo-green))" opacity="0.7">★?★</text>
    </g>
  </svg>
);

// Paloma Dog - Alien-faced founder with ponytail, freckles, and warm smile
export const PalomaDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Alien-shaped elongated ears - elegant and otherworldly */}
      <path d="M14 30 Q6 20 10 8 Q16 14 18 26" />
      <path d="M50 30 Q58 20 54 8 Q48 14 46 26" />
      {/* Ponytail flowing to the side */}
      <path d="M48 18 Q56 14 60 20 Q58 26 54 24" strokeWidth="2.5" />
      <path d="M52 16 Q58 10 62 16" strokeWidth="1.5" opacity="0.7" />
      <path d="M54 22 Q60 22 62 26" strokeWidth="1.5" opacity="0.7" />
      {/* Hair tie */}
      <circle cx="50" cy="18" r="2" fill="hsl(var(--logo-green))" opacity="0.5" />
      {/* Alien-shaped head - wider at top, narrower chin */}
      <path d="M16 36 Q14 24 22 18 Q32 14 42 18 Q50 24 48 36 Q46 48 32 52 Q18 48 16 36" />
      {/* Large almond-shaped alien eyes */}
      <ellipse cx="24" cy="32" rx="5" ry="4" />
      <ellipse cx="24" cy="32" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      <circle cx="23" cy="31" r="1" fill="hsl(var(--background))" />
      <ellipse cx="40" cy="32" rx="5" ry="4" />
      <ellipse cx="40" cy="32" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="31" r="1" fill="hsl(var(--background))" />
      {/* Elegant thin eyebrows */}
      <path d="M19 27 Q24 25 28 27" strokeWidth="1" />
      <path d="M36 27 Q40 25 45 27" strokeWidth="1" />
      {/* Small alien nose */}
      <path d="M30 38 Q32 40 34 38" strokeWidth="1.5" />
      {/* Warm friendly smile */}
      <path d="M26 44 Q32 50 38 44" strokeWidth="2" />
      {/* Freckles scattered on cheeks */}
      <circle cx="18" cy="36" r="0.8" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="20" cy="38" r="0.6" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="17" cy="40" r="0.7" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="21" cy="42" r="0.5" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="46" cy="36" r="0.8" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="44" cy="38" r="0.6" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="47" cy="40" r="0.7" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="43" cy="42" r="0.5" fill="hsl(var(--logo-green))" opacity="0.4" />
      {/* Extra freckles on nose bridge */}
      <circle cx="30" cy="36" r="0.5" fill="hsl(var(--logo-green))" opacity="0.3" />
      <circle cx="34" cy="36" r="0.5" fill="hsl(var(--logo-green))" opacity="0.3" />
      <circle cx="32" cy="35" r="0.4" fill="hsl(var(--logo-green))" opacity="0.3" />
      {/* Subtle sparkle near eye - alien glow */}
      <path d="M14 28 L14 26 M13 27 L15 27" strokeWidth="1" opacity="0.4" />
    </g>
  </svg>
);

// Charlie Dog - Glasses, mohawk hair, and big friendly smile
export const CharlieDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-bounce" : ""}>
      {/* Floppy ears */}
      <path d="M14 30 Q8 22 12 12 Q18 18 20 28" />
      <path d="M50 30 Q56 22 52 12 Q46 18 44 28" />
      {/* Epic mohawk hair - spiky center strip */}
      <path d="M28 12 L30 4 L32 10 L34 2 L36 12" strokeWidth="2.5" />
      <path d="M26 16 L27 10" strokeWidth="2" />
      <path d="M38 16 L37 10" strokeWidth="2" />
      <path d="M30 14 L31 6" strokeWidth="1.5" opacity="0.7" />
      <path d="M34 14 L33 6" strokeWidth="1.5" opacity="0.7" />
      {/* Head */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Glasses - round frames */}
      <circle cx="24" cy="32" r="6" strokeWidth="1.5" />
      <circle cx="40" cy="32" r="6" strokeWidth="1.5" />
      {/* Bridge of glasses */}
      <path d="M30 32 L34 32" strokeWidth="1.5" />
      {/* Arms of glasses going to ears */}
      <path d="M18 32 L14 30" strokeWidth="1.5" />
      <path d="M46 32 L50 30" strokeWidth="1.5" />
      {/* Eyes behind glasses */}
      <circle cx="24" cy="32" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="23" cy="31" r="1" fill="hsl(var(--background))" />
      <circle cx="40" cy="32" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="31" r="1" fill="hsl(var(--background))" />
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* BIG friendly smile - wide and happy */}
      <path d="M22 46 Q32 56 42 46" strokeWidth="2.5" />
      {/* Tongue sticking out slightly */}
      <ellipse cx="32" cy="50" rx="3" ry="2" opacity="0.5" />
    </g>
  </svg>
);

// Dolly Doggy - Long-haired bookish nature lover with glasses and warm smile
export const DollyDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Long flowing ears - like long hair */}
      <path d="M12 28 Q4 32 6 48 Q10 52 14 46 Q16 38 16 30" />
      <path d="M52 28 Q60 32 58 48 Q54 52 50 46 Q48 38 48 30" />
      {/* Extra long hair strands flowing down */}
      <path d="M8 40 Q4 44 6 50" strokeWidth="1.5" opacity="0.6" />
      <path d="M10 44 Q6 48 8 54" strokeWidth="1.5" opacity="0.6" />
      <path d="M56 40 Q60 44 58 50" strokeWidth="1.5" opacity="0.6" />
      <path d="M54 44 Q58 48 56 54" strokeWidth="1.5" opacity="0.6" />
      {/* Soft bangs/fringe at top */}
      <path d="M22 18 Q24 14 28 16" strokeWidth="1.5" />
      <path d="M28 16 Q32 12 36 16" strokeWidth="1.5" />
      <path d="M36 16 Q40 14 42 18" strokeWidth="1.5" />
      {/* Head - soft round shape */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Reading glasses - slightly oval/rectangular */}
      <rect x="18" y="28" width="10" height="8" rx="2" strokeWidth="1.5" />
      <rect x="36" y="28" width="10" height="8" rx="2" strokeWidth="1.5" />
      {/* Bridge of glasses */}
      <path d="M28 32 L36 32" strokeWidth="1.5" />
      {/* Arms of glasses */}
      <path d="M18 30 L12 28" strokeWidth="1.5" />
      <path d="M46 30 L52 28" strokeWidth="1.5" />
      {/* Kind eyes behind glasses */}
      <circle cx="23" cy="32" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="22" cy="31" r="0.8" fill="hsl(var(--background))" />
      <circle cx="41" cy="32" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="40" cy="31" r="0.8" fill="hsl(var(--background))" />
      {/* Gentle eyebrows - thoughtful */}
      <path d="M19 26 Q23 24 27 26" strokeWidth="1" />
      <path d="M37 26 Q41 24 45 26" strokeWidth="1" />
      {/* Small nose */}
      <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      {/* Very warm, big smile */}
      <path d="M24 46 Q32 54 40 46" strokeWidth="2.5" />
      {/* Rosy cheeks */}
      <circle cx="18" cy="40" r="2" opacity="0.3" fill="hsl(var(--logo-green))" />
      <circle cx="46" cy="40" r="2" opacity="0.3" fill="hsl(var(--logo-green))" />
      {/* Small leaf/nature detail near ear */}
      <path d="M6 34 Q4 32 6 30 Q8 32 6 34" fill="hsl(var(--logo-green))" opacity="0.5" />
      <path d="M58 34 Q60 32 58 30 Q56 32 58 34" fill="hsl(var(--logo-green))" opacity="0.5" />
    </g>
  </svg>
);

// Antain Dog - Irish-Asturian founder with freckles, round ears, and curly hair
export const AntainDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Round floppy ears - distinctly round */}
      <circle cx="12" cy="24" r="8" />
      <circle cx="52" cy="24" r="8" />
      {/* Curly hair on top - wild Irish curls */}
      <path d="M22 14 Q20 10 24 8 Q28 6 26 12" />
      <path d="M26 12 Q24 8 28 6 Q32 4 30 10" />
      <path d="M30 10 Q28 6 32 4 Q36 2 34 8" />
      <path d="M34 8 Q32 4 36 6 Q40 8 38 12" />
      <path d="M38 12 Q36 8 40 10 Q44 12 42 16" />
      {/* Extra curl wisps */}
      <path d="M20 18 Q18 14 22 12" strokeWidth="1.5" opacity="0.7" />
      <path d="M44 18 Q46 14 42 12" strokeWidth="1.5" opacity="0.7" />
      {/* Head */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Friendly eyes */}
      <circle cx="25" cy="32" r="4" />
      <circle cx="25" cy="31" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="24" cy="30" r="0.8" fill="hsl(var(--background))" />
      <circle cx="39" cy="32" r="4" />
      <circle cx="39" cy="31" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="30" r="0.8" fill="hsl(var(--background))" />
      {/* Raised happy eyebrows */}
      <path d="M21 26 Q25 24 28 26" strokeWidth="1.5" />
      <path d="M36 26 Q39 24 43 26" strokeWidth="1.5" />
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="hsl(var(--logo-green))" />
      {/* Warm smile */}
      <path d="M25 46 Q32 52 39 46" strokeWidth="2" />
      {/* Irish freckles - scattered across face */}
      <circle cx="18" cy="34" r="0.8" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="20" cy="36" r="0.6" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="17" cy="38" r="0.7" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="21" cy="40" r="0.5" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="19" cy="42" r="0.6" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="46" cy="34" r="0.8" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="44" cy="36" r="0.6" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="47" cy="38" r="0.7" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="43" cy="40" r="0.5" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="45" cy="42" r="0.6" fill="hsl(var(--logo-green))" opacity="0.5" />
      {/* Nose bridge freckles */}
      <circle cx="29" cy="38" r="0.5" fill="hsl(var(--logo-green))" opacity="0.3" />
      <circle cx="35" cy="38" r="0.5" fill="hsl(var(--logo-green))" opacity="0.3" />
      <circle cx="32" cy="37" r="0.4" fill="hsl(var(--logo-green))" opacity="0.3" />
    </g>
  </svg>
);

// Ron Dog - LA mad technologist, guitar player, open source legend, studio wizard
export const RonDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Floppy ears - slightly wild */}
      <path d="M12 28 Q6 20 10 10 Q16 14 18 26" />
      <path d="M52 28 Q58 20 54 10 Q48 14 46 26" />
      {/* Wild crazy hair - mad scientist style */}
      <path d="M20 14 Q18 8 22 6" strokeWidth="2" />
      <path d="M26 12 Q25 4 29 2" strokeWidth="2" />
      <path d="M32 10 Q32 2 35 0" strokeWidth="2" />
      <path d="M38 12 Q39 4 35 2" strokeWidth="2" />
      <path d="M44 14 Q46 8 42 6" strokeWidth="2" />
      {/* Extra wild strands */}
      <path d="M24 10 L22 4" strokeWidth="1.5" opacity="0.7" />
      <path d="M40 10 L42 4" strokeWidth="1.5" opacity="0.7" />
      {/* Head */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Headphones - one side with studio vibes */}
      <path d="M12 32 Q8 32 8 36 Q8 42 12 42" strokeWidth="2.5" />
      <path d="M52 32 Q56 32 56 36 Q56 42 52 42" strokeWidth="2.5" />
      <path d="M12 36 L16 36" strokeWidth="1.5" />
      <path d="M52 36 L48 36" strokeWidth="1.5" />
      {/* Excited wide eyes - techno enthusiasm */}
      <circle cx="24" cy="32" r="4" strokeWidth="2" />
      <circle cx="40" cy="32" r="4" strokeWidth="2" />
      <circle cx="24" cy="32" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="23" cy="31" r="0.8" fill="hsl(var(--background))" />
      <circle cx="40" cy="32" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="31" r="0.8" fill="hsl(var(--background))" />
      {/* Crazy eyebrows - intense focus */}
      <path d="M18 26 Q24 22 28 26" strokeWidth="1.5" />
      <path d="M36 26 Q40 22 46 26" strokeWidth="1.5" />
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      {/* Big excited smile */}
      <path d="M22 46 Q32 54 42 46" strokeWidth="2.5" />
      {/* Guitar neck on side - minimalist */}
      <path d="M54 48 L60 54 L62 52 L56 46" strokeWidth="1.5" opacity="0.8" />
      <path d="M58 50 L59 51" strokeWidth="1" opacity="0.6" />
      <path d="M57 51 L58 52" strokeWidth="1" opacity="0.6" />
      <path d="M56 52 L57 53" strokeWidth="1" opacity="0.6" />
      {/* Open source / code symbol on forehead - git branch */}
      <circle cx="32" cy="22" r="1.5" strokeWidth="1" opacity="0.6" />
      <path d="M32 24 L32 26" strokeWidth="1" opacity="0.6" />
      <path d="M29 20 L32 22 L35 20" strokeWidth="1" opacity="0.6" />
      {/* Fader/slider marks near ear - studio gear */}
      <path d="M6 44 L6 50" strokeWidth="1" opacity="0.5" />
      <path d="M4 46 L8 46" strokeWidth="1" opacity="0.5" />
      <path d="M4 48 L8 48" strokeWidth="1" opacity="0.5" />
    </g>
  </svg>
);

// Julieta Dog - Madrid party queen, ex-London raver, crazy gorgeous energy
export const JulietaDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Flowing elegant ears - party ready */}
      <path d="M10 28 Q4 18 8 8 Q14 12 16 24" />
      <path d="M54 28 Q60 18 56 8 Q50 12 48 24" />
      {/* Gorgeous wavy hair - Madrid glamour */}
      <path d="M18 16 Q16 10 20 8 Q24 6 22 12" />
      <path d="M22 12 Q20 6 26 4 Q30 2 28 10" />
      <path d="M28 10 Q26 4 32 2 Q38 0 36 8" />
      <path d="M36 8 Q34 2 40 4 Q44 6 42 12" />
      <path d="M42 12 Q40 6 44 8 Q48 10 46 16" />
      {/* Extra flowing locks */}
      <path d="M14 20 Q12 14 16 12" strokeWidth="1.5" opacity="0.7" />
      <path d="M50 20 Q52 14 48 12" strokeWidth="1.5" opacity="0.7" />
      {/* Head */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Sparkling party eyes - wide and excited */}
      <circle cx="24" cy="32" r="5" strokeWidth="1.5" />
      <circle cx="40" cy="32" r="5" strokeWidth="1.5" />
      <circle cx="24" cy="31" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="22" cy="30" r="1" fill="hsl(var(--background))" />
      <circle cx="40" cy="31" r="2.5" fill="hsl(var(--logo-green))" />
      <circle cx="38" cy="30" r="1" fill="hsl(var(--background))" />
      {/* Sparkle accents in eyes - crazy energy */}
      <circle cx="26" cy="29" r="0.5" fill="hsl(var(--logo-green))" opacity="0.8" />
      <circle cx="42" cy="29" r="0.5" fill="hsl(var(--logo-green))" opacity="0.8" />
      {/* Long fluttery lashes - gorgeous */}
      <path d="M19 28 L17 26" strokeWidth="1.5" />
      <path d="M21 27 L20 24" strokeWidth="1.5" />
      <path d="M43 27 L44 24" strokeWidth="1.5" />
      <path d="M45 28 L47 26" strokeWidth="1.5" />
      {/* Raised excited eyebrows */}
      <path d="M19 24 Q24 21 28 24" strokeWidth="1.5" />
      <path d="M36 24 Q40 21 45 24" strokeWidth="1.5" />
      {/* Cute nose */}
      <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      {/* Big party smile - showing teeth */}
      <path d="M24 46 Q32 54 40 46" strokeWidth="2" />
      <path d="M27 47 L37 47" strokeWidth="1" opacity="0.5" />
      {/* Beauty mark - Madrid glamour */}
      <circle cx="42" cy="42" r="1" fill="hsl(var(--logo-green))" />
      {/* Small hoop earring - party vibes */}
      <circle cx="8" cy="28" r="2.5" strokeWidth="1.5" opacity="0.8" />
      {/* Little crown/tiara - party queen */}
      <path d="M26 6 L28 2 L30 5 L32 1 L34 5 L36 2 L38 6" strokeWidth="1.5" opacity="0.7" />
      {/* Confetti/sparkles around - party atmosphere */}
      <circle cx="6" cy="18" r="1" fill="hsl(var(--logo-green))" opacity="0.6" />
      <circle cx="58" cy="16" r="1" fill="hsl(var(--logo-green))" opacity="0.6" />
      <path d="M4 36 L6 34" strokeWidth="1" opacity="0.5" />
      <path d="M58 38 L60 36" strokeWidth="1" opacity="0.5" />
    </g>
  </svg>
);

// Pire Dog - Globe-trotting acid lover, round glasses, business by day, party legend by night
export const PireDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Round floppy ears */}
      <path d="M10 30 Q4 22 8 12 Q14 16 16 28" />
      <path d="M54 30 Q60 22 56 12 Q50 16 48 28" />
      {/* Sparse hair on top - distinguished gentleman */}
      <path d="M28 12 Q30 6 32 12" strokeWidth="1.5" />
      <path d="M32 10 Q34 4 36 10" strokeWidth="1.5" />
      <path d="M36 12 Q38 6 40 12" strokeWidth="1.5" />
      {/* Single wisp */}
      <path d="M32 8 L32 4" strokeWidth="1" opacity="0.7" />
      {/* Round head - very round */}
      <circle cx="32" cy="36" r="16" />
      {/* Round glasses - distinctive */}
      <circle cx="24" cy="34" r="6" strokeWidth="2" />
      <circle cx="40" cy="34" r="6" strokeWidth="2" />
      {/* Glasses bridge */}
      <path d="M30 34 L34 34" strokeWidth="1.5" />
      {/* Glasses arms */}
      <path d="M18 34 L12 32" strokeWidth="1.5" opacity="0.8" />
      <path d="M46 34 L52 32" strokeWidth="1.5" opacity="0.8" />
      {/* Happy eyes behind glasses */}
      <circle cx="24" cy="33" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="23" cy="32" r="0.8" fill="hsl(var(--background))" />
      <circle cx="40" cy="33" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="32" r="0.8" fill="hsl(var(--background))" />
      {/* Happy raised eyebrows */}
      <path d="M19 26 Q24 24 29 26" strokeWidth="1.5" />
      <path d="M35 26 Q40 24 45 26" strokeWidth="1.5" />
      {/* Nose */}
      <ellipse cx="32" cy="42" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      {/* Big happy smile - always happy */}
      <path d="M24 48 Q32 56 40 48" strokeWidth="2.5" />
      {/* Smile lines - genuine happiness */}
      <path d="M22 46 Q20 48 22 50" strokeWidth="1" opacity="0.5" />
      <path d="M42 46 Q44 48 42 50" strokeWidth="1" opacity="0.5" />
      {/* 303 acid symbol near ear - loves acid */}
      <text x="2" y="44" fontSize="6" fill="hsl(var(--logo-green))" opacity="0.6" fontFamily="monospace">303</text>
      {/* Globe/travel dots - world traveler */}
      <circle cx="56" cy="44" r="1" fill="hsl(var(--logo-green))" opacity="0.5" />
      <circle cx="58" cy="48" r="0.8" fill="hsl(var(--logo-green))" opacity="0.4" />
      <circle cx="60" cy="46" r="0.6" fill="hsl(var(--logo-green))" opacity="0.5" />
      {/* Briefcase hint - business by day */}
      <path d="M4 54 L10 54 L10 58 L4 58 Z" strokeWidth="1" opacity="0.4" />
      <path d="M6 54 L6 52 L8 52 L8 54" strokeWidth="1" opacity="0.4" />
    </g>
  </svg>
);

// Alberto Dog - Argentinian chef-raver, London life, long hair, glow sticks, always smiling
export const AlbertoDog = ({ className, animated = false }: DogVariantProps) => (
  <svg viewBox="0 0 64 64" className={cn("w-10 h-10", className)} fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="hsl(var(--logo-green))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" className={animated ? "animate-pulse" : ""}>
      {/* Floppy friendly ears */}
      <path d="M8 28 Q2 18 6 8 Q14 12 16 26" />
      <path d="M56 28 Q62 18 58 8 Q50 12 48 26" />
      {/* Long flowing hair - Argentinian mane */}
      <path d="M16 16 Q12 8 18 4 Q22 2 20 12" />
      <path d="M20 12 Q16 4 24 2 Q28 0 26 10" />
      <path d="M26 10 Q22 2 30 0 Q34 -2 32 8" />
      <path d="M32 8 Q28 0 36 0 Q40 2 38 10" />
      <path d="M38 10 Q34 2 42 2 Q46 4 44 12" />
      <path d="M44 12 Q40 4 48 4 Q52 8 48 16" />
      {/* Extra long strands flowing down */}
      <path d="M12 20 Q8 28 10 36" strokeWidth="1.5" opacity="0.6" />
      <path d="M52 20 Q56 28 54 36" strokeWidth="1.5" opacity="0.6" />
      <path d="M14 24 Q10 32 12 40" strokeWidth="1" opacity="0.4" />
      <path d="M50 24 Q54 32 52 40" strokeWidth="1" opacity="0.4" />
      {/* Round friendly head */}
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      {/* Warm happy eyes */}
      <circle cx="24" cy="32" r="4" strokeWidth="1.5" />
      <circle cx="40" cy="32" r="4" strokeWidth="1.5" />
      <circle cx="24" cy="31" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="23" cy="30" r="0.8" fill="hsl(var(--background))" />
      <circle cx="40" cy="31" r="2" fill="hsl(var(--logo-green))" />
      <circle cx="39" cy="30" r="0.8" fill="hsl(var(--background))" />
      {/* Friendly raised eyebrows */}
      <path d="M20 26 Q24 23 28 26" strokeWidth="1.5" />
      <path d="M36 26 Q40 23 44 26" strokeWidth="1.5" />
      {/* Nose */}
      <ellipse cx="32" cy="40" rx="2.5" ry="2" fill="hsl(var(--logo-green))" />
      {/* Big warm smile - always smiling */}
      <path d="M22 46 Q32 56 42 46" strokeWidth="2.5" />
      {/* Smile showing teeth - genuine warmth */}
      <path d="M26 48 L38 48" strokeWidth="1" opacity="0.4" />
      {/* Glow sticks - one in each ear area */}
      <path d="M4 32 L4 44" strokeWidth="2.5" opacity="0.8" />
      <path d="M60 32 L60 44" strokeWidth="2.5" opacity="0.8" />
      {/* Glow stick glow effect */}
      <circle cx="4" cy="38" r="3" strokeWidth="0.5" opacity="0.3" />
      <circle cx="60" cy="38" r="3" strokeWidth="0.5" opacity="0.3" />
      {/* Steak/chef spatula hint - best steaks */}
      <path d="M54 52 L58 56 L60 54 L56 50" strokeWidth="1.5" opacity="0.5" />
      {/* Argentine sun symbol - small */}
      <circle cx="6" cy="18" r="2" strokeWidth="1" opacity="0.5" />
      <path d="M6 14 L6 16" strokeWidth="0.8" opacity="0.4" />
      <path d="M6 20 L6 22" strokeWidth="0.8" opacity="0.4" />
      <path d="M2 18 L4 18" strokeWidth="0.8" opacity="0.4" />
      <path d="M8 18 L10 18" strokeWidth="0.8" opacity="0.4" />
    </g>
  </svg>
);

export const dogVariants = [
  { name: 'Happy', Component: HappyDog, personality: 'Tail wagging at 128 BPM since birth', status: 'good boy' },
  { name: 'Sleepy', Component: SleepyDog, personality: 'Professional napper, occasional raver', status: 'zzz mode' },
  { name: 'Excited', Component: ExcitedDog, personality: 'SAW A STROBE LIGHT AND CANT STOP', status: 'maximum bark' },
  { name: 'Grumpy', Component: GrumpyDog, personality: 'Your taste in techno is statistically mid', status: 'judging' },
  { name: 'Curious', Component: CuriousDog, personality: 'Needs to sniff every synth in the booth', status: 'investigating' },
  { name: 'Party', Component: PartyDog, personality: 'Brought glowsticks and zero regrets', status: 'vibing' },
  { name: 'DJ', Component: DJDog, personality: 'Can hear requests but choosing not to', status: 'mixing' },
  { name: 'Puppy', Component: PuppyDog, personality: 'First rave! Why is everyone sweaty?', status: 'training' },
  { name: 'Old', Component: OldDog, personality: 'Mixing vinyl before your DJ was born', status: 'wise' },
  { name: 'Techno', Component: TechnoDog, personality: 'No vocals, no nonsense, no mercy', status: 'hacking' },
  { name: 'Dancing', Component: DancingDog, personality: 'Legs moving since 1992', status: 'grooving' },
  { name: 'Raving', Component: RavingDog, personality: 'Peak time is not a time, its a lifestyle', status: 'peak hour' },
  { name: 'Crazy', Component: CrazyDog, personality: 'Certified unhinged, medically advised to rave', status: 'unhinged' },
  { name: 'Fan', Component: FanDog, personality: 'Front row, intense eye contact with DJ', status: 'front row' },
  { name: 'Traveller', Component: TravellerDog, personality: 'Passport has more club stamps than countries', status: 'on tour' },
  { name: 'Zen', Component: ZenDog, personality: 'Enlightenment through repetitive kick drums', status: 'meditating' },
  { name: 'Ninja', Component: NinjaDog, personality: 'Nobody saw me enter or leave', status: 'stealth' },
  { name: 'Space', Component: SpaceDog, personality: 'Orbiting the dancefloor at 140 BPM', status: 'orbiting' },
  { name: 'Chef', Component: ChefDog, personality: 'Todays special: locally-sourced techno', status: 'serving' },
  { name: 'Pirate', Component: PirateDog, personality: 'Sailing seven warehouses for booty bass', status: 'raiding' },
  { name: 'Scientist', Component: ScientistDog, personality: 'Peer-reviewed your DJs transitions', status: 'researching' },
  { name: 'Rocker', Component: RockerDog, personality: 'Punk spirit, industrial noise, techno core', status: 'shredding' },
  { name: 'Summer', Component: SummerDog, personality: 'Sweating through festival season happily', status: 'chillin' },
  { name: 'Christmas', Component: ChristmasDog, personality: 'Jingle bells, the 909 swells', status: 'festive' },
  { name: 'Halloween', Component: HalloweenDog, personality: 'Scariest thing I know is last call', status: 'haunting' },
  { name: 'Valentine', Component: ValentineDog, personality: 'Fell in love on the dancefloor, married the DJ', status: 'smitten' },
  { name: 'Spring', Component: SpringDog, personality: 'Fresh sneakers, questionable afterhours', status: 'blooming' },
  { name: 'Autumn', Component: AutumnDog, personality: 'Darker nights, deeper beats, cozier raves', status: 'falling' },
  { name: 'Winter', Component: WinterDog, personality: 'Cold outside but warehouse is sweating', status: 'wrapped up' },
  { name: 'New Year', Component: NewYearDog, personality: 'Only resolution: more afterhours', status: 'celebrating' },
  { name: 'Easter', Component: EasterDog, personality: 'Hunting rare vinyl instead of eggs', status: 'egg hunting' },
  { name: 'Birthday', Component: BirthdayDog, personality: 'Every rave celebrates existence', status: 'making wishes' },
  { name: 'Disco', Component: DiscoDog, personality: 'Funky ancestor of all things techno', status: 'groovy' },
  { name: 'Thug', Component: ThugDog, personality: 'Too raw for your algorithm', status: 'gangsta' },
  { name: 'Hypnotic', Component: HypnoticDog, personality: 'Same loop for 3 hours, keeps getting better', status: 'mesmerized' },
  { name: 'Vinyl', Component: VinylDog, personality: 'That crackle before the drop is love language', status: 'crate digging' },
  { name: 'Synth', Component: SynthDog, personality: 'Analog warmth, patch cables in dreams', status: 'patching' },
  { name: 'Acid', Component: AcidDog, personality: 'Squelching through life at 303 degrees', status: '303 mode' },
  { name: 'Industrial', Component: IndustrialDog, personality: 'Running on metal, rust, relentless rhythm', status: 'grinding' },
  { name: 'Minimal', Component: MinimalDog, personality: 'Why use many sound when few do trick', status: 'reduced' },
  { name: 'Dub', Component: DubDog, personality: 'Lost in echo chamber, never coming back', status: 'dubbed out' },
  { name: 'Gabber', Component: GabberDog, personality: '200 BPM minimum, hakken til death', status: 'hakken' },
  { name: 'Berghain', Component: BerghainDog, personality: 'In queue so long Ive evolved', status: 'queueing' },
  { name: 'Afterhours', Component: AfterhoursDog, personality: 'Sun is a suggestion, not a rule', status: 'surviving' },
  { name: 'Promoter', Component: PromoterDog, personality: 'Building scenes, not just parties', status: 'networking' },
  { name: 'Bouncer', Component: BouncerDog, personality: 'Can read your vibe from 50 meters', status: 'selecting' },
  { name: 'Producer', Component: ProducerDog, personality: '847 hours on a track nobody will hear', status: 'rendering' },
  { name: 'Resident', Component: ResidentDog, personality: 'Know every crack in this floor personally', status: 'at home' },
  { name: 'Warm Up', Component: WarmUpDog, personality: 'Setting tables, literally and metaphorically', status: 'setting mood' },
  { name: 'Peak Time', Component: PeakTimeDog, personality: '3AM IS NOT A TIME ITS A STATE OF BEING', status: 'banging' },
  { name: 'Closing', Component: ClosingDog, personality: 'Emotional damage delivered at 7AM', status: 'emotional' },
  { name: 'Modular', Component: ModularDog, personality: 'More patch cables than life choices', status: 'euroracked' },
  { name: 'Analog', Component: AnalogDog, personality: 'Warm signals only, cold digital begone', status: 'no laptops' },
  { name: 'VJ', Component: VJDog, personality: 'Painting with photons while you dance', status: 'projecting' },
  { name: 'Underground', Component: UndergroundDog, personality: 'Best parties have no address', status: 'hidden' },
  { name: 'Purist', Component: PuristDog, personality: 'If its not 4/4, not coming through', status: 'gatekeeping' },
  { name: 'Tourist', Component: TouristDog, personality: 'First time, jet-lagged, straight to club', status: 'amazed' },
  { name: 'Legend', Component: LegendDog, personality: 'Still here since the beginning', status: 'iconic' },
  { name: 'Nerdy', Component: NerdyDog, personality: 'Analyzed this BPM to three decimal places', status: 'calculating' },
  // VENUE DOGS
  { name: 'Tresor', Component: TresorDog, personality: 'Detroit heart, Berlin soul, vault vibes', status: 'in the vault' },
  { name: 'About Blank', Component: AboutBlankDog, personality: 'Garden party energy, collective therapy', status: 'collective' },
  { name: 'Bassiani', Component: BassianiDog, personality: 'Dancing for freedom in Georgian underground', status: 'resisting' },
  { name: 'Khidi', Component: KhidiDog, personality: 'Raw Tbilisi industrial vibes only', status: 'tbilisi dark' },
  { name: 'Concrete', Component: ConcreteDog, personality: 'Sunrise over the Seine never gets old', status: 'legendary' },
  { name: 'De School', Component: DeSchoolDog, personality: 'Class is forever in session', status: 'amsterdam' },
  { name: 'Fold', Component: FoldDog, personality: '24+ hours of South London darkness', status: 'east london' },
  { name: 'Fuse', Component: FuseDog, personality: 'Low ceilings, high temperatures, legend', status: 'brussels' },
  { name: 'Instytut', Component: InstytutDog, personality: 'Silesian steel, Katowice industrial', status: 'katowice' },
  { name: 'Marble Bar', Component: MarbleBarDog, personality: 'Standing on hallowed Detroit ground', status: 'detroit' },
  { name: 'Vent', Component: VentDog, personality: 'Tokyo precision, zero ego, perfect sound', status: 'quality sound' },
  { name: 'Video Club', Component: VideoClubDog, personality: 'Bogotá underground fire since day one', status: 'colombian' },
  { name: 'D-Edge', Component: DEdgeDog, personality: 'São Paulo marathon runner extraordinaire', status: 'south america' },
  { name: 'MUTEK', Component: MutekDog, personality: 'Audiovisual experiments blow minds here', status: 'glitching' },
  { name: 'Sub Club', Component: SubClubDog, personality: 'Glasgow institution, Scottish bass royalty', status: 'subculture' },
  { name: 'Security', Component: SecurityDog, personality: 'Eyes everywhere, judgment fair', status: 'watching' },
  { name: 'Bartender', Component: BartenderDog, personality: 'Hydrating ravers since forever', status: 'mixing' },
  { name: 'Sven Marquardt', Component: SvenMarquardtDog, personality: 'The door is a philosophy', status: 'judging' },
  // FESTIVAL DOGS
  { name: 'Aquasella', Component: AquasellaDog, personality: 'River raving in Asturias with cider', status: 'outdoor vibes' },
  { name: 'Aquia Real Raver', Component: AquiaRealRaverDog, personality: 'La Real until legs give out', status: 'peak festival mode' },
  // GEAR/STYLE DOGS
  { name: 'Dawless', Component: DawlessDog, personality: 'No laptop, no safety net, pure chaos', status: 'patching' },
  // SPANISH LEGENDS
  { name: 'Eulogio', Component: EulogioDog, personality: 'Asturian legend, crate-digger supreme', status: 'la real forever' },
  { name: 'M.E.N', Component: MENDog, personality: 'Deep in Moog Barcelona basement forever', status: 'deep hypnotic' },
  // FOUNDERS
  { name: 'Alex', Component: AlexDog, personality: 'Scruffy Irish ideas machine, powered by chaos', status: 'building' },
  { name: 'Paloma', Component: PalomaDog, personality: 'Alien soul founder, dreaming in impossible colors', status: 'dreaming' },
  { name: 'Charlie', Component: CharlieDog, personality: 'Mohawk philosopher, glasses-adjusting wisdom', status: 'grinning' },
  { name: 'Dolly', Component: DollyDog, personality: 'Bookish nature lover, bass in bloodstream', status: 'studying' },
  { name: 'Antain', Component: AntainDog, personality: 'Irish-Asturian curly-haired creative soul', status: 'creating' },
  { name: 'La Pipa', Component: LaPipaDog, personality: 'Beyond the obvious, into the stranger', status: 'something stranger' },
  { name: 'Ron', Component: RonDog, personality: 'Mad LA technologist, guitar hero, open source legend', status: 'shipping code' },
  { name: 'Julieta', Component: JulietaDog, personality: 'Madrid party queen, ex-London raver, absolutely unhinged', status: 'partying' },
  { name: 'Pire', Component: PireDog, personality: 'Globe-trotting acid head, business by day, party legend by night', status: 'squelching' },
  { name: 'Alberto', Component: AlbertoDog, personality: 'Argentinian chef-raver, best steaks by day, glow sticks til sunrise', status: 'grilling & dancing' },
];
