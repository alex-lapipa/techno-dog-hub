/**
 * techno.dog E-commerce Module - Shopify Data Service
 * 
 * Connects to live Shopify data via Storefront API.
 * This is READ-ONLY and does not modify any Shopify configuration.
 * 
 * Enhanced with Printful POD integration detection and metrics.
 */

import { fetchProducts, fetchCollections } from '@/lib/shopify';
import { toast } from 'sonner';
import type { DashboardKPI } from '../types/ecommerce.types';
import { isPrintfulSupported, getPrintfulConfig } from '../config/printful-integration';

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
  // Printful POD metrics
  podProducts: number;
  standardProducts: number;
  avgProductionDays: number;
}

export async function fetchShopifyStats(): Promise<ShopifyStats> {
  try {
    const [products, collections] = await Promise.all([
      fetchProducts(250), // Max allowed by API
      fetchCollections(50),
    ]);

    let totalVariants = 0;
    let availableVariants = 0;
    let podProducts = 0;
    let totalProductionDays = 0;
    const productTypesSet = new Set<string>();

    products.forEach((edge) => {
      const product = edge.node;
      if (product.productType) {
        productTypesSet.add(product.productType);
        
        // Check if this product type is POD-supported
        if (isPrintfulSupported(product.productType)) {
          podProducts++;
          const config = getPrintfulConfig(product.productType);
          if (config) {
            totalProductionDays += config.productionDays;
          }
        }
      }
      product.variants.edges.forEach((variantEdge) => {
        totalVariants++;
        if (variantEdge.node.availableForSale) {
          availableVariants++;
        }
      });
    });

    const standardProducts = products.length - podProducts;
    const avgProductionDays = podProducts > 0 ? Math.round(totalProductionDays / podProducts) : 0;

    return {
      totalProducts: products.length,
      totalVariants,
      availableVariants,
      outOfStockVariants: totalVariants - availableVariants,
      totalCollections: collections.length,
      productTypes: Array.from(productTypesSet),
      podProducts,
      standardProducts,
      avgProductionDays,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Shopify Data Service] Error fetching stats:', error);
    
    // Show user-friendly toast for common errors
    if (errorMessage.includes('402') || errorMessage.includes('Payment required')) {
      toast.error('Shopify API Access Unavailable', {
        description: 'Your Shopify store requires an active billing plan to access API data.',
      });
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      toast.error('Network Error', {
        description: 'Unable to connect to Shopify. Please check your connection.',
      });
    }
    
    return {
      totalProducts: 0,
      totalVariants: 0,
      availableVariants: 0,
      outOfStockVariants: 0,
      totalCollections: 0,
      productTypes: [],
      podProducts: 0,
      standardProducts: 0,
      avgProductionDays: 0,
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
      label: 'POD Items',
      value: stats.podProducts.toString(),
      icon: 'printer',
      change: stats.podProducts > 0 ? '+Printful' : undefined,
    },
    {
      label: 'In Stock',
      value: stats.availableVariants.toString(),
      icon: 'check-circle',
    },
    {
      label: 'Collections',
      value: stats.totalCollections.toString(),
      icon: 'folder',
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
  productType: string;
  variantName: string;
  sku: string;
  availableForSale: boolean;
  price: string;
  currencyCode: string;
  // Printful POD fields
  isPOD: boolean;
  fulfillmentService: 'printful' | 'manual' | 'standard';
  productionDays: number | null;
  baseCost: number | null;
}

export async function fetchShopifyInventory(): Promise<ShopifyInventoryItem[]> {
  try {
    const products = await fetchProducts(250);
    const inventory: ShopifyInventoryItem[] = [];

    products.forEach((edge) => {
      const product = edge.node;
      const productType = product.productType || '';
      const isPOD = isPrintfulSupported(productType);
      const printfulConfig = isPOD ? getPrintfulConfig(productType) : null;
      
      product.variants.edges.forEach((variantEdge) => {
        const variant = variantEdge.node;
        inventory.push({
          id: variant.id,
          productId: product.id,
          productName: product.title,
          productType,
          variantName: variant.title === 'Default Title' ? '-' : variant.title,
          sku: variant.id.split('/').pop() || '-',
          availableForSale: variant.availableForSale,
          price: variant.price.amount,
          currencyCode: variant.price.currencyCode,
          isPOD,
          fulfillmentService: isPOD ? 'printful' : 'standard',
          productionDays: printfulConfig?.productionDays ?? null,
          baseCost: printfulConfig?.baseCost ?? null,
        });
      });
    });

    return inventory;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Shopify Data Service] Error fetching inventory:', error);
    
    // Show user-friendly toast for common errors
    if (errorMessage.includes('402') || errorMessage.includes('Payment required')) {
      toast.error('Shopify API Access Unavailable', {
        description: 'Your Shopify store requires an active billing plan to access inventory data.',
      });
    }
    
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
