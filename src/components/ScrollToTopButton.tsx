import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-background/90 backdrop-blur-md border-2 border-red-500/60 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-background hover:border-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] group"
      aria-label="Back to top"
    >
      {/* VHS red glow effect */}
      <div className="absolute inset-0 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors" />
      
      {/* Arrow icon in red */}
      <ChevronUp className="h-6 w-6 text-red-500 transition-transform duration-300 group-hover:-translate-y-0.5 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/95 border border-red-500/40 text-foreground text-xs font-mono px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
        Back to Top
      </span>
    </button>
  );
};

export default ScrollToTopButton;
