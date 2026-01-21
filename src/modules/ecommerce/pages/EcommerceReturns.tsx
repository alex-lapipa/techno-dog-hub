/**
 * techno.dog E-commerce Module - Returns
 * 
 * Returns are managed in Shopify Admin.
 * Printful POD products have specific return policies.
 */

import { RotateCcw, ExternalLink, Printer, AlertCircle } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin, SHOPIFY_ADMIN_URL } from '../config/shopify-config';
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
      <div className="space-y-4">
        {/* Main Returns Card */}
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

        {/* Printful Return Policy Info */}
        {MODULE_CONFIG.FEATURES.PRINTFUL_POD && (
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-logo-green/10 rounded">
                <Printer className="w-5 h-5 text-logo-green" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                    POD Return Policy
                  </h3>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    PRINTFUL
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Print-on-demand products are made to order and have specific return conditions.
                  Returns are accepted for defective or damaged items within 30 days of delivery.
                </p>
                
                {/* Policy Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-mono text-xs text-foreground">Defective/Damaged Items</span>
                      <p className="text-[11px] text-muted-foreground">
                        Full replacement or refund within 30 days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-mono text-xs text-foreground">Wrong Size/Color</span>
                      <p className="text-[11px] text-muted-foreground">
                        Replacement at cost or store credit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                    <div>
                      <span className="font-mono text-xs text-foreground">Change of Mind</span>
                      <p className="text-[11px] text-muted-foreground">
                        Not eligible for POD items (made to order)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => window.open('https://www.printful.com/policies/returns', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Printful Return Policy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/apps/printful`, '_blank')}
                  >
                    Printful Dashboard
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

export default EcommerceReturns;
