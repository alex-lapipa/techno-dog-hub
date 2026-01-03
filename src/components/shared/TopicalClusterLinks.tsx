import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClusterLink {
  label: string;
  path: string;
  count?: number;
}

interface TopicalClusterLinksProps {
  title: string;
  description?: string;
  links: ClusterLink[];
  className?: string;
}

/**
 * Hub/Spoke internal linking component for SEO
 * Creates topical clusters linking to related content areas
 */
export function TopicalClusterLinks({
  title,
  description,
  links,
  className,
}: TopicalClusterLinksProps) {
  if (links.length === 0) return null;

  return (
    <section className={cn("border border-border bg-card/20 p-4 sm:p-6", className)}>
      <h3 className="font-mono text-xs sm:text-sm uppercase tracking-wider mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mb-4">
          {description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="group inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-xs border border-border px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-foreground hover:text-background hover:border-foreground transition-colors"
          >
            {link.label}
            {link.count !== undefined && (
              <span className="text-muted-foreground group-hover:text-background/70">
                ({link.count})
              </span>
            )}
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}
