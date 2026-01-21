/**
 * techno.dog E-commerce Module - Shipping
 * 
 * Shipping is managed in Shopify Admin.
 * Printful handles shipping for POD products automatically.
 */

import { Truck, ExternalLink, Printer, Globe, Clock } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin, SHOPIFY_ADMIN_URL } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

export function EcommerceShipping() {
  return (
    <AdminPageLayout
      title="Shipping"
      description="Shipping zones via Shopify + Printful"
      icon={Truck}
      iconColor="text-logo-green"
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <div className="space-y-4">
        {/* Main Shipping Card */}
        <Card className="p-8 bg-card border-border">
          <div className="text-center max-w-md mx-auto">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <Truck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-lg font-medium text-foreground uppercase tracking-wide mb-2">
              Shipping in Shopify Admin
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Configure shipping zones, rates, and delivery options directly in your Shopify dashboard.
            </p>
            <Button
              onClick={() => openShopifyAdmin('settingsShipping')}
              className="font-mono"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Shopify Shipping
            </Button>
          </div>
        </Card>

        {/* Printful Shipping Info */}
        {MODULE_CONFIG.FEATURES.PRINTFUL_POD && (
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-logo-green/10 rounded">
                <Printer className="w-5 h-5 text-logo-green" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                    Printful Shipping
                  </h3>
                  <Badge variant="secondary" className="font-mono text-[10px] bg-logo-green/10 text-logo-green">
                    AUTOMATED
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Printful manages shipping for all POD products. Orders are fulfilled from the nearest print facility
                  to reduce shipping times and costs. Tracking is automatically synced to Shopify.
                </p>
                
                {/* Shipping Estimates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">USA/EU</span>
                    </div>
                    <span className="font-mono text-sm text-foreground">3-5 days</span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">UK</span>
                    </div>
                    <span className="font-mono text-sm text-foreground">4-7 days</span>
                  </div>
                  <div className="p-3 bg-muted/30 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">Worldwide</span>
                    </div>
                    <span className="font-mono text-sm text-foreground">7-14 days</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/apps/printful`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Printful Shipping Settings
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

export default EcommerceShipping;
