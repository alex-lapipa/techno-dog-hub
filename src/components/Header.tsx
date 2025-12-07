import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import technoDogLogo from "@/assets/techno-dog-logo.png";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleAuthClick = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  const navItems = [
    {
      label: { en: 'News', es: 'Noticias' },
      path: '/news',
      sub: [
        { label: { en: 'Latest', es: 'Últimas' }, path: '/news' },
        { label: { en: 'Features', es: 'Reportajes' }, path: '/news/features' },
        { label: { en: 'Interviews', es: 'Entrevistas' }, path: '/news/interviews' },
      ]
    },
    {
      label: { en: 'Festivals', es: 'Festivales' },
      path: '/festivals',
      sub: [
        { label: { en: 'All Festivals', es: 'Todos' }, path: '/festivals' },
        { label: { en: 'Aquasella', es: 'Aquasella' }, path: '/festivals/aquasella' },
        { label: { en: 'L.E.V.', es: 'L.E.V.' }, path: '/festivals/lev' },
        { label: { en: 'Atonal', es: 'Atonal' }, path: '/festivals/atonal' },
        { label: { en: 'Dekmantel', es: 'Dekmantel' }, path: '/festivals/dekmantel' },
      ]
    },
    {
      label: { en: 'Artists', es: 'Artistas' },
      path: '/artists',
      sub: [
        { label: { en: 'Directory', es: 'Directorio' }, path: '/artists' },
        { label: { en: 'By Region', es: 'Por Región' }, path: '/artists/regions' },
        { label: { en: 'Labels', es: 'Sellos' }, path: '/labels' },
        { label: { en: 'Crews', es: 'Crews' }, path: '/crews' },
      ]
    },
    {
      label: { en: 'Releases', es: 'Lanzamientos' },
      path: '/releases',
      sub: [
        { label: { en: 'Archive', es: 'Archivo' }, path: '/releases' },
        { label: { en: 'Essential', es: 'Esenciales' }, path: '/releases/essential' },
        { label: { en: 'New', es: 'Nuevos' }, path: '/releases/new' },
      ]
    },
    {
      label: { en: 'Gear', es: 'Equipo' },
      path: '/gear',
      sub: [
        { label: { en: 'All Gear', es: 'Todo' }, path: '/gear' },
        { label: { en: 'Synthesizers', es: 'Sintetizadores' }, path: '/gear?category=synth' },
        { label: { en: 'Drum Machines', es: 'Cajas de Ritmos' }, path: '/gear?category=drum-machine' },
        { label: { en: 'Samplers', es: 'Samplers' }, path: '/gear?category=sampler' },
      ]
    },
    {
      label: { en: 'Mad Stuff', es: 'Locuras' },
      path: '/mad',
      sub: [
        { label: { en: 'Timeline', es: 'Cronología' }, path: '/mad/timeline' },
        { label: { en: 'Venues', es: 'Clubs' }, path: '/venues' },
        { label: { en: 'Calendar', es: 'Calendario' }, path: '/mad/calendar' },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={technoDogLogo} alt="techno.dog logo" className="w-32 h-32 logo-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_20px_hsl(var(--primary)/0.6)]" />
            <span className="text-sm font-mono tracking-[0.2em] text-foreground group-hover:animate-glitch">
              techno.dog
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.path)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-1 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors hover:animate-glitch ${
                    isActive(item.path) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label[language]}
                  {item.sub && <ChevronDown className="w-3 h-3" />}
                </Link>
                
                {/* Dropdown */}
                {item.sub && activeDropdown === item.path && (
                  <div className="absolute top-full left-0 mt-0 py-2 bg-background border border-border min-w-[180px] z-50">
                    {item.sub.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className="block px-4 py-2 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-card hover:animate-glitch transition-colors"
                      >
                        {subItem.label[language]}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
            {!loading && (
              <Button variant="brutalist" size="sm" onClick={handleAuthClick} className="hover:animate-glitch">
                {user ? (language === 'en' ? 'Logout' : 'Salir') : (language === 'en' ? 'Login' : 'Entrar')}
              </Button>
            )}
          </div>
        </nav>
      </div>
      
      {/* Mobile nav */}
      <div className="lg:hidden border-t border-border overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors hover:animate-glitch ${
                isActive(item.path) ? 'text-foreground border border-foreground' : 'text-muted-foreground'
              }`}
            >
              {item.label[language]}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
