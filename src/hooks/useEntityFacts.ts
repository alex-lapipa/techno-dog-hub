/**
 * Hook for fetching entity facts from the knowledge layer
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { validateFacts, type FactResult, type ValidFact } from '@/lib/knowledgeValidator';
import { isKnowledgeCacheEnabled } from '@/lib/knowledgeFeatureFlags';

interface EntityFactsOptions {
  entityId?: string;
  entityType?: string;
  entityName?: string;
  predicates?: string[];
  enabled?: boolean;
}

/**
 * Fetch facts for an entity by ID
 */
export function useEntityFacts({ 
  entityId, 
  entityType,
  entityName,
  predicates,
  enabled = true 
}: EntityFactsOptions) {
  return useQuery({
    queryKey: ['entity-facts', entityId, entityType, entityName, predicates],
    queryFn: async (): Promise<FactResult[]> => {
      // If we have an entity ID, query directly
      if (entityId) {
        const { data, error } = await supabase
          .from('kl_facts')
          .select(`
            id,
            predicate,
            value_text,
            value_json,
            source_url,
            evidence_snippet,
            confidence,
            status,
            created_at,
            kl_sources!kl_facts_source_id_fkey (
              name,
              type
            ),
            kl_documents!kl_facts_document_id_fkey (
              fetched_at
            )
          `)
          .eq('entity_id', entityId)
          .order('confidence', { ascending: false });

        if (error) {
          console.error('Error fetching entity facts:', error);
          return [];
        }

        // Transform to ValidFact format
        const rawFacts = (data || []).map((fact: Record<string, unknown>) => ({
          predicate: fact.predicate as string,
          value: fact.value_text || fact.value_json,
          source_url: fact.source_url as string,
          source_name: (fact.kl_sources as Record<string, unknown>)?.name as string || 'Unknown',
          evidence_snippet: fact.evidence_snippet as string,
          fetched_at: (fact.kl_documents as Record<string, unknown>)?.fetched_at as string || fact.created_at as string,
          confidence: fact.confidence as number,
          status: fact.status as 'verified' | 'unverified' | 'conflict',
        })) as Partial<ValidFact>[];

        // Filter by predicates if specified
        const filtered = predicates 
          ? rawFacts.filter(f => predicates.includes(f.predicate!))
          : rawFacts;

        return validateFacts(filtered);
      }

      // If we have entity name + type, find the entity first
      if (entityName && entityType) {
        const normalizedName = entityName.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        
        const { data: entity } = await supabase
          .from('kl_entities')
          .select('id')
          .eq('entity_type', entityType)
          .ilike('normalized_name', `%${normalizedName}%`)
          .single();

        if (entity) {
          // Recursive call with entity ID
          const { data, error } = await supabase
            .from('kl_facts')
            .select(`
              id,
              predicate,
              value_text,
              value_json,
              source_url,
              evidence_snippet,
              confidence,
              status,
              created_at
            `)
            .eq('entity_id', entity.id)
            .order('confidence', { ascending: false });

          if (error) {
            console.error('Error fetching entity facts:', error);
            return [];
          }

          const rawFacts = (data || []).map((fact: Record<string, unknown>) => ({
            predicate: fact.predicate as string,
            value: fact.value_text || fact.value_json,
            source_url: fact.source_url as string,
            source_name: 'Database',
            evidence_snippet: fact.evidence_snippet as string,
            fetched_at: fact.created_at as string,
            confidence: fact.confidence as number,
            status: fact.status as 'verified' | 'unverified' | 'conflict',
          })) as Partial<ValidFact>[];

          return validateFacts(rawFacts);
        }
      }

      return [];
    },
    enabled: enabled && isKnowledgeCacheEnabled() && !!(entityId || (entityName && entityType)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a specific fact for an entity
 */
export function useEntityFact(
  entityId: string | undefined,
  predicate: string,
  enabled = true
) {
  const { data: facts, ...rest } = useEntityFacts({
    entityId,
    predicates: [predicate],
    enabled,
  });

  return {
    ...rest,
    data: facts?.[0] || null,
  };
}
