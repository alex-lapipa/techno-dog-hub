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
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
            "bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10",
            isComplete && "from-logo-green/20 to-logo-green/5 ring-logo-green/20"
          )}>
            <Icon className={cn("w-8 h-8", isComplete ? "text-logo-green" : iconColor)} />
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge 
                variant="outline" 
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5"
              >
                Step {stepNumber} of {totalSteps}
              </Badge>
              {isComplete && (
                <Badge className="bg-logo-green/20 text-logo-green border-logo-green/30 text-[10px]">
                  Complete
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        {children}
      </div>
    </div>
  );
}

export default StepContainer;
