/**
 * Knowledge Layer Change Log
 * 
 * Records all mutations for audit trail and reversibility.
 * Every write to kl_* tables should be logged here.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ChangeLogEntry {
  id: string;
  actor: string;
  action: 'insert' | 'update' | 'delete';
  table_name: string;
  record_id: string;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  reversible: boolean;
  reversed_at: string | null;
  reversed_by: string | null;
  created_at: string;
}

type ChangeAction = 'insert' | 'update' | 'delete';

/**
 * Log a change to the change log
 */
export async function logChange(
  actor: string,
  action: ChangeAction,
  tableName: string,
  recordId: string,
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('kl_change_log')
      .insert({
        actor,
        action,
        table_name: tableName,
        record_id: recordId,
        before_json: before,
        after_json: after,
        metadata,
        reversible: action !== 'delete' || before !== null,
      } as never)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log change:', error);
      return null;
    }

    console.log(`[CHANGE LOG] ${action} on ${tableName}:${recordId} by ${actor}`);
    return data?.id || null;
  } catch (e) {
    console.error('Change log error:', e);
    return null;
  }
}

/**
 * Log an insert operation
 */
export async function logInsert(
  actor: string,
  tableName: string,
  recordId: string,
  data: Record<string, unknown>,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  return logChange(actor, 'insert', tableName, recordId, null, data, metadata);
}

/**
 * Log an update operation
 */
export async function logUpdate(
  actor: string,
  tableName: string,
  recordId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  return logChange(actor, 'update', tableName, recordId, before, after, metadata);
}

/**
 * Log a delete operation
 */
export async function logDelete(
  actor: string,
  tableName: string,
  recordId: string,
  deletedData: Record<string, unknown>,
  metadata: Record<string, unknown> = {}
): Promise<string | null> {
  return logChange(actor, 'delete', tableName, recordId, deletedData, null, metadata);
}

/**
 * Reverse a change (if possible)
 */
export async function reverseChange(
  changeId: string,
  reversedBy: string
): Promise<boolean> {
  try {
    // Get the change log entry
    const { data: entry, error: fetchError } = await supabase
      .from('kl_change_log')
      .select('*')
      .eq('id', changeId)
      .single();

    if (fetchError || !entry) {
      console.error('Change not found:', changeId);
      return false;
    }

    const changeEntry = entry as ChangeLogEntry;

    if (!changeEntry.reversible) {
      console.error('Change is not reversible:', changeId);
      return false;
    }

    if (changeEntry.reversed_at) {
      console.error('Change already reversed:', changeId);
      return false;
    }

    // Perform the reversal based on action type
    let reversed = false;
    
    switch (changeEntry.action) {
      case 'insert':
        // Reverse insert = delete the record
        if (isValidTable(changeEntry.table_name)) {
          const { error } = await supabase
            .from(changeEntry.table_name as 'kl_entities')
            .delete()
            .eq('id', changeEntry.record_id);
          reversed = !error;
        }
        break;

      case 'update':
        // Reverse update = restore before state
        if (changeEntry.before_json && isValidTable(changeEntry.table_name)) {
          const { error } = await supabase
            .from(changeEntry.table_name as 'kl_entities')
            .update(changeEntry.before_json as never)
            .eq('id', changeEntry.record_id);
          reversed = !error;
        }
        break;

      case 'delete':
        // Reverse delete = re-insert the record
        if (changeEntry.before_json && isValidTable(changeEntry.table_name)) {
          const { error } = await supabase
            .from(changeEntry.table_name as 'kl_entities')
            .insert(changeEntry.before_json as never);
          reversed = !error;
        }
        break;
    }

    if (reversed) {
      // Mark the change as reversed
      await supabase
        .from('kl_change_log')
        .update({
          reversed_at: new Date().toISOString(),
          reversed_by: reversedBy,
        })
        .eq('id', changeId);

      // Log the reversal as a new change
      await logChange(
        reversedBy,
        changeEntry.action === 'insert' ? 'delete' : 
        changeEntry.action === 'delete' ? 'insert' : 'update',
        changeEntry.table_name,
        changeEntry.record_id,
        changeEntry.after_json,
        changeEntry.before_json,
        { reversal_of: changeId }
      );

      console.log(`[CHANGE REVERSED] ${changeId} by ${reversedBy}`);
    }

    return reversed;
  } catch (e) {
    console.error('Reversal error:', e);
    return false;
  }
}

/**
 * Get change history for a record
 */
export async function getRecordHistory(
  tableName: string,
  recordId: string
): Promise<ChangeLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('kl_change_log')
      .select('*')
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch record history:', error);
      return [];
    }

    return (data || []) as ChangeLogEntry[];
  } catch (e) {
    console.error('Record history error:', e);
    return [];
  }
}

/**
 * Get recent changes (for admin dashboard)
 */
export async function getRecentChanges(
  limit: number = 50,
  tableName?: string
): Promise<ChangeLogEntry[]> {
  try {
    let query = supabase
      .from('kl_change_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tableName) {
      query = query.eq('table_name', tableName);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch recent changes:', error);
      return [];
    }

    return (data || []) as ChangeLogEntry[];
  } catch (e) {
    console.error('Recent changes error:', e);
    return [];
  }
}

/**
 * Check if table name is a valid kl_* table
 */
function isValidTable(tableName: string): boolean {
  const validTables = [
    'kl_sources',
    'kl_documents', 
    'kl_entities',
    'kl_facts',
    'kl_enrichment_jobs',
    'kl_cached_search',
  ];
  return validTables.includes(tableName);
}
