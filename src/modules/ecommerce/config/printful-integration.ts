/**
 * Printful Integration Configuration for Shopify Creative Studio
 * 
 * This module provides the configuration bridge between Shopify products
 * and Printful's print-on-demand fulfillment service.
 * 
 * SHOPIFY-FIRST: All integrations work through Shopify's fulfillment_service API.
 * When a product is created with fulfillment_service: 'printful', Shopify
 * automatically routes orders to Printful for production and shipping.
 * 
 * @see https://developers.printful.com/docs
 * @see https://shopify.dev/docs/api/admin-rest/2025-07/resources/product-variant
 */

// ============================================================================
// PRINTFUL PRODUCT MAPPINGS
// ============================================================================

/**
 * Printful product IDs mapped to our internal product types.
 * These IDs correspond to Printful's catalog and are used for syncing.
 */
export const PRINTFUL_PRODUCT_IDS: Record<string, number> = {
  // Apparel
  'hoodie': 380, // Unisex Heavy Blend Hoodie (Gildan 18500)
  't-shirt': 586, // Unisex Staple T-Shirt (Bella + Canvas 3001)
  'long-sleeve': 594, // Unisex Long Sleeve Tee (Bella + Canvas 3501)
  'crewneck': 394, // Unisex Crew Neck Sweatshirt (Gildan 18000)
  'tank-top': 592, // Unisex Jersey Tank (Bella + Canvas 3480)
  
  // Accessories
  'cap': 203, // Snapback Hat (Yupoong 6089)
  'beanie': 227, // Knit Beanie (Sportsman SP12)
  'bandana': 429, // All-Over Print Bandana
  
  // Bags
  'tote-bag': 19, // Tote Bag (15" x 15")
  'backpack': 372, // Backpack (AOP)
  
  // Drinkware
  'mug': 19, // White Glossy Mug (11oz)
  'tumbler': 534, // Stainless Steel Tumbler
  
  // Home & Living
  'poster': 1, // Poster (Multiple sizes)
  'canvas': 24, // Canvas (Multiple sizes)
  'pillow': 26, // Throw Pillow (18" x 18")
  
  // Tech
  'phone-case': 194, // iPhone Case (Multiple models)
  'mousepad': 168, // Mousepad (9" x 7.5")
};

/**
 * Printful variant information per product type.
 * Used to map our size options to Printful's variant IDs.
 */
export interface PrintfulVariantInfo {
  printfulProductId: number;
  colorOptions: PrintfulColor[];
  sizeOptions: PrintfulSize[];
  printAreas: PrintfulPrintArea[];
  baseCost: number; // USD
  productionDays: number;
  shippingEstimate: string;
}

export interface PrintfulColor {
  id: string;
  name: string;
  hex: string;
  printfulColorName: string; // Printful's exact color name
}

export interface PrintfulSize {
  id: string;
  name: string;
  printfulSizeName: string; // Printful's exact size name
}

export interface PrintfulPrintArea {
  id: string;
  name: string;
  type: 'front' | 'back' | 'left_sleeve' | 'right_sleeve' | 'all_over' | 'embroidery';
  maxWidth: number; // inches
  maxHeight: number; // inches
  dpiRequired: number;
}

// ============================================================================
// PRINTFUL COLOR MAPPINGS (Aligned with techno.dog brand)
// ============================================================================

export const PRINTFUL_COLORS: PrintfulColor[] = [
  { id: 'black', name: 'Black', hex: '#1a1a1a', printfulColorName: 'Black' },
  { id: 'white', name: 'White', hex: '#ffffff', printfulColorName: 'White' },
  { id: 'navy', name: 'Navy', hex: '#1e3a5f', printfulColorName: 'Navy' },
  { id: 'charcoal', name: 'Charcoal Heather', hex: '#4a4a4a', printfulColorName: 'Dark Heather' },
  { id: 'forest', name: 'Forest Green', hex: '#228b22', printfulColorName: 'Forest Green' },
  { id: 'burgundy', name: 'Burgundy', hex: '#800020', printfulColorName: 'Maroon' },
  { id: 'heather-grey', name: 'Heather Grey', hex: '#9a9a9a', printfulColorName: 'Sport Grey' },
  { id: 'red', name: 'Red', hex: '#dc143c', printfulColorName: 'Red' },
  { id: 'royal', name: 'Royal Blue', hex: '#4169e1', printfulColorName: 'Royal' },
];

