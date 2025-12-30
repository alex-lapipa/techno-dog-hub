import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Brain,
  Cpu,
  Zap,
  Activity,
  Play,
  RefreshCw
} from 'lucide-react';

const AIOrchestratorAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalRuns: 0,
    avgDuration: 0
  });
  const [agentStatuses, setAgentStatuses] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch agent status from database
      const { data: statuses, count } = await supabase
        .from('agent_status')
        .select('*', { count: 'exact' })
        .order('last_run_at', { ascending: false });

      if (statuses) {
        setAgentStatuses(statuses);
        
        const activeCount = statuses.filter(s => s.status === 'running').length;
        const totalRuns = statuses.reduce((sum, s) => sum + (s.run_count || 0), 0);
        const avgDur = statuses.reduce((sum, s) => sum + (s.avg_duration_ms || 0), 0) / (statuses.length || 1);
        
        setStats({
          totalAgents: count || 0,
          activeAgents: activeCount,
          totalRuns: totalRuns,
          avgDuration: Math.round(avgDur)
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runOrchestration = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestration');
      if (error) throw error;
      
      toast({
        title: 'AI Orchestration completed',
        description: data?.message || 'Systems synchronized'
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Orchestration failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-amber-500 border-amber-500/50';
      case 'success': return 'text-logo-green border-logo-green/50';
      case 'error': return 'text-crimson border-crimson/50';
      default: return 'text-muted-foreground border-border';
    }
  };

  return (
    <AdminPageLayout
      title="AI Orchestrator"
      description="Central AI agent coordination and management"
      icon={Brain}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      isLoading={isLoading}
      actions={
        <Button 
          onClick={runOrchestration} 
          disabled={isRunning}
          variant="brutalist" 
          size="sm" 
          className="font-mono text-xs uppercase"
        >
          {isRunning ? (
            <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Running...</>
          ) : (
            <><Play className="w-3.5 h-3.5 mr-1.5" /> Orchestrate</>
          )}
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Agents"
          value={stats.totalAgents}
          icon={Cpu}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Active Now"
          value={stats.activeAgents}
          icon={Activity}
          iconColor="text-amber-500"
        />
        <AdminStatsCard
          label="Total Runs"
          value={stats.totalRuns}
          icon={Zap}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Avg Duration"
          value={`${stats.avgDuration}ms`}
          icon={Brain}
        />
      </div>

      {/* Agent Status Grid */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-logo-green" />
            AGENT STATUS MATRIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agentStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
                No agents registered. Run orchestration to initialize.
              </p>
            ) : (
              agentStatuses.map((agent) => (
                <div 
                  key={agent.id} 
                  className={`p-4 bg-zinc-800 border rounded ${getStatusColor(agent.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-sm">{agent.agent_name}</p>
                      <p className="text-xs text-muted-foreground">{agent.function_name}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-[10px] uppercase ${getStatusColor(agent.status)}`}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Runs:</span>
                      <span className="ml-1">{agent.run_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success:</span>
                      <span className="ml-1">{agent.success_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors:</span>
                      <span className="ml-1 text-crimson">{agent.error_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg:</span>
                      <span className="ml-1">{agent.avg_duration_ms || 0}ms</span>
                    </div>
                  </div>
                  {agent.last_run_at && (
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Last run: {new Date(agent.last_run_at).toLocaleString()}
                    </p>
                  )}
                  {agent.last_error_message && (
                    <p className="text-[10px] text-crimson mt-1 truncate" title={agent.last_error_message}>
                      Error: {agent.last_error_message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
};

export default AIOrchestratorAdmin;
