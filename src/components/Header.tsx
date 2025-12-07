import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    if (user) {
      await signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <span className="text-sm font-mono uppercase tracking-[0.3em] text-foreground group-hover:animate-glitch">
              TechnoFest_EU
            </span>
          </a>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#festivales"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Festivales
            </a>
            <a
              href="#aquasella"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Aquasella
            </a>
            <a
              href="#lev"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              L.E.V.
            </a>
            <a
              href="#chat"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Chat IA
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {!loading && (
              <Button variant="brutalist" size="sm" onClick={handleAuthClick}>
                {user ? 'Salir' : 'Entrar'}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
