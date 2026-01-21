/**
 * Brand Book Guidelines Hook
 * 
 * Provides brand guidelines for product creation in Creative Studio.
 * Enforces strict compliance with brand books.
 * Only Alex Lawton can create designs outside guidelines.
 */

import { useState, useMemo, useCallback } from 'react';
import { useBrandBookProtection } from '@/hooks/useBrandBookProtection';
import technoDogDesign from '@/config/design-system-techno-dog.json';
import doggiesDesign from '@/config/design-system-doggies.json';

export type BrandBookType = 'techno-dog' | 'techno-doggies';

export interface BrandGuideline {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

export interface ApprovedColor {
  name: string;
  hex: string;
  hsl?: string;
  usage: string;
}

export interface ApprovedMascot {
  id: string;
  displayName: string;
  componentName: string;
  personality: string;
  quote: string;
  traits: string[];
  approvedForApparel: boolean;
}

export interface ApprovedProduct {
  type: string;
  placement: string;
  printSize: string;
  fabricColors: string[];
  strokeColors: string[];
}

export interface BrandBookGuidelines {
  name: string;
  description: string;
  version: string;
  colors: ApprovedColor[];
  mascots: ApprovedMascot[];
  products: ApprovedProduct[];
  rules: BrandGuideline[];
  forbidden: string[];
}

export interface ProductValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useBrandBookGuidelines() {
  const { isOwner, isLoading: protectionLoading, logAccess } = useBrandBookProtection();
  const [activeBrandBook, setActiveBrandBook] = useState<BrandBookType>('techno-doggies');

  // Extract guidelines from techno.dog brand book
  const technoDogGuidelines = useMemo<BrandBookGuidelines>(() => {
    const colors: ApprovedColor[] = [];
    
    // Extract core colors
    if (technoDogDesign?.colors?.core) {
      Object.entries(technoDogDesign.colors.core).forEach(([name, data]: [string, any]) => {
        colors.push({
          name,
          hex: data?.hex || '',
          hsl: data?.hsl || '',
          usage: data?.name || 'Core color',
        });
      });
    }

    // Extract accent colors
    if (technoDogDesign?.colors?.accent) {
      Object.entries(technoDogDesign.colors.accent).forEach(([name, data]: [string, any]) => {
        colors.push({
          name,
          hex: data?.hex || '',
          hsl: data?.hsl || '',
          usage: data?.name || 'Accent color',
        });
      });
    }

    return {
      name: 'techno.dog',
      description: 'VHS/Brutalist aesthetic with industrial influences. Dark backgrounds, minimal design.',
      version: technoDogDesign?.meta?.version || '1.0.0',
      colors,
      mascots: [], // techno.dog doesn't have mascots
      products: [], // Generic product types
      rules: [
        { id: 'dark-bg', name: 'Dark Backgrounds', description: 'Always use dark backgrounds (black preferred)', required: true },
        { id: 'minimal', name: 'Minimal Design', description: 'Brutalist minimalism - no unnecessary elements', required: true },
        { id: 'vhs-aesthetic', name: 'VHS Aesthetic', description: 'Film grain, scan lines, glitch effects when appropriate', required: false },
        { id: 'typography', name: 'IBM Plex Mono', description: 'Use IBM Plex Mono for all text', required: true },
        { id: 'lowercase', name: 'Lowercase Text', description: '"techno.dog" must always be lowercase', required: true },
        { id: 'hexagon-logo', name: 'Hexagon Logo Only', description: 'Use geometric hexagon logo - NO dog imagery', required: true },
      ],
      forbidden: [
        'Dog images, icons, or silhouettes',
        'Bright colors or gradients',
        'Non-monospace fonts',
        'Uppercase "techno.dog"',
        'Commercial stock imagery',
        'AI-generated interpretations of branding',
      ],
    };
  }, []);

