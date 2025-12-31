import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import HexagonLogo from "./HexagonLogo";

const Footer = () => {
  const { t } = useLanguage();
  
  const exploreLinks = [
    { label: 'Festivals', path: '/festivals' },
    { label: 'Artists', path: '/artists' },
    { label: 'News', path: '/news' },
    { label: 'Venues', path: '/venues' },
    { label: 'Techno Doggies', path: '/doggies' },
  ];

  const resourceLinks = [
    { label: 'Labels', path: '/labels' },
    { label: 'Releases', path: '/releases' },
    { label: 'Gear', path: '/gear' },
    { label: 'Submit', path: '/submit' },
    { label: 'Developers', path: '/developer' },
  ];
  
  return (
    <footer className="bg-background border-t border-border py-16 pb-24" role="contentinfo">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group" aria-label="techno.dog home">
              <HexagonLogo className="w-8 h-8 drop-shadow-[0_0_6px_hsl(100_100%_60%/0.5)]" />
              <span className="font-mono text-sm tracking-[0.2em] text-foreground group-hover:animate-glitch">
                techno.dog
              </span>
            </Link>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-md">
              {t('footer.description')}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              © 2025 Techno.Dog
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Techno.Dog founder and ringleader{' '}
              <a 
                href="https://alexlawton.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                Alex Lawton
              </a>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              part of{' '}
              <a 
                href="https://lapipa.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                La PiPa
              </a>
            </p>
          </div>

          {/* Explore Navigation */}
          <nav aria-label="Explore navigation" className="space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              // Explore
            </h2>
            <ul className="space-y-2" role="list">
              {exploreLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources Navigation */}
          <nav aria-label="Resources navigation" className="space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              // Resources
            </h2>
            <ul className="space-y-2" role="list">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom terminal */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="font-mono text-xs text-muted-foreground" aria-hidden="true">
            <span className="text-foreground">guest@techno.dog</span>
            <span>:</span>
            <span className="text-foreground">~</span>
            <span>$ </span>
            <span>exit</span>
            <span className="animate-blink">_</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
