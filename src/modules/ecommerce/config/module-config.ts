/**
 * techno.dog E-commerce Module Configuration
 * 
 * Adapted for the techno.dog design system.
 * This module is 100% additive and does not modify existing Shopify configuration.
 */

export const MODULE_CONFIG = {
  /**
   * READ_ONLY Mode
   * When true, all mutation actions are disabled.
   * This module is designed for monitoring/viewing only.
   */
  READ_ONLY: true,

  /**
   * Module Metadata
   */
  MODULE_NAME: 'techno.dog-ops',
  VERSION: '1.1.0',
  
  /**
   * Feature Flags
   */
  FEATURES: {
    ECOMMERCE_OPS: true,
    CREATIVE_STUDIO: true,
    ANALYTICS: true,
    PRINTFUL_POD: true,
    PACKLINK_PRO: true,
  },
  
  /**
   * Printful POD Configuration
   */
  PRINTFUL: {
    ENABLED: true,
    DEFAULT_MARGIN_PERCENT: 60,
    FULFILLMENT_SERVICE: 'printful',
  },

  /**
   * Packlink PRO Shipping Configuration
   */
  PACKLINK: {
    ENABLED: true,
    SHOPIFY_APP_PATH: '/apps/packlink-pro',
    FULFILLMENT_TYPE: 'shipping-automation',
  },

  /**
   * UI Configuration - Adapted for EUR market
   */
  UI: {
    ITEMS_PER_PAGE: 20,
    SHOW_READ_ONLY_BADGE: true,
    DATE_FORMAT: 'en-GB',
    CURRENCY: 'EUR',
    CURRENCY_SYMBOL: '€',
  },

  /**
   * Order Number Prefix
   */
  ORDER_PREFIX: 'TD',

  /**
   * Mock Data Configuration
   */
  MOCK: {
    ENABLE_MOCK_DATA: true,
    SIMULATE_LATENCY: false,
    LATENCY_MS: 300,
  },
} as const;

export type ModuleConfig = typeof MODULE_CONFIG;

export function canMutate(): boolean {
  return !MODULE_CONFIG.READ_ONLY;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(MODULE_CONFIG.UI.DATE_FORMAT, {
    style: 'currency',
    currency: MODULE_CONFIG.UI.CURRENCY,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(MODULE_CONFIG.UI.DATE_FORMAT, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  const padded = String(sequence).padStart(4, '0');
  return `${MODULE_CONFIG.ORDER_PREFIX}-${year}-${padded}`;
}
