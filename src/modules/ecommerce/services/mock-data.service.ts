/**
 * techno.dog E-commerce Module - Data Service
 * 
 * Returns clean empty data for fresh start configuration.
 * All placeholder/synthetic data has been removed per zero-hallucination policy.
 */

import type {
  Order,
  InventoryItem,
  Promotion,
  ShippingRule,
  ReturnRequest,
  DashboardKPI,
} from '../types/ecommerce.types';
import { MODULE_CONFIG } from '../config/module-config';

async function simulateLatency(): Promise<void> {
  if (MODULE_CONFIG.MOCK.SIMULATE_LATENCY) {
    await new Promise((resolve) => 
      setTimeout(resolve, MODULE_CONFIG.MOCK.LATENCY_MS)
    );
  }
}

// ============================================
// DASHBOARD DATA - Clean slate KPIs
// ============================================

export async function fetchDashboardKPIs(): Promise<DashboardKPI[]> {
  await simulateLatency();
  
  return [
    {
      label: 'Total Revenue',
      value: '€0.00',
      icon: 'euro',
    },
    {
      label: 'Orders',
      value: 0,
      icon: 'shopping-bag',
    },
    {
      label: 'Avg. Order Value',
      value: '€0.00',
      icon: 'trending-up',
    },
    {
      label: 'Conversion Rate',
      value: '0.0%',
      icon: 'percent',
    },
  ];
}

// ============================================
// ORDERS DATA - Empty (no synthetic orders)
// ============================================

export async function fetchOrders(): Promise<Order[]> {
  await simulateLatency();
  return [];
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const orders = await fetchOrders();
  return orders.find((o) => o.id === orderId) || null;
}

// ============================================
// INVENTORY DATA - Empty (no synthetic inventory)
// ============================================

export async function fetchInventory(): Promise<InventoryItem[]> {
  await simulateLatency();
  return [];
}

// ============================================
// PROMOTIONS DATA - Empty (no synthetic promotions)
// ============================================

export async function fetchPromotions(): Promise<Promotion[]> {
  await simulateLatency();
  return [];
}

// ============================================
// SHIPPING DATA - Empty (no synthetic shipping rules)
// ============================================

export async function fetchShippingRules(): Promise<ShippingRule[]> {
  await simulateLatency();
  return [];
}

// ============================================
// RETURNS DATA - Empty (no synthetic return requests)
// ============================================

export async function fetchReturns(): Promise<ReturnRequest[]> {
  await simulateLatency();
  return [];
}
