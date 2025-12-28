import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, CheckCircle2, XCircle, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    totalReports: 0,
    totalErrors: 0,
    totalWarnings: 0,
    avgSuccessRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get all reports from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: reports, error } = await supabase
        .from('agent_reports')
        .select('agent_name, severity, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

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

      // Sort by last run (most recent first)
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

      setTotals({ totalReports, totalErrors, totalWarnings, avgSuccessRate });
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
        <span className="font-mono text-[10px] text-muted-foreground ml-auto">Last 30 days</span>
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

      {/* Per-Agent Stats */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {stats.length === 0 ? (
          <div className="text-center py-4">
            <div className="font-mono text-xs text-muted-foreground">No agent data yet</div>
          </div>
        ) : (
          stats.map(agent => (
            <div
              key={agent.agent_name}
              className="p-2 bg-background/30 border border-border/50 flex items-center gap-3"
            >
              {/* Health indicator */}
              <div className={`w-8 h-8 flex items-center justify-center border ${
                agent.success_rate >= 90 ? 'border-logo-green/50 bg-logo-green/10' :
                agent.success_rate >= 70 ? 'border-amber-500/50 bg-amber-500/10' :
                'border-crimson/50 bg-crimson/10'
              }`}>
                {agent.success_rate >= 90 ? (
                  <CheckCircle2 className="w-4 h-4 text-logo-green" />
                ) : agent.success_rate >= 70 ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-crimson" />
                )}
              </div>

              {/* Agent name and last run */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs text-foreground truncate">{agent.agent_name}</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-[10px]">{formatTimeAgo(agent.last_run)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 text-right">
                <div className="hidden sm:block">
                  <div className="font-mono text-[10px] text-muted-foreground">{agent.total_reports} runs</div>
                </div>
                <div className="flex items-center gap-1">
                  {agent.error_count > 0 && (
                    <span className="font-mono text-[10px] text-crimson">{agent.error_count}E</span>
                  )}
                  {agent.warning_count > 0 && (
                    <span className="font-mono text-[10px] text-amber-500">{agent.warning_count}W</span>
                  )}
                </div>
                <div className={`font-mono text-xs font-medium ${getHealthColor(agent.success_rate)}`}>
                  {agent.success_rate}%
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentHealthSummary;
