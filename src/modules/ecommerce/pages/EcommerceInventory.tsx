/**
 * techno.dog E-commerce Module - Inventory List
 * 
 * View inventory levels from LIVE Shopify data.
 * Enhanced with Printful POD integration visibility.
 */

import { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, RefreshCw, ExternalLink, Printer, Clock } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchShopifyInventory, type ShopifyInventoryItem } from '../services/shopify-data.service';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { TableColumn } from '../types/ecommerce.types';

type FulfillmentFilter = 'all' | 'pod' | 'standard';

export function EcommerceInventory() {
  const [inventory, setInventory] = useState<ShopifyInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>('all');

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

  // Filter inventory by fulfillment type
  const filteredInventory = inventory.filter(item => {
    if (fulfillmentFilter === 'all') return true;
    if (fulfillmentFilter === 'pod') return item.isPOD;
    return !item.isPOD;
  });

  const columns: TableColumn<ShopifyInventoryItem>[] = [
    {
      key: 'productName',
      label: 'Product',
      render: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-foreground">{item.productName}</span>
            {item.isPOD && (
              <Badge variant="secondary" className="font-mono text-[8px] bg-logo-green/10 text-logo-green px-1">
                POD
              </Badge>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground">{item.variantName}</div>
        </div>
      ),
    },
    {
      key: 'fulfillmentService',
      label: 'Fulfillment',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {item.isPOD ? (
            <>
              <Printer className="w-3 h-3 text-logo-green" />
              <span className="font-mono text-xs text-logo-green">Printful</span>
            </>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">Standard</span>
          )}
        </div>
      ),
    },
    {
      key: 'productionDays',
      label: 'Production',
      render: (item) => (
        item.productionDays ? (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              {item.productionDays}d
            </span>
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">—</span>
        )
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (item) => (
        <div>
          <span className="font-mono text-foreground">
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: item.currencyCode }).format(parseFloat(item.price))}
          </span>
          {item.baseCost && (
            <div className="text-[10px] text-muted-foreground">
              Cost: ${item.baseCost.toFixed(2)}
            </div>
          )}
        </div>
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
  const podCount = inventory.filter(i => i.isPOD).length;
  const standardCount = totalItems - podCount;

  return (
    <AdminPageLayout
      title="Inventory"
      description="Live stock availability from Shopify + Printful"
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
            onClick={() => openShopifyAdmin('inventory')}
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
          <div className="flex items-center gap-4 flex-wrap">
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
            <div className="border-l border-border h-4" />
            <Badge variant="secondary" className="font-mono text-[10px]">
              <Printer className="w-3 h-3 mr-1" />
              {podCount} POD
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {standardCount} Standard
            </Badge>
          </div>
        )}

        {/* Fulfillment Filter */}
        {!isLoading && totalItems > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Filter:
            </span>
            {(['all', 'pod', 'standard'] as FulfillmentFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setFulfillmentFilter(filter)}
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded transition-colors ${
                  fulfillmentFilter === filter
                    ? 'bg-logo-green/10 text-logo-green'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'pod' ? 'POD Only' : 'Standard'}
              </button>
            ))}
          </div>
        )}

        <EcommerceDataTable
          columns={columns}
          data={filteredInventory}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No products in Shopify store"
        />
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceInventory;
