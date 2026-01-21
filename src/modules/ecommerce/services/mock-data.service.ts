/**
 * techno.dog E-commerce Module - Mock Data Service
 * 
 * Provides placeholder data for read-only demonstration.
 */

import type {
  Order,
  InventoryItem,
  Promotion,
  ShippingRule,
  ReturnRequest,
  DashboardKPI,
} from '../types/ecommerce.types';
import { MODULE_CONFIG, generateOrderNumber } from '../config/module-config';

async function simulateLatency(): Promise<void> {
  if (MODULE_CONFIG.MOCK.SIMULATE_LATENCY) {
    await new Promise((resolve) => 
      setTimeout(resolve, MODULE_CONFIG.MOCK.LATENCY_MS)
    );
  }
}

// ============================================
// DASHBOARD DATA
// ============================================

export async function fetchDashboardKPIs(): Promise<DashboardKPI[]> {
  await simulateLatency();
  
  return [
    {
      label: 'Total Revenue',
      value: '€24,580.00',
      change: 12.5,
      changeLabel: 'vs. last month',
      icon: 'euro',
    },
    {
      label: 'Orders',
      value: 156,
      change: 8.2,
      changeLabel: 'vs. last month',
      icon: 'shopping-bag',
    },
    {
      label: 'Avg. Order Value',
      value: '€157.56',
      change: 4.1,
      changeLabel: 'vs. last month',
      icon: 'trending-up',
    },
    {
      label: 'Conversion Rate',
      value: '3.2%',
      change: -0.5,
      changeLabel: 'vs. last month',
      icon: 'percent',
    },
  ];
}

// ============================================
// ORDERS DATA
// ============================================

export async function fetchOrders(): Promise<Order[]> {
  await simulateLatency();
  
  return [
    {
      id: 'ord_001',
      orderNumber: generateOrderNumber(1),
      status: 'processing',
      paymentStatus: 'paid',
      customerEmail: 'raver@techno.dog',
      customerName: 'Jane Smith',
      shippingAddress: {
        firstName: 'Jane',
        lastName: 'Smith',
        address1: '123 Berghain Street',
        city: 'Berlin',
        province: 'BE',
        postalCode: '10243',
        country: 'Germany',
        phone: '+49 555 123 4567',
      },
      billingAddress: {
        firstName: 'Jane',
        lastName: 'Smith',
        address1: '123 Berghain Street',
        city: 'Berlin',
        province: 'BE',
        postalCode: '10243',
        country: 'Germany',
      },
      lineItems: [
        {
          id: 'li_001',
          productId: 'prod_001',
          productName: 'Techno Dog Hoodie',
          variantName: 'Size M - Black',
          sku: 'TD-HD-M-BLK',
          quantity: 2,
          unitPrice: 59.99,
          totalPrice: 119.98,
        },
      ],
      subtotal: 119.98,
      shippingCost: 4.99,
      taxAmount: 26.24,
      discountAmount: 0,
      total: 151.21,
      currency: 'EUR',
      createdAt: '2026-01-20T10:30:00Z',
      updatedAt: '2026-01-20T14:15:00Z',
    },
    {
      id: 'ord_002',
      orderNumber: generateOrderNumber(2),
      status: 'shipped',
      paymentStatus: 'paid',
      customerEmail: 'selector@techno.dog',
      customerName: 'John Doe',
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '456 Tresor Avenue',
        city: 'Detroit',
        province: 'MI',
        postalCode: '48201',
        country: 'United States',
      },
      billingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address1: '456 Tresor Avenue',
        city: 'Detroit',
        province: 'MI',
        postalCode: '48201',
        country: 'United States',
      },
      lineItems: [
        {
          id: 'li_002',
          productId: 'prod_002',
          productName: 'Techno Dog Cap',
          variantName: 'One Size - Black',
          sku: 'TD-CP-OS-BLK',
          quantity: 1,
          unitPrice: 34.99,
          totalPrice: 34.99,
        },
        {
          id: 'li_003',
          productId: 'prod_003',
          productName: 'Vinyl Sticker Pack',
          variantName: 'Pack of 10',
          sku: 'TD-ST-10',
          quantity: 2,
          unitPrice: 12.99,
          totalPrice: 25.98,
        },
      ],
      subtotal: 60.97,
      shippingCost: 0,
      taxAmount: 12.80,
      discountAmount: 10.00,
      total: 63.77,
      currency: 'EUR',
      notes: 'Free shipping on orders over €50',
      createdAt: '2026-01-19T16:45:00Z',
      updatedAt: '2026-01-20T09:00:00Z',
      fulfilledAt: '2026-01-20T09:00:00Z',
    },
  ];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const orders = await fetchOrders();
  return orders.find((o) => o.id === orderId) || null;
}

// ============================================
// INVENTORY DATA
// ============================================

