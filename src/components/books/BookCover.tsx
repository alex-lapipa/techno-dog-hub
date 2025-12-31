import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSafeCoverUrl, normalizeCoverUrl } from "@/lib/bookCoverUtils";

/**
 * Safe book cover renderer that handles:
 * - Missing/null URLs with placeholder
 * - Broken images with graceful fallback
 * - Various URL formats (protocol-relative, etc.)
 * - Hotlink protection bypass via proxy
 */

interface BookCoverProps {
  coverUrl?: string | null;
  title: string;
  className?: string;
  aspectRatio?: "2/3" | "3/4" | "square";
  showPlaceholder?: boolean;
  yearPublished?: number | null;
  showYearBadge?: boolean;
  vhsEffect?: boolean;
  useProxy?: boolean;
}

export function BookCover({
  coverUrl,
  title,
  className,
  aspectRatio = "2/3",
  showPlaceholder = true,
  yearPublished,
  showYearBadge = false,
  vhsEffect = true,
  useProxy = true,
}: BookCoverProps) {
  const [hasError, setHasError] = useState(false);
  
  // Use proxy for external images to bypass hotlinking restrictions
  const src = useProxy ? getSafeCoverUrl(coverUrl) : normalizeCoverUrl(coverUrl);

  const aspectClasses = {
    "2/3": "aspect-[2/3]",
    "3/4": "aspect-[3/4]",
    "square": "aspect-square",
  };

  // Render placeholder if no src or image errored
  if (!src || hasError) {
    if (!showPlaceholder) return null;
    
    return (
      <div className={cn(
        "relative overflow-hidden border border-border bg-card",
        aspectClasses[aspectRatio],
        className
      )}>
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-muted-foreground/20" />
        </div>
        {showYearBadge && yearPublished && (
          <div className="absolute bottom-0 right-0 bg-crimson text-white text-[9px] font-mono px-1.5 py-0.5">
            {yearPublished}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden border border-[rgba(220,38,38,0.2)] bg-zinc-900 group/cover",
      aspectClasses[aspectRatio],
      className
    )}>
      {/* VHS Effects */}
      {vhsEffect && (
        <>
          {/* VHS Scanlines */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none opacity-100 group-hover/cover:opacity-70 transition-opacity duration-500"
            style={{
              background: `
                repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px),
                radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%),
                linear-gradient(to top, rgba(220,38,38,0.05), rgba(220,38,38,0.05))
              `,
            }}
          />
          
          {/* Red channel offset overlay */}
          <div 
            className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover/cover:opacity-20 mix-blend-multiply translate-x-[1px] group-hover/cover:translate-x-[2px] -translate-y-[1px] transition-all duration-700"
            style={{ 
              background: 'linear-gradient(135deg, rgba(220,38,38,0.3), transparent)',
            }}
          />
          
          {/* Hover glow */}
          <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-[rgba(220,38,38,0.4)] via-[rgba(220,38,38,0.1)] to-transparent opacity-0 group-hover/cover:opacity-100 transition-opacity duration-500" />
        </>
      )}
      
      <img
        src={src}
        alt={`${title} cover`}
        className="w-full h-full object-cover grayscale-[30%] contrast-110 brightness-105 group-hover/cover:grayscale-0 group-hover/cover:brightness-110 transition-all duration-700"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
      
      {/* Year Badge */}
      {showYearBadge && yearPublished && (
        <div className="absolute bottom-0 right-0 bg-black/90 text-crimson text-[9px] font-mono px-1.5 py-0.5 z-20 border-l border-t border-crimson/30">
          {yearPublished}
        </div>
      )}
    </div>
  );
}

export { normalizeCoverUrl } from "@/lib/bookCoverUtils";
