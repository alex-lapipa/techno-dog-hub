import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AgentCardProps {
  name: string;
  category: string;
  description: string;
  status: 'active' | 'idle' | 'error' | 'disabled';
  lastRun?: string;
  pendingReports?: number;
  frameNumber?: string;
  functionName?: string;
  path?: string;
}

const AgentCard = ({
  name,
  category,
  description,
  status: initialStatus,
  pendingReports = 0,
  frameNumber = '01',
  functionName,
  path
}: AgentCardProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (path && !isRunning) {
      navigate(path);
    }
  };

  const statusColors = {
    active: 'text-logo-green',
    idle: 'text-muted-foreground',
    error: 'text-crimson',
    disabled: 'text-muted-foreground/50'
  };

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!functionName || isRunning) return;

    setIsRunning(true);
    setRunStatus('idle');

    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { manual: true }
      });

      if (error) throw error;

      setRunStatus('success');
      toast({
        title: `${name} completed`,
        description: data?.message || 'Task ran successfully'
      });

      setTimeout(() => setRunStatus('idle'), 3000);
    } catch (error) {
      console.error(`Failed to run ${name}:`, error);
      setRunStatus('error');
      toast({
        title: `${name} failed`,
        description: 'Check logs for details',
        variant: 'destructive'
      });

      setTimeout(() => setRunStatus('idle'), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  const currentStatus = isRunning ? 'active' : initialStatus;

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative bg-card border border-border p-4 transition-all duration-200",
        "hover:border-crimson/40",
        initialStatus === 'disabled' && "opacity-50",
        path && "cursor-pointer"
      )}
    >
      {/* Frame number */}
      <div className="absolute top-3 right-3">
        <span className="text-[10px] text-muted-foreground/50 font-mono">{frameNumber}</span>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            {category}
          </div>
          <h3 className="font-mono text-sm uppercase tracking-tight text-foreground group-hover:text-crimson transition-colors">
            {name}
          </h3>
        </div>
        
        <p className="font-mono text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              currentStatus === 'active' ? 'bg-logo-green animate-pulse' :
              currentStatus === 'error' ? 'bg-crimson' :
              'bg-muted-foreground/30'
            )} />
            <span className={cn("font-mono text-[10px] uppercase", statusColors[currentStatus])}>
              {isRunning ? 'Running' : initialStatus}
            </span>
            {pendingReports > 0 && (
              <span className="px-1.5 py-0.5 bg-crimson/20 font-mono text-[9px] text-crimson">
                {pendingReports}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {functionName && (
              <button
                onClick={handleRun}
                disabled={isRunning || initialStatus === 'disabled'}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider px-2 py-1 border transition-all",
                  "hover:border-foreground hover:text-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isRunning ? "border-logo-green text-logo-green" : "border-border text-muted-foreground"
                )}
              >
                {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Run'}
              </button>
            )}
            {path && (
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-crimson transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
