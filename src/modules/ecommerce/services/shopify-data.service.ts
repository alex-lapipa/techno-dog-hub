/**
 * techno.dog E-commerce Module - Shopify Data Service
 * 
 * Connects to live Shopify data via Storefront API.
 * This is READ-ONLY and does not modify any Shopify configuration.
 */

import { fetchProducts, fetchCollections } from '@/lib/shopify';
import type { DashboardKPI } from '../types/ecommerce.types';
import { MODULE_CONFIG } from '../config/module-config';

// ============================================
// SHOPIFY PRODUCT STATS
// ============================================

export interface ShopifyStats {
  totalProducts: number;
  totalVariants: number;
  availableVariants: number;
  outOfStockVariants: number;
  totalCollections: number;
  productTypes: string[];
}

export async function fetchShopifyStats(): Promise<ShopifyStats> {
  try {
    const [products, collections] = await Promise.all([
      fetchProducts(250), // Max allowed by API
      fetchCollections(50),
    ]);

    let totalVariants = 0;
    let availableVariants = 0;
    const productTypesSet = new Set<string>();

    products.forEach((edge) => {
      const product = edge.node;
      if (product.productType) {
        productTypesSet.add(product.productType);
      }
      product.variants.edges.forEach((variantEdge) => {
        totalVariants++;
        if (variantEdge.node.availableForSale) {
          availableVariants++;
        }
      });
    });

    return {
      totalProducts: products.length,
      totalVariants,
      availableVariants,
      outOfStockVariants: totalVariants - availableVariants,
      totalCollections: collections.length,
      productTypes: Array.from(productTypesSet),
    };
  } catch (error) {
    console.error('[Shopify Data Service] Error fetching stats:', error);
    return {
      totalProducts: 0,
      totalVariants: 0,
      availableVariants: 0,
      outOfStockVariants: 0,
      totalCollections: 0,
      productTypes: [],
    };
  }
}

// ============================================
// DASHBOARD KPIs - LIVE FROM SHOPIFY
// ============================================

export async function fetchLiveKPIs(): Promise<DashboardKPI[]> {
  const stats = await fetchShopifyStats();
  
  return [
    {
      label: 'Products',
      value: stats.totalProducts.toString(),
      icon: 'shopping-bag',
    },
    {
      label: 'Variants',
      value: stats.totalVariants.toString(),
      icon: 'trending-up',
    },
    {
      label: 'In Stock',
      value: stats.availableVariants.toString(),
      icon: 'euro',
    },
    {
      label: 'Collections',
      value: stats.totalCollections.toString(),
      icon: 'percent',
    },
  ];
}

// ============================================
// INVENTORY FROM SHOPIFY (Read-Only View)
// ============================================

export interface ShopifyInventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  sku: string;
  availableForSale: boolean;
  price: string;
  currencyCode: string;
}

export async function fetchShopifyInventory(): Promise<ShopifyInventoryItem[]> {
  try {
    const products = await fetchProducts(250);
    const inventory: ShopifyInventoryItem[] = [];

    products.forEach((edge) => {
      const product = edge.node;
      product.variants.edges.forEach((variantEdge) => {
        const variant = variantEdge.node;
        inventory.push({
          id: variant.id,
          productId: product.id,
          productName: product.title,
          variantName: variant.title === 'Default Title' ? '-' : variant.title,
          sku: variant.id.split('/').pop() || '-',
          availableForSale: variant.availableForSale,
          price: variant.price.amount,
          currencyCode: variant.price.currencyCode,
        });
      });
    });

    return inventory;
  } catch (error) {
    console.error('[Shopify Data Service] Error fetching inventory:', error);
    return [];
  }
}

// ============================================
// CONNECTION STATUS
// ============================================

export interface ShopifyConnectionStatus {
  connected: boolean;
  storeDomain: string;
  lastChecked: Date;
  error?: string;
}

export async function checkShopifyConnection(): Promise<ShopifyConnectionStatus> {
  try {
    await fetchProducts(1);
    return {
      connected: true,
      storeDomain: 'technodog-d3wkq.myshopify.com',
      lastChecked: new Date(),
    };
  } catch (error) {
    return {
      connected: false,
      storeDomain: 'technodog-d3wkq.myshopify.com',
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
