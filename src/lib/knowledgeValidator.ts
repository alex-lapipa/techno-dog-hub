/**
 * Zero-Hallucination Validator
 * 
 * Enforces strict evidence requirements for all facts displayed to users.
 * A fact is only valid if it has provenance (source, evidence, timestamp).
 */

export interface ValidFact {
  predicate: string;
  value: string | Record<string, unknown>;
  source_url: string;
  source_name: string;
  evidence_snippet: string;
  fetched_at: string;
  confidence: number;
  status: 'verified' | 'unverified' | 'conflict';
}

export interface UnverifiedFact {
  predicate: string;
  value: null;
  reason: 'no_source' | 'no_evidence' | 'low_confidence' | 'missing_data';
  display_text: 'Unknown' | 'Unverified';
}

export interface ConflictingFact {
  predicate: string;
  status: 'conflict';
  values: ValidFact[];
  display_text: string;
}

export type FactResult = ValidFact | UnverifiedFact | ConflictingFact;

// Minimum confidence threshold for a fact to be considered valid
const MIN_CONFIDENCE_THRESHOLD = 0.3;

/**
 * Validates a fact meets zero-hallucination requirements
 */
export function validateFact(fact: Partial<ValidFact>): FactResult {
  // Check for source URL
  if (!fact.source_url) {
    return {
      predicate: fact.predicate || 'unknown',
      value: null,
      reason: 'no_source',
      display_text: 'Unknown',
    };
  }

  // Check for evidence snippet
  if (!fact.evidence_snippet) {
    return {
      predicate: fact.predicate || 'unknown',
      value: null,
      reason: 'no_evidence',
      display_text: 'Unverified',
    };
  }

  // Check for fetched timestamp
  if (!fact.fetched_at) {
    return {
      predicate: fact.predicate || 'unknown',
      value: null,
      reason: 'missing_data',
      display_text: 'Unverified',
    };
  }

  // Check confidence threshold
  if ((fact.confidence ?? 0) < MIN_CONFIDENCE_THRESHOLD) {
    return {
      predicate: fact.predicate || 'unknown',
      value: null,
      reason: 'low_confidence',
      display_text: 'Unverified',
    };
  }

  // Valid fact with full provenance
  return {
    predicate: fact.predicate!,
    value: fact.value!,
    source_url: fact.source_url,
    source_name: fact.source_name || extractDomain(fact.source_url),
    evidence_snippet: fact.evidence_snippet,
    fetched_at: fact.fetched_at,
    confidence: fact.confidence ?? 0.5,
    status: (fact.status as ValidFact['status']) || 'unverified',
  };
}

/**
 * Validates an array of facts and handles conflicts
 */
export function validateFacts(facts: Partial<ValidFact>[]): FactResult[] {
  if (!facts || facts.length === 0) {
    return [];
  }

  // Group by predicate to detect conflicts
  const byPredicate = new Map<string, Partial<ValidFact>[]>();
  for (const fact of facts) {
    const predicate = fact.predicate || 'unknown';
    const existing = byPredicate.get(predicate) || [];
    existing.push(fact);
    byPredicate.set(predicate, existing);
  }

  const results: FactResult[] = [];

  for (const [predicate, predicateFacts] of byPredicate) {
    // Validate each fact
    const validFacts = predicateFacts
      .map(f => validateFact(f))
      .filter((f): f is ValidFact => 'source_url' in f && f.source_url !== undefined);

    if (validFacts.length === 0) {
      // No valid facts - return unverified
      results.push({
        predicate,
        value: null,
        reason: 'no_evidence',
        display_text: 'Unknown',
      });
    } else if (validFacts.length === 1) {
      // Single valid fact
      results.push(validFacts[0]);
    } else {
      // Check for conflicting values
      const uniqueValues = new Set(
        validFacts.map(f => typeof f.value === 'string' ? f.value : JSON.stringify(f.value))
      );

      if (uniqueValues.size > 1) {
        // Conflict detected - show all sources
        results.push({
          predicate,
          status: 'conflict',
          values: validFacts,
          display_text: `Conflicting information from ${validFacts.length} sources`,
        });
      } else {
        // Multiple sources agree - use highest confidence
        const bestFact = validFacts.reduce((best, current) =>
          current.confidence > best.confidence ? current : best
        );
        bestFact.status = 'verified';
        results.push(bestFact);
      }
    }
  }

  return results;
}

/**
 * Checks if a fact result is valid (has evidence)
 */
export function isValidFact(fact: FactResult): fact is ValidFact {
  return 'source_url' in fact && fact.source_url !== undefined;
}

/**
 * Checks if a fact result is unverified
 */
export function isUnverifiedFact(fact: FactResult): fact is UnverifiedFact {
  return 'reason' in fact;
}

/**
 * Checks if a fact result has conflicts
 */
export function isConflictingFact(fact: FactResult): fact is ConflictingFact {
  return 'values' in fact && fact.status === 'conflict';
}

/**
 * Extract domain name from URL for display
 */
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return 'Unknown Source';
  }
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}

/**
 * Format fetched timestamp as relative time
 */
export function formatFetchedTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
