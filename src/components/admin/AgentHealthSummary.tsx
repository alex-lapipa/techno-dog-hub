import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentStatus {
  id: string;
  agent_name: string;
  function_name: string;
  category: string;
  status: 'idle' | 'running' | 'success' | 'error' | 'disabled';
  last_run_at: string | null;
  run_count: number;
  success_count: number;
  error_count: number;
  avg_duration_ms: number | null;
}

const AgentHealthSummary = () => {
  const [liveAgents, setLiveAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalRuns: 0,
    totalErrors: 0,
    runningCount: 0,
    avgSuccessRate: 0
  });

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('agent-health-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_status'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setLiveAgents(prev => {
              const updated = payload.new as AgentStatus;
              const exists = prev.find(a => a.id === updated.id);
              if (exists) {
                return prev.map(a => a.id === updated.id ? updated : a);
              }
              return [...prev, updated];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: agentData } = await supabase
        .from('agent_status')
        .select('*')
        .order('agent_name');

      if (agentData) {
        setLiveAgents(agentData as unknown as AgentStatus[]);
        
        const totalRuns = agentData.reduce((sum, a: any) => sum + (a.run_count || 0), 0);
        const totalErrors = agentData.reduce((sum, a: any) => sum + (a.error_count || 0), 0);
        const runningCount = agentData.filter((a: any) => a.status === 'running').length;
        const avgSuccessRate = totalRuns > 0 
          ? Math.round(((totalRuns - totalErrors) / totalRuns) * 100)
          : 100;

        setTotals({ totalRuns, totalErrors, runningCount, avgSuccessRate });
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border p-4">
        <Skeleton className="h-4 w-24 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs uppercase tracking-wider">System Status</h3>
          {totals.runningCount > 0 && (
            <span className="px-1.5 py-0.5 bg-logo-green/20 font-mono text-[9px] text-logo-green">
              {totals.runningCount} active
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchData}
          className="p-1 h-6 w-6"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-background border border-border text-center">
          <div className="font-mono text-sm text-foreground">{totals.totalRuns}</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Runs</div>
        </div>
        <div className="p-2 bg-background border border-border text-center">
          <div className={cn(
            "font-mono text-sm",
            totals.totalErrors > 0 ? "text-crimson" : "text-foreground"
          )}>{totals.totalErrors}</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Errors</div>
        </div>
        <div className="p-2 bg-background border border-border text-center">
          <div className={cn(
            "font-mono text-sm",
            totals.avgSuccessRate >= 90 ? "text-logo-green" :
            totals.avgSuccessRate >= 70 ? "text-amber-500" : "text-crimson"
          )}>{totals.avgSuccessRate}%</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Success</div>
        </div>
      </div>

      {/* Status List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {liveAgents.length === 0 ? (
          <div className="text-center py-4">
            <div className="font-mono text-xs text-muted-foreground">No data</div>
          </div>
        ) : (
          liveAgents.map(agent => (
            <div
              key={agent.id}
              className="flex items-center justify-between py-1.5 px-2 bg-background border border-border"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  agent.status === 'running' ? 'bg-logo-green animate-pulse' :
                  agent.status === 'error' ? 'bg-crimson' :
                  agent.status === 'success' ? 'bg-logo-green' :
                  'bg-muted-foreground/30'
                )} />
                <span className="font-mono text-[11px] text-foreground truncate">
                  {agent.agent_name}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {formatTimeAgo(agent.last_run_at)}
                </span>
                {agent.status === 'running' && (
                  <Loader2 className="w-3 h-3 text-logo-green animate-spin" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentHealthSummary;
