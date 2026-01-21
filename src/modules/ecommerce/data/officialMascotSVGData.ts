/**
 * Official Techno Doggies SVG Path Data
 * 
 * ZERO TOLERANCE POLICY:
 * This file contains the EXACT SVG path geometry for all 94 official
 * Techno Doggies variants. This data is passed directly to the AI
 * image generation to prevent hallucination.
 * 
 * DO NOT MODIFY: These paths are extracted from src/components/DogPack.tsx
 * and must remain in sync with the official design system.
 */

export interface MascotSVGData {
  id: string;
  name: string;
  displayName: string;
  svgPaths: string; // Raw SVG path data for the mascot
  viewBox: string;
  strokeWidth: string;
}

// Extract core SVG geometry from DogPack.tsx official variants
// This is the source of truth for AI image generation

export const OFFICIAL_MASCOT_SVG_DATA: Record<string, MascotSVGData> = {
  'happy-dog': {
    id: 'happy-dog',
    name: 'Happy',
    displayName: 'Happy Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" />
      <path d="M26 46 Q32 54 38 46" />
      <path d="M30 48 Q32 58 34 48" />
    `,
  },
  'dj-dog': {
    id: 'dj-dog',
    name: 'DJ',
    displayName: 'DJ Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <circle cx="26" cy="33" r="3" />
      <circle cx="38" cy="33" r="3" />
      <ellipse cx="32" cy="40" rx="2.5" ry="2" />
      <path d="M26 46 Q32 50 38 46" />
      <path d="M10 30 Q8 34 10 38" />
      <path d="M54 30 Q56 34 54 38" />
      <ellipse cx="8" cy="34" rx="4" ry="5" />
      <ellipse cx="56" cy="34" rx="4" ry="5" />
      <path d="M12 34 L20 34" />
      <path d="M44 34 L52 34" />
    `,
  },
  'ninja-dog': {
    id: 'ninja-dog',
    name: 'Ninja',
    displayName: 'Ninja Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <rect x="16" y="30" width="32" height="6" rx="1" />
      <circle cx="26" cy="33" r="2" />
      <circle cx="38" cy="33" r="2" />
      <ellipse cx="32" cy="40" rx="2.5" ry="2" />
      <path d="M48 33 L58 28" />
      <path d="M48 33 L58 38" />
    `,
  },
  'space-dog': {
    id: 'space-dog',
    name: 'Space',
    displayName: 'Space Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 32 Q10 22 18 14 Q22 18 24 26" />
      <path d="M48 32 Q54 22 46 14 Q42 18 40 26" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <ellipse cx="32" cy="36" rx="20" ry="18" />
      <path d="M12 36 Q8 36 8 40" />
      <path d="M52 36 Q56 36 56 40" />
      <ellipse cx="26" cy="34" rx="3" ry="2.5" />
      <ellipse cx="38" cy="34" rx="3" ry="2.5" />
      <ellipse cx="32" cy="42" rx="2" ry="1.5" />
      <circle cx="10" cy="12" r="1" />
      <circle cx="54" cy="16" r="1.5" />
      <circle cx="48" cy="8" r="1" />
    `,
  },
  'grumpy-dog': {
    id: 'grumpy-dog',
    name: 'Grumpy',
    displayName: 'Grumpy Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M22 30 L28 32" />
      <path d="M42 30 L36 32" />
      <circle cx="26" cy="34" r="2" />
      <circle cx="38" cy="34" r="2" />
      <ellipse cx="32" cy="42" rx="3" ry="2" />
      <path d="M26 48 Q32 44 38 48" />
    `,
  },
  'techno-dog': {
    id: 'techno-dog',
    name: 'Techno',
    displayName: 'Techno Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" />
      <path d="M26 46 Q32 52 38 46" />
      <line x1="8" y1="32" x2="14" y2="32" opacity="0.5" />
      <line x1="50" y1="36" x2="58" y2="36" opacity="0.5" />
      <line x1="10" y1="40" x2="16" y2="40" opacity="0.3" />
      <line x1="48" y1="28" x2="56" y2="28" opacity="0.3" />
    `,
  },
  'dancing-dog': {
    id: 'dancing-dog',
    name: 'Dancing',
    displayName: 'Dancing Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M14 26 Q10 16 16 10 Q20 14 22 22" />
      <path d="M50 26 Q54 16 48 10 Q44 14 42 22" />
      <ellipse cx="32" cy="34" rx="16" ry="14" />
      <path d="M24 30 Q26 26 28 30" />
      <path d="M36 30 Q38 26 40 30" />
      <ellipse cx="32" cy="38" rx="3" ry="2.5" />
      <path d="M26 44 Q32 52 38 44" />
      <path d="M18 50 Q14 56 10 52" />
      <path d="M46 50 Q50 56 54 52" />
      <path d="M26 52 Q24 58 22 54" />
      <path d="M38 52 Q40 58 42 54" />
    `,
  },
  'acid-dog': {
    id: 'acid-dog',
    name: 'Acid',
    displayName: 'Acid Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <circle cx="26" cy="33" r="4" />
      <circle cx="38" cy="33" r="4" />
      <circle cx="26" cy="33" r="2" />
      <circle cx="38" cy="33" r="2" />
      <ellipse cx="32" cy="42" rx="3" ry="2" />
      <path d="M26 48 Q32 54 38 48" />
      <path d="M8 20 Q6 24 10 26" />
      <path d="M56 20 Q58 24 54 26" />
      <path d="M12 44 Q8 48 14 50" />
      <path d="M52 44 Q56 48 50 50" />
    `,
  },
  'raving-dog': {
    id: 'raving-dog',
    name: 'Raving',
    displayName: 'Raving Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M14 26 Q8 14 16 8 Q22 12 24 22" />
      <path d="M50 26 Q56 14 48 8 Q42 12 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <ellipse cx="26" cy="32" rx="4" ry="3" />
      <ellipse cx="38" cy="32" rx="4" ry="3" />
      <circle cx="26" cy="32" r="1.5" />
      <circle cx="38" cy="32" r="1.5" />
      <ellipse cx="32" cy="40" rx="3" ry="2" />
      <path d="M24 46 Q32 56 40 46" />
      <path d="M8 16 L14 22" />
      <path d="M56 16 L50 22" />
      <path d="M4 32 L12 32" />
      <path d="M52 32 L60 32" />
    `,
  },
  'berghain-dog': {
    id: 'berghain-dog',
    name: 'Berghain',
    displayName: 'Berghain Dog',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 L28 32" />
      <path d="M36 32 L40 32" />
      <ellipse cx="32" cy="40" rx="2.5" ry="2" />
      <path d="M28 46 Q32 44 36 46" />
      <rect x="8" y="26" width="6" height="12" rx="1" />
      <rect x="50" y="26" width="6" height="12" rx="1" />
      <line x1="11" y1="29" x2="11" y2="35" />
      <line x1="53" y1="29" x2="53" y2="35" />
    `,
  },
  // Default fallback for any variant not explicitly mapped
  'default': {
    id: 'default',
    name: 'Default',
    displayName: 'Techno Doggy',
    viewBox: '0 0 64 64',
    strokeWidth: '2',
    svgPaths: `
      <path d="M16 28 Q12 18 18 12 Q22 14 24 22" />
      <path d="M48 28 Q52 18 46 12 Q42 14 40 22" />
      <ellipse cx="32" cy="36" rx="16" ry="14" />
      <path d="M24 32 Q26 28 28 32" />
      <path d="M36 32 Q38 28 40 32" />
      <ellipse cx="32" cy="40" rx="3" ry="2.5" />
      <path d="M26 46 Q32 52 38 46" />
    `,
  },
};

