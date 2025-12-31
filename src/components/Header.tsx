import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/hooks/useAnalytics";
import HexagonLogo from "./HexagonLogo";
import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, Shield, Heart, Code, ShoppingBag, Radio } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import DogChat from "@/components/admin/DogChat";

// Scenes group: Festivals, Venues, Crews, Labels with horizontal navigation
const SCENES_ITEMS = [
  { label: 'Festivals', path: '/festivals' },
  { label: 'Venues', path: '/venues' },
  { label: 'Crews', path: '/crews' },
  { label: 'Labels', path: '/labels' },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackNavigation } = useAnalytics();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dogChatOpen, setDogChatOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Technopedia', path: '/technopedia' },
    { label: 'Artists', path: '/artists' },
    { label: 'Gear', path: '/gear' },
    { 
      label: 'Scenes', 
      path: '/scenes',
      isScenes: true,
      sub: SCENES_ITEMS
    },
    { label: 'Books', path: '/books' },
    { label: 'Documentaries', path: '/documentaries' },
    { label: 'News', path: '/news' },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isSubItemActive = (path: string) => {
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      return location.pathname === basePath && location.search.includes(query);
    }
    return location.pathname === path;
  };

  // Check if any scene item is active
  const isScenesActive = SCENES_ITEMS.some(item => isActive(item.path));
  
  // Get current scene index for navigation arrows
  const getCurrentSceneIndex = useCallback(() => {
    return SCENES_ITEMS.findIndex(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
  }, [location.pathname]);

  const navigateScene = useCallback((direction: 'prev' | 'next') => {
    const currentIndex = getCurrentSceneIndex();
    let newIndex: number;
    
    if (currentIndex === -1) {
      newIndex = direction === 'next' ? 0 : SCENES_ITEMS.length - 1;
    } else {
      newIndex = direction === 'next' 
        ? (currentIndex + 1) % SCENES_ITEMS.length
        : (currentIndex - 1 + SCENES_ITEMS.length) % SCENES_ITEMS.length;
    }
    
    const targetPath = SCENES_ITEMS[newIndex].path;
    trackNavigation(location.pathname, targetPath);
    navigate(targetPath);
  }, [getCurrentSceneIndex, navigate, trackNavigation, location.pathname]);

  // Show floating arrows when on a scenes page
  const showSceneArrows = isScenesActive;

  return (
    <>
      {/* Floating Scene Navigation Arrows */}
      {showSceneArrows && (
        <>
          <button
            onClick={() => navigateScene('prev')}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-background/90 border border-border hover:border-logo-green hover:bg-card transition-all group"
            aria-label="Previous scene"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-logo-green transition-colors" />
          </button>
          <button
            onClick={() => navigateScene('next')}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-background/90 border border-border hover:border-logo-green hover:bg-card transition-all group"
            aria-label="Next scene"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-logo-green transition-colors" />
          </button>
        </>
      )}

      <header className={`fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${
        scrolled ? 'bg-background shadow-lg' : 'bg-background/80 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-between h-14">
            {/* Logo Area */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Icon - Opens Dog Chat */}
              <button 
                onClick={() => setDogChatOpen(true)}
                className="group cursor-pointer"
                aria-label="Open Dog AI Assistant"
              >
                <HexagonLogo className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_8px_hsl(100_100%_60%/0.6)] group-hover:drop-shadow-[0_0_16px_hsl(100_100%_60%/0.8)]" />
              </button>
              {/* Text - Links to Homepage */}
              <Link 
                to="/"
                onClick={() => trackNavigation(location.pathname, '/')}
                className="text-xs font-mono tracking-[0.15em] text-foreground hover:text-logo-green hover:animate-glitch transition-colors hidden sm:block"
              >
                techno.dog
              </Link>
            </div>

            {/* Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.path)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.isScenes ? (
                    // Scenes dropdown trigger (not a link itself)
                    <button
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 hover:animate-glitch hover:text-logo-green ${
                        isScenesActive 
                          ? 'text-logo-green drop-shadow-[0_0_8px_hsl(var(--logo-green)/0.6)]' 
                          : 'text-muted-foreground hover:text-logo-green'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => trackNavigation(location.pathname, item.path)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all duration-300 hover:animate-glitch hover:text-logo-green ${
                        isActive(item.path) 
                          ? 'text-logo-green drop-shadow-[0_0_8px_hsl(var(--logo-green)/0.6)]' 
                          : 'text-muted-foreground hover:text-logo-green'
                      }`}
                    >
                      {item.label}
                      {item.sub && !item.isScenes && <ChevronDown className="w-2.5 h-2.5 opacity-60" />}
                    </Link>
                  )}
                  
                  {/* Dropdown */}
                  {item.sub && activeDropdown === item.path && (
                    <div className="absolute top-full left-0 mt-0 py-1.5 bg-background border border-border min-w-[160px] z-50 shadow-lg">
                      {item.isScenes && (
                        <div className="flex items-center justify-between px-3 py-1 border-b border-border mb-1">
                          <button 
                            onClick={() => navigateScene('prev')}
                            className="p-1 hover:text-logo-green transition-colors"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <span className="text-[9px] font-mono uppercase text-muted-foreground">Navigate</span>
                          <button 
                            onClick={() => navigateScene('next')}
                            className="p-1 hover:text-logo-green transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {item.sub.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={() => trackNavigation(location.pathname, subItem.path)}
                          className={`block px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                            isSubItemActive(subItem.path) || isActive(subItem.path)
                              ? 'text-logo-green bg-card border-l-2 border-logo-green' 
                              : 'text-muted-foreground hover:text-logo-green hover:bg-card'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/sound-machine">
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:animate-glitch font-mono text-[10px] uppercase tracking-widest text-foreground border border-foreground/50 bg-foreground/10 hover:bg-foreground/20 hover:border-foreground px-2.5 py-1.5 h-auto">
                <Radio className="w-3 h-3 mr-1.5" />
                Audio Lab
              </Button>
            </Link>
            <Link to="/developer">
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:animate-glitch font-mono text-[10px] uppercase tracking-widest text-logo-green border border-logo-green/50 bg-logo-green/10 hover:bg-logo-green/20 hover:border-logo-green hover:text-logo-green px-2.5 py-1.5 h-auto">
                <Code className="w-3 h-3 mr-1.5" />
                Developer API
              </Button>
            </Link>
            <Link to="/support">
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:animate-glitch font-mono text-[10px] uppercase tracking-widest text-crimson border border-crimson/50 bg-crimson/10 hover:bg-crimson/20 hover:border-crimson hover:text-crimson px-2.5 py-1.5 h-auto">
                <Heart className="w-3 h-3 mr-1.5" />
                Support
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:animate-glitch font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-logo-green">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Admin
              </Button>
            </Link>
            
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
                          {item.label}
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
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </nav>
                  <div className="p-4 border-t border-border space-y-2">
                    <Link to="/developer" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full font-mono text-xs uppercase tracking-wider text-logo-green border-logo-green/50 hover:bg-logo-green/10">
                        <Code className="w-3.5 h-3.5 mr-1.5" />
                        Developer API
                      </Button>
                    </Link>
                    <Link to="/support" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full font-mono text-xs uppercase tracking-wider text-crimson border-crimson/50 hover:bg-crimson/10">
                        <Heart className="w-3.5 h-3.5 mr-1.5" />
                        Support
                      </Button>
                    </Link>
                    <Link to="/sound-machine" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full font-mono text-xs uppercase tracking-wider border-foreground/50 hover:bg-foreground/10">
                        <Radio className="w-3.5 h-3.5 mr-1.5" />
                        Audio Lab
                      </Button>
                    </Link>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="brutalist" size="sm" className="w-full font-mono text-xs uppercase tracking-wider">
                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                        Admin
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>

      {/* Dog Chat Dialog */}
      <Dialog open={dogChatOpen} onOpenChange={setDogChatOpen}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden bg-background border-logo-green/30">
          <DialogTitle className="sr-only">Dog AI Assistant</DialogTitle>
          <DogChat />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
