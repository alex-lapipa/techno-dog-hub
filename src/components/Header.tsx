import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import technoDogLogo from "@/assets/techno-dog-logo.png";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          <a href="/" className="flex items-center gap-2 group">
            <img src={technoDogLogo} alt="techno.dog logo" className="w-8 h-8 logo-glow" />
            <span className="text-sm font-mono tracking-[0.2em] text-foreground group-hover:animate-glitch">
              techno.dog
            </span>
          </a>

          {/* Navigation - Hidden on mobile since we have bottom nav */}
          <div className="hidden lg:flex items-center gap-8">
            <a
              href="#festivales"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.festivals')}
            </a>
            <a
              href="#aquasella"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.aquasella')}
            </a>
            <a
              href="#lev"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.lev')}
            </a>
            <a
              href="#chat"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('nav.chat')}
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <LanguageToggle />
            {!loading && (
              <Button variant="brutalist" size="sm" onClick={handleAuthClick}>
                {user ? t('nav.logout') : t('nav.login')}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
