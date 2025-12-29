import { useState, useEffect } from "react";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { DoggyPageFooter, trackDoggyEvent } from "@/components/doggy";

const DoggyWidget = () => {
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const currentDog = dogVariants[currentDogIndex];
  const DogComponent = currentDog.Component;

  // Track page view on mount
  useEffect(() => {
    trackDoggyEvent('widget', 'page_view', undefined, currentDog.name);
  }, []);

  useEffect(() => {
    if (!autoRotate) return;
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDogIndex(prev => (prev + 1) % dogVariants.length);
        setIsAnimating(false);
      }, 150);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoRotate]);

  const nextDog = () => {
    setIsAnimating(true);
    setAutoRotate(false);
    setTimeout(() => {
      setCurrentDogIndex(prev => (prev + 1) % dogVariants.length);
      setIsAnimating(false);
    }, 150);
  };

  const randomDog = () => {
    setIsAnimating(true);
    setAutoRotate(false);
    setTimeout(() => {
      setCurrentDogIndex(Math.floor(Math.random() * dogVariants.length));
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xs">
          <div 
            className="rounded-xl border-2 border-logo-green/30 bg-background p-6 space-y-4"
            style={{ fontFamily: 'monospace' }}
          >
            {/* Dog Display */}
            <div 
              className={`flex flex-col items-center transition-all duration-150 ${
                isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
              }`}
            >
              <DogComponent className="w-24 h-24" animated />
              <h3 className="mt-3 text-lg font-bold text-foreground">{currentDog.name} Dog</h3>
              <p className="text-xs text-muted-foreground text-center mt-1">
                {currentDog.personality}
              </p>
              <span 
                className="mt-2 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-full border border-logo-green/30 text-logo-green"
              >
                {currentDog.status}
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={nextDog}
                className="text-xs font-mono"
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={randomDog}
                className="text-xs font-mono"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Random
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Standalone Footer with copyright and site links */}
      <DoggyPageFooter pageSource="widget" currentDoggyName={currentDog.name} />
    </div>
  );
};

export default DoggyWidget;
