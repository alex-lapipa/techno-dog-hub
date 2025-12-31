const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Normalize an external image URL to a safe absolute URL.
 */
export function normalizeImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Protocol-relative URLs
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  return trimmed;
}

/**
 * Proxy external images through our backend to bypass hotlink/CORS restrictions.
 * If URL already points to our storage, return it directly.
 */
export function getSafeImageUrl(url?: string | null): string | null {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return null;

  // Already a proxied URL
  if (normalized.includes("/functions/v1/image-proxy?url=")) return normalized;

  // If it's already our storage URL, no proxy needed
  if (normalized.includes("supabase.co/storage")) return normalized;

  return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(normalized)}`;
}
