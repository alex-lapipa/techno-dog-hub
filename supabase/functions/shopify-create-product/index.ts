/**
 * techno.dog - Shopify Product Create/Update Edge Function
 * 
 * Uses unified ShopifyClient for all Admin API operations.
 * Supports product creation, updates, collection assignment, and hybrid fulfillment routing.
 * 
 * HYBRID FULFILLMENT MODEL:
 * 1. PRINTFUL (POD): Hoodies, tees, caps - auto-routed for print-on-demand
 * 2. PACKLINK PRO: Vinyl, equipment, accessories - shipping automation for inventory items
 * 3. MANUAL: Default for unclassified products
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createShopifyClient, type ShopifyProductInput, type ShopifyVariantInput } from '../_shared/shopify-client.ts';
import { createLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// FULFILLMENT SERVICE DETECTION
// ============================================

// POD product types → Printful
const POD_PRODUCT_TYPES = [
  'hoodie', 't-shirt', 'tee', 'shirt', 'cap', 'hat', 'beanie',
  'tote-bag', 'tote bag', 'bandana', 'mug', 'poster', 'canvas',
  'long-sleeve', 'crewneck', 'sweatshirt', 'tank-top', 'tank top',
  'backpack', 'pillow', 'phone-case', 'phone case', 'mousepad'
];

// Inventory product types → Packlink PRO
const PACKLINK_PRODUCT_TYPES = [
  'vinyl', 'record', 'lp', 'ep', 'album',
  'equipment', 'hardware', 'synth', 'drum-machine',
  'accessory', 'cable', 'stand', 'case',
  'pre-made', 'physical', 'inventory'
];

type FulfillmentProvider = 'printful' | 'packlink-pro' | 'manual';

interface FulfillmentConfig {
  provider: FulfillmentProvider;
  service: string; // Shopify fulfillment_service value
  inventoryPolicy: 'continue' | 'deny';
  inventoryManagement: 'shopify' | 'printful';
  tags: string[];
}

function determineFulfillment(productType: string): FulfillmentConfig {
  const normalized = productType.toLowerCase().trim();
  
  // Check for Printful POD
  if (POD_PRODUCT_TYPES.some(type => normalized.includes(type))) {
    return {
      provider: 'printful',
      service: 'printful',
      inventoryPolicy: 'continue', // POD = always available
      inventoryManagement: 'shopify',
      tags: ['print-on-demand', 'printful', 'pod-fulfillment'],
    };
  }
  
  // Check for Packlink PRO inventory
  if (PACKLINK_PRODUCT_TYPES.some(type => normalized.includes(type))) {
    return {
      provider: 'packlink-pro',
      service: 'manual', // Packlink handles shipping, not fulfillment API
      inventoryPolicy: 'deny', // Inventory items have stock limits
      inventoryManagement: 'shopify',
      tags: ['packlink-pro', 'inventory-shipping', 'warehouse-fulfillment'],
    };
  }
  
  // Default to manual
  return {
    provider: 'manual',
    service: 'manual',
    inventoryPolicy: 'deny',
    inventoryManagement: 'shopify',
    tags: ['manual-fulfillment'],
  };
}

// ============================================
// VARIANT PROCESSING
// ============================================

function applyFulfillmentDefaults(
  variants: ShopifyVariantInput[], 
  config: FulfillmentConfig
): ShopifyVariantInput[] {
  return variants.map(variant => ({
    ...variant,
    fulfillment_service: config.service,
    inventory_policy: config.inventoryPolicy,
    inventory_management: config.inventoryManagement,
    requires_shipping: true,
    taxable: true,
  }));
}

// ============================================
// METAFIELD INJECTION
// ============================================

function injectFulfillmentMetafields(
  existingMetafields: Array<{ namespace: string; key: string; value: string; type: string }> = [],
  config: FulfillmentConfig
): Array<{ namespace: string; key: string; value: string; type: string }> {
  const fulfillmentMetafields = [
    {
      namespace: 'fulfillment',
      key: 'provider',
      value: config.provider,
      type: 'single_line_text_field',
    },
    {
      namespace: 'fulfillment',
      key: 'auto_route',
      value: config.provider !== 'manual' ? 'true' : 'false',
      type: 'boolean',
    },
    {
      namespace: 'fulfillment',
      key: 'service_type',
      value: config.provider === 'printful' ? 'print-on-demand' : 
             config.provider === 'packlink-pro' ? 'shipping-automation' : 'manual',
      type: 'single_line_text_field',
    },
  ];
  
  // Add provider-specific metafields
  if (config.provider === 'printful') {
    fulfillmentMetafields.push({
      namespace: 'printful',
      key: 'integration_status',
      value: 'connected',
      type: 'single_line_text_field',
    });
  } else if (config.provider === 'packlink-pro') {
    fulfillmentMetafields.push({
      namespace: 'packlink',
      key: 'shipping_enabled',
      value: 'true',
      type: 'boolean',
    });
  }
  
  // Merge without duplicates
  const metafieldKeys = new Set(existingMetafields.map(m => `${m.namespace}:${m.key}`));
  const newMetafields = fulfillmentMetafields.filter(m => !metafieldKeys.has(`${m.namespace}:${m.key}`));
  
  return [...existingMetafields, ...newMetafields];
}

interface RequestBody {
  product: ShopifyProductInput;
  draftId?: string;
  action?: 'create' | 'update';
  productId?: string;
  collectionIds?: string[];
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const logger = createLogger('shopify-create-product', requestId);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Shopify client (uses native Lovable integration)
    const shopify = createShopifyClient({ requestId });

    const { product, draftId, action = 'create', productId, collectionIds }: RequestBody = await req.json();

    if (!product || !product.title) {
      return new Response(
        JSON.stringify({ error: 'Product title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const productType = product.product_type || '';
    const fulfillmentConfig = determineFulfillment(productType);
    const isUpdate = action === 'update' && productId;
    
    logger.info(`${isUpdate ? 'Updating' : 'Creating'} product`, { 
      title: product.title, 
      productId,
      productType,
      fulfillmentProvider: fulfillmentConfig.provider,
      variantCount: product.variants?.length || 0,
    });

    // Apply fulfillment defaults to variants
    const processedVariants = product.variants 
      ? applyFulfillmentDefaults(product.variants, fulfillmentConfig)
      : undefined;
    
    // Inject fulfillment metafields
    const processedMetafields = injectFulfillmentMetafields(
      product.metafields || [],
      fulfillmentConfig
    );

    // Merge fulfillment tags with existing tags
    const existingTags = Array.isArray(product.tags) 
      ? product.tags 
      : (product.tags || '').split(',').map(t => t.trim()).filter(Boolean);
    const allTags = [...new Set([...existingTags, ...fulfillmentConfig.tags])];

    // Build final product payload
    const finalProduct: ShopifyProductInput = {
      ...product,
      variants: processedVariants,
      metafields: processedMetafields.length > 0 ? processedMetafields : undefined,
      tags: allTags.join(', '),
    };

    // Execute product create/update
    const result = isUpdate
      ? await shopify.updateProduct(productId, finalProduct)
      : await shopify.createProduct(finalProduct);

    if (!result.success) {
      logger.error('Shopify API error', { error: result.error, statusCode: result.statusCode });
      return new Response(
        JSON.stringify({ 
          error: 'Shopify API error', 
          details: result.error 
        }),
        { status: result.statusCode || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const createdProduct = result.data?.product;
    logger.info(`Product ${isUpdate ? 'updated' : 'created'} successfully`, { 
      id: createdProduct.id, 
      handle: createdProduct.handle,
      fulfillmentProvider: fulfillmentConfig.provider,
      fulfillmentService: fulfillmentConfig.service,
    });

    // Handle collection assignment if provided
    if (collectionIds && collectionIds.length > 0) {
      logger.info('Assigning to collections', { count: collectionIds.length });
      
      for (const collectionId of collectionIds) {
        const collectResult = await shopify.assignProductToCollection(createdProduct.id, collectionId);
        if (!collectResult.success) {
          logger.warn('Collection assignment failed', { collectionId, error: collectResult.error });
        }
      }
    }

    // Audit logging
    if (draftId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('admin_audit_log').insert({
          action_type: isUpdate ? 'shopify_product_updated' : 'shopify_product_created',
          entity_type: 'product',
          entity_id: createdProduct.id.toString(),
          admin_user_id: '00000000-0000-0000-0000-000000000000',
          details: {
            draftId,
            requestId,
            productTitle: createdProduct.title,
            productId: createdProduct.id,
            handle: createdProduct.handle,
            status: createdProduct.status,
            variantsCount: createdProduct.variants?.length || 0,
            collectionsAssigned: collectionIds?.length || 0,
            fulfillmentProvider: fulfillmentConfig.provider,
            fulfillmentService: fulfillmentConfig.service,
            isPOD: fulfillmentConfig.provider === 'printful',
            isPacklink: fulfillmentConfig.provider === 'packlink-pro',
          },
        });

        // Update draft status to published
        await supabase
          .from('shopify_studio_drafts')
          .update({
            status: 'published',
            shopify_product_id: createdProduct.id.toString(),
            shopify_product_handle: createdProduct.handle,
            published_at: new Date().toISOString(),
          })
          .eq('id', draftId);

      } catch (auditError) {
        logger.warn('Audit/draft update failed', { error: String(auditError) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        action: isUpdate ? 'updated' : 'created',
        product: {
          id: createdProduct.id,
          handle: createdProduct.handle,
          title: createdProduct.title,
          status: createdProduct.status,
          variants_count: createdProduct.variants?.length || 0,
          images_count: createdProduct.images?.length || 0,
          admin_url: shopify.getAdminUrl(`/products/${createdProduct.id}`),
          storefront_url: shopify.getStorefrontUrl(createdProduct.handle),
        },
        fulfillment: {
          provider: fulfillmentConfig.provider,
          service: fulfillmentConfig.service,
          isPOD: fulfillmentConfig.provider === 'printful',
          isPacklink: fulfillmentConfig.provider === 'packlink-pro',
          autoRoute: fulfillmentConfig.provider !== 'manual',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Request failed', { error: String(error) });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
