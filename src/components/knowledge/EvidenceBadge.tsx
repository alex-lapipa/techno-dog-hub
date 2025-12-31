/**
 * Evidence Badge Component
 * 
 * Displays confidence level and verification status for facts.
 */

import { Badge } from '@/components/ui/badge';
import { getConfidenceLevel, formatConfidence } from '@/lib/knowledgeValidator';
import { CheckCircle, AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';

interface EvidenceBadgeProps {
  confidence: number;
  status: 'verified' | 'unverified' | 'conflict' | 'unknown';
  showConfidence?: boolean;
  size?: 'sm' | 'md';
}

export function EvidenceBadge({ 
  confidence, 
  status, 
  showConfidence = true,
  size = 'sm' 
}: EvidenceBadgeProps) {
  const level = getConfidenceLevel(confidence);
  const iconSize = size === 'sm' ? 12 : 16;
  
  const getVariant = () => {
    if (status === 'verified') return 'default';
    if (status === 'conflict') return 'destructive';
    if (status === 'unverified') return 'secondary';
    return 'outline';
  };

  const getIcon = () => {
    if (status === 'verified') return <CheckCircle size={iconSize} className="text-green-500" />;
    if (status === 'conflict') return <AlertTriangle size={iconSize} className="text-destructive" />;
    if (status === 'unverified') return <AlertCircle size={iconSize} className="text-yellow-500" />;
    return <HelpCircle size={iconSize} className="text-muted-foreground" />;
  };

  const getLabel = () => {
    if (status === 'verified') return 'Verified';
    if (status === 'conflict') return 'Conflict';
    if (status === 'unverified') return 'Unverified';
    return 'Unknown';
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={`gap-1 ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
      {showConfidence && status !== 'unknown' && (
        <span className="opacity-70">({formatConfidence(confidence)})</span>
      )}
    </Badge>
  );
}
