import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong",
  message = "An error occurred while loading this content.",
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 gap-4 text-center",
      className
    )}>
      <div className="w-12 h-12 border border-destructive/50 bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="font-mono text-sm uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="font-mono text-xs text-muted-foreground max-w-md">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="font-mono text-xs uppercase tracking-wider gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Try Again
        </Button>
      )}
    </div>
  );
}
