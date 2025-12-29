import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuditIssue {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  entity: string;
  table: string;
  message: string;
  count: number;
  fixable: boolean;
  fixType?: string;
}

export interface AuditProposal {
  id: string;
  action: string;
  entity: string;
  table: string;
  description: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  targetIds?: string[];
  fixType: string;
}

export interface AuditSchema {
  tables: Array<{
    name: string;
    entity: string;
    rows: number;
    hasRelations: boolean;
  }>;
}

export interface SourceMapStats {
  total_canonical: number;
  total_rag: number;
  linked_count: number;
  canonical_only: number;
  rag_only: number;
  link_percentage: number;
}

export interface AuditData {
  schema: AuditSchema;
  healthScores: Record<string, number>;
  issues: AuditIssue[];
  proposals: AuditProposal[];
  totalRecords: number;
  timestamp?: string;
  sourceMapStats?: SourceMapStats;
}

export interface PreviewData {
  fixType: string;
  table: string;
  affectedRecords: any[];
  estimatedChanges: number;
  action: string;
}

export interface FixResult {
  success: boolean;
  action: string;
  affectedCount: number;
  details: string;
  rollbackData?: any;
}

export function useAuditActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [lastFixResult, setLastFixResult] = useState<FixResult | null>(null);

  const runScan = useCallback(async (): Promise<AuditData | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-actions', {
        body: { action: 'scan' }
      });

      if (error) throw error;

      const result = data as AuditData;
      
      // Fetch source map stats from the new database function
      const { data: statsData } = await supabase.rpc('get_source_map_stats');
      if (statsData && statsData.length > 0) {
        result.sourceMapStats = statsData[0] as SourceMapStats;
      }
      
      setAuditData(result);
      toast.success(`Scan complete: ${result.issues.length} issues found`);
      return result;
    } catch (err: any) {
      console.error('Audit scan failed:', err);
      toast.error('Failed to run audit scan');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPreview = useCallback(async (
    fixType: string,
    targetTable?: string,
    targetIds?: string[]
  ): Promise<PreviewData | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-actions', {
        body: { 
          action: 'preview',
          fixType,
          targetTable,
          targetIds
        }
      });

      if (error) throw error;

      const preview = data.preview as PreviewData;
      setPreviewData(preview);
      return preview;
    } catch (err: any) {
      console.error('Preview failed:', err);
      toast.error('Failed to get preview');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFix = useCallback(async (
    fixType: string,
    targetTable?: string,
    targetIds?: string[],
    dryRun: boolean = true
  ): Promise<FixResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-actions', {
        body: { 
          action: 'apply',
          fixType,
          targetTable,
          targetIds,
          dryRun
        }
      });

      if (error) throw error;

      if (dryRun) {
        toast.info('Dry run complete - no changes made');
        setPreviewData(data.preview);
        return null;
      }

      const result = data.result as FixResult;
      setLastFixResult(result);

      if (result.success) {
        toast.success(`Fix applied: ${result.details}`);
        // Refresh audit data after successful fix
        await runScan();
      } else {
        toast.error(`Fix failed: ${result.details}`);
      }

      return result;
    } catch (err: any) {
      console.error('Apply fix failed:', err);
      toast.error('Failed to apply fix');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [runScan]);

  const applyProposal = useCallback(async (
    proposal: AuditProposal,
    dryRun: boolean = true
  ): Promise<FixResult | null> => {
    return applyFix(
      proposal.fixType,
      proposal.table,
      proposal.targetIds,
      dryRun
    );
  }, [applyFix]);

  return {
    isLoading,
    auditData,
    previewData,
    lastFixResult,
    runScan,
    getPreview,
    applyFix,
    applyProposal,
    setPreviewData
  };
}
