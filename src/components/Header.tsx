import { Music, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <Music className="w-8 h-8 text-primary animate-pulse-glow" />
            <span className="font-display text-xl font-bold gradient-text">
              TechnoFest
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#festivales"
              className="font-body text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Festivales
            </a>
            <a
              href="#aquasella"
              className="font-body text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Aquasella
            </a>
            <a
              href="#calendario"
              className="font-body text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Calendario
            </a>
            <a
              href="#comunidad"
              className="font-body text-sm uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Comunidad
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="neon" size="sm">
              Entrar
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
