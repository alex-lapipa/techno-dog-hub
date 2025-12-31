import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Safe book cover renderer that handles:
 * - Missing/null URLs with placeholder
 * - Broken images with graceful fallback
 * - Various URL formats (protocol-relative, etc.)
 * - Hotlink protection bypass
 */

function normalizeCoverUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Handle protocol-relative URLs
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  // Return as-is for relative paths
  return trimmed;
}

interface BookCoverProps {
  coverUrl?: string | null;
  title: string;
  className?: string;
  aspectRatio?: "2/3" | "3/4" | "square";
  showPlaceholder?: boolean;
  yearPublished?: number | null;
  showYearBadge?: boolean;
  vhsEffect?: boolean;
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
}: BookCoverProps) {
  const [hasError, setHasError] = useState(false);
  const src = normalizeCoverUrl(coverUrl);

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
      "relative overflow-hidden border border-border",
      aspectClasses[aspectRatio],
      className
    )}>
      {/* VHS Scanlines Overlay */}
      {vhsEffect && (
        <>
          <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.3)_2px,rgba(0,0,0,0.3)_4px)]" />
          <div className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-5 bg-gradient-to-r from-crimson via-transparent to-cyan-500" />
        </>
      )}
      
      <img
        src={src}
        alt={`${title} cover`}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
      />
      
      {/* Year Badge */}
      {showYearBadge && yearPublished && (
        <div className="absolute bottom-0 right-0 bg-crimson text-white text-[9px] font-mono px-1.5 py-0.5 z-20">
          {yearPublished}
        </div>
      )}
    </div>
  );
}

export { normalizeCoverUrl };
