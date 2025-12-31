import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Normalize cover URL to ensure it's valid
 */
export function normalizeCoverUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Handle protocol-relative URLs
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  return trimmed;
}

/**
 * Get a safe cover URL that uses our proxy to bypass hotlinking restrictions.
 * Returns null if no valid URL provided.
 */
export function getSafeCoverUrl(coverUrl?: string | null): string | null {
  const normalized = normalizeCoverUrl(coverUrl);
  if (!normalized) return null;

  // If it's already our Supabase storage URL, no proxy needed
  if (normalized.includes("supabase.co/storage")) {
    return normalized;
  }

  // Use the image proxy edge function
  return `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(normalized)}`;
}

/**
 * Build an Amazon search URL for a book
 */
export function buildAmazonSearchUrl(
  title: string,
  author?: string | null,
  locale: "es" | "uk" | "us" = "es"
): string {
  const query = encodeURIComponent(`${title} ${author || ""}`.trim());
  const domain =
    locale === "uk" ? "amazon.co.uk" :
    locale === "us" ? "amazon.com" :
    "amazon.es";

  return `https://${domain}/s?k=${query}&i=stripbooks`;
}

/**
 * Save purchase_url ONLY if it's missing in DB (never overwrites an existing one)
 */
export async function ensurePurchaseUrlSaved(
  bookId: string,
  title: string,
  author?: string | null
): Promise<boolean> {
  if (!bookId || !title) return false;

  try {
    const { data: existing, error: readErr } = await supabase
      .from("books")
      .select("id, purchase_url")
      .eq("id", bookId)
      .maybeSingle();

    if (readErr || !existing) return false;
    if (existing.purchase_url && existing.purchase_url.trim() !== "") return false;

    // Generate Amazon search URL as fallback
    const amazonUrl = buildAmazonSearchUrl(title, author, "es");

    const { error: updateErr } = await supabase
      .from("books")
      .update({ purchase_url: amazonUrl })
      .eq("id", bookId);

    return !updateErr;
  } catch (error) {
    console.error("Error saving purchase URL:", error);
    return false;
  }
}

/**
 * Save cover_url ONLY if it's missing in DB (never overwrites an existing one)
 */
export async function ensureCoverUrlSaved(
  bookId: string,
  coverUrl?: string | null
): Promise<boolean> {
  const url = normalizeCoverUrl(coverUrl);
  if (!bookId || !url) return false;

  try {
    const { data: existing, error: readErr } = await supabase
      .from("books")
      .select("id, cover_url")
      .eq("id", bookId)
      .maybeSingle();

    if (readErr || !existing) return false;
    if (existing.cover_url && normalizeCoverUrl(existing.cover_url)) return false;

    const { error: updateErr } = await supabase
      .from("books")
      .update({ cover_url: url })
      .eq("id", bookId);

    return !updateErr;
  } catch (error) {
    console.error("Error saving cover URL:", error);
    return false;
  }
}

/**
 * Batch update missing covers for multiple books
 */
export async function ensureBatchCoverUrlsSaved(
  books: Array<{ id: string; cover_url?: string | null }>
): Promise<number> {
  let updated = 0;
  
  for (const book of books) {
    if (book.cover_url) {
      const success = await ensureCoverUrlSaved(book.id, book.cover_url);
      if (success) updated++;
    }
  }
  
  return updated;
}
