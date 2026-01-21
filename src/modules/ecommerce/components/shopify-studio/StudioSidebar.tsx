/**
 * Shopify Creative Studio v2 - Sidebar Navigation
 * 
 * Visual progress indicator with step navigation.
 */

import { Check, Circle, CircleDot, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { STUDIO_STEPS, type StudioStep } from '../../hooks/useShopifyStudio';

interface StudioSidebarProps {
  currentStep: StudioStep;
  completedSteps: StudioStep[];
  onStepClick: (step: StudioStep) => void;
  isStepComplete: (step: StudioStep) => boolean;
  productTitle?: string;
}

export function StudioSidebar({
  currentStep,
  completedSteps,
  onStepClick,
  isStepComplete,
  productTitle,
}: StudioSidebarProps) {
  const currentIndex = STUDIO_STEPS.findIndex(s => s.id === currentStep);
  const allComplete = completedSteps.length === STUDIO_STEPS.length;
  const progressPercent = (completedSteps.length / STUDIO_STEPS.length) * 100;

  return (
    <div className="w-64 border-r border-border bg-card/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold text-primary">SHOPIFY STUDIO</h3>
            <p className="text-[10px] text-muted-foreground">v2 • Shopify-First</p>
          </div>
        </div>
        
        {productTitle && (
          <div className="mt-3 p-2 bg-muted/50 rounded text-xs font-mono truncate">
            {productTitle}
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="flex-1 p-4 space-y-1">
        {STUDIO_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isComplete = isStepComplete(step.id);
          const isPast = index < currentIndex;
          const isClickable = isPast || isComplete || index === currentIndex;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                "hover:bg-muted/50",
                isCurrent && "bg-primary/10 border border-primary/30",
                !isClickable && "opacity-40 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                isComplete && "bg-logo-green text-black",
                isCurrent && !isComplete && "bg-primary text-primary-foreground",
                !isComplete && !isCurrent && "bg-muted text-muted-foreground"
              )}>
                {isComplete ? (
                  <Check className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <CircleDot className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-xs font-mono">{step.number}</span>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-primary",
                  isComplete && "text-logo-green"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {step.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span className="font-mono">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-logo-green transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {allComplete && (
          <Badge variant="outline" className="w-full justify-center mt-3 text-logo-green border-logo-green">
            Ready to Publish
          </Badge>
        )}
      </div>
    </div>
  );
}

export default StudioSidebar;
