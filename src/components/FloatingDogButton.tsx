import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import DogSilhouette from '@/components/DogSilhouette';
import DogChat from '@/components/admin/DogChat';

// Quirky ambient messages - techno dog personality
const ambientMessages = [
  "woof! did you know Surgeon uses a 303? 🎛️",
  "pssst... have you explored the gear archive?",
  "borking about that 909 kick drum...",
  "*tail wag* 170 artists in the database!",
  "techno tip: always trust the hi-hats",
  "sniffing out new releases...",
  "who let the dogs out? (it was me)",
  "bork bork! ask me about Jeff Mills",
  "feeling hypnotic today 🌀",
  "warehouse vibes loading...",
  "4/4 forever, am I right?",
  "did someone say Berghain?",
  "*spins in circles* acid acid acid!",
  "tip: click me for techno wisdom",
  "the kick drum is my heartbeat 💚",
  "sniffing vinyl in Berlin...",
  "bork! explore the venues page",
  "I dream of 303 basslines",
  "techno dog reporting for duty!",
  "have you met Underground Resistance?",
  "filter sweep incoming... wooooof",
  "paws on the decks, always",
  "*happy dance* it's always 4am somewhere",
  "Roland gang rise up! 🐕",
  "ask me anything, I don't bite",
  "synth pads make me sleepy 😴",
  "bork! who's your favorite artist?",
  "I've got 99 gear items catalogued",
  "the dancefloor is calling...",
  "arf! check out the festivals section",
];

const FloatingDogButton = () => {
  const [dogChatOpen, setDogChatOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const location = useLocation();

  // Hide on widget page - keep widget clean and self-contained
  const isWidgetPage = location.pathname === '/doggy-widget';

  // Stop pulsing after first interaction
  useEffect(() => {
    if (dogChatOpen) {
      setIsPulsing(false);
    }
  }, [dogChatOpen]);

  // Pick a random message
  const pickRandomMessage = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * ambientMessages.length);
    return ambientMessages[randomIndex];
  }, []);

  // Ambient speech bubble timer - only when chat is closed
  useEffect(() => {
    if (dogChatOpen || isWidgetPage) {
      setBubbleVisible(false);
      return;
    }

    // Initial delay before first bubble (8-15 seconds)
    const initialDelay = 8000 + Math.random() * 7000;
    
    let bubbleTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const showBubble = () => {
      setBubbleMessage(pickRandomMessage());
      setBubbleVisible(true);
      
      // Hide after exactly 4 seconds
      hideTimeout = setTimeout(() => {
        setBubbleVisible(false);
      }, 4000);
    };

    // Start the cycle
    const startCycle = () => {
      showBubble();
      // Show next bubble in 18-25 seconds
      bubbleTimeout = setTimeout(startCycle, 18000 + Math.random() * 7000);
    };

    const initialTimeout = setTimeout(startCycle, initialDelay);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(bubbleTimeout);
      clearTimeout(hideTimeout);
    };
  }, [dogChatOpen, isWidgetPage, pickRandomMessage]);

  // Don't render on widget page
  if (isWidgetPage) {
    return null;
  }

  return (
    <>
      {/* Ambient Speech Bubble */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none ${
          bubbleVisible && !dogChatOpen
            ? 'animate-fade-in'
            : 'animate-fade-out'
        }`}
        style={{ animationDuration: '400ms', animationFillMode: 'forwards' }}
      >
        <div className="relative bg-background/95 backdrop-blur-md border border-logo-green/50 rounded-xl px-4 py-2.5 shadow-[0_0_20px_hsl(100_100%_60%/0.2)] max-w-[280px]">
          {/* Speech bubble tail */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-logo-green/50" />
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-background/95" />
          
          <p className="font-mono text-xs text-foreground/90 text-center leading-relaxed">
            {bubbleMessage}
          </p>
        </div>
      </div>

      <button
        onClick={() => setDogChatOpen(true)}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-16 h-16 rounded-full bg-background/90 backdrop-blur-md border-2 border-logo-green/60 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-background hover:border-logo-green hover:shadow-[0_0_30px_hsl(100_100%_60%/0.5)] group ${isPulsing ? 'animate-pulse' : ''}`}
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
