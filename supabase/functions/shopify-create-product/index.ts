/**
 * techno.dog - Shopify Product Creation Edge Function
 * 
 * Creates products in Shopify Admin API from Creative Studio drafts.
 * Uses the Shopify Admin REST API with access token.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'technodog-d3wkq.myshopify.com';
const SHOPIFY_API_VERSION = '2025-01';

interface ShopifyProductInput {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: Array<{
    option1?: string;
    option2?: string;
    option3?: string;
    price: string;
    sku?: string;
    inventory_management?: string;
  }>;
  options?: Array<{
    name: string;
    values: string[];
  }>;
  images?: Array<{
    src: string;
    alt?: string;
  }>;
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
    type: string;
  }>;
}

interface CreateProductRequest {
  product: ShopifyProductInput;
  draftId?: string;
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

    const { product, draftId }: CreateProductRequest = await req.json();

    if (!product || !product.title) {
      return new Response(
        JSON.stringify({ error: 'Product title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[shopify-create-product] Creating product:', product.title);

    // Build Shopify Admin API URL
    const shopifyUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json`;

    // Make request to Shopify Admin API
    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ product }),
    });

    const responseData = await shopifyResponse.json();

    if (!shopifyResponse.ok) {
      console.error('[shopify-create-product] Shopify API error:', responseData);
      return new Response(
        JSON.stringify({ 
          error: 'Shopify API error', 
          details: responseData.errors || responseData 
        }),
        { status: shopifyResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const createdProduct = responseData.product;
    console.log('[shopify-create-product] Product created successfully:', createdProduct.id);

    // If draftId provided, update the draft status in Supabase (if tracking drafts)
    if (draftId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Log the product creation for auditing
        await supabase.from('admin_audit_log').insert({
          action_type: 'shopify_product_created',
          entity_type: 'product',
          entity_id: createdProduct.id.toString(),
          admin_user_id: '00000000-0000-0000-0000-000000000000', // System action
          details: {
            draftId,
            productTitle: createdProduct.title,
            productId: createdProduct.id,
            handle: createdProduct.handle,
          },
        });
      } catch (auditError) {
        console.warn('[shopify-create-product] Audit log failed:', auditError);
        // Don't fail the request if audit logging fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        product: {
          id: createdProduct.id,
          handle: createdProduct.handle,
          title: createdProduct.title,
          status: createdProduct.status,
          admin_url: `https://admin.shopify.com/store/technodog-d3wkq/products/${createdProduct.id}`,
          storefront_url: `https://technodog-d3wkq.myshopify.com/products/${createdProduct.handle}`,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[shopify-create-product] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
