import { useState, useEffect } from "react";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

const DoggyWidget = () => {
  const [currentDogIndex, setCurrentDogIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentDog = dogVariants[currentDogIndex];
  const DogComponent = currentDog.Component;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentDogIndex(prev => (prev + 1) % dogVariants.length);
        setIsAnimating(false);
      }, 150);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const randomDog = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDogIndex(Math.floor(Math.random() * dogVariants.length));
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div className="w-full h-full min-h-[280px] flex items-center justify-center p-3 bg-background">
      <div 
        className="w-full max-w-[260px] rounded-lg border border-logo-green/30 bg-background/95 p-4"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Dog Display */}
        <div 
          className={`flex flex-col items-center transition-all duration-150 ${
            isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          <DogComponent className="w-16 h-16" animated />
          <h3 className="mt-2 text-sm font-bold text-foreground">{currentDog.name}</h3>
          <span 
            className="mt-1 px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-full border border-logo-green/30 text-logo-green"
          >
            {currentDog.status}
          </span>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={randomDog}
            className="text-[10px] font-mono h-7 px-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Shuffle
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-[10px] font-mono h-7 px-2"
          >
            <a href="https://techno.dog/doggies" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              techno.dog
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoggyWidget;
