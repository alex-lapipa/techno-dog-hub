import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

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
      className="group relative block bg-zinc-800 p-1 transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Sprocket holes left */}
      <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
        ))}
      </div>
      
      {/* Sprocket holes right */}
      <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
        ))}
      </div>
      
      {/* Content container */}
      <div 
        className={cn(
          "relative mx-2 p-4 border border-crimson/20 transition-all duration-500",
          "group-hover:border-crimson/60 group-hover:shadow-[0_0_30px_hsl(var(--crimson)/0.3)]"
        )}
        style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}
      >
        {/* VHS overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-100 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
              radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)
            `,
          }}
        />

        {/* Frame number */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/70 border border-crimson/40">
          <span className="text-[10px] text-crimson tracking-wider font-bold font-mono">{frameNumber}</span>
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-logo-green/20 border border-logo-green/50 text-[9px] text-logo-green font-mono uppercase tracking-wider">
            {badge}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 pt-5">
          <h3 className="font-mono text-sm uppercase tracking-tight text-foreground group-hover:text-crimson transition-colors">
            {name}
          </h3>
          <p className="font-mono text-[11px] text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-crimson/30 via-crimson/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
};

export default ToolCard;