/**
 * techno.dog - Packlink PRO Integration Configuration
 * 
 * Packlink PRO is used for non-POD inventory fulfillment and shipping logistics.
 * This works alongside Printful for a hybrid fulfillment model:
 * - Printful: Print-on-demand items (hoodies, tees, caps)
 * - Packlink PRO: Pre-made inventory, vinyl, equipment, accessories
 */

// ============================================
// PACKLINK PRO CONFIGURATION
// ============================================

export const PACKLINK_CONFIG = {
  /**
   * Feature flag - set to true when Packlink PRO is configured in Shopify
   */
  ENABLED: true,

  /**
   * Packlink PRO app URL in Shopify Admin
   */
  SHOPIFY_APP_PATH: '/apps/packlink-pro',

  /**
   * Default carrier preferences (can be configured in Packlink dashboard)
   */
  PREFERRED_CARRIERS: [
    'DHL Express',
    'UPS',
    'DPD',
    'GLS',
    'Correos Express',
  ],

  /**
   * Fulfillment service identifier
   */
  FULFILLMENT_SERVICE: 'packlink-pro' as const,

  /**
   * Product types that should use Packlink PRO for fulfillment
   * (non-POD items that require warehouse shipping)
   */
  ELIGIBLE_PRODUCT_TYPES: [
    'vinyl',
    'record',
    'equipment',
    'accessory',
    'hardware',
    'pre-made',
    'physical',
  ],
} as const;

// ============================================
// SHIPPING ZONE ESTIMATES
// ============================================

export interface PacklinkShippingZone {
  id: string;
  name: string;
  countries: string[];
  estimatedDays: string;
  description: string;
}

export const PACKLINK_SHIPPING_ZONES: PacklinkShippingZone[] = [
  {
    id: 'eu-domestic',
    name: 'EU Domestic',
    countries: ['ES', 'DE', 'FR', 'IT', 'NL', 'BE', 'PT', 'AT'],
    estimatedDays: '2-4 days',
    description: 'Express delivery within EU mainland',
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    countries: ['GB'],
    estimatedDays: '3-5 days',
    description: 'Post-Brexit tracked delivery',
  },
  {
    id: 'usa-canada',
    name: 'North America',
    countries: ['US', 'CA'],
    estimatedDays: '5-10 days',
    description: 'International express via DHL/UPS',
  },
  {
    id: 'worldwide',
    name: 'Rest of World',
    countries: [],
    estimatedDays: '7-21 days',
    description: 'International standard with tracking',
  },
];

// ============================================
// SHOPIFY VARIANT DEFAULTS FOR PACKLINK
// ============================================

export interface PacklinkShopifyConfig {
  fulfillment_service: 'manual'; // Packlink uses manual fulfillment with shipping automation
  inventory_management: 'shopify';
  inventory_policy: 'deny'; // Non-POD items have limited stock
  requires_shipping: true;
}

export const PACKLINK_SHOPIFY_DEFAULTS: PacklinkShopifyConfig = {
  fulfillment_service: 'manual', // Packlink integrates at shipping level, not fulfillment API
  inventory_management: 'shopify',
  inventory_policy: 'deny', // Stop selling when out of stock
  requires_shipping: true,
};

// ============================================
// METAFIELD CONFIGURATION
// ============================================

export const PACKLINK_METAFIELD_NAMESPACE = 'packlink';

export const PACKLINK_METAFIELDS = {
  enabled: {
    namespace: PACKLINK_METAFIELD_NAMESPACE,
    key: 'enabled',
    type: 'boolean',
  },
  carrier_preference: {
    namespace: PACKLINK_METAFIELD_NAMESPACE,
    key: 'carrier_preference',
    type: 'single_line_text_field',
  },
  warehouse_location: {
    namespace: PACKLINK_METAFIELD_NAMESPACE,
    key: 'warehouse_location',
    type: 'single_line_text_field',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if a product type should use Packlink PRO for fulfillment
 */
export function isPacklinkProduct(productType: string): boolean {
  if (!productType) return false;
  const normalized = productType.toLowerCase().trim();
  return PACKLINK_CONFIG.ELIGIBLE_PRODUCT_TYPES.some(
    type => normalized.includes(type) || type.includes(normalized)
  );
}

/**
 * Get shipping zone by country code
 */
export function getShippingZoneForCountry(countryCode: string): PacklinkShippingZone {
  const zone = PACKLINK_SHIPPING_ZONES.find(z => 
    z.countries.includes(countryCode.toUpperCase())
  );
  return zone || PACKLINK_SHIPPING_ZONES[PACKLINK_SHIPPING_ZONES.length - 1]; // Default to worldwide
}

/**
 * Apply Packlink defaults to variant configuration
 */
export function applyPacklinkDefaults<T extends Record<string, unknown>>(
  variant: T
): T & PacklinkShopifyConfig {
  return {
    ...variant,
    ...PACKLINK_SHOPIFY_DEFAULTS,
  };
}

/**
 * Generate Packlink-specific metafields for a product
 */
export function generatePacklinkMetafields(
  warehouseLocation: string = 'EU-ES-BCN'
): Array<{ namespace: string; key: string; value: string; type: string }> {
  return [
    {
      namespace: PACKLINK_METAFIELD_NAMESPACE,
      key: 'enabled',
      value: 'true',
      type: 'boolean',
    },
    {
      namespace: PACKLINK_METAFIELD_NAMESPACE,
      key: 'carrier_preference',
      value: PACKLINK_CONFIG.PREFERRED_CARRIERS[0],
      type: 'single_line_text_field',
    },
    {
      namespace: PACKLINK_METAFIELD_NAMESPACE,
      key: 'warehouse_location',
      value: warehouseLocation,
      type: 'single_line_text_field',
    },
  ];
}

/**
 * Determine which fulfillment service should handle a product
 */
export type FulfillmentService = 'printful' | 'packlink-pro' | 'manual';

export function determineFulfillmentService(
  productType: string,
  isPrintfulEligible: boolean = false
): FulfillmentService {
  // Printful takes priority for POD items
  if (isPrintfulEligible) return 'printful';
  
  // Packlink for eligible inventory products
  if (isPacklinkProduct(productType)) return 'packlink-pro';
  
  // Default to manual
  return 'manual';
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  PACKLINK_CONFIG,
  PACKLINK_SHIPPING_ZONES,
  PACKLINK_SHOPIFY_DEFAULTS,
  PACKLINK_METAFIELD_NAMESPACE,
  PACKLINK_METAFIELDS,
  isPacklinkProduct,
  getShippingZoneForCountry,
  applyPacklinkDefaults,
  generatePacklinkMetafields,
  determineFulfillmentService,
};
