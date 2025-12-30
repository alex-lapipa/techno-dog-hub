import { useState, useEffect } from "react";
import { dogVariants } from "@/components/DogPack";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const DoggyWidget = () => {
  const [currentDogIndex, setCurrentDogIndex] = useState(
    Math.floor(Math.random() * dogVariants.length)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const currentDog = dogVariants[currentDogIndex];
  const DogComponent = currentDog.Component;

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

  const shuffleDog = () => {
    setAutoRotate(false);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDogIndex(Math.floor(Math.random() * dogVariants.length));
      setIsAnimating(false);
    }, 150);
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-4"
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100%',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
      }}
    >
      <div 
        className="w-full max-w-[280px] rounded-xl border border-[#39FF14]/30 p-5 flex flex-col items-center gap-4"
        style={{ background: 'rgba(10,10,10,0.95)' }}
      >
        {/* Doggy Display */}
        <div 
          className={`flex flex-col items-center transition-all duration-150 ${
            isAnimating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          <DogComponent className="w-20 h-20" animated />
          <h3 className="mt-3 text-base font-bold" style={{ color: '#fff' }}>
            {currentDog.name}
          </h3>
          <span 
            className="mt-1 px-3 py-1 text-[10px] uppercase tracking-wider rounded-full"
            style={{ 
              border: '1px solid rgba(57, 255, 20, 0.4)', 
              color: '#39FF14' 
            }}
          >
            {currentDog.status}
          </span>
        </div>

        {/* Shuffle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={shuffleDog}
          className="text-xs font-mono h-8 px-4"
          style={{ 
            borderColor: 'rgba(57, 255, 20, 0.4)',
            color: '#39FF14',
            background: 'transparent'
          }}
        >
          <RefreshCw className="w-3 h-3 mr-2" />
          Shuffle
        </Button>

        {/* CTA Link */}
        <a 
          href="https://techno.dog/doggies" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[11px] font-mono transition-colors hover:underline"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          Get your own doggy at techno.dog
        </a>
      </div>
    </div>
  );
};

export default DoggyWidget;
