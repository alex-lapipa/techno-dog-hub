/**
 * Creative Studio Workflow Sidebar
 * 
 * Displays numbered steps with descriptions and progress indicators.
 */

import { Check, Circle, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WORKFLOW_STEPS, type WorkflowStep } from '../../hooks/useCreativeWorkflow';

interface WorkflowSidebarProps {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  onStepClick: (step: WorkflowStep) => void;
  isStepComplete: (step: WorkflowStep) => boolean;
}

export function WorkflowSidebar({
  currentStep,
  completedSteps,
  onStepClick,
  isStepComplete,
}: WorkflowSidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 border-r border-border bg-card/50 p-4 relative">
      {/* Subtle VHS noise overlay - Phase 4 */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="mb-6 relative">
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Workflow Steps
        </h3>
      </div>
      
      <nav className="space-y-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isComplete = isStepComplete(step.id);
          const isPast = completedSteps.includes(step.id);
          const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
          const canNavigate = index <= currentIndex || isPast;
          
          return (
            <button
              key={step.id}
              onClick={() => canNavigate && onStepClick(step.id)}
              disabled={!canNavigate}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
                isCurrent && "bg-primary/10 border border-primary/30",
                !isCurrent && !isComplete && "opacity-60"
              )}
            >
              {/* Step indicator */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono",
                "border-2 transition-colors",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isComplete && !isCurrent && "border-logo-green bg-logo-green/10 text-logo-green",
                !isCurrent && !isComplete && "border-muted-foreground/30 text-muted-foreground"
              )}>
                {isComplete && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <CircleDot className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-mono text-sm font-medium truncate",
                  isCurrent && "text-foreground",
                  !isCurrent && "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">
                  {step.description}
                </p>
                {!step.required && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-muted/50 text-[9px] font-mono uppercase rounded text-muted-foreground">
                    Optional
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
      
      {/* Progress indicator with neon glow - Phase 4 */}
      <div className="mt-6 pt-4 border-t border-border relative">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-mono uppercase">Progress</span>
          <span className="font-mono">
            {completedSteps.length}/{WORKFLOW_STEPS.length}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ 
              width: `${(completedSteps.length / WORKFLOW_STEPS.length) * 100}%`,
              boxShadow: completedSteps.length > 0 
                ? '0 0 8px hsl(var(--primary)), 0 0 16px hsl(var(--primary) / 0.5)' 
                : 'none',
            }}
          />
        </div>
        {/* Underground badge - Phase 4 */}
        {completedSteps.length === WORKFLOW_STEPS.length && (
          <div className="mt-3 text-center">
            <span 
              className="inline-block px-2 py-1 text-[9px] font-mono uppercase rounded bg-gradient-to-r from-muted via-primary/20 to-muted text-primary animate-pulse"
            >
              Design Complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowSidebar;