export const PRINTFUL_SIZES: PrintfulSize[] = [
  { id: 'xs', name: 'XS', printfulSizeName: 'XS' },
  { id: 's', name: 'S', printfulSizeName: 'S' },
  { id: 'm', name: 'M', printfulSizeName: 'M' },
  { id: 'l', name: 'L', printfulSizeName: 'L' },
  { id: 'xl', name: 'XL', printfulSizeName: 'XL' },
  { id: '2xl', name: '2XL', printfulSizeName: '2XL' },
  { id: '3xl', name: '3XL', printfulSizeName: '3XL' },
  { id: '4xl', name: '4XL', printfulSizeName: '4XL' },
  { id: '5xl', name: '5XL', printfulSizeName: '5XL' },
];

// ============================================================================
// PRINTFUL PRODUCT CONFIGURATIONS
// ============================================================================

export const PRINTFUL_PRODUCTS: Record<string, PrintfulVariantInfo> = {
  hoodie: {
    printfulProductId: 380,
    colorOptions: PRINTFUL_COLORS,
    sizeOptions: PRINTFUL_SIZES.filter(s => ['s', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'].includes(s.id)),
    printAreas: [
      { id: 'front', name: 'Front', type: 'front', maxWidth: 12, maxHeight: 16, dpiRequired: 300 },
      { id: 'back', name: 'Back', type: 'back', maxWidth: 14, maxHeight: 16, dpiRequired: 300 },
      { id: 'left_sleeve', name: 'Left Sleeve', type: 'left_sleeve', maxWidth: 4, maxHeight: 4, dpiRequired: 300 },
      { id: 'right_sleeve', name: 'Right Sleeve', type: 'right_sleeve', maxWidth: 4, maxHeight: 4, dpiRequired: 300 },
    ],
    baseCost: 22.95,
    productionDays: 3,
    shippingEstimate: '3-5 business days',
  },
  't-shirt': {
    printfulProductId: 586,
    colorOptions: PRINTFUL_COLORS,
    sizeOptions: PRINTFUL_SIZES.filter(s => ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl'].includes(s.id)),
    printAreas: [
      { id: 'front', name: 'Front', type: 'front', maxWidth: 12, maxHeight: 16, dpiRequired: 300 },
      { id: 'back', name: 'Back', type: 'back', maxWidth: 14, maxHeight: 16, dpiRequired: 300 },
    ],
    baseCost: 11.25,
    productionDays: 2,
    shippingEstimate: '3-5 business days',
  },
  cap: {
    printfulProductId: 203,
    colorOptions: PRINTFUL_COLORS.filter(c => ['black', 'white', 'navy', 'charcoal'].includes(c.id)),
    sizeOptions: [{ id: 'os', name: 'One Size', printfulSizeName: 'One size' }],
    printAreas: [
      { id: 'front', name: 'Front Panel', type: 'front', maxWidth: 4, maxHeight: 2.5, dpiRequired: 300 },
      { id: 'back', name: 'Back', type: 'back', maxWidth: 4, maxHeight: 2, dpiRequired: 300 },
    ],
    baseCost: 14.95,
    productionDays: 3,
    shippingEstimate: '3-5 business days',
  },
  'tote-bag': {
    printfulProductId: 19,
    colorOptions: PRINTFUL_COLORS.filter(c => ['black', 'white', 'navy'].includes(c.id)),
    sizeOptions: [{ id: 'standard', name: 'Standard', printfulSizeName: '15"x15"' }],
    printAreas: [
      { id: 'front', name: 'Front', type: 'front', maxWidth: 12, maxHeight: 12, dpiRequired: 300 },
      { id: 'back', name: 'Back', type: 'back', maxWidth: 12, maxHeight: 12, dpiRequired: 300 },
    ],
    baseCost: 9.95,
    productionDays: 3,
    shippingEstimate: '3-5 business days',
  },
  bandana: {
    printfulProductId: 429,
    colorOptions: [{ id: 'all-over', name: 'All-Over Print', hex: '#000000', printfulColorName: 'All-over print' }],
    sizeOptions: [{ id: 'os', name: 'One Size', printfulSizeName: '22"x22"' }],
    printAreas: [
      { id: 'all_over', name: 'All Over', type: 'all_over', maxWidth: 22, maxHeight: 22, dpiRequired: 150 },
    ],
    baseCost: 8.95,
    productionDays: 3,
    shippingEstimate: '3-5 business days',
  },
  beanie: {
    printfulProductId: 227,
    colorOptions: PRINTFUL_COLORS.filter(c => ['black', 'charcoal', 'navy', 'heather-grey'].includes(c.id)),
    sizeOptions: [{ id: 'os', name: 'One Size', printfulSizeName: 'One size' }],
    printAreas: [
      { id: 'embroidery', name: 'Front Embroidery', type: 'embroidery', maxWidth: 2.5, maxHeight: 2.5, dpiRequired: 300 },
    ],
    baseCost: 10.50,
    productionDays: 5,
    shippingEstimate: '3-5 business days',
  },
  mug: {
    printfulProductId: 19,
    colorOptions: [{ id: 'white', name: 'White', hex: '#ffffff', printfulColorName: 'White' }],
    sizeOptions: [
      { id: '11oz', name: '11 oz', printfulSizeName: '11oz' },
      { id: '15oz', name: '15 oz', printfulSizeName: '15oz' },
    ],
    printAreas: [
      { id: 'front', name: 'Wrap Around', type: 'front', maxWidth: 8.5, maxHeight: 3.5, dpiRequired: 300 },
    ],
    baseCost: 5.95,
    productionDays: 2,
    shippingEstimate: '3-5 business days',
  },
  poster: {
    printfulProductId: 1,
    colorOptions: [{ id: 'matte', name: 'Matte', hex: '#ffffff', printfulColorName: 'Matte' }],
    sizeOptions: [
      { id: '12x18', name: '12" x 18"', printfulSizeName: '12×18' },
      { id: '18x24', name: '18" x 24"', printfulSizeName: '18×24' },
      { id: '24x36', name: '24" x 36"', printfulSizeName: '24×36' },
    ],
    printAreas: [
      { id: 'front', name: 'Full Print', type: 'front', maxWidth: 36, maxHeight: 24, dpiRequired: 300 },
    ],
    baseCost: 7.50,
    productionDays: 2,
    shippingEstimate: '3-5 business days',
  },
};

// ============================================================================
// SHOPIFY FULFILLMENT SERVICE CONFIGURATION
// ============================================================================

/**
 * When publishing to Shopify with Printful as the fulfillment provider,
 * set these variant properties to enable automatic order routing.
 */
export interface PrintfulShopifyConfig {
  fulfillment_service: 'printful';
  inventory_management: 'shopify' | 'printful';
  inventory_policy: 'continue'; // POD = always available
  requires_shipping: true;
}

export const PRINTFUL_SHOPIFY_DEFAULTS: PrintfulShopifyConfig = {
  fulfillment_service: 'printful',
  inventory_management: 'shopify', // Shopify manages inventory display, Printful handles production
  inventory_policy: 'continue', // Always accept orders (POD model)
  requires_shipping: true,
};

/**
 * Metafield namespaces for Printful-specific product data.
 * These help with order routing and tracking.
 */
export const PRINTFUL_METAFIELD_NAMESPACE = 'printful';

export const PRINTFUL_METAFIELDS = {
  productId: {
    namespace: PRINTFUL_METAFIELD_NAMESPACE,
    key: 'product_id',
    type: 'number_integer' as const,
    description: 'Printful catalog product ID',
  },
  printAreas: {
    namespace: PRINTFUL_METAFIELD_NAMESPACE,
    key: 'print_areas',
    type: 'json' as const,
    description: 'Available print placement areas',
  },
  productionTime: {
    namespace: PRINTFUL_METAFIELD_NAMESPACE,
    key: 'production_days',
    type: 'number_integer' as const,
    description: 'Estimated production time in days',
  },
  baseCost: {
    namespace: PRINTFUL_METAFIELD_NAMESPACE,
    key: 'base_cost',
    type: 'number_decimal' as const,
    description: 'Base production cost (USD)',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get Printful configuration for a product type
 */
export function getPrintfulConfig(productType: string): PrintfulVariantInfo | null {
  const normalizedType = productType.toLowerCase().replace(/\s+/g, '-');
  return PRINTFUL_PRODUCTS[normalizedType] || null;
}

/**
 * Check if a product type is supported by Printful
 */
export function isPrintfulSupported(productType: string): boolean {
  return getPrintfulConfig(productType) !== null;
}

/**
 * Calculate retail price from base cost with margin
 */
export function calculateRetailPrice(
  baseCost: number,
  marginPercent: number = 60
): { cost: number; retail: number; profit: number } {
  const retail = baseCost / (1 - marginPercent / 100);
  const profit = retail - baseCost;
  return {
    cost: Math.round(baseCost * 100) / 100,
    retail: Math.round(retail * 100) / 100,
    profit: Math.round(profit * 100) / 100,
  };
}

/**
 * Generate Printful-specific metafields for a product
 */
export function generatePrintfulMetafields(
  productType: string
): Array<{ namespace: string; key: string; value: string; type: string }> {
  const config = getPrintfulConfig(productType);
  if (!config) return [];

  return [
    {
      namespace: PRINTFUL_METAFIELD_NAMESPACE,
      key: 'product_id',
      value: config.printfulProductId.toString(),
      type: 'number_integer',
    },
    {
      namespace: PRINTFUL_METAFIELD_NAMESPACE,
      key: 'print_areas',
      value: JSON.stringify(config.printAreas),
      type: 'json',
    },
    {
      namespace: PRINTFUL_METAFIELD_NAMESPACE,
      key: 'production_days',
      value: config.productionDays.toString(),
      type: 'number_integer',
    },
    {
      namespace: PRINTFUL_METAFIELD_NAMESPACE,
      key: 'base_cost',
      value: config.baseCost.toFixed(2),
      type: 'number_decimal',
    },
    {
      namespace: 'fulfillment',
      key: 'provider',
      value: 'printful',
      type: 'single_line_text_field',
    },
    {
      namespace: 'fulfillment',
      key: 'shipping_estimate',
      value: config.shippingEstimate,
      type: 'single_line_text_field',
    },
  ];
}

/**
 * Apply Printful defaults to a Shopify variant
 */
export function applyPrintfulDefaults<T extends Record<string, unknown>>(variant: T): T & PrintfulShopifyConfig {
  return {
    ...variant,
    ...PRINTFUL_SHOPIFY_DEFAULTS,
  };
}

/**
 * Get production and shipping estimate text
 */
export function getProductionEstimate(productType: string): string {
  const config = getPrintfulConfig(productType);
  if (!config) return 'Production: 3-5 business days';
  
  return `Production: ${config.productionDays} day${config.productionDays > 1 ? 's' : ''} • Shipping: ${config.shippingEstimate}`;
}

/**
 * Get print area requirements for design validation
 */
export function getPrintAreaRequirements(
  productType: string,
  areaId: string
): { width: number; height: number; dpi: number } | null {
  const config = getPrintfulConfig(productType);
  if (!config) return null;

  const area = config.printAreas.find(a => a.id === areaId);
  if (!area) return null;

  return {
    width: area.maxWidth,
    height: area.maxHeight,
    dpi: area.dpiRequired,
  };
}

export default {
  PRINTFUL_PRODUCTS,
  PRINTFUL_COLORS,
  PRINTFUL_SIZES,
  PRINTFUL_PRODUCT_IDS,
  PRINTFUL_SHOPIFY_DEFAULTS,
  getPrintfulConfig,
  isPrintfulSupported,
  calculateRetailPrice,
  generatePrintfulMetafields,
  applyPrintfulDefaults,
  getProductionEstimate,
};