export async function fetchInventory(): Promise<InventoryItem[]> {
  await simulateLatency();
  
  return [
    {
      id: 'inv_001',
      productId: 'prod_001',
      productName: 'Techno Dog Hoodie',
      variantName: 'Size S - Black',
      sku: 'TD-HD-S-BLK',
      quantity: 45,
      reservedQuantity: 3,
      availableQuantity: 42,
      lowStockThreshold: 10,
      locationId: 'loc_001',
      locationName: 'Main Warehouse',
      lastUpdated: '2026-01-20T12:00:00Z',
    },
    {
      id: 'inv_002',
      productId: 'prod_001',
      productName: 'Techno Dog Hoodie',
      variantName: 'Size M - Black',
      sku: 'TD-HD-M-BLK',
      quantity: 8,
      reservedQuantity: 2,
      availableQuantity: 6,
      lowStockThreshold: 10,
      locationId: 'loc_001',
      locationName: 'Main Warehouse',
      lastUpdated: '2026-01-20T12:00:00Z',
    },
    {
      id: 'inv_003',
      productId: 'prod_002',
      productName: 'Techno Dog Cap',
      variantName: 'One Size - Black',
      sku: 'TD-CP-OS-BLK',
      quantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      lowStockThreshold: 5,
      locationId: 'loc_001',
      locationName: 'Main Warehouse',
      lastUpdated: '2026-01-19T18:00:00Z',
    },
    {
      id: 'inv_004',
      productId: 'prod_003',
      productName: 'Vinyl Sticker Pack',
      variantName: 'Pack of 10',
      sku: 'TD-ST-10',
      quantity: 120,
      reservedQuantity: 5,
      availableQuantity: 115,
      lowStockThreshold: 20,
      locationId: 'loc_001',
      locationName: 'Main Warehouse',
      lastUpdated: '2026-01-20T08:30:00Z',
    },
  ];
}

// ============================================
// PROMOTIONS DATA
// ============================================

export async function fetchPromotions(): Promise<Promotion[]> {
  await simulateLatency();
  
  return [
    {
      id: 'promo_001',
      code: 'TECHNODOG10',
      title: '10% Off - New Raver Discount',
      description: 'Special discount for new techno.dog community members',
      type: 'percentage_discount',
      value: 10,
      status: 'active',
      usageCount: 45,
      usageLimit: 100,
      minimumOrderAmount: 30,
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2026-12-31T23:59:59Z',
      createdAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'promo_002',
      code: 'FREESHIP',
      title: 'Free Shipping',
      description: 'Free shipping on orders over €50',
      type: 'free_shipping',
      value: 0,
      status: 'active',
      usageCount: 128,
      minimumOrderAmount: 50,
      startsAt: '2026-01-01T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'promo_003',
      code: 'WELCOME15',
      title: '€15 First Purchase',
      description: 'Welcome discount for new customers',
      type: 'fixed_amount',
      value: 15,
      status: 'active',
      usageCount: 23,
      usageLimit: 500,
      minimumOrderAmount: 40,
      startsAt: '2026-01-01T00:00:00Z',
      createdAt: '2025-12-20T00:00:00Z',
    },
  ];
}

// ============================================
// SHIPPING DATA
// ============================================

export async function fetchShippingRules(): Promise<ShippingRule[]> {
  await simulateLatency();
  
  return [
    {
      id: 'ship_001',
      name: 'Standard EU',
      zone: {
        id: 'zone_001',
        name: 'European Union',
        countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT'],
      },
      rateType: 'price_based',
      rate: 4.99,
      freeAbove: 50,
      estimatedDays: '3-5 business days',
      isActive: true,
    },
    {
      id: 'ship_002',
      name: 'Express EU',
      zone: {
        id: 'zone_001',
        name: 'European Union',
        countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT'],
      },
      rateType: 'flat',
      rate: 9.99,
      estimatedDays: '1-2 business days',
      isActive: true,
    },
    {
      id: 'ship_003',
      name: 'International Standard',
      zone: {
        id: 'zone_002',
        name: 'International',
        countries: ['US', 'CA', 'GB', 'AU', 'JP'],
      },
      rateType: 'flat',
      rate: 14.99,
      estimatedDays: '7-14 business days',
      isActive: true,
    },
  ];
}

// ============================================
// RETURNS DATA
// ============================================

export async function fetchReturns(): Promise<ReturnRequest[]> {
  await simulateLatency();
  
  return [
    {
      id: 'ret_001',
      orderId: 'ord_old_001',
      orderNumber: generateOrderNumber(89),
      customerEmail: 'raver@techno.dog',
      customerName: 'Alice Johnson',
      status: 'requested',
      reason: 'wrong_item',
      reasonDetails: 'Received size M instead of L',
      items: [
        {
          productName: 'Techno Dog Hoodie',
          quantity: 1,
          refundAmount: 59.99,
        },
      ],
      totalRefundAmount: 59.99,
      createdAt: '2026-01-18T14:00:00Z',
      updatedAt: '2026-01-18T14:00:00Z',
    },
    {
      id: 'ret_002',
      orderId: 'ord_old_002',
      orderNumber: generateOrderNumber(76),
      customerEmail: 'selector@techno.dog',
      customerName: 'Bob Wilson',
      status: 'approved',
      reason: 'changed_mind',
      items: [
        {
          productName: 'Techno Dog Cap',
          quantity: 1,
          refundAmount: 34.99,
        },
      ],
      totalRefundAmount: 34.99,
      createdAt: '2026-01-15T10:30:00Z',
      updatedAt: '2026-01-16T09:00:00Z',
    },
    {
      id: 'ret_003',
      orderId: 'ord_old_003',
      orderNumber: generateOrderNumber(54),
      customerEmail: 'dj@techno.dog',
      customerName: 'Carol Davis',
      status: 'refunded',
      reason: 'defective',
      reasonDetails: 'The hoodie zipper does not work properly',
      items: [
        {
          productName: 'Techno Dog Hoodie',
          quantity: 1,
          refundAmount: 59.99,
        },
      ],
      totalRefundAmount: 59.99,
      createdAt: '2026-01-10T11:00:00Z',
      updatedAt: '2026-01-14T16:00:00Z',
      resolvedAt: '2026-01-14T16:00:00Z',
    },
  ];
}
