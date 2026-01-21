import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import DogSilhouette from '@/components/DogSilhouette';
import DogChat from '@/components/admin/DogChat';

// Quirky ambient messages - gen z techno dog personality
const ambientMessages = [
  "bestie the 909 kick is lowkey unmatched",
  "no cap surgeon understood the assignment",
  "pov: you forgot to check the gear archive",
  "it's giving warehouse at 4am realness",
  "the 303 is mother and that's on period",
  "not me borking about acid basslines again",
  "this database has 170 artists no cap",
  "hi-hats hitting different today ngl",
  "me when the filter sweep drops: unhinged",
  "berghain queue core is my aesthetic",
  "lowkey obsessed with detroit techno rn",
  "the way jeff mills ate that... iconic",
  "tell me you love techno without telling me",
  "4/4 is my entire personality tbh",
  "this vinyl is bussin fr fr",
  "me pretending i'm not thinking about 303s",
  "underground resistance walked so we could run",
  "gear archive is giving encyclopedia realness",
  "the kick drum said slay and left",
  "not me sniffing out unreleased tracks",
  "roland gang rise up no cap",
  "ask me anything i literally don't bite",
  "synth pads are lowkey a vibe tho",
  "99 gear items catalogued it's giving thorough",
  "the dancefloor is calling and i must bork",
  "festivals section is chef's kiss honestly",
  "acid acid acid... anyway stream the archive",
  "based and warehouse-pilled tbh",
  "me @ 6am still vibing: real",
  "click me for techno wisdom no cap",
];

const FloatingDogButton = () => {
  const [dogChatOpen, setDogChatOpen] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const shownMessagesRef = useRef<Set<number>>(new Set());
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // Hide on widget page and admin routes - keep widget/admin clean
  const isWidgetPage = location.pathname === '/doggy-widget';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const shouldHide = isWidgetPage || isAdminRoute;

  // Stop pulsing after first interaction
  useEffect(() => {
    if (dogChatOpen) {
      setIsPulsing(false);
    }
  }, [dogChatOpen]);

  // Pick a random message that hasn't been shown yet
  const pickRandomMessage = useCallback(() => {
    // Reset if all messages have been shown
    if (shownMessagesRef.current.size >= ambientMessages.length) {
      shownMessagesRef.current.clear();
    }
    
    // Find available indices
    const availableIndices: number[] = [];
    for (let i = 0; i < ambientMessages.length; i++) {
      if (!shownMessagesRef.current.has(i)) {
        availableIndices.push(i);
      }
    }
    
    // Pick random from available
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    shownMessagesRef.current.add(randomIndex);
    
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
      const message = pickRandomMessage();
      setBubbleMessage(message);
      setDisplayedText('');
      setBubbleVisible(true);
      
      // Typewriter effect
      let charIndex = 0;
      const typeSpeed = 35; // ms per character
      
      const typeNextChar = () => {
        if (charIndex < message.length) {
          setDisplayedText(message.slice(0, charIndex + 1));
          charIndex++;
          typewriterRef.current = setTimeout(typeNextChar, typeSpeed);
        }
      };
      
      typewriterRef.current = setTimeout(typeNextChar, 100);
      
      // Hide after 4 seconds (starts after bubble appears)
      hideTimeout = setTimeout(() => {
        setBubbleVisible(false);
        if (typewriterRef.current) {
          clearTimeout(typewriterRef.current);
        }
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
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [dogChatOpen, shouldHide, pickRandomMessage]);

  // Don't render on widget page or admin routes
  if (shouldHide) {
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
            {displayedText}
            <span className="inline-block w-0.5 h-3 bg-logo-green ml-0.5 animate-pulse" />
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
          {/* Close button */}
          <button
            onClick={() => setDogChatOpen(false)}
            className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-logo-green/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-logo-green hover:bg-background transition-all duration-200 group"
            aria-label="Close Techno Dog chat"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="group-hover:rotate-90 transition-transform duration-200"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <DogChat />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingDogButton;
