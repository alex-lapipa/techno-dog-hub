/**
 * techno.dog E-commerce Module - Shipping
 * 
 * Shipping is managed in Shopify Admin.
 */

import { Truck, ExternalLink } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

export function EcommerceShipping() {
  return (
    <AdminPageLayout
      title="Shipping"
      description="Shipping zones via Shopify Admin"
      icon={Truck}
      iconColor="text-logo-green"
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
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
    </AdminPageLayout>
  );
}

export default EcommerceShipping;
