import { Music, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Music className="w-8 h-8 text-primary" />
              <span className="font-display text-xl font-bold gradient-text">
                TechnoFest
              </span>
            </div>
            <p className="font-body text-muted-foreground text-sm">
              Tu portal de festivales techno en Europa. Descubre los mejores
              eventos de música electrónica.
            </p>
          </div>

          {/* Enlaces */}
          <div className="space-y-4">
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground">
              Explorar
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#festivales"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Festivales
                </a>
              </li>
              <li>
                <a
                  href="#artistas"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Artistas
                </a>
              </li>
              <li>
                <a
                  href="#calendario"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Calendario
                </a>
              </li>
              <li>
                <a
                  href="#noticias"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Noticias
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#privacidad"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#terminos"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Términos
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div className="space-y-4">
            <h4 className="font-display text-sm uppercase tracking-wider text-foreground">
              Síguenos
            </h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_hsl(180_100%_50%/0.5)]"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_hsl(180_100%_50%/0.5)]"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_hsl(180_100%_50%/0.5)]"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-[0_0_15px_hsl(180_100%_50%/0.5)]"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="font-body text-sm text-muted-foreground">
            © 2024 TechnoFest Europa. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
