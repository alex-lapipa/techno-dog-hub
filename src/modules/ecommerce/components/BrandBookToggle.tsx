/**
 * Brand Book Toggle Component
 * 
 * Allows switching between techno.dog and Techno Doggies brand books
 * in the Creative Studio.
 */

import { BookOpen, Dog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { BrandBookType } from '../hooks/useBrandBookGuidelines';

interface BrandBookToggleProps {
  value: BrandBookType;
  onChange: (value: BrandBookType) => void;
  disabled?: boolean;
  className?: string;
}

export function BrandBookToggle({ 
  value, 
  onChange, 
  disabled = false,
  className 
}: BrandBookToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 bg-muted/50 rounded-lg", className)}>
      {/* techno.dog option */}
      <button
        type="button"
        onClick={() => onChange('techno-dog')}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all font-mono text-xs uppercase tracking-wide",
          value === 'techno-dog'
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <BookOpen className="w-4 h-4 text-crimson" />
        <span>techno.dog</span>
        {value === 'techno-dog' && (
          <Badge variant="secondary" className="ml-1 text-[8px] px-1 py-0 h-4">
            Active
          </Badge>
        )}
      </button>

      {/* Techno Doggies option */}
      <button
        type="button"
        onClick={() => onChange('techno-doggies')}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all font-mono text-xs uppercase tracking-wide",
          value === 'techno-doggies'
            ? "bg-background text-foreground shadow-sm border border-border"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Dog className="w-4 h-4 text-logo-green" />
        <span>Doggies</span>
        {value === 'techno-doggies' && (
          <Badge variant="secondary" className="ml-1 text-[8px] px-1 py-0 h-4">
            Active
          </Badge>
        )}
      </button>
    </div>
  );
}

export default BrandBookToggle;
