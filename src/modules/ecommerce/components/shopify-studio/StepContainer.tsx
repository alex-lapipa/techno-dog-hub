/**
 * Shopify Creative Studio v2 - Step Container
 * 
 * Wrapper component for each step with consistent styling,
 * visual hierarchy, and generous spacing for the vertical flow.
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepContainerProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  children: ReactNode;
  isComplete?: boolean;
  className?: string;
}

export function StepContainer({
  stepNumber,
  totalSteps,
  title,
  description,
  icon: Icon,
  iconColor = 'text-primary',
  children,
  isComplete,
  className,
}: StepContainerProps) {
  return (
    <div className={cn("min-h-[calc(100vh-220px)]", className)}>
      {/* Step Header */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-10">
        <div className="flex items-start gap-8">
          {/* Icon */}
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br ring-2 ring-offset-2 ring-offset-background transition-all",
            isComplete 
              ? "from-logo-green/30 to-logo-green/10 ring-logo-green/40" 
              : "from-crimson/20 to-crimson/5 ring-crimson/30"
          )}>
            <Icon className={cn("w-10 h-10", isComplete ? "text-logo-green" : "text-crimson")} />
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <Badge 
                variant="outline" 
                className="font-mono text-xs uppercase tracking-wider px-3 py-1 border-crimson/30 text-crimson"
              >
                Step {stepNumber} of {totalSteps}
              </Badge>
              {isComplete && (
                <Badge className="bg-logo-green/20 text-logo-green border border-logo-green/30 text-xs font-mono uppercase">
                  Complete
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight font-mono uppercase">
              {title}
            </h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </div>
    </div>
  );
}

export default StepContainer;
