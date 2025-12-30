import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for interacting with the Doggy Self-Healing Agent
 * 
 * SCOPE: Only affects Doggy landing page, never main site
 * Uses isolated doggy_* tables
 */

interface AgentStatus {
  lastRun: {
    id: string;
    run_type: string;
    status: string;
    started_at: string;
    finished_at?: string;
    performance_score?: number;
    virality_score?: number;
    issues_detected?: number;
    issues_auto_fixed?: number;
  } | null;
  unresolvedIssues: number;
  pendingHQSuggestions: Array<{
    id: string;
    issue_type: string;
    hq_suggestion: string;
  }>;
  recentFixes: Array<{
    id: string;
    fix_type: string;
    target_component: string;
    applied_at: string;
    success: boolean;
  }>;
  isHealthy: boolean;
}

interface AnalysisResult {
  runId: string;
  result: {
    performanceScore: number;
    viralityScore: number;
    issuesFound: Array<{
      type: string;
      severity: string;
      description: string;
      autoFixable: boolean;
      component?: string;
      doggy?: string;
    }>;
    hqSuggestions: Array<{
      title: string;
      description: string;
      priority: string;
      category: string;
    }>;
    autoFixesApplied: Array<{
      type: string;
      component: string;
      description: string;
      success: boolean;
    }>;
  };
}

export const useDoggyAgent = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  const runAnalysis = useCallback(async (): Promise<AnalysisResult | null> => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('doggy-self-heal', {
        body: { action: 'analyze' }
      });

      if (error) throw error;
      
      setLastAnalysis(data);
      
      const { result } = data;
      if (result.issuesFound.length > 0) {
        toast.info(`Doggy Agent found ${result.issuesFound.length} issue(s)`, {
          description: result.autoFixesApplied.length > 0 
            ? `Auto-fixed ${result.autoFixesApplied.length} on landing page`
            : 'Check HQ for suggestions'
        });
      } else {
        toast.success('Doggy landing page is healthy!', {
          description: `Performance: ${result.performanceScore}% | Virality: ${result.viralityScore}%`
        });
      }

      return data;
    } catch (error) {
      console.error('Doggy Agent analysis failed:', error);
      toast.error('Agent analysis failed');
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const getStatus = useCallback(async (): Promise<AgentStatus | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('doggy-self-heal', {
        body: { action: 'get-status' }
      });

      if (error) throw error;
      
      setStatus(data.status);
      return data.status;
    } catch (error) {
      console.error('Failed to get agent status:', error);
      return null;
    }
  }, []);

  const reportError = useCallback(async (errorData: {
    error_type: 'share' | 'download' | 'render' | 'network' | 'unknown';
    error_message: string;
    stack_trace?: string;
    page_source: 'main_page' | 'widget' | 'shared';
    doggy_name?: string;
    action_attempted?: string;
  }) => {
    try {
      // Get session info
      const session_id = sessionStorage.getItem('doggy_session_id');
      
      await supabase.functions.invoke('doggy-self-heal', {
        body: { 
          action: 'report-error',
          data: {
            ...errorData,
            session_id,
            user_agent: navigator.userAgent
          }
        }
      });
    } catch (error) {
      // Silent fail - don't break UX for error reporting
      console.debug('Error reporting failed:', error);
    }
  }, []);

  const applyFix = useCallback(async (issueId: string) => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('doggy-self-heal', {
        body: { action: 'auto-fix', data: { issueId } }
      });

      if (error) throw error;
      
      if (data.success && data.fix) {
        toast.success('Fix applied!', {
          description: data.fix.description
        });
      }

      return data;
    } catch (error) {
      console.error('Failed to apply fix:', error);
      toast.error('Failed to apply fix');
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const approveHQSuggestion = useCallback(async (issueId: string) => {
    try {
      // This just marks the suggestion as approved - actual implementation
      // would be done by admin in Doggies HQ
      const { error } = await supabase
        .from('doggy_agent_issues')
        .update({ 
          hq_approved: true, 
          hq_approved_at: new Date().toISOString() 
        })
        .eq('id', issueId);

      if (error) throw error;
      
      toast.success('Suggestion approved for HQ implementation');
      return true;
    } catch (error) {
      console.error('Failed to approve suggestion:', error);
      toast.error('Failed to approve suggestion');
      return false;
    }
  }, []);

  const rejectHQSuggestion = useCallback(async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('doggy_agent_issues')
        .update({ 
          hq_suggestion: null,
          resolved_at: new Date().toISOString()
        })
        .eq('id', issueId);

      if (error) throw error;
      
      toast.info('Suggestion dismissed');
      return true;
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
      return false;
    }
  }, []);

  return {
    isRunning,
    status,
    lastAnalysis,
    runAnalysis,
    getStatus,
    reportError,
    applyFix,
    approveHQSuggestion,
    rejectHQSuggestion
  };
};

export default useDoggyAgent;
