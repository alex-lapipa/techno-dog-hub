import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  tag?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function PageHeader({ 
  tag,
  title, 
  description,
  actions,
  className,
  children
}: PageHeaderProps) {
  return (
    <section className={cn("border-b border-border", className)}>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-3">
            {tag && (
              <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                // {tag}
              </div>
            )}
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
                {description}
              </p>
            )}
            {children}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
