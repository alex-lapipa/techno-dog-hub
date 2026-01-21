/**
 * techno.dog E-commerce Module - Inventory List
 * 
 * View inventory levels in read-only mode.
 */

import { useEffect, useState } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { fetchInventory } from '../services/mock-data.service';
import { formatDate, MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { InventoryItem, TableColumn, StockStatus } from '../types/ecommerce.types';

function getStockStatus(item: InventoryItem): StockStatus {
  if (item.availableQuantity === 0) return 'out_of_stock';
  if (item.availableQuantity <= item.lowStockThreshold) return 'low_stock';
  return 'in_stock';
}

const statusConfig: Record<StockStatus, { label: string; className: string; icon: React.ElementType }> = {
  in_stock: { label: 'In Stock', className: 'bg-logo-green/10 text-logo-green', icon: CheckCircle },
  low_stock: { label: 'Low Stock', className: 'bg-destructive/10 text-destructive', icon: AlertTriangle },
  out_of_stock: { label: 'Out of Stock', className: 'bg-muted text-muted-foreground', icon: XCircle },
};

export function EcommerceInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory()
      .then(setInventory)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: TableColumn<InventoryItem>[] = [
    {
      key: 'productName',
      label: 'Product',
      render: (item) => (
        <div>
          <div className="text-foreground">{item.productName}</div>
          <div className="text-[10px] text-muted-foreground">{item.variantName}</div>
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (item) => (
        <span className="font-mono text-foreground">{item.quantity}</span>
      ),
    },
    {
      key: 'availableQuantity',
      label: 'Available',
      render: (item) => (
        <span className="font-mono text-foreground">{item.availableQuantity}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => {
        const status = getStockStatus(item);
        const config = statusConfig[status];
        return (
          <Badge 
            variant="secondary" 
            className={`font-mono text-[10px] uppercase ${config.className}`}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'locationName',
      label: 'Location',
      render: (item) => (
        <span className="text-muted-foreground">{item.locationName}</span>
      ),
    },
    {
      key: 'lastUpdated',
      label: 'Updated',
      render: (item) => (
        <span className="text-muted-foreground text-xs">{formatDate(item.lastUpdated)}</span>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Inventory"
      description="Stock levels and availability tracking"
      icon={Package}
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
        data={inventory}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No inventory items found"
      />
    </AdminPageLayout>
  );
}

export default EcommerceInventory;
