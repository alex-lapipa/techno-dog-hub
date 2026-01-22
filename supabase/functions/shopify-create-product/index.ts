/**
 * techno.dog - Shopify Product Create/Update Edge Function
 * 
 * Uses unified ShopifyClient for all Admin API operations.
 * Supports product creation, updates, collection assignment, and Printful POD routing.
 * 
 * PRINTFUL INTEGRATION:
 * When publishing POD products, this function automatically:
 * 1. Sets fulfillment_service to 'printful' for automatic order routing
 * 2. Sets inventory_policy to 'continue' (POD = always available)
 * 3. Injects Printful metafields for tracking
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createShopifyClient, type ShopifyProductInput, type ShopifyVariantInput } from '../_shared/shopify-client.ts';
import { createLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// POD product type detection
const POD_PRODUCT_TYPES = [
  'hoodie', 't-shirt', 'tee', 'shirt', 'cap', 'hat', 'beanie',
  'tote-bag', 'tote bag', 'bandana', 'mug', 'poster', 'canvas',
  'long-sleeve', 'crewneck', 'sweatshirt', 'tank-top', 'tank top',
  'backpack', 'pillow', 'phone-case', 'phone case', 'mousepad'
];

function isPrintfulProduct(productType: string): boolean {
  const normalized = productType.toLowerCase().trim();
  return POD_PRODUCT_TYPES.some(type => normalized.includes(type));
}

// Apply Printful defaults to variants
function applyPrintfulDefaults(variants: ShopifyVariantInput[], productType: string): ShopifyVariantInput[] {
  const isPOD = isPrintfulProduct(productType);
  
  if (!isPOD) return variants;
  
  return variants.map(variant => ({
    ...variant,
    // CRITICAL: Route orders to Printful for fulfillment
    fulfillment_service: 'printful',
    // POD model: Always continue selling (no stock limits)
    inventory_policy: 'continue',
    // Shopify manages display, Printful handles production
    inventory_management: 'shopify',
    // Physical goods require shipping
    requires_shipping: true,
    // POD products are taxable
    taxable: true,
  }));
}

// Inject Printful metafields for product tracking
function injectPrintfulMetafields(
  existingMetafields: Array<{ namespace: string; key: string; value: string; type: string }> = [],
  productType: string
): Array<{ namespace: string; key: string; value: string; type: string }> {
  const isPOD = isPrintfulProduct(productType);
  
  if (!isPOD) return existingMetafields;
  
  const printfulMetafields = [
    {
      namespace: 'fulfillment',
      key: 'provider',
      value: 'printful',
      type: 'single_line_text_field',
    },
    {
      namespace: 'fulfillment',
      key: 'production_model',
      value: 'print-on-demand',
      type: 'single_line_text_field',
    },
    {
      namespace: 'fulfillment',
      key: 'auto_route',
      value: 'true',
      type: 'boolean',
    },
    {
      namespace: 'printful',
      key: 'integration_status',
      value: 'connected',
      type: 'single_line_text_field',
    },
  ];
  
  // Merge without duplicates
  const metafieldKeys = new Set(existingMetafields.map(m => `${m.namespace}:${m.key}`));
  const newMetafields = printfulMetafields.filter(m => !metafieldKeys.has(`${m.namespace}:${m.key}`));
  
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
    const isPOD = isPrintfulProduct(productType);
    const isUpdate = action === 'update' && productId;
    
    logger.info(`${isUpdate ? 'Updating' : 'Creating'} product`, { 
      title: product.title, 
      productId,
      productType,
      isPOD,
      variantCount: product.variants?.length || 0,
    });

    // Apply Printful defaults to variants if POD product
    const processedVariants = product.variants 
      ? applyPrintfulDefaults(product.variants, productType)
      : undefined;
    
    // Inject Printful metafields if POD product
    const processedMetafields = injectPrintfulMetafields(
      product.metafields || [],
      productType
    );

    // Build final product payload
    const finalProduct: ShopifyProductInput = {
      ...product,
      variants: processedVariants,
      metafields: processedMetafields.length > 0 ? processedMetafields : undefined,
      // Add POD tags for Printful sync
      tags: isPOD 
        ? (Array.isArray(product.tags) 
            ? [...product.tags, 'print-on-demand', 'printful'].join(', ')
            : `${product.tags || ''}, print-on-demand, printful`.replace(/^, /, ''))
        : product.tags,
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
      isPOD,
      fulfillmentService: isPOD ? 'printful' : 'manual',
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
            isPOD,
            fulfillmentService: isPOD ? 'printful' : 'manual',
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
          provider: isPOD ? 'printful' : 'manual',
          isPOD,
          autoRoute: isPOD,
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
