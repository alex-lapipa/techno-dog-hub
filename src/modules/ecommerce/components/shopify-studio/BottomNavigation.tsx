/**
 * Shopify Creative Studio v2 - Bottom Navigation
 * 
 * Sticky bottom navigation bar for the vertical flow layout.
 * Provides clear Back/Next navigation with current step context.
 */

import { ArrowLeft, ArrowRight, Save, RotateCcw, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type StudioStepConfig } from '../../hooks/useShopifyStudio';

interface BottomNavigationProps {
  currentStepConfig: StudioStepConfig;
  stepNumber: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoNext: boolean;
  isPublishStep: boolean;
  isPublishing: boolean;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  onReset: () => void;
}

export function BottomNavigation({
  currentStepConfig,
  stepNumber,
  totalSteps,
  canGoBack,
  canGoNext,
  isPublishStep,
  isPublishing,
  onBack,
  onNext,
  onSave,
  onReset,
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t-2 border-logo-green/20 shadow-2xl shadow-logo-green/10">
      <div className="max-w-5xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back Button */}
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={!canGoBack}
            className="gap-2 min-w-[140px] h-12 font-mono uppercase text-sm border-border hover:border-crimson hover:text-crimson transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Center: Step Info & Actions */}
          <div className="flex items-center gap-5">
            {/* Current Step Badge */}
            <div className="hidden md:flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="font-mono font-bold px-4 py-1.5 text-sm bg-muted text-foreground"
              >
                {currentStepConfig.title}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {stepNumber}/{totalSteps}
              </span>
            </div>

            <Separator orientation="vertical" className="h-8 hidden md:block bg-border" />

            {/* Save & Reset */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSave} 
                className="gap-2 text-muted-foreground hover:text-logo-green hover:bg-logo-green/10 font-mono uppercase text-xs"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onReset} 
                className="gap-2 text-muted-foreground hover:text-crimson hover:bg-crimson/10 font-mono uppercase text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </div>

          {/* Right: Next/Publish Button */}
          <Button 
            onClick={onNext} 
            disabled={!canGoNext && !isPublishStep}
            className={cn(
              "gap-2 min-w-[180px] h-12 font-mono uppercase text-sm font-bold transition-all",
              isPublishStep 
                ? "bg-logo-green hover:bg-logo-green/90 text-background shadow-lg shadow-logo-green/30 hover:shadow-xl hover:shadow-logo-green/40" 
                : "bg-crimson hover:bg-crimson/90 text-white shadow-lg shadow-crimson/20"
            )}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                Publishing...
              </>
            ) : isPublishStep ? (
              <>
                <Rocket className="w-4 h-4" />
                Publish to Shopify
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BottomNavigation;
