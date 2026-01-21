/**
 * Shopify Product Service for Creative Studio
 * 
 * Aligns Creative Studio product drafts with Shopify product structure
 * and print-on-demand fulfillment provider standards.
 * 
 * NON-DESTRUCTIVE: This service adds Shopify sync capability without
 * modifying existing Creative Studio or Shopify configurations.
 */

import { supabase } from '@/integrations/supabase/client';
import { type ProductDraft, type ProductCopyConfig } from '../hooks/useCreativeWorkflow';
import { type ApprovedProduct } from '../hooks/useBrandBookGuidelines';

// Shopify-aligned product template structure
export interface ShopifyProductTemplate {
  productType: string;
  shopifyProductType: string; // Shopify's product_type field
  vendor: string;
  tags: string[];
  fulfillmentProvider: 'printful' | 'printify' | 'gooten' | 'manual';
  variants: ShopifyVariantTemplate[];
  metafields: ShopifyMetafield[];
}

export interface ShopifyVariantTemplate {
  option1: string; // e.g., Size
  option2?: string; // e.g., Color
  sku_prefix: string;
  weight: number; // in grams
  weight_unit: 'g' | 'kg' | 'lb' | 'oz';
}

export interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type: 'single_line_text_field' | 'multi_line_text_field' | 'json';
}

// Print-on-demand aligned product templates
// These match common fulfillment provider SKU structures
export const SHOPIFY_PRODUCT_TEMPLATES: Record<string, ShopifyProductTemplate> = {
  'Hoodie': {
    productType: 'Hoodie',
    shopifyProductType: 'Unisex Hoodie',
    vendor: 'techno.dog',
    tags: ['apparel', 'hoodie', 'streetwear', 'techno', 'unisex'],
    fulfillmentProvider: 'printful',
    variants: [
      { option1: 'S', sku_prefix: 'TD-HOOD-S', weight: 450, weight_unit: 'g' },
      { option1: 'M', sku_prefix: 'TD-HOOD-M', weight: 480, weight_unit: 'g' },
      { option1: 'L', sku_prefix: 'TD-HOOD-L', weight: 510, weight_unit: 'g' },
      { option1: 'XL', sku_prefix: 'TD-HOOD-XL', weight: 540, weight_unit: 'g' },
      { option1: 'XXL', sku_prefix: 'TD-HOOD-XXL', weight: 570, weight_unit: 'g' },
    ],
    metafields: [
      { namespace: 'custom', key: 'print_area', value: 'front_chest,back', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'fabric', value: '80% Cotton, 20% Polyester', type: 'single_line_text_field' },
    ],
  },
  'T-Shirt': {
    productType: 'T-Shirt',
    shopifyProductType: 'Unisex T-Shirt',
    vendor: 'techno.dog',
    tags: ['apparel', 't-shirt', 'streetwear', 'techno', 'unisex'],
    fulfillmentProvider: 'printful',
    variants: [
      { option1: 'S', sku_prefix: 'TD-TEE-S', weight: 150, weight_unit: 'g' },
      { option1: 'M', sku_prefix: 'TD-TEE-M', weight: 165, weight_unit: 'g' },
      { option1: 'L', sku_prefix: 'TD-TEE-L', weight: 180, weight_unit: 'g' },
      { option1: 'XL', sku_prefix: 'TD-TEE-XL', weight: 195, weight_unit: 'g' },
      { option1: 'XXL', sku_prefix: 'TD-TEE-XXL', weight: 210, weight_unit: 'g' },
    ],
    metafields: [
      { namespace: 'custom', key: 'print_area', value: 'front_chest', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'fabric', value: '100% Organic Cotton', type: 'single_line_text_field' },
    ],
  },
  'Cap': {
    productType: 'Cap',
    shopifyProductType: 'Embroidered Cap',
    vendor: 'techno.dog',
    tags: ['accessories', 'cap', 'hat', 'streetwear', 'techno'],
    fulfillmentProvider: 'printful',
    variants: [
      { option1: 'One Size', sku_prefix: 'TD-CAP-OS', weight: 85, weight_unit: 'g' },
    ],
    metafields: [
      { namespace: 'custom', key: 'print_area', value: 'front_panel', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'decoration', value: 'Embroidery', type: 'single_line_text_field' },
    ],
  },
  'Tote Bag': {
    productType: 'Tote Bag',
    shopifyProductType: 'Canvas Tote Bag',
    vendor: 'techno.dog',
    tags: ['accessories', 'bag', 'tote', 'streetwear', 'techno', 'eco-friendly'],
    fulfillmentProvider: 'printful',
    variants: [
      { option1: 'Standard', sku_prefix: 'TD-TOTE-STD', weight: 200, weight_unit: 'g' },
    ],
    metafields: [
      { namespace: 'custom', key: 'print_area', value: 'front_center', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'fabric', value: '100% Cotton Canvas', type: 'single_line_text_field' },
    ],
  },
  'Bandana': {
    productType: 'Bandana',
    shopifyProductType: 'Printed Bandana',
    vendor: 'techno.dog',
    tags: ['accessories', 'bandana', 'streetwear', 'techno'],
    fulfillmentProvider: 'printful',
    variants: [
      { option1: 'One Size', sku_prefix: 'TD-BAND-OS', weight: 30, weight_unit: 'g' },
    ],
    metafields: [
      { namespace: 'custom', key: 'print_area', value: 'all_over', type: 'single_line_text_field' },
      { namespace: 'custom', key: 'fabric', value: '100% Cotton', type: 'single_line_text_field' },
    ],
  },
};

