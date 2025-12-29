import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtext?: string;
  className?: string;
  onClick?: () => void;
}

export const AdminStatsCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-crimson/60',
  trend,
  subtext,
  className,
  onClick
}: AdminStatsCardProps) => {
  return (
    <Card 
      className={cn(
        "bg-zinc-900 border-crimson/20 transition-all duration-300",
        onClick && "cursor-pointer hover:border-crimson/50 hover:shadow-[0_0_20px_rgba(255,0,0,0.1)]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs font-mono",
                trend.isPositive ? "text-logo-green" : "text-crimson"
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
            {subtext && (
              <p className="text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <Icon className={cn("w-8 h-8", iconColor)} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatsCard;
