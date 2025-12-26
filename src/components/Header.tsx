import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import LanguageToggle from "./LanguageToggle";
import HexagonLogo from "./HexagonLogo";
import { useState, useEffect } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { trackClick, trackNavigation } = useAnalytics();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = async () => {
    if (user) {
      trackClick('logout_button');
      await signOut();
    } else {
      trackClick('login_button');
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
        { label: { en: 'Labels', es: 'Sellos' }, path: '/labels' },
        { label: { en: 'Crews', es: 'Crews' }, path: '/crews' },
      ]
    },
    {
      label: { en: 'Releases', es: 'Lanzamientos' },
      path: '/releases',
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
      path: '/venues',
      sub: [
        { label: { en: 'Venues', es: 'Clubs' }, path: '/venues' },
        { label: { en: 'User Stories', es: 'Historias' }, path: '/mad/stories' },
        { label: { en: 'Crews', es: 'Crews' }, path: '/crews' },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isSubItemActive = (path: string) => {
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      return location.pathname === basePath && location.search.includes(query);
    }
    return location.pathname === path;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${
      scrolled ? 'bg-background shadow-lg' : 'bg-background/80 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <HexagonLogo className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_8px_hsl(100_100%_60%/0.6)] group-hover:drop-shadow-[0_0_16px_hsl(100_100%_60%/0.8)]" />
            <span className="text-xs font-mono tracking-[0.15em] text-foreground group-hover:animate-glitch hidden sm:block">
              techno.dog
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.path)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.path}
                  onClick={() => trackNavigation(location.pathname, item.path)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 hover:animate-glitch hover:text-logo-green ${
                    isActive(item.path) ? 'text-logo-green drop-shadow-[0_0_8px_hsl(var(--logo-green)/0.6)]' : 'text-muted-foreground hover:text-logo-green'
                  }`}
                >
                  {item.label[language]}
                  {item.sub && <ChevronDown className="w-2.5 h-2.5 opacity-60" />}
                </Link>
                
                {/* Dropdown */}
                {item.sub && activeDropdown === item.path && (
                  <div className="absolute top-full left-0 mt-0 py-1.5 bg-background border border-border min-w-[160px] z-50 shadow-lg">
                    {item.sub.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => trackNavigation(location.pathname, subItem.path)}
                        className={`block px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                          isSubItemActive(subItem.path) 
                            ? 'text-logo-green bg-card border-l-2 border-logo-green' 
                            : 'text-muted-foreground hover:text-logo-green hover:bg-card'
                        }`}
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
              <Button variant="brutalist" size="sm" onClick={handleAuthClick} className="hidden sm:flex hover:animate-glitch">
                {user ? (language === 'en' ? 'Logout' : 'Salir') : (language === 'en' ? 'Login' : 'Entrar')}
              </Button>
            )}
            
            {/* Mobile hamburger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="hover:animate-glitch">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <span className="text-sm font-mono tracking-widest uppercase">Menu</span>
                  </div>
                  <nav className="flex-1 overflow-y-auto py-4">
                    {navItems.map((item) => (
                      <div key={item.path} className="border-b border-border/50">
                        <Link
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-3 text-sm font-mono uppercase tracking-wider transition-colors hover:bg-card ${
                            isActive(item.path) ? 'text-logo-green bg-card' : 'text-muted-foreground'
                          }`}
                        >
                          {item.label[language]}
                        </Link>
                        {item.sub && (
                          <div className="bg-card/50">
                            {item.sub.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-6 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                                  isSubItemActive(subItem.path)
                                    ? 'text-logo-green border-l-2 border-logo-green ml-[-2px]'
                                    : 'text-muted-foreground hover:text-logo-green'
                                }`}
                              >
                                {subItem.label[language]}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border">
                    {!loading && (
                      <Button variant="brutalist" size="sm" onClick={() => { handleAuthClick(); setMobileMenuOpen(false); }} className="w-full">
                        {user ? (language === 'en' ? 'Logout' : 'Salir') : (language === 'en' ? 'Login' : 'Entrar')}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
