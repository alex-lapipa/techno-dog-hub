/**
 * techno.dog - Shopify Product Create/Update Edge Function
 * 
 * Full Shopify Admin API integration for Creative Studio.
 * Supports product creation, updates, and collection assignment.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'technodog-d3wkq.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';
const ADMIN_URL_BASE = 'https://admin.shopify.com/store/technodog-d3wkq';

interface ShopifyVariantInput {
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

interface ShopifyMetafieldInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

interface ShopifyProductInput {
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

interface RequestBody {
  product: ShopifyProductInput;
  draftId?: string;
  action?: 'create' | 'update';
  productId?: string;
  collectionIds?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN not configured');
    }

    const { product, draftId, action = 'create', productId, collectionIds }: RequestBody = await req.json();

    if (!product || !product.title) {
      return new Response(
        JSON.stringify({ error: 'Product title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isUpdate = action === 'update' && productId;
    console.log(`[shopify-product] ${isUpdate ? 'Updating' : 'Creating'} product:`, product.title);

    // Build Shopify Admin API URL
    const shopifyUrl = isUpdate
      ? `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products/${productId.split('/').pop()}.json`
      : `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`;

    // Clean up product payload for Shopify
    const cleanProduct = {
      ...product,
      // Ensure tags is a comma-separated string
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags,
      // Clean up empty fields
      body_html: product.body_html || '',
      vendor: product.vendor || 'techno.dog',
      product_type: product.product_type || '',
    };

    // Make request to Shopify Admin API
    const shopifyResponse = await fetch(shopifyUrl, {
      method: isUpdate ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ product: cleanProduct }),
    });

    const responseData = await shopifyResponse.json();

    if (!shopifyResponse.ok) {
      console.error('[shopify-product] Shopify API error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Shopify API error', 
          details: responseData.errors || responseData 
        }),
        { status: shopifyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const createdProduct = responseData.product;
    console.log(`[shopify-product] Product ${isUpdate ? 'updated' : 'created'} successfully:`, createdProduct.id);

    // Handle collection assignment if provided
    if (collectionIds && collectionIds.length > 0) {
      console.log('[shopify-product] Assigning to collections:', collectionIds);
      
      for (const collectionId of collectionIds) {
        try {
          // Extract numeric ID from GraphQL ID if needed
          const numericCollectionId = collectionId.includes('gid://') 
            ? collectionId.split('/').pop() || ''
            : collectionId;
          
          if (!numericCollectionId) continue;
          
          const collectUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/collects.json`;
          
          await fetch(collectUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({
              collect: {
                product_id: createdProduct.id,
                collection_id: parseInt(numericCollectionId, 10),
              },
            }),
          });
        } catch (collectError) {
          console.warn('[shopify-product] Collection assignment failed:', collectError);
          // Continue - don't fail the whole operation for collection assignment
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
        console.warn('[shopify-product] Audit/draft update failed:', auditError);
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
          admin_url: `${ADMIN_URL_BASE}/products/${createdProduct.id}`,
          storefront_url: `https://${SHOPIFY_STORE_DOMAIN}/products/${createdProduct.handle}`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[shopify-product] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
