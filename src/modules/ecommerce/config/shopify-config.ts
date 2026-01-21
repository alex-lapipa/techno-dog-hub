/**
 * techno.dog E-commerce Module - Shopify Configuration
 * 
 * Centralized Shopify configuration for the e-commerce module.
 * Single source of truth for Shopify Admin URLs and settings.
 * 
 * NOTE: Storefront API credentials are in src/lib/shopify.ts
 * This file is for Admin-side configuration only.
 */

// Store identifier
export const SHOPIFY_STORE_ID = 'technodog-d3wkq';

// Admin URLs
export const SHOPIFY_ADMIN_URL = `https://admin.shopify.com/store/${SHOPIFY_STORE_ID}`;

// Admin API version (for edge functions)
export const SHOPIFY_ADMIN_API_VERSION = '2025-07';

// Quick-access paths
export const SHOPIFY_ADMIN_PATHS = {
  // Core
  dashboard: '',
  products: '/products',
  inventory: '/products/inventory',
  collections: '/collections',
  
  // Orders & Customers
  orders: '/orders',
  draftOrders: '/draft_orders',
  customers: '/customers',
  
  // Marketing & Discounts
  discounts: '/discounts',
  discountsNew: '/discounts/new',
  discountsAutomatic: '/discounts?type=automatic',
  marketing: '/marketing',
  
  // Analytics
  analytics: '/analytics',
  analyticsSales: '/analytics/reports/finances_summary',
  analyticsTraffic: '/analytics/reports/sessions_over_time',
  analyticsProducts: '/analytics/reports/product_views',
  
  // Settings
  settings: '/settings',
  settingsShipping: '/settings/shipping',
  settingsPayments: '/settings/payments',
  settingsCheckout: '/settings/checkout',
} as const;

/**
 * Get full Shopify Admin URL for a given path
 */
export function getShopifyAdminUrl(path: keyof typeof SHOPIFY_ADMIN_PATHS | string = ''): string {
  const adminPath = typeof path === 'string' && path in SHOPIFY_ADMIN_PATHS
    ? SHOPIFY_ADMIN_PATHS[path as keyof typeof SHOPIFY_ADMIN_PATHS]
    : path;
  return `${SHOPIFY_ADMIN_URL}${adminPath}`;
}

/**
 * Open Shopify Admin in a new tab
 */
export function openShopifyAdmin(path: keyof typeof SHOPIFY_ADMIN_PATHS | string = ''): void {
  window.open(getShopifyAdminUrl(path), '_blank');
}
