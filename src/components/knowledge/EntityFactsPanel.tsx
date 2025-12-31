/**
 * Entity Facts Panel
 * 
 * Displays all facts for an entity with evidence toggle.
 * Used on artist/label/venue detail pages.
 */

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FactCard } from './FactCard';
import { type FactResult } from '@/lib/knowledgeValidator';
import { isEvidenceUIEnabled } from '@/lib/knowledgeFeatureFlags';
import { FileQuestion } from 'lucide-react';

interface EntityFactsPanelProps {
  facts: FactResult[];
  entityName: string;
  entityType: string;
  isLoading?: boolean;
}

export function EntityFactsPanel({ 
  facts, 
  entityName, 
  entityType,
  isLoading = false 
}: EntityFactsPanelProps) {
  const [showEvidence, setShowEvidence] = useState(true);
  
  // Check if evidence UI is enabled
  if (!isEvidenceUIEnabled()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="h-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!facts || facts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <FileQuestion size={40} className="mb-2 opacity-50" />
        <p className="text-sm">No verified facts found for this {entityType}.</p>
        <p className="text-xs mt-1">Facts require source evidence to be displayed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Verified Facts
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({facts.length})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <Switch 
            id="show-evidence" 
            checked={showEvidence}
            onCheckedChange={setShowEvidence}
          />
          <Label htmlFor="show-evidence" className="text-sm cursor-pointer">
            Show evidence
          </Label>
        </div>
      </div>

      {/* Facts grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {facts.map((fact, index) => (
          <FactCard 
            key={`${fact.predicate}-${index}`} 
            fact={fact} 
            showEvidence={showEvidence}
          />
        ))}
      </div>

      {/* Zero-hallucination disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        All facts are sourced from verified documents. 
        Unverified information is not displayed.
      </p>
    </div>
  );
}