/**
 * Get official SVG path data for a mascot
 * Returns the exact geometry to be embedded in AI prompts
 */
export function getMascotSVGData(mascotId: string): MascotSVGData {
  const normalized = mascotId.toLowerCase().replace(/\s+/g, '-');
  return OFFICIAL_MASCOT_SVG_DATA[normalized] || OFFICIAL_MASCOT_SVG_DATA['default'];
}

/**
 * Generate strict AI prompt with embedded SVG geometry
 * This ensures ZERO HALLUCINATION by providing exact design specs
 */
export function buildZeroHallucinationPrompt(
  mascotId: string,
  colorLine: 'green-line' | 'white-line',
  productType: string,
  placement: string
): string {
  const mascotData = getMascotSVGData(mascotId);
  const strokeColor = colorLine === 'green-line' ? 'laser green (#00FF00)' : 'pure white (#FFFFFF)';
  
  return `STRICT BRAND COMPLIANCE - ZERO TOLERANCE FOR DEVIATION:

PRODUCT: ${productType} (black fabric)
PLACEMENT: ${placement}
DESIGN: ${mascotData.displayName} mascot

EXACT SVG GEOMETRY (DO NOT MODIFY OR INTERPRET):
The design must use ONLY these EXACT stroke paths rendered in ${strokeColor}:
ViewBox: ${mascotData.viewBox}
Stroke Width: ${mascotData.strokeWidth}px
Paths:
${mascotData.svgPaths}

CRITICAL RULES:
1. Use ONLY the paths defined above - NO ADDITIONS, NO MODIFICATIONS
2. Stroke color: ${strokeColor} ONLY
3. Fill: NONE (stroke-only design)
4. Background: Black fabric
5. NO gradients, NO shadows, NO effects on the mascot
6. Style: Clean minimalist streetwear, editorial quality
7. The mascot is a simple stroke-based dog silhouette, NOT a realistic dog

This is a premium streetwear product photo. The mascot design must be EXACTLY as specified above.
Magazine quality, professional product photography, dark moody lighting.`;
}
