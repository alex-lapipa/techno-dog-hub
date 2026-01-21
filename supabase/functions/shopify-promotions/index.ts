/**
 * techno.dog - Shopify Promotions Edge Function
 * 
 * Handles Price Rules and Discount Codes CRUD operations.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SHOPIFY_STORE_DOMAIN = 'technodog-d3wkq.myshopify.com';
const SHOPIFY_API_VERSION = '2025-07';

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN not configured');
    }

    const { action, promotion, priceRuleId } = await req.json();
    const baseUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

    // ─── LIST ───
    if (action === 'list') {
      // Fetch all price rules
      const priceRulesRes = await fetch(`${baseUrl}/price_rules.json?limit=50`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      });

      if (!priceRulesRes.ok) {
        const errorData = await priceRulesRes.json();
        throw new Error(`Shopify API error: ${JSON.stringify(errorData)}`);
      }

      const { price_rules } = await priceRulesRes.json();

      // Fetch discount codes for each price rule
      const promotionsWithCodes = await Promise.all(
        (price_rules || []).map(async (rule: any) => {
          const codesRes = await fetch(
            `${baseUrl}/price_rules/${rule.id}/discount_codes.json`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
              },
            }
          );

          let discountCodes = [];
          if (codesRes.ok) {
            const codesData = await codesRes.json();
            discountCodes = codesData.discount_codes || [];
          }

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

      return new Response(
        JSON.stringify({ promotions: promotionsWithCodes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── CREATE ───
    if (action === 'create' && promotion) {
      const input = promotion as PromotionInput;
      
      // Create price rule
      const priceRulePayload = {
        price_rule: {
          title: input.title,
          target_type: input.targetType || 'line_item',
          target_selection: 'all',
          allocation_method: 'across',
          value_type: input.valueType,
          value: input.valueType === 'percentage' ? `-${input.value}` : `-${input.value}`,
          customer_selection: 'all',
          starts_at: input.startsAt || new Date().toISOString(),
          ends_at: input.endsAt || null,
          usage_limit: input.usageLimit || null,
          once_per_customer: input.oncePerCustomer || false,
          prerequisite_subtotal_range: input.minimumOrderAmount 
            ? { greater_than_or_equal_to: String(input.minimumOrderAmount) }
            : null,
        },
      };

      const priceRuleRes = await fetch(`${baseUrl}/price_rules.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify(priceRulePayload),
      });

      if (!priceRuleRes.ok) {
        const errorData = await priceRuleRes.json();
        throw new Error(`Failed to create price rule: ${JSON.stringify(errorData)}`);
      }

      const { price_rule } = await priceRuleRes.json();

      // Create discount code
      const discountCodeRes = await fetch(
        `${baseUrl}/price_rules/${price_rule.id}/discount_codes.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': accessToken,
          },
          body: JSON.stringify({
            discount_code: { code: input.code },
          }),
        }
      );

      let discountCodeId = null;
      if (discountCodeRes.ok) {
        const { discount_code } = await discountCodeRes.json();
        discountCodeId = discount_code.id;
      }

      return new Response(
        JSON.stringify({
          success: true,
          priceRuleId: price_rule.id,
          discountCodeId,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── DELETE ───
    if (action === 'delete' && priceRuleId) {
      const deleteRes = await fetch(`${baseUrl}/price_rules/${priceRuleId}.json`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      });

      if (!deleteRes.ok && deleteRes.status !== 404) {
        throw new Error('Failed to delete price rule');
      }

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
    console.error('[shopify-promotions] Error:', error);
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
