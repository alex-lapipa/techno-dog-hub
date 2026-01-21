/**
 * techno.dog E-commerce Module - Shopify Promotions Service
 * 
 * Real-time integration with Shopify Price Rules and Discount Codes API.
 * Uses Lovable's Shopify integration for CRUD operations.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Promotion, PromotionType, PromotionStatus } from '../types/ecommerce.types';

// ============================================
// TYPES
// ============================================

export interface ShopifyPriceRule {
  id: number;
  title: string;
  value_type: 'percentage' | 'fixed_amount';
  value: string;
  customer_selection: 'all' | 'prerequisite';
  target_type: 'line_item' | 'shipping_line';
  target_selection: 'all' | 'entitled';
  allocation_method: 'across' | 'each';
  once_per_customer: boolean;
  usage_limit: number | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  entitled_product_ids: number[];
  entitled_variant_ids: number[];
  entitled_collection_ids: number[];
  entitled_country_ids: number[];
  prerequisite_product_ids: number[];
  prerequisite_variant_ids: number[];
  prerequisite_collection_ids: number[];
  prerequisite_subtotal_range: { greater_than_or_equal_to: string } | null;
  prerequisite_quantity_range: { greater_than_or_equal_to: number } | null;
  prerequisite_to_entitlement_quantity_ratio: { prerequisite_quantity: number; entitled_quantity: number } | null;
}

export interface ShopifyDiscountCode {
  id: number;
  price_rule_id: number;
  code: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionWithCodes extends Promotion {
  priceRuleId: number;
  discountCodes: ShopifyDiscountCode[];
  targetType: 'line_item' | 'shipping_line';
  valueType: 'percentage' | 'fixed_amount';
}

// ============================================
// HELPERS
// ============================================

function mapValueTypeToPromotionType(
  valueType: 'percentage' | 'fixed_amount',
  targetType: 'line_item' | 'shipping_line'
): PromotionType {
  if (targetType === 'shipping_line') return 'free_shipping';
  return valueType === 'percentage' ? 'percentage_discount' : 'fixed_amount';
}

function getPromotionStatus(startsAt: string, endsAt: string | null): PromotionStatus {
  const now = new Date();
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  if (start > now) return 'scheduled';
  if (end && end < now) return 'expired';
  return 'active';
}

function mapPriceRuleToPromotion(
  priceRule: ShopifyPriceRule,
  discountCodes: ShopifyDiscountCode[]
): PromotionWithCodes {
  const primaryCode = discountCodes[0];
  
  return {
    id: String(priceRule.id),
    priceRuleId: priceRule.id,
    code: primaryCode?.code || priceRule.title,
    title: priceRule.title,
    description: `${priceRule.value_type === 'percentage' ? priceRule.value + '%' : '€' + Math.abs(parseFloat(priceRule.value))} off`,
    type: mapValueTypeToPromotionType(priceRule.value_type, priceRule.target_type),
    value: Math.abs(parseFloat(priceRule.value)),
    valueType: priceRule.value_type,
    targetType: priceRule.target_type,
    status: getPromotionStatus(priceRule.starts_at, priceRule.ends_at),
    usageCount: discountCodes.reduce((sum, dc) => sum + dc.usage_count, 0),
    usageLimit: priceRule.usage_limit || undefined,
    minimumOrderAmount: priceRule.prerequisite_subtotal_range 
      ? parseFloat(priceRule.prerequisite_subtotal_range.greater_than_or_equal_to)
      : undefined,
    startsAt: priceRule.starts_at,
    endsAt: priceRule.ends_at || undefined,
    createdAt: priceRule.created_at,
    discountCodes,
  };
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch all promotions from Shopify
 */
export async function fetchShopifyPromotions(): Promise<PromotionWithCodes[]> {
  try {
    // This would normally call an edge function that uses the Shopify Admin API
    // For now, we'll use a simplified approach that works with the Lovable tools
    const response = await supabase.functions.invoke('shopify-promotions', {
      body: { action: 'list' }
    });

    if (response.error) {
      console.warn('[promotions] Edge function not available, returning empty array');
      return [];
    }

    return response.data?.promotions || [];
  } catch (error) {
    console.error('[promotions] Error fetching promotions:', error);
    return [];
  }
}

/**
 * Create a new price rule and discount code
 */
export interface CreatePromotionInput {
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

export async function createShopifyPromotion(input: CreatePromotionInput): Promise<{
  success: boolean;
  priceRuleId?: number;
  discountCodeId?: number;
  error?: string;
}> {
  try {
    const response = await supabase.functions.invoke('shopify-promotions', {
      body: { 
        action: 'create',
        promotion: input
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return {
      success: true,
      priceRuleId: response.data?.priceRuleId,
      discountCodeId: response.data?.discountCodeId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create promotion';
    toast.error('Failed to create promotion', { description: message });
    return { success: false, error: message };
  }
}

/**
 * Delete a price rule (and its associated discount codes)
 */
export async function deleteShopifyPromotion(priceRuleId: number): Promise<boolean> {
  try {
    const response = await supabase.functions.invoke('shopify-promotions', {
      body: { 
        action: 'delete',
        priceRuleId
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    toast.success('Promotion deleted');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete promotion';
    toast.error('Failed to delete promotion', { description: message });
    return false;
  }
}

/**
 * Get promotion stats summary
 */
export async function getPromotionStats(promotions: PromotionWithCodes[]): Promise<{
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  totalUsage: number;
}> {
  return {
    total: promotions.length,
    active: promotions.filter(p => p.status === 'active').length,
    scheduled: promotions.filter(p => p.status === 'scheduled').length,
    expired: promotions.filter(p => p.status === 'expired').length,
    totalUsage: promotions.reduce((sum, p) => sum + p.usageCount, 0),
  };
}
