import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAgentRunnerOptions {
  functionName: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

interface AgentRunnerReturn {
  isRunning: boolean;
  runAgent: (action?: string, params?: Record<string, any>) => Promise<any>;
  lastResult: any;
  lastError: Error | null;
}

/**
 * Shared hook for running Supabase edge function agents
 * Provides consistent loading states, error handling, and toast notifications
 */
export const useAgentRunner = ({
  functionName,
  onSuccess,
  onError,
  successMessage,
  errorMessage = 'Agent failed'
}: UseAgentRunnerOptions): AgentRunnerReturn => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [lastError, setLastError] = useState<Error | null>(null);

  const runAgent = useCallback(async (action?: string, params?: Record<string, any>) => {
    setIsRunning(true);
    setLastError(null);
    
    try {
      const body = action ? { action, ...params } : params;
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) throw error;
      
      setLastResult(data);
      
      if (successMessage || data?.message) {
        toast({
          title: successMessage || `${functionName} completed`,
          description: data?.message || 'Operation successful'
        });
      }
      
      onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setLastError(error);
      
      toast({
        title: errorMessage,
        description: error.message,
        variant: 'destructive'
      });
      
      onError?.(error);
      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [functionName, onSuccess, onError, successMessage, errorMessage, toast]);

  return {
    isRunning,
    runAgent,
    lastResult,
    lastError
  };
};

export default useAgentRunner;
