const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="font-mono text-sm tracking-[0.2em] text-foreground">
              techno.dog
            </div>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-md">
              Portal de festivales de música electrónica en Europa.
              Información sobre eventos, artistas y cultura techno.
              Contenido en español. Acepta entradas en ES/EN/FR.
            </p>
            <div className="font-mono text-xs text-muted-foreground">
              © 2025 techno.dog
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              // Explorar
            </div>
            <ul className="space-y-2">
              {["Festivales", "Artistas", "Calendario", "Noticias", "Archivo"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              // Redes
            </div>
            <ul className="space-y-2">
              {["Instagram", "Twitter/X", "Telegram", "Soundcloud"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom terminal */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="font-mono text-xs text-muted-foreground">
            <span className="text-foreground">guest@techno.dog</span>
            <span>:</span>
            <span className="text-foreground">~</span>
            <span>$ </span>
            <span>exit</span>
            <span className="animate-blink">_</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
