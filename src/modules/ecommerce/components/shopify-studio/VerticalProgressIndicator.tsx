/**
 * Shopify Creative Studio v2 - Vertical Progress Indicator
 * 
 * Horizontal step-by-step progress bar for vertical scrolling layout.
 * Clean, spacious design with clear visual feedback.
 */

import { Check, Package, Sparkles, Palette, Wand2, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STUDIO_STEPS, type StudioStep } from '../../hooks/useShopifyStudio';

interface VerticalProgressIndicatorProps {
  currentStep: StudioStep;
  completedSteps: StudioStep[];
  isStepComplete: (step: StudioStep) => boolean;
  onStepClick: (step: StudioStep) => void;
}

// Step-specific icons
const STEP_ICONS: Record<StudioStep, React.ComponentType<{ className?: string }>> = {
  'product-select': Package,
  'variant-config': Sparkles,
  'brand-design': Palette,
  'ai-enhance': Wand2,
  'publish': Rocket,
};

export function VerticalProgressIndicator({
  currentStep,
  completedSteps,
  isStepComplete,
  onStepClick,
}: VerticalProgressIndicatorProps) {
  const currentIndex = STUDIO_STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full bg-background/95 backdrop-blur-lg border-b-2 border-logo-green/20 sticky top-0 z-40 shadow-lg shadow-logo-green/5">
      <div className="max-w-5xl mx-auto px-6 py-5">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {STUDIO_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[step.id];
            const isCurrent = step.id === currentStep;
            const isComplete = isStepComplete(step.id);
            const isPast = index < currentIndex;
            const isClickable = isPast || isComplete || index === currentIndex;
            const isLast = index === STUDIO_STEPS.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "relative flex flex-col items-center gap-2 transition-all group",
                    !isClickable && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                    "ring-2 ring-offset-2 ring-offset-background",
                    isComplete && "bg-logo-green text-background ring-logo-green shadow-lg shadow-logo-green/30",
                    isCurrent && !isComplete && "bg-crimson text-white ring-crimson scale-110 shadow-xl shadow-crimson/30",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground ring-border"
                  )}>
                    {isComplete ? (
                      <Check className="w-6 h-6" strokeWidth={3} />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="text-center min-w-[90px]">
                    <p className={cn(
                      "text-xs font-mono font-bold uppercase tracking-wide transition-colors",
                      isCurrent && "text-crimson",
                      isComplete && "text-logo-green",
                      !isCurrent && !isComplete && "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className={cn(
                      "text-[10px] font-mono mt-0.5 hidden sm:block",
                      isCurrent ? "text-crimson/70" : "text-muted-foreground/50"
                    )}>
                      Step {step.number}
                    </p>
                  </div>
                </button>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-4 h-1 relative hidden sm:block rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-border" />
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all duration-500",
                        isComplete ? "bg-logo-green" : "bg-transparent"
                      )}
                      style={{ width: isComplete ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default VerticalProgressIndicator;
