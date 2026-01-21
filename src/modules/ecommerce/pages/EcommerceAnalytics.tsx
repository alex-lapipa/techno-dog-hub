/**
 * techno.dog E-commerce Module - Analytics
 * 
 * Sales analytics and performance metrics.
 * Links to Shopify Analytics dashboard for detailed reports.
 */

import { BarChart3, ExternalLink, TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';

const SHOPIFY_ADMIN_URL = 'https://admin.shopify.com/store/technodog-d3wkq';

const ANALYTICS_LINKS = [
  {
    label: 'Sales Reports',
    description: 'Revenue, orders, and conversion',
    icon: DollarSign,
    path: '/analytics/reports/finances_summary',
  },
  {
    label: 'Traffic & Sessions',
    description: 'Visitors, page views, sources',
    icon: Users,
    path: '/analytics/reports/sessions_over_time',
  },
  {
    label: 'Product Analytics',
    description: 'Best sellers, views, cart adds',
    icon: ShoppingCart,
    path: '/analytics/reports/product_views',
  },
  {
    label: 'Live View',
    description: 'Real-time store activity',
    icon: TrendingUp,
    path: '/analytics',
  },
];

export function EcommerceAnalytics() {
  return (
    <AdminPageLayout
      title="Analytics"
      description="Sales and performance metrics"
      icon={BarChart3}
      iconColor="text-logo-green"
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <div className="space-y-6">
        {/* Analytics Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ANALYTICS_LINKS.map((link) => (
            <Card 
              key={link.label}
              className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
              onClick={() => window.open(`${SHOPIFY_ADMIN_URL}${link.path}`, '_blank')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted/50 rounded group-hover:bg-logo-green/10 transition-colors">
                  <link.icon className="w-5 h-5 text-muted-foreground group-hover:text-logo-green transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm uppercase tracking-wider text-foreground">
                    {link.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {link.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted/50 rounded">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                  Shopify Analytics
                </h3>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  Full Access
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Access comprehensive analytics directly in Shopify Admin. Track sales trends,
                customer behavior, marketing performance, and inventory insights.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  Revenue Tracking
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Conversion Funnels
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Customer Segments
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Marketing Attribution
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 font-mono text-xs"
                onClick={() => window.open(`${SHOPIFY_ADMIN_URL}/analytics`, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                Open Shopify Analytics
              </Button>
            </div>
          </div>
        </Card>

        {/* Module Status */}
        <Card className="p-4 border-dashed border-border">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {MODULE_CONFIG.MODULE_NAME} v{MODULE_CONFIG.VERSION}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Analytics data sourced from Shopify Admin API
            </span>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default EcommerceAnalytics;
