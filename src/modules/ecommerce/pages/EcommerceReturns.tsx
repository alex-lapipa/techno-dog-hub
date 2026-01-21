/**
 * techno.dog E-commerce Module - Returns List
 * 
 * View return requests in read-only mode.
 */

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { fetchReturns } from '../services/mock-data.service';
import { formatCurrency, formatDate, MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { ReturnRequest, TableColumn, ReturnStatus } from '../types/ecommerce.types';

const statusColors: Record<ReturnStatus, string> = {
  requested: 'bg-primary/10 text-primary',
  approved: 'bg-logo-green/10 text-logo-green',
  rejected: 'bg-destructive/10 text-destructive',
  in_transit: 'bg-muted text-foreground',
  received: 'bg-logo-green/20 text-logo-green',
  refunded: 'bg-logo-green text-background',
};

const reasonLabels: Record<string, string> = {
  wrong_item: 'Wrong Item',
  defective: 'Defective',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed Mind',
  other: 'Other',
};

export function EcommerceReturns() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReturns()
      .then(setReturns)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: TableColumn<ReturnRequest>[] = [
    {
      key: 'orderNumber',
      label: 'Order',
      render: (ret) => (
        <span className="font-mono text-foreground">{ret.orderNumber}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (ret) => (
        <div>
          <div className="text-foreground">{ret.customerName}</div>
          <div className="text-[10px] text-muted-foreground">{ret.customerEmail}</div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (ret) => (
        <span className="text-muted-foreground text-xs">
          {reasonLabels[ret.reason] || ret.reason}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (ret) => (
        <Badge 
          variant="secondary" 
          className={`font-mono text-[10px] uppercase ${statusColors[ret.status]}`}
        >
          {ret.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'totalRefundAmount',
      label: 'Refund',
      render: (ret) => (
        <span className="font-mono text-foreground">{formatCurrency(ret.totalRefundAmount)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Requested',
      render: (ret) => (
        <span className="text-muted-foreground text-xs">{formatDate(ret.createdAt)}</span>
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Returns"
      description="Return requests and refund tracking"
      icon={RotateCcw}
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
        data={returns}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No return requests found"
      />
    </AdminPageLayout>
  );
}

export default EcommerceReturns;
