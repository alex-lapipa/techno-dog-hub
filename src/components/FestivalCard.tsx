import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FestivalCardProps {
  name: string;
  location: string;
  date: string;
  attendees: string;
  image: string;
  featured?: boolean;
}

const FestivalCard = ({
  name,
  location,
  date,
  attendees,
  image,
  featured = false,
}: FestivalCardProps) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl gradient-card border border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(180_100%_50%/0.2)] ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative p-6 ${featured ? "md:p-8" : ""} flex flex-col h-full min-h-[280px]`}>
        {featured && (
          <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-secondary/20 border border-secondary/50 text-secondary text-xs font-body uppercase tracking-wider mb-4">
            Destacado
          </span>
        )}

        <div className="mt-auto space-y-4">
          <h3
            className={`font-display font-bold text-foreground group-hover:text-glow-cyan transition-all duration-300 ${
              featured ? "text-2xl md:text-3xl" : "text-xl"
            }`}
          >
            {name}
          </h3>

          <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              {location}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {attendees}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="group/btn w-fit opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            Ver más
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
