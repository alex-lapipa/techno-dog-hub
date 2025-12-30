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
  { name: 'Christmas', Component: ChristmasDog, personality: 'Ho ho ho-use music', status: 'festive' },
  { name: 'Halloween', Component: HalloweenDog, personality: 'Spooky beats after dark', status: 'haunting' },
  { name: 'Valentine', Component: ValentineDog, personality: 'Spreading love on the floor', status: 'smitten' },
  { name: 'Spring', Component: SpringDog, personality: 'Fresh blooms, fresh tunes', status: 'blooming' },
  { name: 'Autumn', Component: AutumnDog, personality: 'Cozy warehouse sessions', status: 'falling' },
  { name: 'Winter', Component: WinterDog, personality: 'Cold outside, fire inside', status: 'wrapped up' },
  { name: 'New Year', Component: NewYearDog, personality: 'Counting down to the drop', status: 'celebrating' },
  { name: 'Easter', Component: EasterDog, personality: 'Hopping through the beats', status: 'egg hunting' },
  { name: 'Birthday', Component: BirthdayDog, personality: 'Every day is a party', status: 'making wishes' },
  { name: 'Disco', Component: DiscoDog, personality: 'Stayin alive on the floor', status: 'funky' },
  { name: 'Thug', Component: ThugDog, personality: 'Too cool for the mainstream', status: 'gangsta' },
];
