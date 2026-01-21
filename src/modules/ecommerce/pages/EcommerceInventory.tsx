/**
 * techno.dog E-commerce Module - Inventory List
 * 
 * View inventory levels from LIVE Shopify data.
 */

import { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { fetchShopifyInventory, type ShopifyInventoryItem } from '../services/shopify-data.service';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { TableColumn } from '../types/ecommerce.types';

export function EcommerceInventory() {
  const [inventory, setInventory] = useState<ShopifyInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShopifyInventory()
      .then(setInventory)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: TableColumn<ShopifyInventoryItem>[] = [
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
      key: 'price',
      label: 'Price',
      render: (item) => (
        <span className="font-mono text-foreground">
          {new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currencyCode }).format(parseFloat(item.price))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge 
          variant="secondary" 
          className={`font-mono text-[10px] uppercase ${item.availableForSale ? 'bg-logo-green/10 text-logo-green' : 'bg-muted text-muted-foreground'}`}
        >
          {item.availableForSale ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Available
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Unavailable
            </>
          )}
        </Badge>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Inventory"
      description="Live stock availability from Shopify"
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
        emptyMessage="No products in Shopify store"
      />
    </AdminPageLayout>
  );
}

export default EcommerceInventory;
