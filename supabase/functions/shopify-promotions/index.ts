/**
 * techno.dog - Shopify Promotions Edge Function
 * 
 * Uses unified ShopifyClient for Price Rules and Discount Codes CRUD.
 */

import { createShopifyClient } from '../_shared/shopify-client.ts';
import { createLogger } from '../_shared/logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PromotionInput {
  title: string;
  code: string;
  valueType: 'percentage' | 'fixed_amount';
  value: number;
  targetType?: 'line_item' | 'shipping_line';
  usageLimit?: number;
  oncePerCustomer?: boolean;
  minimumOrderAmount?: number;
  startsAt?: string;
  endsAt?: string;
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const logger = createLogger('shopify-promotions', requestId);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Shopify client (uses native Lovable integration)
    const shopify = createShopifyClient({ requestId });

    const { action, promotion, priceRuleId } = await req.json();
    logger.info('Processing request', { action, priceRuleId });

    // ─── LIST ───
    if (action === 'list') {
      const priceRulesResult = await shopify.listPriceRules(50);

      if (!priceRulesResult.success) {
        throw new Error(`Shopify API error: ${priceRulesResult.error}`);
      }

      const priceRules = priceRulesResult.data?.price_rules || [];

      // Fetch discount codes for each price rule
      const promotionsWithCodes = await Promise.all(
        priceRules.map(async (rule: any) => {
          const codesResult = await shopify.listDiscountCodes(rule.id);
          const discountCodes = codesResult.success ? (codesResult.data?.discount_codes || []) : [];

          return {
            id: String(rule.id),
            priceRuleId: rule.id,
            code: discountCodes[0]?.code || rule.title,
            title: rule.title,
            description: `${rule.value_type === 'percentage' ? rule.value + '%' : '€' + Math.abs(parseFloat(rule.value))} off`,
            type: rule.target_type === 'shipping_line' 
              ? 'free_shipping' 
              : rule.value_type === 'percentage' 
                ? 'percentage_discount' 
                : 'fixed_amount',
            value: Math.abs(parseFloat(rule.value)),
            valueType: rule.value_type,
            targetType: rule.target_type,
            status: getStatus(rule.starts_at, rule.ends_at),
            usageCount: discountCodes.reduce((sum: number, dc: any) => sum + (dc.usage_count || 0), 0),
            usageLimit: rule.usage_limit || undefined,
            minimumOrderAmount: rule.prerequisite_subtotal_range?.greater_than_or_equal_to 
              ? parseFloat(rule.prerequisite_subtotal_range.greater_than_or_equal_to)
              : undefined,
            startsAt: rule.starts_at,
            endsAt: rule.ends_at || undefined,
            createdAt: rule.created_at,
            discountCodes,
          };
        })
      );

      logger.info('Listed promotions', { count: promotionsWithCodes.length });

      return new Response(
        JSON.stringify({ promotions: promotionsWithCodes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── CREATE ───
    if (action === 'create' && promotion) {
      const input = promotion as PromotionInput;
      logger.info('Creating promotion', { title: input.title, code: input.code });
      
      // Create price rule
      const priceRuleResult = await shopify.createPriceRule({
        title: input.title,
        target_type: input.targetType || 'line_item',
        target_selection: 'all',
        allocation_method: 'across',
        value_type: input.valueType,
        value: `-${input.value}`,
        customer_selection: 'all',
        starts_at: input.startsAt || new Date().toISOString(),
        ends_at: input.endsAt || null,
        usage_limit: input.usageLimit || null,
        once_per_customer: input.oncePerCustomer || false,
        prerequisite_subtotal_range: input.minimumOrderAmount 
          ? { greater_than_or_equal_to: String(input.minimumOrderAmount) }
          : null,
      });

      if (!priceRuleResult.success) {
        throw new Error(`Failed to create price rule: ${priceRuleResult.error}`);
      }

      const priceRule = priceRuleResult.data?.price_rule;

      // Create discount code
      const discountCodeResult = await shopify.createDiscountCode(priceRule.id, input.code);
      const discountCodeId = discountCodeResult.success ? discountCodeResult.data?.discount_code?.id : null;

      logger.info('Promotion created', { priceRuleId: priceRule.id, discountCodeId });

      return new Response(
        JSON.stringify({
          success: true,
          priceRuleId: priceRule.id,
          discountCodeId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── DELETE ───
    if (action === 'delete' && priceRuleId) {
      logger.info('Deleting promotion', { priceRuleId });
      
      const deleteResult = await shopify.deletePriceRule(priceRuleId);

      if (!deleteResult.success && deleteResult.statusCode !== 404) {
        throw new Error(`Failed to delete price rule: ${deleteResult.error}`);
      }

      logger.info('Promotion deleted', { priceRuleId });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logger.error('Request failed', { error: String(error) });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getStatus(startsAt: string, endsAt: string | null): string {
  const now = new Date();
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  if (start > now) return 'scheduled';
  if (end && end < now) return 'expired';
  return 'active';
}
