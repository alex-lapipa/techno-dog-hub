/**
 * Techno Doggies Mockup Compositor (Client-Side)
 *
 * ZERO TOLERANCE POLICY:
 * - The AI may generate the PRODUCT photography (blank garment)
 * - The mascot MUST be composited from the official Techno Doggies SVG pack
 *   (no AI-drawn mascots, ever)
 */

import { OFFICIAL_MASCOT_SVG_DATA, getMascotSVGData } from '../data/officialMascotSVGData';
import type { ApprovedMascot } from '../hooks/useBrandBookGuidelines';
import type { ColorLineType } from '../hooks/useCreativeWorkflow';

type PlacementHint = {
  xPct: number; // 0..1
  yPct: number; // 0..1
  sizePct: number; // relative to min(imgW,imgH)
};

function toKebabCase(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .trim()
    .toLowerCase();
}

function resolveOfficialMascotKey(mascot: ApprovedMascot): string {
  const candidates = [
    mascot.id,
    mascot.componentName ? toKebabCase(mascot.componentName) : '',
    toKebabCase(mascot.displayName),
  ].filter(Boolean);

  for (const key of candidates) {
    if (OFFICIAL_MASCOT_SVG_DATA[key]) return key;
  }
  return 'default';
}

function getPlacementHint(productType?: string, placement?: string): PlacementHint {
  const pt = (productType || '').toLowerCase();
  const pl = (placement || '').toLowerCase();

  // Simple, brand-safe defaults (small/medium, centered)
  if (pt.includes('cap')) {
    // front panel area
    return { xPct: 0.5, yPct: 0.52, sizePct: 0.20 };
  }

  if (pt.includes('hoodie')) {
    // chest
    return { xPct: 0.5, yPct: 0.46, sizePct: 0.22 };
  }

  if (pt.includes('tee') || pt.includes('t-shirt') || pt.includes('shirt')) {
    return { xPct: 0.5, yPct: 0.42, sizePct: 0.22 };
  }

  if (pt.includes('tote') || pl.includes('front')) {
    return { xPct: 0.5, yPct: 0.50, sizePct: 0.24 };
  }

  return { xPct: 0.5, yPct: 0.5, sizePct: 0.22 };
}

function buildMascotSvgDataUrl({
  mascot,
  colorLine,
}: {
  mascot: ApprovedMascot;
  colorLine: ColorLineType;
}): string {
  const key = resolveOfficialMascotKey(mascot);
  const mascotData = getMascotSVGData(key);

  const stroke = colorLine === 'white-line' ? '#FFFFFF' : '#00FF00';
  const strokeWidth = mascotData.strokeWidth || '2';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mascotData.viewBox}" width="512" height="512">
  <g fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision">
    ${mascotData.svgPaths}
  </g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Returns a PNG data URL representing base mockup + official mascot overlay.
 */
export async function compositeTechnoDoggiesMockup({
  baseImageUrl,
  mascot,
  colorLine,
  productType,
  placement,
}: {
  baseImageUrl: string;
  mascot: ApprovedMascot;
  colorLine: ColorLineType;
  productType?: string;
  placement?: string;
}): Promise<string> {
  const base = await loadImage(baseImageUrl);
  const hint = getPlacementHint(productType, placement);

  const canvas = document.createElement('canvas');
  canvas.width = base.naturalWidth || base.width;
  canvas.height = base.naturalHeight || base.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  // Base product photo
  ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

  // Official mascot overlay
  const mascotSvgUrl = buildMascotSvgDataUrl({ mascot, colorLine });
  const overlay = await loadImage(mascotSvgUrl);

  const size = Math.round(Math.min(canvas.width, canvas.height) * hint.sizePct);
  const x = Math.round(canvas.width * hint.xPct - size / 2);
  const y = Math.round(canvas.height * hint.yPct - size / 2);

  ctx.drawImage(overlay, x, y, size, size);

  return canvas.toDataURL('image/png');
}
