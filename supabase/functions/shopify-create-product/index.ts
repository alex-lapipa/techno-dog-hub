/**
 * techno.dog - Shopify Product Create/Update Edge Function
 * 
 * Uses unified ShopifyClient for all Admin API operations.
 * Supports product creation, updates, and collection assignment.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createShopifyClient, type ShopifyProductInput } from '../_shared/shopify-client.ts';
import { createLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const isUpdate = action === 'update' && productId;
    logger.info(`${isUpdate ? 'Updating' : 'Creating'} product`, { title: product.title, productId });

    // Execute product create/update
    const result = isUpdate
      ? await shopify.updateProduct(productId, product)
      : await shopify.createProduct(product);

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
      handle: createdProduct.handle 
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
