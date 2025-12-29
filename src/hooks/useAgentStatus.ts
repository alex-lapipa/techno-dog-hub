import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AgentStatus {
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
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface UseAgentStatusReturn {
  agents: AgentStatus[];
  loading: boolean;
  error: Error | null;
  refreshAgents: () => Promise<void>;
  updateAgentStatus: (agentName: string, status: Partial<AgentStatus>) => Promise<void>;
  runAgent: (agentName: string, functionName: string) => Promise<any>;
  runAllAgents: () => Promise<{ success: number; failed: number }>;
  isRunningAll: boolean;
}

/**
 * Hook for real-time agent status synchronization
 * Provides live updates via Supabase realtime subscriptions
 */
export const useAgentStatus = (): UseAgentStatusReturn => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('agent_status')
        .select('*')
        .order('category', { ascending: true })
        .order('agent_name', { ascending: true });

      if (fetchError) throw fetchError;
      
      // Type assertion since the table is new and types may not be regenerated yet
      setAgents((data || []) as unknown as AgentStatus[]);
      setError(null);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch agent status');
      setError(e);
      console.error('Error fetching agent status:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    fetchAgents();

    const channel = supabase
      .channel('agent-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_status'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setAgents(prev => prev.map(agent => 
              agent.id === (payload.new as AgentStatus).id 
                ? payload.new as AgentStatus 
                : agent
            ));
          } else if (payload.eventType === 'INSERT') {
            setAgents(prev => [...prev, payload.new as AgentStatus]);
          } else if (payload.eventType === 'DELETE') {
            setAgents(prev => prev.filter(agent => agent.id !== (payload.old as AgentStatus).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAgents]);

  const updateAgentStatus = useCallback(async (agentName: string, status: Partial<AgentStatus>) => {
    try {
      const { error: updateError } = await supabase
        .from('agent_status')
        .update({ ...status, updated_at: new Date().toISOString() })
        .eq('agent_name', agentName);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating agent status:', err);
      throw err;
    }
  }, []);

  const runAgent = useCallback(async (agentName: string, functionName: string) => {
    const startTime = Date.now();
    
    // Update status to running
    await updateAgentStatus(agentName, { 
      status: 'running',
      last_run_at: new Date().toISOString()
    });

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(functionName);
      
      if (invokeError) throw invokeError;

      const duration = Date.now() - startTime;
      
      // Update status to success
      await updateAgentStatus(agentName, {
        status: 'success',
        last_success_at: new Date().toISOString(),
        last_error_message: null,
        run_count: (agents.find(a => a.agent_name === agentName)?.run_count || 0) + 1,
        success_count: (agents.find(a => a.agent_name === agentName)?.success_count || 0) + 1,
        avg_duration_ms: duration
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Update status to error
      await updateAgentStatus(agentName, {
        status: 'error',
        last_error_at: new Date().toISOString(),
        last_error_message: errorMessage,
        run_count: (agents.find(a => a.agent_name === agentName)?.run_count || 0) + 1,
        error_count: (agents.find(a => a.agent_name === agentName)?.error_count || 0) + 1
      });

      throw err;
    }
  }, [agents, updateAgentStatus]);

  const runAllAgents = useCallback(async () => {
    setIsRunningAll(true);
    let success = 0;
    let failed = 0;

    const enabledAgents = agents.filter(a => a.status !== 'disabled');

    for (const agent of enabledAgents) {
      try {
        await runAgent(agent.agent_name, agent.function_name);
        success++;
      } catch {
        failed++;
      }
    }

    setIsRunningAll(false);

    toast({
      title: 'All agents completed',
      description: `${success} succeeded, ${failed} failed`,
      variant: failed > 0 ? 'destructive' : 'default'
    });

    return { success, failed };
  }, [agents, runAgent, toast]);

  return {
    agents,
    loading,
    error,
    refreshAgents: fetchAgents,
    updateAgentStatus,
    runAgent,
    runAllAgents,
    isRunningAll
  };
};

export default useAgentStatus;
