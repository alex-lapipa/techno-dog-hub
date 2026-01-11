/**
 * Generic Agent Admin Component
 * 
 * A metadata-driven template for agent admin pages to reduce duplication.
 * Existing specialized pages can gradually migrate to this pattern.
 * 
 * @example
 * <GenericAgentAdmin
 *   config={{
 *     agentName: 'media-curator',
 *     title: 'Media Curator',
 *     description: 'Manages media asset curation and processing',
 *     functionName: 'media-curator',
 *     statsQueries: [...],
 *     tabs: [...]
 *   }}
 * />
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  AgentRunButton, 
  AgentStatusBadge, 
  AgentLastRun,
  QuickStatsRow,
  AgentEmptyState
} from './AgentAdminComponents';
import { 
  Activity, 
  Database, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  LucideIcon
} from 'lucide-react';

// ============================================
// Type Definitions
// ============================================

export interface StatConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  query: {
    table: string;
    count?: boolean;
    filter?: Record<string, unknown>;
  };
}

export interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
  component?: React.ComponentType<{ agentName: string }>;
  content?: React.ReactNode;
}

export interface AgentAdminConfig {
  agentName: string;
  title: string;
  description: string;
  functionName: string;
  icon?: LucideIcon;
  statsConfigs?: StatConfig[];
  tabs?: TabConfig[];
  customActions?: React.ReactNode;
}

interface AgentStatus {
  status: string;
  last_run_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  run_count: number;
  success_count: number;
  error_count: number;
  avg_duration_ms: number | null;
}

// ============================================
// Default Stats Configuration
// ============================================

const DEFAULT_STATS: StatConfig[] = [
  {
    key: 'runs',
    label: 'Total Runs',
    icon: Activity,
    query: { table: 'agent_status', count: true }
  }
];

// ============================================
// Main Component
// ============================================

export function GenericAgentAdmin({ config }: { config: AgentAdminConfig }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});

  const fetchAgentStatus = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('agent_status')
        .select('*')
        .eq('agent_name', config.agentName)
        .maybeSingle();
      
      if (data) {
        setAgentStatus(data as AgentStatus);
      }
    } catch (error) {
      console.error('Failed to fetch agent status:', error);
    }
  }, [config.agentName]);

  const fetchStats = useCallback(async () => {
    const statsConfigs = config.statsConfigs || DEFAULT_STATS;
    const newStats: Record<string, number> = {};

    await Promise.all(
      statsConfigs.map(async (stat) => {
        try {
          if (stat.query.count) {
            const query = supabase
              .from(stat.query.table as 'agent_status')
              .select('*', { count: 'exact', head: true });
            
            const { count } = await query;
            newStats[stat.key] = count || 0;
          }
        } catch (error) {
          console.error(`Failed to fetch stat ${stat.key}:`, error);
          newStats[stat.key] = 0;
        }
      })
    );

    setStats(newStats);
  }, [config.statsConfigs]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchAgentStatus(), fetchStats()]);
    setIsLoading(false);
  }, [fetchAgentStatus, fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke(config.functionName);
      
      if (error) throw error;
      
      toast({
        title: 'Agent Executed',
        description: data?.message || `${config.title} completed successfully`,
      });
      
      await fetchData();
    } catch (error) {
      console.error('Agent execution failed:', error);
      toast({
        title: 'Execution Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getAgentStatusType = (): 'idle' | 'running' | 'success' | 'error' => {
    if (isRunning) return 'running';
    if (!agentStatus) return 'idle';
    if (agentStatus.status === 'error') return 'error';
    if (agentStatus.last_success_at) return 'success';
    return 'idle';
  };

  const Icon = config.icon || Activity;

  return (
    <AdminPageLayout
      title={config.title}
      description={config.description}
      isLoading={isLoading}
      onRefresh={fetchData}
      actions={
        <div className="flex items-center gap-3">
          {config.customActions}
          <AgentRunButton
            onClick={runAgent}
            isRunning={isRunning}
            label={`Run ${config.title}`}
            runningLabel="Executing..."
          />
        </div>
      }
    >
      {/* Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-logo-green" />
          <AgentStatusBadge status={getAgentStatusType()} />
          {agentStatus && (
            <AgentLastRun 
              lastRunAt={agentStatus.last_run_at}
              status={agentStatus.last_error_at && 
                new Date(agentStatus.last_error_at) > new Date(agentStatus.last_success_at || 0) 
                ? 'error' : 'success'}
              duration={agentStatus.avg_duration_ms || undefined}
            />
          )}
        </div>
        
        {agentStatus && (
          <QuickStatsRow
            stats={[
              { label: 'Runs', value: agentStatus.run_count || 0, icon: Activity },
              { label: 'Success', value: agentStatus.success_count || 0, icon: CheckCircle },
              { label: 'Errors', value: agentStatus.error_count || 0, icon: AlertCircle },
            ]}
          />
        )}
      </div>

      {/* Stats Cards */}
      {config.statsConfigs && config.statsConfigs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {config.statsConfigs.map((stat) => (
            <AdminStatsCard
              key={stat.key}
              label={stat.label}
              value={stats[stat.key] || 0}
              icon={stat.icon}
            />
          ))}
        </div>
      )}

      {/* Tabs or Default Content */}
      {config.tabs && config.tabs.length > 0 ? (
        <Tabs defaultValue={config.tabs[0].id} className="space-y-4">
          <TabsList className="bg-muted/50 border border-border">
            {config.tabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="font-mono text-xs uppercase"
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5 mr-1.5" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {config.tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {tab.component ? (
                <tab.component agentName={config.agentName} />
              ) : tab.content ? (
                tab.content
              ) : (
                <AgentEmptyState
                  icon={tab.icon}
                  title={`No ${tab.label} Data`}
                  description={`Run the agent to generate ${tab.label.toLowerCase()} data.`}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-mono text-sm uppercase">Agent Output</CardTitle>
          </CardHeader>
          <CardContent>
            {agentStatus?.last_error_message ? (
              <div className="p-4 bg-crimson/10 border border-crimson/30 rounded">
                <p className="text-xs font-mono text-crimson">
                  {agentStatus.last_error_message}
                </p>
              </div>
            ) : (
              <AgentEmptyState
                icon={Database}
                title="No Recent Output"
                description="Run the agent to see results here."
                action={
                  <AgentRunButton
                    onClick={runAgent}
                    isRunning={isRunning}
                    variant="outline"
                    size="sm"
                  />
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </AdminPageLayout>
  );
}

export default GenericAgentAdmin;
