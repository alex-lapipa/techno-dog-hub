/**
 * techno.dog E-commerce Module - Type Definitions
 * 
 * Shared TypeScript interfaces for the e-commerce admin module.
 */

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'failed';

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerEmail: string;
  customerName: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  lineItems: OrderLineItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  fulfilledAt?: string;
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  locationId: string;
  locationName: string;
  lastUpdated: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

// ============================================
// PROMOTIONS TYPES
// ============================================

export type PromotionType =
  | 'percentage_discount'
  | 'fixed_amount'
  | 'buy_x_get_y'
  | 'free_shipping';

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'expired';

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description?: string;
  type: PromotionType;
  value: number;
  status: PromotionStatus;
  usageCount: number;
  usageLimit?: number;
  minimumOrderAmount?: number;
  startsAt: string;
  endsAt?: string;
  createdAt: string;
}

// ============================================
// SHIPPING TYPES
// ============================================

export type ShippingRateType = 'flat' | 'price_based' | 'weight_based';

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  regions?: string[];
}

export interface ShippingRule {
  id: string;
  name: string;
  zone: ShippingZone;
  rateType: ShippingRateType;
  rate: number;
  freeAbove?: number;
  minWeight?: number;
  maxWeight?: number;
  estimatedDays: string;
  isActive: boolean;
}

// ============================================
// RETURNS TYPES
// ============================================

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded';

export type ReturnReason =
  | 'wrong_item'
  | 'defective'
  | 'not_as_described'
  | 'changed_mind'
  | 'other';

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: ReturnStatus;
  reason: ReturnReason;
  reasonDetails?: string;
  items: {
    productName: string;
    quantity: number;
    refundAmount: number;
  }[];
  totalRefundAmount: number;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardKPI {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  period: AnalyticsPeriod;
}

export interface AnalyticsPeriod {
  start: string;
  end: string;
  comparison?: {
    start: string;
    end: string;
  };
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export interface TableColumn<T> {
  key: string;
  label: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  [key: string]: string | string[] | boolean | undefined;
}
