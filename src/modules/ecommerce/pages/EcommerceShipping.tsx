/**
 * techno.dog E-commerce Module - Shipping
 * 
 * Hybrid fulfillment model:
 * - Printful: POD products (hoodies, tees, caps)
 * - Packlink PRO: Inventory items, vinyl, equipment
 * - Shopify: Zone configuration and rate management
 */

import { Truck, ExternalLink, Printer, Globe, Clock, Package, Zap, MapPin } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin, SHOPIFY_ADMIN_URL } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { PACKLINK_SHIPPING_ZONES } from '../config/packlink-integration';

export function EcommerceShipping() {
  return (
    <AdminPageLayout
      title="Shipping"
      description="Hybrid fulfillment via Printful + Packlink PRO"
      icon={Truck}
      iconColor="text-logo-green"
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <div className="space-y-4">
        {/* Fulfillment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Printful POD Card */}
          {MODULE_CONFIG.FEATURES.PRINTFUL_POD && (
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-logo-green/10 rounded">
                  <Printer className="w-5 h-5 text-logo-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                      Printful POD
                    </h3>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-logo-green/10 text-logo-green">
                      ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Print-on-demand fulfillment for hoodies, tees, and caps.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="font-mono text-[10px]">Hoodies</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">T-Shirts</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Caps</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs w-full"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/apps/printful`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Printful Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Packlink PRO Card */}
          {MODULE_CONFIG.FEATURES.PACKLINK_PRO && (
            <Card className="p-5 bg-card border-border">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary/10 rounded">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                      Packlink PRO
                    </h3>
                    <Badge variant="secondary" className="font-mono text-[10px] bg-primary/10 text-primary">
                      ACTIVE
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Shipping automation for inventory items, vinyl, and equipment.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="outline" className="font-mono text-[10px]">Vinyl</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Equipment</Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">Accessories</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs w-full"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}${MODULE_CONFIG.PACKLINK.SHOPIFY_APP_PATH}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Packlink Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Shipping Zones - Packlink PRO */}
        {MODULE_CONFIG.FEATURES.PACKLINK_PRO && (
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                Packlink PRO Shipping Zones
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PACKLINK_SHIPPING_ZONES.map((zone) => (
                <div key={zone.id} className="p-3 bg-muted/30 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">{zone.name}</span>
                  </div>
                  <span className="font-mono text-sm text-foreground">{zone.estimatedDays}</span>
                  <p className="text-[10px] text-muted-foreground mt-1">{zone.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Printful Shipping Estimates */}
        {MODULE_CONFIG.FEATURES.PRINTFUL_POD && (
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-logo-green" />
              <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                Printful Production + Shipping
              </h3>
              <Badge variant="secondary" className="font-mono text-[10px] bg-logo-green/10 text-logo-green">
                AUTO-ROUTED
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-muted/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">USA/EU</span>
                </div>
                <span className="font-mono text-sm text-foreground">3-5 days</span>
                <p className="text-[10px] text-muted-foreground mt-1">Nearest facility</p>
              </div>
              <div className="p-3 bg-muted/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">UK</span>
                </div>
                <span className="font-mono text-sm text-foreground">4-7 days</span>
                <p className="text-[10px] text-muted-foreground mt-1">UK fulfillment center</p>
              </div>
              <div className="p-3 bg-muted/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">Worldwide</span>
                </div>
                <span className="font-mono text-sm text-foreground">7-14 days</span>
                <p className="text-[10px] text-muted-foreground mt-1">International express</p>
              </div>
              <div className="p-3 bg-muted/30 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <Printer className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">Production</span>
                </div>
                <span className="font-mono text-sm text-foreground">2-5 days</span>
                <p className="text-[10px] text-muted-foreground mt-1">Before shipping</p>
              </div>
            </div>
          </Card>
        )}

        {/* Shopify Shipping Settings */}
        <Card className="p-6 bg-card border-border">
          <div className="text-center max-w-md mx-auto">
            <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
              <Truck className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide mb-2">
              Shopify Shipping Zones
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Configure shipping rates and delivery zones in Shopify Admin.
            </p>
            <Button
              onClick={() => openShopifyAdmin('settingsShipping')}
              className="font-mono"
              size="sm"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-2" />
              Open Shopify Shipping
            </Button>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceShipping;
