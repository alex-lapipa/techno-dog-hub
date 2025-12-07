import { Calendar, MapPin, ExternalLink, Eye, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

const LEVSection = () => {
  return (
    <section id="lev" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Visual - Generative art style */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Generative pattern */}
            <div className="border border-border p-6 font-mono text-xs overflow-hidden relative">
              <div className="grid grid-cols-16 gap-px opacity-60">
                {Array.from({ length: 256 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square"
                    style={{
                      backgroundColor: `hsl(0 0% ${Math.random() > 0.7 ? "100" : Math.random() > 0.5 ? "30" : "0"}%)`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/90 px-6 py-4 border border-foreground">
                  <div className="font-mono text-2xl md:text-3xl uppercase tracking-[0.5em] text-foreground">
                    L.E.V.
                  </div>
                </div>
              </div>
            </div>

            {/* Program highlights */}
            <div className="border border-border p-6">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                // Programa 2025
              </div>
              <div className="space-y-3">
                {[
                  { icon: Eye, label: "Instalaciones audiovisuales", count: "15+" },
                  { icon: Cpu, label: "Live A/V performances", count: "30+" },
                  { label: "Talleres y conferencias", count: "12" },
                  { label: "Artistas internacionales", count: "50+" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between font-mono text-sm border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground flex items-center gap-2">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </span>
                    <span className="text-foreground">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code snippet decoration */}
            <div className="font-mono text-xs text-muted-foreground leading-relaxed p-4 bg-card border border-border">
              <div className="text-foreground">// generative_visual.js</div>
              <div className="mt-2">
                <span className="text-muted-foreground">const</span>{" "}
                <span className="text-foreground">lev</span>{" "}
                <span className="text-muted-foreground">=</span>{" "}
                <span className="text-foreground">{"{"}</span>
              </div>
              <div className="pl-4">
                <span className="text-muted-foreground">year:</span>{" "}
                <span className="text-foreground">2025</span>,
              </div>
              <div className="pl-4">
                <span className="text-muted-foreground">location:</span>{" "}
                <span className="text-foreground">"Gijón"</span>,
              </div>
              <div className="pl-4">
                <span className="text-muted-foreground">focus:</span>{" "}
                <span className="text-foreground">["audio", "visual", "tech"]</span>
              </div>
              <div>
                <span className="text-foreground">{"}"}</span>;
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Header */}
            <div className="space-y-4">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                // Arte audiovisual + tecnología
              </div>
              <h2 className="font-mono text-4xl md:text-6xl uppercase tracking-tight text-foreground">
                L.E.V.
              </h2>
              <div className="font-mono text-lg text-muted-foreground uppercase tracking-wider">
                Laboratorio de Electrónica Visual
              </div>
              <div className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
                Gijón, Asturias — España
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4 font-mono text-sm text-muted-foreground leading-relaxed">
              <p>
                L.E.V. Festival es un referente internacional en la exploración 
                de las intersecciones entre música electrónica, arte visual y 
                nuevas tecnologías. Desde 2007, Gijón se convierte cada mayo en 
                el epicentro de la creación audiovisual contemporánea.
              </p>
              <p>
                El festival combina conciertos, performances audiovisuales en 
                directo, instalaciones interactivas, talleres y conferencias 
                con artistas y creadores de todo el mundo que trabajan en la 
                frontera entre sonido, imagen y código.
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
                  8-11 May 2025
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Ubicación
                </div>
                <div className="font-mono text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  LABoral + Gijón
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Edición
                </div>
                <div className="font-mono text-foreground">
                  18ª Edición
                </div>
              </div>
              <div className="border border-border p-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                  Precio desde
                </div>
                <div className="font-mono text-foreground">
                  35€
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {["live a/v", "instalación", "generativo", "inmersivo", "vj", "código creativo"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs uppercase tracking-wider px-3 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="brutalist" size="lg">
                Web oficial
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="terminal" size="lg">
                Ver programa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LEVSection;
