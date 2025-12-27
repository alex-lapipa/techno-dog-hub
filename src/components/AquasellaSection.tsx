import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const AquasellaSection = () => {
  return (
    <section id="aquasella" className="py-24 bg-card border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                // Featured festival
              </div>
              <h2 className="font-mono text-4xl md:text-6xl uppercase tracking-tight text-foreground">
                Aquasella
              </h2>
              <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                Arriondas, Asturias — Spain
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 font-mono text-sm text-muted-foreground leading-relaxed">
              <p>
                Aquasella is one of the most iconic electronic music festivals 
                on the Iberian Peninsula. Since 1997, it has combined techno, 
                house, and experimental music in an incomparable natural setting 
                in the heart of Asturias.
              </p>
              <p>
                The festival takes place next to the Sella River, where the 
                Asturian mountains create a unique atmosphere that has attracted 
                internationally renowned artists for nearly three decades.
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Date
                </div>
                <div className="font-mono text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  14-17 Aug 2025
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Location
                </div>
                <div className="font-mono text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Arriondas
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Edition
                </div>
                <div className="font-mono text-foreground">
                  28th Edition
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Price from
                </div>
                <div className="font-mono text-foreground">
                  85€
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="brutalist" size="lg">
                Buy tickets
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="terminal" size="lg">
                View lineup
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="space-y-6">
            {/* ASCII art style decoration */}
            <div className="border border-border p-8 font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre overflow-x-auto">
{`╔═══════════════════════════════════════╗
║                                       ║
║     A Q U A S E L L A   2 0 2 5      ║
║                                       ║
║     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║
║     ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ ║
║     ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ ║
║     ░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░ ║
║     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║
║                                       ║
║     14-17.08.2025                     ║
║     ARRIONDAS, ASTURIAS               ║
║                                       ║
╚═══════════════════════════════════════╝`}
            </div>

            {/* Lineup preview */}
            <div className="border border-border p-6">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                // Confirmed headliners
              </div>
              <div className="space-y-2">
                {[
                  "Charlotte de Witte",
                  "Amelie Lens",
                  "Adam Beyer",
                  "Nina Kraviz",
                  "Richie Hawtin",
                  "+ 50 more artists",
                ].map((artist, i) => (
                  <div
                    key={artist}
                    className="font-mono text-sm text-foreground flex items-center gap-3"
                  >
                    <span className="text-muted-foreground text-xs">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={i === 5 ? "text-muted-foreground" : ""}>
                      {artist}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AquasellaSection;
