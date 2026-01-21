/**
 * techno.dog E-commerce Module - Orders List
 * 
 * View all orders in read-only mode.
 */

import { useEffect, useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchOrders } from '../services/mock-data.service';
import { formatCurrency, formatDate, MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { Order, TableColumn, OrderStatus } from '../types/ecommerce.types';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  confirmed: 'bg-primary/10 text-primary',
  processing: 'bg-logo-green/10 text-logo-green',
  shipped: 'bg-logo-green/20 text-logo-green',
  delivered: 'bg-logo-green text-background',
  cancelled: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',
};

export function EcommerceOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: TableColumn<Order>[] = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (order) => (
        <span className="font-mono text-foreground">{order.orderNumber}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (order) => (
        <div>
          <div className="text-foreground">{order.customerName}</div>
          <div className="text-[10px] text-muted-foreground">{order.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => (
        <Badge 
          variant="secondary" 
          className={`font-mono text-[10px] uppercase ${statusColors[order.status]}`}
        >
          {order.status}
        </Badge>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (order) => (
        <span className="font-mono text-foreground">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (order) => (
        <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: () => (
        <Button variant="ghost" size="sm" disabled={MODULE_CONFIG.READ_ONLY}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Orders"
      description="View and manage customer orders"
      icon={ShoppingBag}
      iconColor="text-logo-green"
      isLoading={isLoading}
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <EcommerceDataTable
        columns={columns}
        data={orders}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No orders found"
      />
    </AdminPageLayout>
  );
}

export default EcommerceOrders;
