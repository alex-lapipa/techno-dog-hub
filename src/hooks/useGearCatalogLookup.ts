import { useMemo } from "react";
import { useGearData } from "./useGearData";

interface GearMatch {
  gearText: string;
  catalogId: string | null;
  catalogName: string | null;
}

// Normalize text for matching (lowercase, remove special chars)
function normalize(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Extract key matching terms from gear name
function getMatchTerms(name: string): string[] {
  const normalized = normalize(name);
  const words = normalized.split(' ');
  
  // Common model patterns to look for
  const patterns = [
    normalized, // Full name
    words.slice(-2).join(' '), // Last 2 words (often model)
    words.slice(-1).join(' '), // Last word
  ];
  
  return [...new Set(patterns)].filter(p => p.length > 2);
}

export function useGearCatalogLookup() {
  const { data: gearCatalog, isLoading } = useGearData();

  // Build lookup maps for efficient matching
  const lookupMaps = useMemo(() => {
    if (!gearCatalog) return null;
    
    const exactNameMap = new Map<string, string>(); // normalized name -> id
    const partialMap = new Map<string, { id: string; name: string; score: number }[]>();
    
    for (const item of gearCatalog) {
      const normalizedName = normalize(item.name);
      exactNameMap.set(normalizedName, item.id);
      
      // Also map without brand for partial matching
      const manufacturer = normalize(item.manufacturer);
      const nameWithoutBrand = normalizedName.replace(manufacturer, '').trim();
      if (nameWithoutBrand.length > 3) {
        exactNameMap.set(nameWithoutBrand, item.id);
      }
      
      // Build partial match index
      const terms = getMatchTerms(item.name);
      for (const term of terms) {
        if (!partialMap.has(term)) {
          partialMap.set(term, []);
        }
        partialMap.get(term)!.push({ 
          id: item.id, 
          name: item.name,
          score: term === normalizedName ? 100 : term.length 
        });
      }
    }
    
    return { exactNameMap, partialMap, catalog: gearCatalog };
  }, [gearCatalog]);

  // Match a single gear text to catalog
  const matchGear = useMemo(() => {
    if (!lookupMaps) return (_text: string): GearMatch => ({ gearText: '', catalogId: null, catalogName: null });
    
    return (gearText: string): GearMatch => {
      const normalized = normalize(gearText);
      
      // Try exact match first
      if (lookupMaps.exactNameMap.has(normalized)) {
        const id = lookupMaps.exactNameMap.get(normalized)!;
        const item = lookupMaps.catalog.find(g => g.id === id);
        return { gearText, catalogId: id, catalogName: item?.name || null };
      }
      
      // Try partial matches
      const terms = getMatchTerms(gearText);
      let bestMatch: { id: string; name: string; score: number } | null = null;
      
      for (const term of terms) {
        const matches = lookupMaps.partialMap.get(term);
        if (matches) {
          for (const match of matches) {
            // Verify the match makes sense (check if catalog name contains original terms)
            const catalogNormalized = normalize(match.name);
            const gearWords = normalized.split(' ');
            const matchingWords = gearWords.filter(w => catalogNormalized.includes(w));
            
            if (matchingWords.length >= 2 || (matchingWords.length === 1 && gearWords.length === 1)) {
              const adjustedScore = match.score + matchingWords.length * 10;
              if (!bestMatch || adjustedScore > bestMatch.score) {
                bestMatch = { ...match, score: adjustedScore };
              }
            }
          }
        }
      }
      
      if (bestMatch) {
        return { gearText, catalogId: bestMatch.id, catalogName: bestMatch.name };
      }
      
      return { gearText, catalogId: null, catalogName: null };
    };
  }, [lookupMaps]);

  // Match multiple gear texts
  const matchGearList = useMemo(() => {
    return (gearList: string[]): GearMatch[] => {
      return gearList.map(matchGear);
    };
  }, [matchGear]);

  return {
    matchGear,
    matchGearList,
    isLoading,
    catalogSize: gearCatalog?.length || 0
  };
}
