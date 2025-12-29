import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface AgentStatus {
  id: string;
  agent_name: string;
  function_name: string;
  category: string;
  status: 'idle' | 'running' | 'success' | 'error' | 'disabled';
  last_run_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  run_count: number;
  success_count: number;
  error_count: number;
  avg_duration_ms: number | null;
}

interface AgentStats {
  agent_name: string;
  total_reports: number;
  error_count: number;
  warning_count: number;
  info_count: number;
  last_run: string | null;
  success_rate: number;
}

const AgentHealthSummary = () => {
  const [liveAgents, setLiveAgents] = useState<AgentStatus[]>([]);
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalReports: 0,
    totalErrors: 0,
    totalWarnings: 0,
    avgSuccessRate: 0,
    runningCount: 0
  });

  useEffect(() => {
    fetchData();

    // Subscribe to real-time agent status updates
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
      // Fetch live agent status
      const { data: agentData } = await supabase
        .from('agent_status')
        .select('*')
        .order('agent_name');

      if (agentData) {
        setLiveAgents(agentData as unknown as AgentStatus[]);
      }

      // Also fetch historical report data for stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: reports } = await supabase
        .from('agent_reports')
        .select('agent_name, severity, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // Group by agent and calculate stats
      const agentMap = new Map<string, {
        total: number;
        errors: number;
        warnings: number;
        info: number;
        lastRun: string | null;
      }>();

      reports?.forEach(report => {
        const existing = agentMap.get(report.agent_name) || {
          total: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          lastRun: null
        };

        existing.total++;
        if (report.severity === 'error' || report.severity === 'critical') {
          existing.errors++;
        } else if (report.severity === 'warning') {
          existing.warnings++;
        } else {
          existing.info++;
        }

        if (!existing.lastRun || new Date(report.created_at) > new Date(existing.lastRun)) {
          existing.lastRun = report.created_at;
        }

        agentMap.set(report.agent_name, existing);
      });

      const agentStats: AgentStats[] = Array.from(agentMap.entries()).map(([name, data]) => ({
        agent_name: name,
        total_reports: data.total,
        error_count: data.errors,
        warning_count: data.warnings,
        info_count: data.info,
        last_run: data.lastRun,
        success_rate: data.total > 0 ? Math.round(((data.total - data.errors) / data.total) * 100) : 100
      }));

      agentStats.sort((a, b) => {
        if (!a.last_run) return 1;
        if (!b.last_run) return -1;
        return new Date(b.last_run).getTime() - new Date(a.last_run).getTime();
      });

      setStats(agentStats);

      // Calculate totals
      const totalReports = agentStats.reduce((sum, a) => sum + a.total_reports, 0);
      const totalErrors = agentStats.reduce((sum, a) => sum + a.error_count, 0);
      const totalWarnings = agentStats.reduce((sum, a) => sum + a.warning_count, 0);
      const avgSuccessRate = agentStats.length > 0 
        ? Math.round(agentStats.reduce((sum, a) => sum + a.success_rate, 0) / agentStats.length)
        : 100;
      const runningCount = (agentData || []).filter((a: any) => a.status === 'running').length;

      setTotals({ totalReports, totalErrors, totalWarnings, avgSuccessRate, runningCount });
    } catch (err) {
      console.error('Error fetching agent stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getHealthColor = (successRate: number) => {
    if (successRate >= 90) return 'text-logo-green';
    if (successRate >= 70) return 'text-amber-500';
    return 'text-crimson';
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-logo-green" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-crimson" />;
      case 'disabled':
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBorder = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return 'border-amber-500/50 bg-amber-500/10';
      case 'success':
        return 'border-logo-green/50 bg-logo-green/10';
      case 'error':
        return 'border-crimson/50 bg-crimson/10';
      default:
        return 'border-border bg-background/50';
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-logo-green" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-border p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-logo-green" />
        <h3 className="font-mono text-xs uppercase tracking-wider text-logo-green">Agent Health</h3>
        {totals.runningCount > 0 && (
          <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/50 font-mono text-[9px] text-amber-500">
            {totals.runningCount} RUNNING
          </span>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchData}
          className="ml-auto p-1 h-6 w-6"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="p-2 bg-background/50 border border-border text-center">
          <div className="font-mono text-lg text-foreground">{totals.totalReports}</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Reports</div>
        </div>
        <div className="p-2 bg-crimson/10 border border-crimson/30 text-center">
          <div className="font-mono text-lg text-crimson">{totals.totalErrors}</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Errors</div>
        </div>
        <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-center">
          <div className="font-mono text-lg text-amber-500">{totals.totalWarnings}</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Warnings</div>
        </div>
        <div className="p-2 bg-logo-green/10 border border-logo-green/30 text-center">
          <div className={`font-mono text-lg ${getHealthColor(totals.avgSuccessRate)}`}>{totals.avgSuccessRate}%</div>
          <div className="font-mono text-[9px] text-muted-foreground uppercase">Health</div>
        </div>
      </div>

      {/* Live Agent Status Grid */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {liveAgents.length === 0 && stats.length === 0 ? (
          <div className="text-center py-4">
            <div className="font-mono text-xs text-muted-foreground">No agent data yet</div>
          </div>
        ) : (
          liveAgents.map(agent => {
            const historicalStats = stats.find(s => s.agent_name === agent.agent_name);
            const successRate = agent.run_count > 0 
              ? Math.round((agent.success_count / agent.run_count) * 100)
              : (historicalStats?.success_rate || 100);

            return (
              <div
                key={agent.id}
                className={`p-2 border flex items-center gap-3 transition-colors ${getStatusBorder(agent.status)}`}
              >
                {/* Status indicator */}
                <div className={`w-8 h-8 flex items-center justify-center border ${getStatusBorder(agent.status)}`}>
                  {getStatusIcon(agent.status)}
                </div>

                {/* Agent name and last run */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-foreground truncate">{agent.agent_name}</div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono text-[10px]">{formatTimeAgo(agent.last_run_at)}</span>
                    {agent.avg_duration_ms && (
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        ({Math.round(agent.avg_duration_ms / 1000)}s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-right">
                  <div className="hidden sm:block">
                    <div className="font-mono text-[10px] text-muted-foreground">{agent.run_count} runs</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {agent.error_count > 0 && (
                      <span className="font-mono text-[10px] text-crimson">{agent.error_count}E</span>
                    )}
                  </div>
                  <div className={`font-mono text-xs font-medium ${getHealthColor(successRate)}`}>
                    {successRate}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AgentHealthSummary;
