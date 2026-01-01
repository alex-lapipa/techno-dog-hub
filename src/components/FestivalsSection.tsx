import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { festivals as allFestivals } from "@/data/festivals";

interface FestivalCardProps {
  id: string;
  name: string;
  location: string;
  date: string;
  index: number;
}

const FestivalCard = ({ id, name, location, date, index }: FestivalCardProps) => {
  return (
    <Link
      to={`/festivals/${id}`}
      className="group block border-b border-border py-6 hover:bg-muted/30 transition-colors px-4 -mx-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-6">
          {/* Index */}
          <span className="font-mono text-xs text-muted-foreground w-8">
            {String(index).padStart(2, "0")}
          </span>

          {/* Name */}
          <h3 className="font-mono text-lg md:text-xl uppercase tracking-wide text-foreground group-hover:animate-glitch">
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-8">
          {/* Location */}
          <span className="hidden md:block font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {location}
          </span>

          {/* Date */}
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {date}
          </span>

          {/* Arrow */}
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

// Helper to format month for display
const formatMonthsForDisplay = (months: string[]): string => {
  const monthAbbrev: { [key: string]: string } = {
    'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
    'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
    'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
  };
  const first = months[0];
  return `${monthAbbrev[first] || first} 2025`;
};

// Get featured festivals from the verified database - prioritize active festivals with upcoming dates
const getFeaturedFestivals = () => {
  return allFestivals
    .filter(f => f.active)
    .slice(0, 8)
    .map(f => ({
      id: f.id,
      name: f.name,
      location: `${f.city}, ${f.country}`,
      date: formatMonthsForDisplay(f.months)
    }));
};

const FestivalsSection = () => {
  const featuredFestivals = getFeaturedFestivals();

  return (
    <section id="festivales" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            // Upcoming events
          </div>
          <h2 className="font-mono text-3xl md:text-4xl uppercase tracking-wide text-foreground">
            Festivals 2025
          </h2>
        </div>

        {/* List */}
        <div className="border-t border-border">
          {featuredFestivals.map((festival, index) => (
            <FestivalCard key={festival.id} {...festival} index={index + 1} />
          ))}
        </div>

        {/* Footer - show actual count from database */}
        <div className="mt-8 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            Showing {featuredFestivals.length} of {allFestivals.length} festivals
          </span>
          <Link 
            to="/festivals" 
            className="font-mono text-xs text-crimson hover:text-crimson/80 transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FestivalsSection;
