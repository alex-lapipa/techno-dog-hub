import { useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
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
}

const AgentCard = ({
  name,
  category,
  description,
  status: initialStatus,
  lastRun,
  pendingReports = 0,
  frameNumber = '01',
  functionName
}: AgentCardProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const statusColors = {
    active: 'bg-logo-green/20 border-logo-green/50 text-logo-green',
    idle: 'bg-muted/50 border-border text-muted-foreground',
    error: 'bg-crimson/20 border-crimson/50 text-crimson',
    disabled: 'bg-muted/20 border-border/50 text-muted-foreground/50'
  };

  const statusLabels = {
    active: 'RUNNING',
    idle: 'STANDBY',
    error: 'ALERT',
    disabled: 'OFF'
  };

  const currentStatus = isRunning ? 'active' : initialStatus;

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
        description: data?.message || 'Agent ran successfully'
      });

      // Reset success indicator after 3 seconds
      setTimeout(() => setRunStatus('idle'), 3000);
    } catch (error) {
      console.error(`Failed to run ${name}:`, error);
      setRunStatus('error');
      toast({
        title: `${name} failed`,
        description: 'Check logs for details',
        variant: 'destructive'
      });

      // Reset error indicator after 3 seconds
      setTimeout(() => setRunStatus('idle'), 3000);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative w-full text-left bg-zinc-800 p-1 transition-all duration-300",
        "hover:scale-[1.02]",
        initialStatus === 'disabled' && "opacity-50"
      )}
    >
      {/* Sprocket holes left */}
      <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
        ))}
      </div>
      
      {/* Sprocket holes right */}
      <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
        ))}
      </div>
      
      {/* Content container */}
      <div 
        className={cn(
          "relative mx-2 p-4 border border-crimson/20 transition-all duration-500",
          "group-hover:border-crimson/60 group-hover:shadow-[0_0_30px_hsl(var(--crimson)/0.3)]",
          isRunning && "border-logo-green/60 shadow-[0_0_30px_hsl(var(--logo-green)/0.3)]"
        )}
        style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}
      >
        {/* VHS overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-100 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
              radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)
            `,
          }}
        />

        {/* Frame number */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 border border-crimson/40">
          <span className="text-[10px] text-crimson tracking-wider font-bold font-mono">{frameNumber}</span>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "absolute top-2 right-2 px-2 py-0.5 border text-[9px] font-mono uppercase tracking-wider flex items-center gap-1",
          statusColors[currentStatus]
        )}>
          {isRunning && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
          {runStatus === 'success' && <CheckCircle className="w-2.5 h-2.5" />}
          {runStatus === 'error' && <AlertCircle className="w-2.5 h-2.5" />}
          {isRunning ? 'RUNNING' : statusLabels[initialStatus]}
        </div>

        {/* Content */}
        <div className="relative z-10 pt-6">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
            {category}
          </div>
          <h3 className="font-mono text-sm uppercase tracking-tight text-foreground group-hover:text-crimson transition-colors">
            {name}
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>

          {/* Footer with Run button */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-crimson/20">
            <div className="flex items-center gap-2">
              {lastRun && (
                <span className="font-mono text-[10px] text-muted-foreground">
                  Last: {lastRun}
                </span>
              )}
              {pendingReports > 0 && (
                <span className="px-2 py-0.5 bg-crimson/20 border border-crimson/50 font-mono text-[10px] text-crimson">
                  {pendingReports}
                </span>
              )}
            </div>
            
            {functionName && (
              <button
                onClick={handleRun}
                disabled={isRunning || initialStatus === 'disabled'}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 border font-mono text-[10px] uppercase tracking-wider transition-all",
                  "hover:bg-logo-green/20 hover:border-logo-green/60 hover:text-logo-green",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isRunning 
                    ? "border-logo-green/60 text-logo-green bg-logo-green/10" 
                    : "border-border text-muted-foreground"
                )}
              >
                {isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                {isRunning ? 'Running' : 'Run'}
              </button>
            )}
          </div>
        </div>

        {/* Hover glow */}
        <div className={cn(
          "absolute inset-0 pointer-events-none bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-500",
          isRunning 
            ? "from-logo-green/30 via-logo-green/10 opacity-100" 
            : "from-crimson/30 via-crimson/10 group-hover:opacity-100"
        )} />
      </div>
    </div>
  );
};

export default AgentCard;