  // Extract guidelines from Techno Doggies brand book
  const doggiesGuidelines = useMemo<BrandBookGuidelines>(() => {
    const mascots: ApprovedMascot[] = doggiesDesign?.mascots?.coreVariants?.map((variant: any) => ({
      id: variant.id,
      displayName: variant.displayName,
      componentName: variant.componentName,
      personality: variant.personality,
      quote: variant.quote,
      traits: variant.traits || [],
      approvedForApparel: variant.approvedForApparel ?? true,
    })) || [];

    const products: ApprovedProduct[] = doggiesDesign?.merchandise?.approvedProductTypes?.map((product: any) => ({
      type: product.type,
      placement: product.placement,
      printSize: product.printSize,
      fabricColors: product.fabricColors || [],
      strokeColors: product.strokeColors || [],
    })) || [];

    const colors: ApprovedColor[] = [];
    if (doggiesDesign?.colors?.primary) {
      colors.push({
        name: doggiesDesign.colors.primary.name,
        hex: doggiesDesign.colors.primary.hex,
        hsl: doggiesDesign.colors.primary.hsl,
        usage: doggiesDesign.colors.primary.usage,
      });
    }
    if (doggiesDesign?.colors?.secondary) {
      colors.push({
        name: doggiesDesign.colors.secondary.name,
        hex: doggiesDesign.colors.secondary.hex,
        usage: doggiesDesign.colors.secondary.usage,
      });
    }

    const rulesFromJson = doggiesDesign?.merchandise?.zeroTolerancePolicy?.rules || [];

    return {
      name: 'Techno Doggies',
      description: '94-variant Techno Talkies pack. Stroke-only graphics on black fabric.',
      version: doggiesDesign?.meta?.version || '2.0.0',
      colors,
      mascots,
      products,
      rules: rulesFromJson.map((rule: string, index: number) => ({
        id: `rule-${index}`,
        name: rule.split(' ').slice(0, 3).join(' '),
        description: rule,
        required: rule.toUpperCase().includes('NEVER') || rule.toUpperCase().includes('ONLY') || rule.toUpperCase().includes('ALWAYS'),
      })),
      forbidden: doggiesDesign?.guidelines?.dont || [
        'AI-generated or modified mascots',
        'Non-approved color variations',
        'Filled or gradient mascots',
        'Busy or colorful backgrounds',
        'Non-core mascot variants for merchandise',
      ],
    };
  }, []);

  // Get active guidelines based on selected brand book
  const activeGuidelines = useMemo(() => {
    return activeBrandBook === 'techno-dog' ? technoDogGuidelines : doggiesGuidelines;
  }, [activeBrandBook, technoDogGuidelines, doggiesGuidelines]);

  // Validate a product design against guidelines
  const validateProduct = useCallback((product: {
    mascotId?: string;
    productType?: string;
    fabricColor?: string;
    strokeColor?: string;
    customDesign?: boolean;
  }): ProductValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // If custom design and not owner, block immediately
    if (product.customDesign && !isOwner) {
      errors.push('Custom designs outside brand guidelines require owner authorization (Alex Lawton only)');
      return { isValid: false, errors, warnings };
    }

    // If owner with custom design, allow with warning
    if (product.customDesign && isOwner) {
      warnings.push('Owner override: Custom design allowed outside standard guidelines');
      return { isValid: true, errors, warnings };
    }

    // Validate against Techno Doggies guidelines
    if (activeBrandBook === 'techno-doggies') {
      // Check mascot is approved
      if (product.mascotId) {
        const approvedMascot = activeGuidelines.mascots.find(m => m.id === product.mascotId);
        if (!approvedMascot) {
          errors.push(`Mascot "${product.mascotId}" is not in the approved list of core variants`);
        } else if (!approvedMascot.approvedForApparel) {
          errors.push(`Mascot "${approvedMascot.displayName}" is not approved for apparel`);
        }
      }

      // Check product type is approved
      if (product.productType) {
        const approvedProduct = activeGuidelines.products.find(
          p => p.type.toLowerCase() === product.productType?.toLowerCase()
        );
        if (!approvedProduct) {
          errors.push(`Product type "${product.productType}" is not in the approved merchandise list`);
        } else {
          // Check fabric color
          if (product.fabricColor && !approvedProduct.fabricColors.includes(product.fabricColor.toLowerCase())) {
            errors.push(`Fabric color "${product.fabricColor}" is not approved for ${product.productType}. Approved: ${approvedProduct.fabricColors.join(', ')}`);
          }
          // Check stroke color
          if (product.strokeColor && !approvedProduct.strokeColors.includes(product.strokeColor)) {
            errors.push(`Stroke color "${product.strokeColor}" is not approved. Approved: ${approvedProduct.strokeColors.join(', ')}`);
          }
        }
      }
    }

    // Validate against techno.dog guidelines
    if (activeBrandBook === 'techno-dog') {
      if (product.mascotId) {
        errors.push('techno.dog brand does not use mascots. Switch to Techno Doggies brand book for mascot products.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, [activeBrandBook, activeGuidelines, isOwner]);

  // Switch brand book with logging
  const switchBrandBook = useCallback(async (brandBook: BrandBookType) => {
    setActiveBrandBook(brandBook);
    await logAccess(brandBook, 'brand_book_switch', { 
      from: activeBrandBook, 
      to: brandBook,
      isOwner 
    });
  }, [activeBrandBook, isOwner, logAccess]);

  // Check if user can create custom designs
  const canCreateCustomDesigns = isOwner;

  return {
    // State
    activeBrandBook,
    isLoading: protectionLoading,
    isOwner,
    canCreateCustomDesigns,
    
    // Guidelines
    activeGuidelines,
    technoDogGuidelines,
    doggiesGuidelines,
    
    // Actions
    switchBrandBook,
    validateProduct,
    logAccess,
  };
}

export default useBrandBookGuidelines;
