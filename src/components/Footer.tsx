import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import technoDogLogo from "@/assets/techno-dog-logo.png";

const Footer = () => {
  const { t, language } = useLanguage();
  
  const exploreLinks = [
    { label: t('nav.festivals'), path: '/festivals' },
    { label: t('footer.artists'), path: '/artists' },
    { label: t('footer.news'), path: '/news' },
    { label: language === 'en' ? 'Venues' : 'Clubs', path: '/venues' },
    { label: language === 'en' ? 'User Stories' : 'Historias', path: '/mad/stories' },
  ];

  const resourceLinks = [
    { label: language === 'en' ? 'Labels' : 'Sellos', path: '/labels' },
    { label: language === 'en' ? 'Releases' : 'Lanzamientos', path: '/releases' },
    { label: language === 'en' ? 'Gear' : 'Equipo', path: '/gear' },
    { label: language === 'en' ? 'Submit' : 'Enviar', path: '/submit' },
    { label: language === 'en' ? 'Developers' : 'Desarrolladores', path: '/developer' },
  ];
  
  return (
    <footer className="bg-background border-t border-border py-16 pb-24" role="contentinfo">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group" aria-label="techno.dog home">
              <img src={technoDogLogo} alt="techno.dog logo" className="w-8 h-8" />
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
              Techno.Dog ringleader{' '}
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
          <nav aria-label={language === 'en' ? 'Explore navigation' : 'Navegación explorar'} className="space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {t('footer.explore')}
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
          <nav aria-label={language === 'en' ? 'Resources navigation' : 'Navegación recursos'} className="space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              // {language === 'en' ? 'Resources' : 'Recursos'}
            </h2>
            <ul className="space-y-2" role="list">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
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