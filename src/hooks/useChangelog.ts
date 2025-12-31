import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Changelog System following Keep a Changelog standard
 * https://keepachangelog.com/en/1.0.0/
 * 
 * Categories:
 * - Added: New features
 * - Changed: Changes in existing functionality
 * - Deprecated: Soon-to-be removed features
 * - Removed: Removed features
 * - Fixed: Bug fixes
 * - Security: Vulnerability fixes
 */

export type ChangelogCategory = 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';

export interface ChangelogEntry {
  id: string;
  version: string;
  category: ChangelogCategory;
  scope: string;
  title: string;
  description: string | null;
  technical_details: Record<string, any>;
  diagram_code: string | null;
  files_changed: string[];
  performance_impact: Record<string, any> | null;
  is_breaking_change: boolean;
  author: string;
  source: string;
  created_at: string;
  released_at: string | null;
}

export interface CreateChangelogEntry {
  version?: string;
  category: ChangelogCategory;
  scope: string;
  title: string;
  description?: string;
  technical_details?: Record<string, any>;
  diagram_code?: string;
  files_changed?: string[];
  performance_impact?: Record<string, any>;
  is_breaking_change?: boolean;
  author?: string;
  source?: string;
}

// Scope categories for the techno.dog project
export const CHANGELOG_SCOPES = [
  'doggies',
  'artists',
  'gear',
  'labels',
  'collectives',
  'books',
  'documentaries',
  'venues',
  'admin',
  'api',
  'auth',
  'database',
  'ui',
  'performance',
  'seo',
  'infrastructure',
] as const;

// Category metadata for display
export const CATEGORY_META: Record<ChangelogCategory, { label: string; color: string; icon: string }> = {
  added: { label: 'Added', color: 'text-logo-green', icon: '✨' },
  changed: { label: 'Changed', color: 'text-amber-500', icon: '🔄' },
  deprecated: { label: 'Deprecated', color: 'text-orange-500', icon: '⚠️' },
  removed: { label: 'Removed', color: 'text-destructive', icon: '🗑️' },
  fixed: { label: 'Fixed', color: 'text-blue-500', icon: '🔧' },
  security: { label: 'Security', color: 'text-purple-500', icon: '🔒' },
};

/**
 * Fetch changelog entries with optional filters
 */
export const useChangelogEntries = (filters?: {
  category?: ChangelogCategory;
  scope?: string;
  version?: string;
  search?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['changelog', filters],
    queryFn: async () => {
      let query = supabase
        .from('changelog_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.scope) {
        query = query.eq('scope', filters.scope);
      }
      if (filters?.version) {
        query = query.eq('version', filters.version);
      }
      if (filters?.search) {
        query = query.textSearch('search_vector', filters.search);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ChangelogEntry[];
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get changelog grouped by version
 */
export const useChangelogByVersion = () => {
  const { data: entries, ...rest } = useChangelogEntries();
  
  const grouped = entries?.reduce((acc, entry) => {
    if (!acc[entry.version]) {
      acc[entry.version] = [];
    }
    acc[entry.version].push(entry);
    return acc;
  }, {} as Record<string, ChangelogEntry[]>);
  
  return { data: grouped, entries, ...rest };
};

/**
 * Create a new changelog entry
 */
export const useCreateChangelog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: CreateChangelogEntry) => {
      const { data, error } = await supabase
        .from('changelog_entries')
        .insert({
          version: entry.version || '0.1.0',
          category: entry.category,
          scope: entry.scope,
          title: entry.title,
          description: entry.description || null,
          technical_details: entry.technical_details || {},
          diagram_code: entry.diagram_code || null,
          files_changed: entry.files_changed || [],
          performance_impact: entry.performance_impact || null,
          is_breaking_change: entry.is_breaking_change || false,
          author: entry.author || 'techno.dog AI',
          source: entry.source || 'lovable',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelog'] });
    },
  });
};

/**
 * Utility to log a changelog entry (for use in other hooks/components)
 */
export const logChangelog = async (entry: CreateChangelogEntry): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('changelog_entries')
      .insert({
        version: entry.version || '0.1.0',
        category: entry.category,
        scope: entry.scope,
        title: entry.title,
        description: entry.description || null,
        technical_details: entry.technical_details || {},
        diagram_code: entry.diagram_code || null,
        files_changed: entry.files_changed || [],
        performance_impact: entry.performance_impact || null,
        is_breaking_change: entry.is_breaking_change || false,
        author: entry.author || 'techno.dog AI',
        source: entry.source || 'lovable',
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Failed to log changelog:', error);
      return null;
    }
    return data.id;
  } catch (e) {
    console.error('Failed to log changelog:', e);
    return null;
  }
};

export default useChangelogEntries;
