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
    <div className="w-full bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4">
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
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    "ring-2 ring-offset-2 ring-offset-background",
                    isComplete && "bg-logo-green text-black ring-logo-green",
                    isCurrent && !isComplete && "bg-primary text-primary-foreground ring-primary scale-110 shadow-lg shadow-primary/25",
                    !isComplete && !isCurrent && "bg-muted text-muted-foreground ring-muted-foreground/20"
                  )}>
                    {isComplete ? (
                      <Check className="w-5 h-5" strokeWidth={3} />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="text-center min-w-[80px]">
                    <p className={cn(
                      "text-xs font-medium transition-colors",
                      isCurrent && "text-primary",
                      isComplete && "text-logo-green",
                      !isCurrent && !isComplete && "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 hidden sm:block">
                      Step {step.number}
                    </p>
                  </div>
                </button>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 mx-4 h-0.5 relative hidden sm:block">
                    <div className="absolute inset-0 bg-border rounded-full" />
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
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
