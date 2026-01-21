/**
 * Brand Book Protection Badge
 * 
 * Visual indicator showing brand book protection status.
 * Displays locked status and authorized owner.
 */

import { Lock, Shield, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useBrandBookProtection } from '@/hooks/useBrandBookProtection';

interface BrandBookProtectionBadgeProps {
  configType?: 'techno_dog' | 'techno_doggies';
  showOwner?: boolean;
  className?: string;
}

export function BrandBookProtectionBadge({ 
  configType,
  showOwner = true,
  className = ''
}: BrandBookProtectionBadgeProps) {
  const { isLoading, isOwner, isProtected, lockedBy, lockedReason } = useBrandBookProtection();

  if (isLoading) {
    return (
      <Badge variant="outline" className={`font-mono text-[10px] ${className}`}>
        <div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground animate-spin rounded-full mr-1.5" />
        Checking...
      </Badge>
    );
  }

  if (isOwner) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`bg-logo-green/10 text-logo-green font-mono text-[10px] uppercase ${className}`}
          >
            <Shield className="w-3 h-3 mr-1" />
            Owner Access
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-mono text-xs">
          <p>You have full access to modify brand books</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          <Badge 
            variant="secondary" 
            className="bg-destructive/10 text-destructive font-mono text-[10px] uppercase"
          >
            <Lock className="w-3 h-3 mr-1" />
            Protected
          </Badge>
          {showOwner && (
            <Badge 
              variant="outline" 
              className="font-mono text-[10px] text-muted-foreground"
            >
              <User className="w-3 h-3 mr-1" />
              {lockedBy}
            </Badge>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs font-mono text-xs">
        <p className="font-medium text-destructive">Read-Only Access</p>
        <p className="mt-1 text-muted-foreground">{lockedReason}</p>
        <p className="mt-2 text-foreground">Only {lockedBy} can modify this content.</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default BrandBookProtectionBadge;
