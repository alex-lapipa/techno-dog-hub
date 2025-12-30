import { ExternalLink, Users, Headphones, Wrench, Code, HelpCircle, Music } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface DoggyPageFooterProps {
  pageSource: 'widget' | 'main_page' | 'shared';
  currentDoggyName?: string;
}

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('doggy_session_id');
  if (!sessionId) {
    sessionId = `doggy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('doggy_session_id', sessionId);
  }
  return sessionId;
};

export const trackDoggyEvent = async (
  pageSource: string,
  eventType: string,
  linkClicked?: string,
  doggyName?: string,
  metadata?: Json
) => {
  try {
    await supabase.from('doggy_page_analytics').insert([{
      page_source: pageSource,
      event_type: eventType,
      link_clicked: linkClicked || null,
      session_id: getSessionId(),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      doggy_name: doggyName || null,
      metadata: metadata || {}
    }]);
  } catch (error) {
    // Silent fail - don't break user experience for analytics
    console.debug('Analytics tracking error:', error);
  }
};

const footerLinks = [
  { label: 'Artists', path: '/artists', icon: Headphones, description: 'Discover techno artists' },
  { label: 'Gear', path: '/gear', icon: Wrench, description: 'Explore production gear' },
  { label: 'Audio Lab', path: '/sound-machine', icon: Music, description: 'Create sounds' },
  { label: 'Support', path: '/support', icon: HelpCircle, description: 'Get help' },
  { label: 'Developer API', path: '/developer', icon: Code, description: 'Build with us' },
  { label: 'Community', path: '/community', icon: Users, description: 'Join the pack' },
];

const DoggyPageFooter = ({ pageSource, currentDoggyName }: DoggyPageFooterProps) => {
  const location = useLocation();
  const isMainSite = location.pathname.startsWith('/');
  const isEmbeddedWidget = pageSource === 'widget';
  
  const handleLinkClick = (linkLabel: string, path: string) => {
    trackDoggyEvent(pageSource, 'link_click', linkLabel, currentDoggyName, { path });
  };

  // For embedded widgets, always use external links
  // For main site pages, use React Router for internal navigation
  const renderLink = (link: typeof footerLinks[0]) => {
    const IconComponent = link.icon;
    const linkClasses = "group flex flex-col items-center p-3 rounded-lg border border-border/30 hover:border-logo-green/50 hover:bg-logo-green/5 transition-all duration-200";
    
    if (isEmbeddedWidget) {
      return (
        <a
          key={link.path}
          href={`https://techno.dog${link.path}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleLinkClick(link.label, link.path)}
          className={linkClasses}
        >
          <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-logo-green transition-colors" />
          <span className="mt-1.5 font-mono text-xs text-foreground group-hover:text-logo-green transition-colors">
            {link.label}
          </span>
        </a>
      );
    }
    
    return (
      <Link
        key={link.path}
        to={link.path}
        onClick={() => handleLinkClick(link.label, link.path)}
        className={linkClasses}
      >
        <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-logo-green transition-colors" />
        <span className="mt-1.5 font-mono text-xs text-foreground group-hover:text-logo-green transition-colors">
          {link.label}
        </span>
      </Link>
    );
  };

  return (
    <footer className="w-full border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Site Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {footerLinks.map(renderLink)}
        </div>

        {/* Copyright & Branding */}
        <div className="text-center space-y-3 pt-4 border-t border-border/30">
          <p className="font-mono text-xs text-muted-foreground">
            Techno Doggies are © {new Date().getFullYear()} the{' '}
            {isEmbeddedWidget ? (
              <a 
                href="https://techno.dog/community" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleLinkClick('Community Copyright', '/community')}
                className="text-logo-green hover:underline"
              >
                techno.dog community
              </a>
            ) : (
              <Link 
                to="/community"
                onClick={() => handleLinkClick('Community Copyright', '/community')}
                className="text-logo-green hover:underline"
              >
                techno.dog community
              </Link>
            )}
            . Free to share with attribution.
          </p>
          
          {/* Credits */}
          <p className="font-mono text-[10px] text-muted-foreground/70">
            RingLeader:{' '}
            <a 
              href="https://alexlawton.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-logo-green transition-colors"
            >
              Alex Lawton
            </a>
            {' '}·{' '}
            <a 
              href="https://lapipa.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-logo-green transition-colors"
            >
              Lapipa
            </a>
          </p>
          
          {isEmbeddedWidget ? (
            <a 
              href="https://techno.dog" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleLinkClick('Main Site', '/')}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors"
            >
              <span className="font-bold">techno.dog</span>
              <span>— Your global techno companion</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <Link 
              to="/"
              onClick={() => handleLinkClick('Main Site', '/')}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors"
            >
              <span className="font-bold">techno.dog</span>
              <span>— Your global techno companion</span>
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default DoggyPageFooter;