// Convert Creative Studio draft to Shopify-ready product data
export interface ShopifyReadyProduct {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  status: 'draft' | 'active';
  options: Array<{ name: string; values: string[] }>;
  variants: Array<{
    option1: string;
    option2?: string;
    price: string;
    sku: string;
    weight: number;
    weight_unit: string;
    inventory_policy: 'deny' | 'continue';
  }>;
  images: Array<{
    src: string;
    alt: string;
  }>;
  metafields: ShopifyMetafield[];
}

/**
 * Get Shopify-aligned template for a product type
 */
export function getShopifyTemplate(productType: string): ShopifyProductTemplate | null {
  return SHOPIFY_PRODUCT_TEMPLATES[productType] || null;
}

/**
 * Check if a product type is Shopify-ready
 */
export function isShopifyReady(productType: string): boolean {
  return productType in SHOPIFY_PRODUCT_TEMPLATES;
}

/**
 * Generate a unique SKU for a product variant
 */
export function generateSKU(
  productType: string,
  mascotSlug?: string,
  colorLine?: string,
  variantOption?: string
): string {
  const template = SHOPIFY_PRODUCT_TEMPLATES[productType];
  if (!template) return `TD-CUSTOM-${Date.now()}`;
  
  const basePrefix = template.variants.find(v => v.option1 === variantOption)?.sku_prefix
    || template.variants[0]?.sku_prefix
    || 'TD';
  
  const mascotCode = mascotSlug ? `-${mascotSlug.toUpperCase().slice(0, 3)}` : '';
  const colorCode = colorLine === 'green-line' ? '-GRN' : colorLine === 'white-line' ? '-WHT' : '';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  
  return `${basePrefix}${mascotCode}${colorCode}-${timestamp}`;
}

/**
 * Convert Creative Studio draft to Shopify-ready product structure
 */
export function convertDraftToShopifyProduct(
  draft: ProductDraft,
  basePrice: number = 49.99
): ShopifyReadyProduct | null {
  if (!draft.selectedProduct || !draft.editorialBrief) {
    return null;
  }

  const template = getShopifyTemplate(draft.selectedProduct.type);
  if (!template) {
    return null;
  }

  // Build product description from editorial brief
  const bodyHtml = buildProductDescription(draft);

  // Build tags array
  const customTags = [
    draft.brandBook,
    draft.selectedMascot?.id,
    draft.colorLine,
  ].filter(Boolean);

  const allTags = [...template.tags, ...customTags];

  // Build variants with pricing
  const variants = template.variants.map(v => ({
    option1: v.option1,
    price: basePrice.toFixed(2),
    sku: generateSKU(
      draft.selectedProduct!.type,
      draft.selectedMascot?.id,
      draft.colorLine || undefined,
      v.option1
    ),
    weight: v.weight,
    weight_unit: v.weight_unit,
    inventory_policy: 'continue' as const, // Print-on-demand: always available
  }));

  // Build metafields with Creative Studio metadata
  const metafields: ShopifyMetafield[] = [
    ...template.metafields,
    {
      namespace: 'creative_studio',
      key: 'brand_book',
      value: draft.brandBook,
      type: 'single_line_text_field',
    },
    {
      namespace: 'creative_studio',
      key: 'color_line',
      value: draft.colorLine || 'none',
      type: 'single_line_text_field',
    },
  ];

  if (draft.selectedMascot) {
    metafields.push({
      namespace: 'creative_studio',
      key: 'mascot',
      value: JSON.stringify({
        id: draft.selectedMascot.id,
        displayName: draft.selectedMascot.displayName,
      }),
      type: 'json',
    });
  }

  if (draft.productCopy && draft.productCopy.length > 0) {
    metafields.push({
      namespace: 'creative_studio',
      key: 'product_copy',
      value: JSON.stringify(draft.productCopy),
      type: 'json',
    });
  }

  // Build product structure
  const product: ShopifyReadyProduct = {
    title: draft.editorialBrief.productName,
    body_html: bodyHtml,
    vendor: template.vendor,
    product_type: template.shopifyProductType,
    tags: allTags.join(', '),
    status: 'draft', // Always create as draft for review
    options: [{ name: 'Size', values: template.variants.map(v => v.option1) }],
    variants,
    images: [],
    metafields,
  };

  // Add generated image if available
  if (draft.generatedImageUrl) {
    product.images.push({
      src: draft.generatedImageUrl,
      alt: `${draft.editorialBrief.productName} - ${template.productType}`,
    });
  }

  return product;
}

