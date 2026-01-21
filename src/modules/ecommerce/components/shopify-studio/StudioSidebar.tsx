/**
 * Shopify Creative Studio v2 - Sidebar Navigation
 * 
 * Enhanced visual progress indicator with step navigation.
 * Cleaner UX with better visual hierarchy and animations.
 */

import { Check, ChevronRight, ShoppingBag, Sparkles, Package, Palette, Wand2, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { STUDIO_STEPS, type StudioStep } from '../../hooks/useShopifyStudio';

interface StudioSidebarProps {
  currentStep: StudioStep;
  completedSteps: StudioStep[];
  onStepClick: (step: StudioStep) => void;
  isStepComplete: (step: StudioStep) => boolean;
  productTitle?: string;
}

// Step-specific icons for better visual identity
const STEP_ICONS: Record<StudioStep, React.ReactNode> = {
  'product-select': <Package className="w-4 h-4" />,
  'variant-config': <Sparkles className="w-4 h-4" />,
  'brand-design': <Palette className="w-4 h-4" />,
  'ai-enhance': <Wand2 className="w-4 h-4" />,
  'publish': <Rocket className="w-4 h-4" />,
};

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
    <div className="w-72 border-r border-border bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground tracking-tight">
              CREATIVE STUDIO
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Shopify-First Workflow
            </p>
          </div>
        </div>
        
        {/* Product Title Badge */}
        {productTitle && productTitle !== 'New Product' && (
          <div className="mt-4 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              Editing
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {productTitle}
            </p>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="px-5 py-4 border-b border-border/30">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground font-medium">Progress</span>
          <span className="font-mono font-bold text-primary">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Steps */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {STUDIO_STEPS.map((step, index) => {
            const isCurrent = step.id === currentStep;
            const isComplete = isStepComplete(step.id);
            const isPast = index < currentIndex;
            const isClickable = isPast || isComplete || index === currentIndex;
            const isNext = index === currentIndex + 1;

            return (
              <button
                key={step.id}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-full group relative flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                  isCurrent && "bg-primary/10 shadow-sm shadow-primary/5",
                  !isCurrent && isClickable && "hover:bg-muted/60",
                  !isClickable && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Connector Line */}
                {index < STUDIO_STEPS.length - 1 && (
                  <div className={cn(
                    "absolute left-6 top-12 w-0.5 h-4 rounded-full transition-colors",
                    isComplete ? "bg-logo-green" : "bg-border"
                  )} />
                )}

                {/* Step Indicator */}
                <div className={cn(
                  "relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  isComplete && "bg-logo-green text-black shadow-sm shadow-logo-green/30",
                  isCurrent && !isComplete && "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                  !isComplete && !isCurrent && "bg-muted/80 text-muted-foreground",
                  isNext && !isComplete && "ring-1 ring-primary/30"
                )}>
                  {isComplete ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    STEP_ICONS[step.id]
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-medium transition-colors",
                      isCurrent && "text-primary",
                      isComplete && "text-logo-green"
                    )}>
                      {step.title}
                    </p>
                    {isCurrent && (
                      <ChevronRight className="w-3 h-3 text-primary animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {step.description}
                  </p>
                </div>

                {/* Step Number Badge */}
                <span className={cn(
                  "text-[10px] font-mono opacity-50",
                  isCurrent && "opacity-100 text-primary"
                )}>
                  {step.number}/{STUDIO_STEPS.length}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Status */}
      <div className="p-4 border-t border-border/50">
        {allComplete ? (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-logo-green/10 border border-logo-green/30 rounded-lg">
            <Check className="w-4 h-4 text-logo-green" />
            <span className="text-sm font-medium text-logo-green">Ready to Publish</span>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">
              Complete all steps to publish
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudioSidebar;
