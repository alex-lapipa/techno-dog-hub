/**
 * techno.dog E-commerce Module - Promotions List
 * 
 * View active promotions and discount codes.
 */

import { useEffect, useState } from 'react';
import { Tag, Copy } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchPromotions } from '../services/mock-data.service';
import { formatCurrency, formatDate, MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { Promotion, TableColumn, PromotionStatus } from '../types/ecommerce.types';
import { toast } from 'sonner';

const statusColors: Record<PromotionStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-primary/10 text-primary',
  active: 'bg-logo-green/10 text-logo-green',
  expired: 'bg-destructive/10 text-destructive',
};

export function EcommercePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPromotions()
      .then(setPromotions)
      .finally(() => setIsLoading(false));
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Code "${code}" copied to clipboard`);
  };

  const columns: TableColumn<Promotion>[] = [
    {
      key: 'code',
      label: 'Code',
      render: (promo) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-foreground bg-muted px-2 py-0.5 rounded">
            {promo.code}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyCode(promo.code);
            }}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (promo) => (
        <div>
          <div className="text-foreground">{promo.title}</div>
          {promo.description && (
            <div className="text-[10px] text-muted-foreground line-clamp-1">
              {promo.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (promo) => (
        <span className="font-mono text-xs text-muted-foreground">
          {promo.type === 'percentage_discount' && `${promo.value}% off`}
          {promo.type === 'fixed_amount' && `${formatCurrency(promo.value)} off`}
          {promo.type === 'free_shipping' && 'Free Shipping'}
          {promo.type === 'buy_x_get_y' && 'BOGO'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (promo) => (
        <Badge 
          variant="secondary" 
          className={`font-mono text-[10px] uppercase ${statusColors[promo.status]}`}
        >
          {promo.status}
        </Badge>
      ),
    },
    {
      key: 'usage',
      label: 'Usage',
      render: (promo) => (
        <span className="font-mono text-xs text-muted-foreground">
          {promo.usageCount}{promo.usageLimit ? ` / ${promo.usageLimit}` : ''}
        </span>
      ),
    },
    {
      key: 'startsAt',
      label: 'Start',
      render: (promo) => (
        <span className="text-muted-foreground text-xs">{formatDate(promo.startsAt)}</span>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Promotions"
      description="Discount codes and campaigns"
      icon={Tag}
      iconColor="text-logo-green"
      isLoading={isLoading}
      actions={
        MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
          <ReadOnlyBadge />
        )
      }
    >
      <EcommerceDataTable
        columns={columns}
        data={promotions}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No promotions found"
      />
    </AdminPageLayout>
  );
}

export default EcommercePromotions;