/**
 * Build HTML product description from editorial brief
 */
function buildProductDescription(draft: ProductDraft): string {
  if (!draft.editorialBrief) return '';

  const parts: string[] = [];

  // Main description
  if (draft.editorialBrief.description) {
    parts.push(`<p>${draft.editorialBrief.description}</p>`);
  }

  // Tagline as a highlight
  if (draft.editorialBrief.tagline) {
    parts.push(`<p><strong>${draft.editorialBrief.tagline}</strong></p>`);
  }

  // Creative rationale (optional, for SEO)
  if (draft.editorialBrief.creativeRationale) {
    parts.push(`<p><em>${draft.editorialBrief.creativeRationale}</em></p>`);
  }

  // Product copy elements
  if (draft.productCopy && draft.productCopy.length > 0) {
    const copyText = draft.productCopy.map(c => c.text).join(' • ');
    parts.push(`<p class="product-copy">${copyText}</p>`);
  }

  return parts.join('\n');
}

/**
 * Get fulfillment provider info for a product type
 */
export function getFulfillmentInfo(productType: string): {
  provider: string;
  printAreas: string[];
  productionTime: string;
} | null {
  const template = SHOPIFY_PRODUCT_TEMPLATES[productType];
  if (!template) return null;

  const printAreaField = template.metafields.find(m => m.key === 'print_area');
  const printAreas = printAreaField?.value.split(',') || [];

  return {
    provider: template.fulfillmentProvider,
    printAreas,
    productionTime: '3-5 business days', // Standard POD timeframe
  };
}

/**
 * Validate draft for Shopify readiness
 */
export interface ShopifyValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateForShopify(draft: ProductDraft): ShopifyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!draft.selectedProduct) {
    errors.push('Product type is required');
  } else if (!isShopifyReady(draft.selectedProduct.type)) {
    errors.push(`Product type "${draft.selectedProduct.type}" is not configured for Shopify`);
  }

  if (!draft.editorialBrief?.productName) {
    errors.push('Product name is required');
  }

  if (!draft.editorialBrief?.description) {
    warnings.push('Product description is recommended for SEO');
  }

  if (!draft.generatedImageUrl) {
    warnings.push('Product image is recommended before publishing');
  }

  // Brand-specific validation
  if (draft.brandBook === 'techno-doggies') {
    if (!draft.selectedMascot) {
      warnings.push('Techno Doggies products typically include a mascot');
    }
    if (!draft.colorLine) {
      warnings.push('Color line selection is recommended for Techno Doggies');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create product in Shopify via Edge Function
 * (Uses Shopify Admin API through backend)
 */
export async function createShopifyProduct(
  draft: ProductDraft,
  basePrice: number = 49.99
): Promise<{ success: boolean; productId?: string; error?: string }> {
  const validation = validateForShopify(draft);
  if (!validation.isValid) {
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(', ')}`,
    };
  }

  const shopifyProduct = convertDraftToShopifyProduct(draft, basePrice);
  if (!shopifyProduct) {
    return {
      success: false,
      error: 'Failed to convert draft to Shopify format',
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('shopify-create-product', {
      body: { product: shopifyProduct },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      productId: data?.product?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get Shopify-aligned product types available
 */
export function getAvailableShopifyProductTypes(): string[] {
  return Object.keys(SHOPIFY_PRODUCT_TEMPLATES);
}

/**
 * Enhance approved product with Shopify metadata
 */
export function enhanceWithShopifyData(product: ApprovedProduct): ApprovedProduct & {
  shopifyReady: boolean;
  shopifyTemplate?: ShopifyProductTemplate;
  fulfillmentInfo?: ReturnType<typeof getFulfillmentInfo>;
} {
  const template = getShopifyTemplate(product.type);
  return {
    ...product,
    shopifyReady: !!template,
    shopifyTemplate: template || undefined,
    fulfillmentInfo: getFulfillmentInfo(product.type) || undefined,
  };
}
