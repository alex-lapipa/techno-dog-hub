/**
 * techno.dog E-commerce Module - Promotions
 * 
 * View active Shopify discount codes and price rules.
 * Create/manage in Shopify Admin.
 */

import { useEffect, useState } from 'react';
import { Tag, ExternalLink, RefreshCw, Plus, Percent, Gift } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

const SHOPIFY_ADMIN_URL = 'https://admin.shopify.com/store/technodog-d3wkq';

export function EcommercePromotions() {
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh - in production this would fetch from Shopify Admin API
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <AdminPageLayout
      title="Promotions"
      description="Discount codes & price rules"
      icon={Tag}
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
            disabled={isLoading}
            className="font-mono text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
            onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/discounts/new`, '_blank')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-logo-green/10 rounded group-hover:bg-logo-green/20 transition-colors">
                <Plus className="w-4 h-4 text-logo-green" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Create Discount
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  New code or automatic
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
            onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/discounts`, '_blank')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded group-hover:bg-muted transition-colors">
                <Percent className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  All Discounts
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  View & manage all
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
            onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/discounts?type=automatic`, '_blank')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded group-hover:bg-muted transition-colors">
                <Gift className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Automatic Discounts
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Cart-level offers
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted/50 rounded">
              <Tag className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                Shopify Discounts
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and manage discount codes, automatic discounts, and promotional campaigns
                directly in your Shopify dashboard. All discount types supported:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Percentage Off
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Fixed Amount
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Free Shipping
                </Badge>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Buy X Get Y
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 font-mono text-xs"
                onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/discounts`, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Open Shopify Discounts
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default EcommercePromotions;
