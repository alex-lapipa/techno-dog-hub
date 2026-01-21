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
import type { ColorLineType, ProductCopyConfig } from '../hooks/useCreativeWorkflow';

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

function getTextPlacementHint(productType?: string, textPlacement?: string): PlacementHint {
  const pt = (productType || '').toLowerCase();
  const pl = (textPlacement || '').toLowerCase();

  // These are pragmatic 2D overlays on a single product photo.
  // They are intentionally conservative to stay "small-to-medium".
  if (pt.includes('cap')) {
    if (pl.includes('front')) return { xPct: 0.5, yPct: 0.66, sizePct: 0.035 };
    if (pl.includes('left')) return { xPct: 0.27, yPct: 0.56, sizePct: 0.03 };
    if (pl.includes('right')) return { xPct: 0.73, yPct: 0.56, sizePct: 0.03 };
    if (pl.includes('back')) return { xPct: 0.5, yPct: 0.58, sizePct: 0.03 };
    return { xPct: 0.5, yPct: 0.66, sizePct: 0.035 };
  }

  if (pt.includes('hoodie')) {
    if (pl.includes('front')) return { xPct: 0.5, yPct: 0.64, sizePct: 0.04 };
    if (pl.includes('back')) return { xPct: 0.5, yPct: 0.72, sizePct: 0.045 };
    if (pl.includes('sleeve')) return { xPct: 0.78, yPct: 0.60, sizePct: 0.03 };
    if (pl.includes('hood')) return { xPct: 0.5, yPct: 0.30, sizePct: 0.03 };
    return { xPct: 0.5, yPct: 0.64, sizePct: 0.04 };
  }

  if (pt.includes('tee') || pt.includes('t-shirt') || pt.includes('shirt')) {
    if (pl.includes('front')) return { xPct: 0.5, yPct: 0.62, sizePct: 0.04 };
    if (pl.includes('back')) return { xPct: 0.5, yPct: 0.72, sizePct: 0.045 };
    if (pl.includes('sleeve')) return { xPct: 0.80, yPct: 0.56, sizePct: 0.03 };
    if (pl.includes('collar')) return { xPct: 0.5, yPct: 0.30, sizePct: 0.03 };
    return { xPct: 0.5, yPct: 0.62, sizePct: 0.04 };
  }

  if (pt.includes('tote')) {
    if (pl.includes('back')) return { xPct: 0.5, yPct: 0.78, sizePct: 0.045 };
    return { xPct: 0.5, yPct: 0.72, sizePct: 0.045 };
  }

  return { xPct: 0.5, yPct: 0.7, sizePct: 0.04 };
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
    // Prevent canvas tainting if the image URL is served with CORS headers.
    // (Data URLs are fine either way.)
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function sanitizeCopyText(input: string): string {
  return (input || '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function resolveCopyFontSizePx({
  canvasW,
  canvasH,
  sizeLabel,
}: {
  canvasW: number;
  canvasH: number;
  sizeLabel?: ProductCopyConfig['fontSize'];
}): number {
  const base = Math.min(canvasW, canvasH);
  const pct = sizeLabel === 'large' ? 0.055 : sizeLabel === 'medium' ? 0.042 : 0.032;
  return Math.max(12, Math.round(base * pct));
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
  productCopy,
}: {
  baseImageUrl: string;
  mascot: ApprovedMascot;
  colorLine: ColorLineType;
  productType?: string;
  placement?: string;
  productCopy?: ProductCopyConfig[];
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

   // Optional: product copy overlay (stroke-only)
  const copyEntries = (productCopy || []).filter((c) => sanitizeCopyText(c.text).length > 0);
  if (copyEntries.length > 0) {
    const stroke = colorLine === 'white-line' ? '#FFFFFF' : '#00FF00';

    ctx.save();
    ctx.fillStyle = 'transparent';
    ctx.strokeStyle = stroke;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';

    for (const entry of copyEntries) {
      const txt = sanitizeCopyText(entry.text);
      const tHint = getTextPlacementHint(productType, entry.placement);
      const fontPx = resolveCopyFontSizePx({
        canvasW: canvas.width,
        canvasH: canvas.height,
        sizeLabel: entry.fontSize,
      });

      ctx.font = `${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace`;
      ctx.lineWidth = Math.max(1.5, Math.round(fontPx / 12));

      const tx = Math.round(canvas.width * tHint.xPct);
      const ty = Math.round(canvas.height * tHint.yPct);

      // Stroke-only for brand compliance
      ctx.strokeText(txt, tx, ty);
    }

    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
