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
                // Festival destacado
              </div>
              <h2 className="font-mono text-4xl md:text-6xl uppercase tracking-tight text-foreground">
                Aquasella
              </h2>
              <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                Arriondas, Asturias — España
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 font-mono text-sm text-muted-foreground leading-relaxed">
              <p>
                Aquasella es uno de los festivales de música electrónica más 
                emblemáticos de la península ibérica. Desde 1997, combina 
                techno, house y música experimental en un entorno natural 
                incomparable en el corazón de Asturias.
              </p>
              <p>
                El festival se celebra junto al río Sella, donde las montañas 
                asturianas crean una atmósfera única que ha atraído a artistas 
                de renombre internacional durante casi tres décadas.
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Fecha
                </div>
                <div className="font-mono text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  14-17 Ago 2025
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Ubicación
                </div>
                <div className="font-mono text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Arriondas
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Edición
                </div>
                <div className="font-mono text-foreground">
                  28ª Edición
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Precio desde
                </div>
                <div className="font-mono text-foreground">
                  85€
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="brutalist" size="lg">
                Comprar entradas
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="terminal" size="lg">
                Ver lineup
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
                // Headliners confirmados
              </div>
              <div className="space-y-2">
                {[
                  "Charlotte de Witte",
                  "Amelie Lens",
                  "Adam Beyer",
                  "Nina Kraviz",
                  "Richie Hawtin",
                  "+ 50 artistas más",
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
