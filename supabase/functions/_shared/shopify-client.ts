/**
 * techno.dog - Unified Shopify Admin API Client
 * 
 * Uses Lovable's native Shopify integration via injected environment variables.
 * Provides centralized error handling, retries, and logging for all Shopify Admin operations.
 */

import { createLogger } from './logger.ts';

// ============================================
// CONFIGURATION (from Lovable native integration)
// ============================================

const SHOPIFY_STORE_DOMAIN = 'technodog-d3wkq.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const ADMIN_URL_BASE = 'https://admin.shopify.com/store/technodog-d3wkq';

// ============================================
// TYPES
// ============================================

export interface ShopifyClientConfig {
  requestId?: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface ShopifyApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  retryCount?: number;
}

export interface ShopifyProductInput {
  title: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  tags?: string | string[];
  status?: 'active' | 'draft' | 'archived';
  handle?: string;
  template_suffix?: string;
  variants?: ShopifyVariantInput[];
  options?: Array<{ name: string; values: string[]; position?: number }>;
  images?: Array<{ src: string; alt?: string; position?: number }>;
  metafields?: ShopifyMetafieldInput[];
  seo?: { title?: string; description?: string };
}

export interface ShopifyVariantInput {
  title?: string;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  price: string;
  compare_at_price?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  weight_unit?: string;
  grams?: number;
  inventory_management?: string;
  inventory_policy?: string;
  fulfillment_service?: string;
  requires_shipping?: boolean;
  taxable?: boolean;
}

export interface ShopifyMetafieldInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ShopifyPriceRuleInput {
  title: string;
  target_type: 'line_item' | 'shipping_line';
  target_selection: 'all' | 'entitled';
  allocation_method: 'across' | 'each';
  value_type: 'percentage' | 'fixed_amount';
  value: string;
  customer_selection: 'all' | 'prerequisite';
  starts_at: string;
  ends_at?: string | null;
  usage_limit?: number | null;
  once_per_customer?: boolean;
  prerequisite_subtotal_range?: { greater_than_or_equal_to: string } | null;
}

// ============================================
// CLIENT CLASS
// ============================================

export class ShopifyClient {
  private accessToken: string;
  private baseUrl: string;
  private logger: ReturnType<typeof createLogger>;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(config: ShopifyClientConfig = {}) {
    const token = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!token) {
      throw new Error('SHOPIFY_ACCESS_TOKEN not configured - ensure Lovable Shopify integration is enabled');
    }
    
