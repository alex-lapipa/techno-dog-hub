/**
 * techno.dog E-commerce Module - Inventory List
 * 
 * View inventory levels from LIVE Shopify data.
 */

import { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchShopifyInventory, type ShopifyInventoryItem } from '../services/shopify-data.service';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { TableColumn } from '../types/ecommerce.types';

const SHOPIFY_ADMIN_URL = 'https://admin.shopify.com/store/technodog-d3wkq';

export function EcommerceInventory() {
  const [inventory, setInventory] = useState<ShopifyInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    const data = await fetchShopifyInventory();
    setInventory(data);
  };

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

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

  // Summary stats
  const totalItems = inventory.length;
  const availableCount = inventory.filter(i => i.availableForSale).length;
  const unavailableCount = totalItems - availableCount;

  return (
    <AdminPageLayout
      title="Inventory"
      description="Live stock availability from Shopify"
      icon={Package}
      iconColor="text-logo-green"
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          {MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
            <ReadOnlyBadge />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="font-mono text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/products/inventory`, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Manage in Shopify
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        {!isLoading && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {totalItems} Variants
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] bg-logo-green/10 text-logo-green">
              {availableCount} Available
            </Badge>
            {unavailableCount > 0 && (
              <Badge variant="secondary" className="font-mono text-[10px] bg-destructive/10 text-destructive">
                {unavailableCount} Unavailable
              </Badge>
            )}
          </div>
        )}

        <EcommerceDataTable
          columns={columns}
          data={inventory}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No products in Shopify store"
        />
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceInventory;
