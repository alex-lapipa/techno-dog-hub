/**
 * techno.dog E-commerce Module - Returns
 * 
 * Returns are managed in Shopify Admin.
 */

import { RotateCcw, ExternalLink } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

export function EcommerceReturns() {
  return (
    <AdminPageLayout
      title="Returns"
      description="Return requests via Shopify Admin"
      icon={RotateCcw}
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
            <RotateCcw className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-mono text-lg font-medium text-foreground uppercase tracking-wide mb-2">
            Returns in Shopify Admin
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Process returns, refunds, and exchanges directly in your Shopify dashboard.
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
    </AdminPageLayout>
  );
}

export default EcommerceReturns;
