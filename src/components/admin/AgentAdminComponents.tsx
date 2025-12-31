/**
 * Shared Agent Admin Components
 * 
 * Common UI patterns extracted from admin pages to reduce duplication
 * and ensure consistent UX across all agent admin interfaces.
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  LucideIcon
} from 'lucide-react';

// ============================================
// Agent Run Button with States
// ============================================
interface AgentRunButtonProps {
  onClick: () => void;
  isRunning: boolean;
  disabled?: boolean;
  label?: string;
  runningLabel?: string;
  variant?: 'default' | 'brutalist' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export function AgentRunButton({
  onClick,
  isRunning,
  disabled = false,
  label = 'Run Agent',
  runningLabel = 'Running...',
  variant = 'brutalist',
  size = 'sm'
}: AgentRunButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      disabled={disabled || isRunning}
      variant={variant}
      size={size}
      className="font-mono text-xs uppercase"
    >
      {isRunning ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          {runningLabel}
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 mr-1.5" />
          {label}
        </>
      )}
    </Button>
  );
}

// ============================================
// Pipeline Progress Panel
// ============================================
interface PipelineStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface PipelineProgressProps {
  steps: PipelineStep[];
  currentProgress: number;
  isRunning: boolean;
  onAbort?: () => void;
  title?: string;
}

export function PipelineProgress({
  steps,
  currentProgress,
  isRunning,
  onAbort,
  title = 'Pipeline Progress'
}: PipelineProgressProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isRunning && <Loader2 className="w-4 h-4 animate-spin text-logo-green" />}
            {title}
          </span>
          {isRunning && onAbort && (
            <Button 
              onClick={onAbort} 
              variant="destructive" 
              size="sm" 
              className="font-mono text-xs"
            >
              <Square className="w-3 h-3 mr-1" />
              Abort
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={currentProgress} className="h-2" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={`p-2 rounded border text-xs font-mono ${
                step.status === 'completed' 
                  ? 'border-logo-green/30 bg-logo-green/5 text-logo-green' 
                  : step.status === 'running'
                  ? 'border-amber-500/30 bg-amber-500/5 text-amber-500'
                  : step.status === 'error'
                  ? 'border-crimson/30 bg-crimson/5 text-crimson'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {step.status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
                {step.status === 'error' && <AlertCircle className="w-3 h-3" />}
                {step.status === 'pending' && <Clock className="w-3 h-3" />}
                <span className="truncate">{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Agent Status Badge
// ============================================
interface AgentStatusBadgeProps {
  status: 'idle' | 'running' | 'success' | 'error' | 'warning';
  label?: string;
}

export function AgentStatusBadge({ status, label }: AgentStatusBadgeProps) {
  const config = {
    idle: { variant: 'secondary' as const, text: label || 'Idle' },
    running: { variant: 'default' as const, text: label || 'Running' },
    success: { variant: 'default' as const, text: label || 'Success' },
    error: { variant: 'destructive' as const, text: label || 'Error' },
    warning: { variant: 'outline' as const, text: label || 'Warning' },
  };

  const { variant, text } = config[status];
  
  return (
    <Badge variant={variant} className="font-mono text-xs uppercase">
      {status === 'running' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
      {text}
    </Badge>
  );
}

// ============================================
// Quick Stats Row
// ============================================
interface QuickStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

interface QuickStatsRowProps {
  stats: QuickStat[];
}

export function QuickStatsRow({ stats }: QuickStatsRowProps) {
  return (
    <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded border border-border">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {stat.icon && <stat.icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-xs text-muted-foreground font-mono">{stat.label}:</span>
          <span className="text-sm font-mono font-medium">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================
interface AgentEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AgentEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: AgentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-12 h-12 text-muted-foreground/30 mb-4" />}
      <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground/70 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ============================================
// Agent Last Run Info
// ============================================
interface AgentLastRunProps {
  lastRunAt: string | null;
  status?: 'success' | 'error' | 'running';
  duration?: number; // in ms
}

export function AgentLastRun({ lastRunAt, status, duration }: AgentLastRunProps) {
  if (!lastRunAt) {
    return (
      <span className="text-xs text-muted-foreground font-mono">
        Never run
      </span>
    );
  }

  const timeAgo = getTimeAgo(new Date(lastRunAt));
  
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      {status === 'success' && <CheckCircle className="w-3 h-3 text-logo-green" />}
      {status === 'error' && <AlertCircle className="w-3 h-3 text-crimson" />}
      {status === 'running' && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
      <span className="text-muted-foreground">Last run: {timeAgo}</span>
      {duration && (
        <span className="text-muted-foreground/70">
          ({(duration / 1000).toFixed(1)}s)
        </span>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
