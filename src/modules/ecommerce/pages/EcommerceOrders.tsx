/**
 * techno.dog E-commerce Module - Orders
 * 
 * Orders are managed in Shopify Admin (not available via Storefront API).
 * Printful POD orders are automatically routed for fulfillment.
 */

import { ShoppingBag, ExternalLink, Printer, Package } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin, SHOPIFY_ADMIN_URL } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

export function EcommerceOrders() {
  return (
    <AdminPageLayout
      title="Orders"
      description="Order management via Shopify Admin"
      icon={ShoppingBag}
      iconColor="text-logo-green"
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <div className="space-y-4">
        {/* Main Orders Card */}
        <Card className="p-8 bg-card border-border">
          <div className="text-center max-w-md mx-auto">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-lg font-medium text-foreground uppercase tracking-wide mb-2">
              Orders in Shopify Admin
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Order data is managed directly in Shopify Admin. The Storefront API provides product data only.
              Click below to view and manage orders in your Shopify dashboard.
            </p>
            <Button
              onClick={() => openShopifyAdmin('orders')}
              className="font-mono"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Shopify Orders
            </Button>
          </div>
        </Card>

        {/* Printful POD Fulfillment Info */}
        {MODULE_CONFIG.FEATURES.PRINTFUL_POD && (
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-logo-green/10 rounded">
                <Printer className="w-5 h-5 text-logo-green" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                    POD Order Fulfillment
                  </h3>
                  <Badge variant="secondary" className="font-mono text-[10px] bg-logo-green/10 text-logo-green">
                    AUTOMATIC
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Orders containing Printful products are automatically routed for print-on-demand fulfillment.
                  Printful handles production, quality control, and shipping directly to your customers.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    <Package className="w-3 h-3 mr-1" />
                    Auto-Fulfillment
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    2-5 Day Production
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    Tracking Updates
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/apps/printful`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Printful Orders
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => openShopifyAdmin('orders')}
                  >
                    All Orders
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceOrders;
