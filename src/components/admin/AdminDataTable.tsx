import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminDataTableProps<T> {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  maxHeight?: string;
  actions?: ReactNode;
}

export function AdminDataTable<T extends { id: string | number }>({
  title,
  icon: Icon,
  iconColor = 'text-crimson',
  data,
  columns,
  emptyMessage = 'No data found',
  maxHeight = '400px',
  actions
}: AdminDataTableProps<T>) {
  const getValue = (item: T, key: string): any => {
    return key.split('.').reduce((obj: any, k) => obj?.[k], item);
  };

  return (
    <Card className="bg-zinc-900 border-crimson/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            {Icon && <Icon className={cn("w-4 h-4", iconColor)} />}
            {title}
          </CardTitle>
          {actions}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight }}>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 font-mono">{emptyMessage}</p>
          ) : (
            <div className="space-y-2">
              {data.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded hover:border-crimson/30 transition-colors"
                >
                  {columns.map((col, idx) => (
                    <div key={`${item.id}-${String(col.key)}`} className={cn("flex-1", col.className)}>
                      {col.render ? col.render(item) : (
                        <span className="text-sm text-foreground">
                          {String(getValue(item, String(col.key)) ?? '')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AdminDataTable;
