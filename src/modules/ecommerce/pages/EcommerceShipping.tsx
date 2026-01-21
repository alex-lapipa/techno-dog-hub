/**
 * techno.dog E-commerce Module - Shipping Rules
 * 
 * View shipping zones and rates.
 */

import { useEffect, useState } from 'react';
import { Truck, CheckCircle, XCircle } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Badge } from '@/components/ui/badge';
import { fetchShippingRules } from '../services/mock-data.service';
import { formatCurrency, MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { EcommerceDataTable } from '../components/EcommerceDataTable';
import type { ShippingRule, TableColumn } from '../types/ecommerce.types';

export function EcommerceShipping() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShippingRules()
      .then(setRules)
      .finally(() => setIsLoading(false));
  }, []);

  const columns: TableColumn<ShippingRule>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (rule) => (
        <span className="font-medium text-foreground">{rule.name}</span>
      ),
    },
    {
      key: 'zone',
      label: 'Zone',
      render: (rule) => (
        <div>
          <div className="text-foreground">{rule.zone.name}</div>
          <div className="text-[10px] text-muted-foreground">
            {rule.zone.countries.join(', ')}
          </div>
        </div>
      ),
    },
    {
      key: 'rateType',
      label: 'Type',
      render: (rule) => (
        <span className="font-mono text-xs text-muted-foreground uppercase">
          {rule.rateType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (rule) => (
        <span className="font-mono text-foreground">{formatCurrency(rule.rate)}</span>
      ),
    },
    {
      key: 'freeAbove',
      label: 'Free Above',
      render: (rule) => (
        <span className="font-mono text-muted-foreground">
          {rule.freeAbove ? formatCurrency(rule.freeAbove) : '-'}
        </span>
      ),
    },
    {
      key: 'estimatedDays',
      label: 'Delivery',
      render: (rule) => (
        <span className="text-muted-foreground text-xs">{rule.estimatedDays}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (rule) => (
        rule.isActive ? (
          <Badge variant="secondary" className="bg-logo-green/10 text-logo-green font-mono text-[10px]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-muted text-muted-foreground font-mono text-[10px]">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        )
      ),
    },
  ];

  return (
    <AdminPageLayout
      title="Shipping"
      description="Shipping zones and delivery rates"
      icon={Truck}
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
        data={rules}
        keyField="id"
        isLoading={isLoading}
        emptyMessage="No shipping rules found"
      />
    </AdminPageLayout>
  );
}

export default EcommerceShipping;
