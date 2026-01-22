/**
 * techno.dog - Fix POD Variant Settings Edge Function
 * 
 * Updates existing variants to have correct POD/Printful settings:
 * - inventory_policy: continue (always accept orders)
 * - requires_shipping: true (physical products)
 * 
 * Note: fulfillment_service cannot be changed via API after creation.
 * It must be set when variant is created or via Printful sync in Shopify Admin.
 */

import { createShopifyClient } from '../_shared/shopify-client.ts';
import { createLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FixRequest {
  productIds?: number[];
  dryRun?: boolean;
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const logger = createLogger('shopify-fix-pod-variants', requestId);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const shopify = createShopifyClient({ requestId });
    const body: FixRequest = await req.json().catch(() => ({}));
    
    const productIds = body.productIds || [];
    const dryRun = body.dryRun ?? false;
    
    logger.info('Starting POD variant fix', { productIds, dryRun });
    
    // If no product IDs provided, fetch all products with POD tags
    let productsToFix: number[] = productIds;
    
    if (productsToFix.length === 0) {
      const listResult = await shopify.listProducts(50);
      if (listResult.success && listResult.data?.products) {
        productsToFix = listResult.data.products
          .filter((p: any) => {
            const tags = (p.tags || '').toLowerCase();
            return tags.includes('pod') || tags.includes('printful') || tags.includes('print-on-demand');
          })
          .map((p: any) => p.id);
      }
    }
    
    logger.info('Products to fix', { count: productsToFix.length, ids: productsToFix });
    
    const results: Array<{
      productId: number;
      productTitle: string;
      variantsUpdated: number;
      variantsFailed: number;
      errors: string[];
    }> = [];
    
    for (const productId of productsToFix) {
      const productResult = await shopify.getProduct(productId);
      
      if (!productResult.success || !productResult.data?.product) {
        logger.error('Failed to fetch product', { productId, error: productResult.error });
        results.push({
          productId,
          productTitle: 'Unknown',
          variantsUpdated: 0,
          variantsFailed: 1,
          errors: [productResult.error || 'Failed to fetch product'],
        });
        continue;
      }
      
      const product = productResult.data.product;
      const variants = product.variants || [];
      const errors: string[] = [];
      let updated = 0;
      let failed = 0;
      
      for (const variant of variants) {
        // Check if variant needs fixing
        const needsFix = 
          variant.inventory_policy !== 'continue' ||
          variant.requires_shipping !== true;
        
        if (!needsFix) {
          logger.info('Variant already correct', { variantId: variant.id, sku: variant.sku });
          continue;
        }
        
        if (dryRun) {
          logger.info('Would update variant (dry run)', { 
            variantId: variant.id, 
            sku: variant.sku,
            currentPolicy: variant.inventory_policy,
            currentShipping: variant.requires_shipping,
          });
          updated++;
          continue;
        }
        
        // Fix the variant
        const updateResult = await shopify.updateVariant(variant.id, {
          inventory_policy: 'continue',
          requires_shipping: true,
          taxable: true,
        });
        
        if (updateResult.success) {
          logger.info('Variant updated', { variantId: variant.id, sku: variant.sku });
          updated++;
        } else {
          logger.error('Failed to update variant', { 
            variantId: variant.id, 
            sku: variant.sku,
            error: updateResult.error 
          });
          errors.push(`Variant ${variant.sku}: ${updateResult.error}`);
          failed++;
        }
      }
      
      results.push({
        productId,
        productTitle: product.title,
        variantsUpdated: updated,
        variantsFailed: failed,
        errors,
      });
    }
    
    const totalUpdated = results.reduce((sum, r) => sum + r.variantsUpdated, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.variantsFailed, 0);
    
    logger.info('POD variant fix complete', { totalUpdated, totalFailed, dryRun });
    
    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        summary: {
          productsProcessed: results.length,
          totalVariantsUpdated: totalUpdated,
          totalVariantsFailed: totalFailed,
        },
        results,
        note: 'fulfillment_service cannot be changed via API. Use Printful sync in Shopify Admin to set fulfillment_service: printful.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    logger.error('Request failed', { error: String(error) });
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
