import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon = Inbox,
  title,
  description,
  action,
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 gap-4 text-center border border-dashed border-border",
      className
    )}>
      <div className="w-12 h-12 border border-border bg-card flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="font-mono text-sm uppercase tracking-wider text-foreground">
          {title}
        </h3>
        {description && (
          <p className="font-mono text-xs text-muted-foreground max-w-md">
            {description}
          </p>
        )}
      </div>
      {action && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={action.onClick}
          className="font-mono text-xs uppercase tracking-wider"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
