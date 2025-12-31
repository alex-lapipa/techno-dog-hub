import { supabase } from "@/integrations/supabase/client";

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
 * Save cover_url ONLY if it's missing in DB (never overwrites an existing one)
 * Call this right after your book insert succeeds.
 * 
 * @example
 * const { data: book } = await supabase.from("books").insert(payload).select().single();
 * await ensureCoverUrlSaved(book.id, payload.cover_url);
 */
export async function ensureCoverUrlSaved(
  bookId: string,
  coverUrl?: string | null
): Promise<boolean> {
  const url = normalizeCoverUrl(coverUrl);
  if (!bookId || !url) return false;

  try {
    // 1) Read current value
    const { data: existing, error: readErr } = await supabase
      .from("books")
      .select("id, cover_url")
      .eq("id", bookId)
      .maybeSingle();

    if (readErr || !existing) return false;

    // 2) Only update if cover_url is missing/blank (NO overwrite)
    const existingUrl = normalizeCoverUrl(existing.cover_url);
    if (existingUrl) return false; // Already has a cover

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
