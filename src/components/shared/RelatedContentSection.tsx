import { Link } from "react-router-dom";
import { ArrowRight, User, Sliders, Music, MapPin, Calendar, BookOpen, Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelatedItem {
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
  type: 'artist' | 'gear' | 'venue' | 'festival' | 'label' | 'book' | 'documentary';
}

interface RelatedContentSectionProps {
  title: string;
  items: RelatedItem[];
  basePath: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  maxItems?: number;
  className?: string;
}

const typeIcons = {
  artist: User,
  gear: Sliders,
  venue: MapPin,
  festival: Calendar,
  label: Music,
  book: BookOpen,
  documentary: Film,
};

const typeLabels = {
  artist: "Artist",
  gear: "Gear",
  venue: "Venue",
  festival: "Festival",
  label: "Label",
  book: "Book",
  documentary: "Documentary",
};

export function RelatedContentSection({
  title,
  items,
  basePath,
  viewAllLink,
  viewAllLabel = "View All",
  maxItems = 6,
  className,
}: RelatedContentSectionProps) {
  const displayItems = items.slice(0, maxItems);
  const Icon = typeIcons[items[0]?.type] || User;

  if (displayItems.length === 0) return null;

  return (
    <section className={cn("border-t border-border pt-6 sm:pt-8", className)}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-mono text-sm sm:text-base uppercase tracking-wide flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
          >
            {viewAllLabel}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {displayItems.map((item) => {
          const ItemIcon = typeIcons[item.type];
          return (
            <Link
              key={item.id}
              to={`${basePath}/${item.id}`}
              className="group border border-border hover:bg-card transition-colors p-2 sm:p-3"
            >
              {/* Thumbnail */}
              <div className="aspect-square relative overflow-hidden bg-card/30 mb-2">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ItemIcon className="w-8 h-8 text-muted-foreground/20" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-0.5">
                <span className="font-mono text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider">
                  {typeLabels[item.type]}
                </span>
                <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wide truncate group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                {item.subtitle && (
                  <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
