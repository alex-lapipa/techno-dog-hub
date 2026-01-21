/**
 * techno.dog E-commerce Module - Read Only Badge
 * 
 * Visual indicator displayed when the module is in read-only mode.
 * Styled to match the techno.dog design system.
 */

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadOnlyBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ReadOnlyBadge({ 
  className = '', 
  size = 'md' 
}: ReadOnlyBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[9px]',
    md: 'px-2 py-1 text-[10px]',
    lg: 'px-3 py-1.5 text-xs',
  };

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'bg-muted/50 border border-border',
        'text-muted-foreground',
        'rounded font-mono uppercase tracking-wider',
        sizeClasses[size],
        className
      )}
    >
      <Lock className={iconSizes[size]} />
      Read-only
    </span>
  );
}

export default ReadOnlyBadge;
