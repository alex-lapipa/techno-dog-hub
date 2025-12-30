import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import DogSilhouette from '@/components/DogSilhouette';
import DogChat from '@/components/admin/DogChat';

const FloatingDogButton = () => {
  const [dogChatOpen, setDogChatOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const location = useLocation();

  // Hide on widget page - keep widget clean and self-contained
  const isWidgetPage = location.pathname === '/doggy-widget';

  // Stop pulsing after first interaction
  useEffect(() => {
    if (dogChatOpen) {
      setIsPulsing(false);
    }
  }, [dogChatOpen]);

  // Don't render on widget page
  if (isWidgetPage) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setDogChatOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-background/90 backdrop-blur-md border-2 border-logo-green/60 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-background hover:border-logo-green hover:shadow-[0_0_30px_hsl(100_100%_60%/0.5)] group ${isPulsing ? 'animate-pulse' : ''}`}
        aria-label="Open Techno Dog"
      >
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-logo-green/20 animate-ping" style={{ animationDuration: '2s' }} />
        
        {/* Dog Silhouette */}
        <DogSilhouette className="w-10 h-10 transition-transform duration-300 group-hover:rotate-6 drop-shadow-[0_0_8px_hsl(100_100%_60%/0.6)]" />
        
        {/* Tooltip */}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/95 border border-logo-green/40 text-foreground text-xs font-mono px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          Ask Techno Dog
        </span>
      </button>

      <Dialog open={dogChatOpen} onOpenChange={setDogChatOpen}>
        <DialogContent className="max-w-2xl h-[85vh] max-h-[700px] p-0 overflow-hidden bg-background border-logo-green/30 shadow-[0_0_40px_hsl(100_100%_60%/0.15)]">
          <DialogTitle className="sr-only">Techno Dog</DialogTitle>
          <DogChat />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingDogButton;
