/**
 * techno.dog E-commerce Module - Dashboard
 * 
 * KPI overview for e-commerce operations.
 * Connected to LIVE Shopify data via Storefront API.
 */

import { useEffect, useState } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, ShoppingBag, Euro, Percent, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchLiveKPIs, checkShopifyConnection, type ShopifyConnectionStatus } from '../services/shopify-data.service';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import type { DashboardKPI } from '../types/ecommerce.types';

const iconMap: Record<string, React.ElementType> = {
  'euro': Euro,
  'shopping-bag': ShoppingBag,
  'trending-up': TrendingUp,
  'percent': Percent,
};

export function EcommerceDashboard() {
  const [kpis, setKpis] = useState<DashboardKPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<ShopifyConnectionStatus | null>(null);

  useEffect(() => {
    Promise.all([
      fetchLiveKPIs(),
      checkShopifyConnection(),
    ])
      .then(([kpiData, connectionStatus]) => {
        setKpis(kpiData);
        setConnection(connectionStatus);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminPageLayout
      title="E-commerce Ops"
      description="Operations dashboard with KPIs and metrics"
      icon={LayoutDashboard}
      iconColor="text-logo-green"
      isLoading={isLoading}
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 px-2 text-xs font-mono"
                  onClick={() => window.open('https://admin.shopify.com', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open Shopify Admin
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted/50 rounded">
              <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                Store Operations Module
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Real-time data from your Shopify store. KPIs above reflect live product and inventory counts.
                Use the sidebar to navigate between Shop, Lookbook, and operational views.
              </p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {MODULE_CONFIG.MODULE_NAME} v{MODULE_CONFIG.VERSION} • Read-Only Mode
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceDashboard;
