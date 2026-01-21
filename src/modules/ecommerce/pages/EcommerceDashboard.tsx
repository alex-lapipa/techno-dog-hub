/**
 * techno.dog E-commerce Module - Dashboard
 * 
 * KPI overview for e-commerce operations.
 * Connected to LIVE Shopify data via Storefront API.
 */

import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, TrendingUp, TrendingDown, ShoppingBag, Euro, Percent, 
  CheckCircle, XCircle, ExternalLink, RefreshCw, Package, Tag, Truck, BarChart3 
} from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchLiveKPIs, checkShopifyConnection, type ShopifyConnectionStatus } from '../services/shopify-data.service';
import { MODULE_CONFIG } from '../config/module-config';
import { SHOPIFY_ADMIN_URL, getShopifyAdminUrl, openShopifyAdmin } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import type { DashboardKPI } from '../types/ecommerce.types';

const iconMap: Record<string, React.ElementType> = {
  'euro': Euro,
  'shopping-bag': ShoppingBag,
  'trending-up': TrendingUp,
  'percent': Percent,
};

const QUICK_ACTIONS = [
  { label: 'Products', icon: Package, path: '/products', description: 'Manage catalog' },
  { label: 'Orders', icon: ShoppingBag, path: '/orders', description: 'View orders' },
  { label: 'Discounts', icon: Tag, path: '/discounts', description: 'Promotions' },
  { label: 'Shipping', icon: Truck, path: '/settings/shipping', description: 'Delivery' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', description: 'Reports' },
];

export function EcommerceDashboard() {
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connection, setConnection] = useState<ShopifyConnectionStatus | null>(null);

  const fetchData = async () => {
    const [kpiData, connectionStatus] = await Promise.all([
      fetchLiveKPIs(),
      checkShopifyConnection(),
    ]);
    setKpis(kpiData);
    setConnection(connectionStatus);
  };

  useEffect(() => {
    fetchData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  return (
    <AdminPageLayout
      title="E-commerce Ops"
      description="Operations dashboard with live Shopify data"
      icon={LayoutDashboard}
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
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const IconComponent = kpi.icon ? iconMap[kpi.icon] || TrendingUp : TrendingUp;
            const isPositive = (kpi.change ?? 0) >= 0;
            
            return (
              <Card key={kpi.label} className="p-4 bg-card border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {kpi.label}
                    </p>
                    <p className="mt-1 text-2xl font-mono font-bold text-foreground">
                      {kpi.value}
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                {kpi.change !== undefined && (
                  <div className="mt-3 flex items-center gap-1.5">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-logo-green" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`font-mono text-xs ${isPositive ? 'text-logo-green' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {kpi.changeLabel}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Shopify Admin Quick Access
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="h-auto py-3 flex-col gap-1 font-mono text-xs hover:border-logo-green/50 hover:bg-logo-green/5"
                onClick={() => window.open(`${SHOPIFY_ADMIN_URL}${action.path}`, '_blank')}
              >
                <action.icon className="w-4 h-4 text-muted-foreground" />
                <span className="uppercase tracking-wider">{action.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Shopify Connection Status */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded ${connection?.connected ? 'bg-logo-green/10' : 'bg-destructive/10'}`}>
              {connection?.connected ? (
                <CheckCircle className="w-5 h-5 text-logo-green" />
              ) : (
                <XCircle className="w-5 h-5 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                  Shopify Connection
                </h3>
                <Badge 
                  variant="secondary" 
                  className={`font-mono text-[10px] ${connection?.connected ? 'bg-logo-green/10 text-logo-green' : 'bg-destructive/10 text-destructive'}`}
                >
                  {connection?.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground font-mono">
                {connection?.storeDomain || 'No store connected'}
              </p>
              {connection?.connected && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs font-mono"
                    onClick={() => window.open(SHOPIFY_ADMIN_URL, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Admin Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs font-mono"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/products`, '_blank')}
                  >
                    Products
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs font-mono"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/orders`, '_blank')}
                  >
                    Orders
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-card border-border border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="font-mono text-[10px]">
                {MODULE_CONFIG.MODULE_NAME} v{MODULE_CONFIG.VERSION}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Real-time data from Shopify Storefront API
              </span>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              Read-Only Mode
            </Badge>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceDashboard;
