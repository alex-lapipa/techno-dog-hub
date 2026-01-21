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
    <div className="w-64 flex-shrink-0 border-r border-border bg-card/50 p-4">
      <div className="mb-6">
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
      
      {/* Progress indicator */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-mono uppercase">Progress</span>
          <span className="font-mono">
            {completedSteps.length}/{WORKFLOW_STEPS.length}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(completedSteps.length / WORKFLOW_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default WorkflowSidebar;
