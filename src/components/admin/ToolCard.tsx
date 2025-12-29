import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ToolCardProps {
  name: string;
  description: string;
  path: string;
  frameNumber?: string;
  badge?: string;
}

const ToolCard = ({
  name,
  description,
  path,
  frameNumber = '01',
  badge
}: ToolCardProps) => {
  return (
    <Link
      to={path}
      className="group block bg-card border border-border p-4 transition-all duration-200 hover:border-logo-green/40"
    >
      {/* Frame number */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground/50 font-mono">{frameNumber}</span>
        {badge && (
          <span className="px-1.5 py-0.5 bg-logo-green/20 font-mono text-[9px] text-logo-green uppercase">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-sm uppercase tracking-tight text-foreground group-hover:text-logo-green transition-colors">
            {name}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-logo-green transition-colors" />
        </div>
        <p className="font-mono text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default ToolCard;