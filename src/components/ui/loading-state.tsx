import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  size = "default",
  className 
}: LoadingStateProps) {
  const iconSizes = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8"
  };

  const textSizes = {
    sm: "text-[10px]",
    default: "text-xs",
    lg: "text-sm"
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 gap-3",
      className
    )}>
      <Loader2 className={cn(iconSizes[size], "text-muted-foreground animate-spin")} />
      <p className={cn(
        "font-mono uppercase tracking-widest text-muted-foreground",
        textSizes[size]
      )}>
        {message}
      </p>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("w-4 h-4 animate-spin", className)} />;
}
