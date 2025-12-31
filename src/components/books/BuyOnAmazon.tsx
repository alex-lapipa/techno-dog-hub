import React, { useEffect, useMemo, useState } from "react";
import { buildAmazonSearchUrl, ensurePurchaseUrlSaved } from "@/lib/bookCoverUtils";
import { ExternalLink } from "lucide-react";

interface BuyOnAmazonProps {
  bookId: string;
  title: string;
  author?: string | null;
  purchaseUrl?: string | null;
  locale?: "es" | "uk" | "us";
  className?: string;
}

export function BuyOnAmazon({
  bookId,
  title,
  author,
  purchaseUrl,
  locale = "es",
  className,
}: BuyOnAmazonProps) {
  // Always have a working link even if DB field is missing
  const fallback = useMemo(
    () => buildAmazonSearchUrl(title, author, locale),
    [title, author, locale]
  );
  const [url, setUrl] = useState<string>(purchaseUrl?.trim() || fallback);

  useEffect(() => {
    // If DB is missing, compute + save in background (no UI changes)
    if (!purchaseUrl || purchaseUrl.trim() === "") {
      ensurePurchaseUrlSaved(bookId, title, author).catch(() => {});
    } else {
      setUrl(purchaseUrl.trim());
    }
  }, [bookId, title, author, purchaseUrl]);

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={
        className ||
        "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border border-border bg-card hover:bg-accent transition-colors"
      }
      aria-label={`Buy ${title} on Amazon`}
    >
      <span>Buy on Amazon</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  );
}
