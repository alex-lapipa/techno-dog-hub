/**
 * Creative Studio Workflow Sidebar
 * 
 * Displays numbered steps with descriptions and progress indicators.
 * GREEN = complete, RED = incomplete/pending
 */

import { Check, Circle, CircleDot, X } from 'lucide-react';
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
      {/* Subtle VHS noise overlay */}
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
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          <span className="text-logo-green">●</span> Done <span className="text-destructive ml-2">●</span> Pending
        </p>
      </div>
      
      <nav className="space-y-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isComplete = isStepComplete(step.id);
          const isPast = completedSteps.includes(step.id);
          const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
          const canNavigate = index <= currentIndex || isPast;
          // Required steps that are not complete show red, optional steps show neutral
          const showIncomplete = step.required && !isComplete && !isCurrent;
          
          return (
            <button
              key={step.id}
              onClick={() => canNavigate && onStepClick(step.id)}
              disabled={!canNavigate}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all",
                "hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed",
                isCurrent && "bg-primary/10 border border-primary/30",
                isComplete && !isCurrent && "bg-logo-green/5 border border-logo-green/20",
                showIncomplete && "border border-destructive/20"
              )}
            >
              {/* Step indicator - GREEN for done, RED for pending required */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono",
                "border-2 transition-colors",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isComplete && !isCurrent && "border-logo-green bg-logo-green text-black",
                showIncomplete && "border-destructive/60 bg-destructive/10 text-destructive",
                !isCurrent && !isComplete && !showIncomplete && "border-muted-foreground/30 text-muted-foreground"
              )}>
                {isComplete && !isCurrent ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <CircleDot className="w-4 h-4" />
                ) : showIncomplete ? (
                  <Circle className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-mono text-sm font-medium truncate",
                  isCurrent && "text-foreground",
                  isComplete && !isCurrent && "text-logo-green",
                  showIncomplete && "text-destructive",
                  !isCurrent && !isComplete && !showIncomplete && "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2">
                  {step.description}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {!step.required && (
                    <span className="inline-block px-1.5 py-0.5 bg-muted/50 text-[9px] font-mono uppercase rounded text-muted-foreground">
                      Optional
                    </span>
                  )}
                  {isComplete && !isCurrent && (
                    <span className="inline-block px-1.5 py-0.5 bg-logo-green/20 text-[9px] font-mono uppercase rounded text-logo-green">
                      Done
                    </span>
                  )}
                  {showIncomplete && (
                    <span className="inline-block px-1.5 py-0.5 bg-destructive/10 text-[9px] font-mono uppercase rounded text-destructive">
                      Required
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      
      {/* Progress indicator with green/red status */}
      <div className="mt-6 pt-4 border-t border-border relative">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-mono uppercase">Progress</span>
          <span className={cn(
            "font-mono font-bold",
            completedSteps.length === WORKFLOW_STEPS.length ? "text-logo-green" : "text-foreground"
          )}>
            {completedSteps.length}/{WORKFLOW_STEPS.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden relative flex">
          {WORKFLOW_STEPS.map((step, i) => {
            const isComplete = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={cn(
                  "flex-1 h-full transition-colors border-r border-background last:border-r-0",
                  isComplete ? "bg-logo-green" : "bg-destructive/30"
                )}
                style={isComplete ? { 
                  boxShadow: '0 0 6px hsl(142, 76%, 36%)' 
                } : undefined}
              />
            );
          })}
        </div>
        {/* Completion badge */}
        {completedSteps.length === WORKFLOW_STEPS.length && (
          <div className="mt-3 text-center">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase rounded-full bg-logo-green text-black font-bold"
            >
              <Check className="w-3 h-3" />
              All Steps Complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowSidebar;