    this.accessToken = token;
    this.baseUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;
    this.logger = createLogger('shopify-client', config.requestId);
    this.maxRetries = config.maxRetries ?? 2;
    this.retryDelayMs = config.retryDelayMs ?? 1000;
  }

  // ─── CORE REQUEST METHOD ───
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
    } = {}
  ): Promise<ShopifyApiResponse<T>> {
    const { method = 'GET', body } = options;
    const url = `${this.baseUrl}${endpoint}`;
    
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= this.maxRetries) {
      try {
        this.logger.info(`Shopify API ${method} ${endpoint}`, { 
          retry: retryCount > 0 ? retryCount : undefined 
        });

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.accessToken,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '2', 10);
          this.logger.warn('Rate limited by Shopify', { retryAfter });
          await this.delay(retryAfter * 1000);
          retryCount++;
          continue;
        }

        // Handle authentication errors (don't retry)
        if (response.status === 401 || response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          this.logger.error('Shopify authentication failed', { 
            status: response.status,
            error: errorData 
          });
          return {
            success: false,
            error: `Authentication failed: ${JSON.stringify(errorData.errors || errorData)}`,
            statusCode: response.status,
          };
        }

        // Handle successful responses
        if (response.ok || response.status === 204) {
          const data = response.status === 204 ? null : await response.json();
          return {
            success: true,
            data: data as T,
            statusCode: response.status,
            retryCount: retryCount > 0 ? retryCount : undefined,
          };
        }

        // Handle other errors
        const errorData = await response.json().catch(() => ({}));
        
        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < this.maxRetries) {
          this.logger.warn('Shopify server error, retrying', { 
            status: response.status,
            error: errorData 
          });
          await this.delay(this.retryDelayMs * (retryCount + 1));
          retryCount++;
          continue;
        }

        return {
          success: false,
          error: JSON.stringify(errorData.errors || errorData),
          statusCode: response.status,
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.error('Shopify request failed', { error: lastError.message });
        
        if (retryCount < this.maxRetries) {
          await this.delay(this.retryDelayMs * (retryCount + 1));
          retryCount++;
          continue;
        }
        break;
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
      retryCount,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ─── PRODUCTS ───
  
  async createProduct(product: ShopifyProductInput): Promise<ShopifyApiResponse<{ product: any }>> {
    const cleanProduct = this.cleanProductPayload(product);
    return this.request<{ product: any }>('/products.json', {
      method: 'POST',
      body: { product: cleanProduct },
    });
  }

  async updateProduct(productId: string | number, product: Partial<ShopifyProductInput>): Promise<ShopifyApiResponse<{ product: any }>> {
    const numericId = typeof productId === 'string' ? productId.split('/').pop() : productId;
    const cleanProduct = this.cleanProductPayload(product as ShopifyProductInput);
    return this.request<{ product: any }>(`/products/${numericId}.json`, {
      method: 'PUT',
      body: { product: cleanProduct },
    });
  }

  async getProduct(productId: string | number): Promise<ShopifyApiResponse<{ product: any }>> {
    const numericId = typeof productId === 'string' ? productId.split('/').pop() : productId;
    return this.request<{ product: any }>(`/products/${numericId}.json`);
  }

  async listProducts(limit = 50): Promise<ShopifyApiResponse<{ products: any[] }>> {
    return this.request<{ products: any[] }>(`/products.json?limit=${limit}`);
  }

  // ─── VARIANTS ───

  async updateVariant(variantId: string | number, variant: Partial<ShopifyVariantInput>): Promise<ShopifyApiResponse<{ variant: any }>> {
    const numericId = typeof variantId === 'string' ? variantId.split('/').pop() : variantId;
    return this.request<{ variant: any }>(`/variants/${numericId}.json`, {
      method: 'PUT',
      body: { variant },
    });
  }

  async getVariant(variantId: string | number): Promise<ShopifyApiResponse<{ variant: any }>> {
    const numericId = typeof variantId === 'string' ? variantId.split('/').pop() : variantId;
    return this.request<{ variant: any }>(`/variants/${numericId}.json`);
  }

  private cleanProductPayload(product: ShopifyProductInput): Record<string, unknown> {
    return {
      ...product,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags,
      body_html: product.body_html || '',
      vendor: product.vendor || 'techno.dog',
      product_type: product.product_type || '',
    };
  }

  // ─── COLLECTIONS ───

  async assignProductToCollection(productId: number, collectionId: string | number): Promise<ShopifyApiResponse<{ collect: any }>> {
    const numericCollectionId = typeof collectionId === 'string' 
      ? (collectionId.includes('gid://') ? collectionId.split('/').pop() : collectionId)
      : collectionId;

    if (!numericCollectionId) {
      return { success: false, error: 'Invalid collection ID' };
    }

    return this.request<{ collect: any }>('/collects.json', {
      method: 'POST',
      body: {
        collect: {
          product_id: productId,
          collection_id: parseInt(String(numericCollectionId), 10),
        },
      },
    });
  }

  // ─── PRICE RULES (PROMOTIONS) ───

  async listPriceRules(limit = 50): Promise<ShopifyApiResponse<{ price_rules: any[] }>> {
    return this.request<{ price_rules: any[] }>(`/price_rules.json?limit=${limit}`);
  }

  async createPriceRule(priceRule: ShopifyPriceRuleInput): Promise<ShopifyApiResponse<{ price_rule: any }>> {
    return this.request<{ price_rule: any }>('/price_rules.json', {
      method: 'POST',
      body: { price_rule: priceRule },
    });
  }

  async deletePriceRule(priceRuleId: number): Promise<ShopifyApiResponse<null>> {
    return this.request<null>(`/price_rules/${priceRuleId}.json`, {
      method: 'DELETE',
    });
  }

  // ─── DISCOUNT CODES ───

  async listDiscountCodes(priceRuleId: number): Promise<ShopifyApiResponse<{ discount_codes: any[] }>> {
    return this.request<{ discount_codes: any[] }>(`/price_rules/${priceRuleId}/discount_codes.json`);
  }

  async createDiscountCode(priceRuleId: number, code: string): Promise<ShopifyApiResponse<{ discount_code: any }>> {
    return this.request<{ discount_code: any }>(`/price_rules/${priceRuleId}/discount_codes.json`, {
      method: 'POST',
      body: { discount_code: { code } },
    });
  }

  // ─── UTILITIES ───

  getAdminUrl(path = ''): string {
    return `${ADMIN_URL_BASE}${path}`;
  }

  getStorefrontUrl(handle: string): string {
    return `https://${SHOPIFY_STORE_DOMAIN}/products/${handle}`;
  }

  static getStoreDomain(): string {
    return SHOPIFY_STORE_DOMAIN;
  }

  static getApiVersion(): string {
    return SHOPIFY_API_VERSION;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createShopifyClient(config: ShopifyClientConfig = {}): ShopifyClient {
  return new ShopifyClient(config);
}
