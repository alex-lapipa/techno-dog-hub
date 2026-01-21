/**
 * techno.dog E-commerce Module - Data Table
 * 
 * Reusable table component styled for the techno.dog design system.
 */

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { TableColumn } from '../types/ecommerce.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EcommerceDataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function EcommerceDataTable<T>({
  columns,
  data,
  keyField,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
}: EcommerceDataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <span className="ml-2 font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Loading
          </span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                style={{ width: column.width }}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={String(item[keyField])}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-border',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className="font-mono text-xs"
                >
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T] ?? '-')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default EcommerceDataTable;
