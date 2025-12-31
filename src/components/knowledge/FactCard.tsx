/**
 * Fact Card Component
 * 
 * Displays a single fact with full provenance information.
 * Implements zero-hallucination UI requirements.
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EvidenceBadge } from './EvidenceBadge';
import { 
  type ValidFact, 
  type UnverifiedFact, 
  type ConflictingFact,
  type FactResult,
  isValidFact,
  isUnverifiedFact,
  isConflictingFact,
  formatFetchedTime 
} from '@/lib/knowledgeValidator';
import { ExternalLink, ChevronDown, ChevronUp, Quote, Clock, Link2 } from 'lucide-react';

interface FactCardProps {
  fact: FactResult;
  showEvidence?: boolean;
  compact?: boolean;
}

export function FactCard({ fact, showEvidence = true, compact = false }: FactCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Unverified fact
  if (isUnverifiedFact(fact)) {
    return (
      <Card className="border-dashed border-muted">
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium capitalize text-muted-foreground">
              {fact.predicate.replace(/_/g, ' ')}
            </span>
            <EvidenceBadge confidence={0} status="unknown" showConfidence={false} />
          </div>
          <p className="text-muted-foreground italic mt-1">{fact.display_text}</p>
        </CardContent>
      </Card>
    );
  }

  // Conflicting fact
  if (isConflictingFact(fact)) {
    return (
      <Card className="border-destructive/50">
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium capitalize">
              {fact.predicate.replace(/_/g, ' ')}
            </span>
            <EvidenceBadge confidence={0.5} status="conflict" showConfidence={false} />
          </div>
          <p className="text-sm text-muted-foreground mb-3">{fact.display_text}</p>
          <div className="space-y-2">
            {fact.values.map((v, i) => (
              <div key={i} className="pl-3 border-l-2 border-muted">
                <p className="text-sm">{typeof v.value === 'string' ? v.value : JSON.stringify(v.value)}</p>
                <p className="text-xs text-muted-foreground">
                  Source: <a href={v.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    {v.source_name}
                  </a>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Valid fact with evidence
  if (isValidFact(fact)) {
    return (
      <Card>
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium capitalize text-muted-foreground">
              {fact.predicate.replace(/_/g, ' ')}
            </span>
            <EvidenceBadge confidence={fact.confidence} status={fact.status} />
          </div>
          
          <p className="text-foreground">
            {typeof fact.value === 'string' ? fact.value : JSON.stringify(fact.value)}
          </p>

          {showEvidence && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1 h-7 px-2 text-xs">
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {isOpen ? 'Hide evidence' : 'Show evidence'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {/* Evidence snippet */}
                <div className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                  <Quote size={14} className="shrink-0 mt-0.5 text-muted-foreground" />
                  <p className="italic text-muted-foreground">{fact.evidence_snippet}</p>
                </div>
                
                {/* Source info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Link2 size={12} />
                    <a 
                      href={fact.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-primary"
                    >
                      {fact.source_name}
                    </a>
                    <ExternalLink size={10} />
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Fetched {formatFetchedTime(fact.fetched_at)}</span>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
