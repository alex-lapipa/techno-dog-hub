import { useState, useEffect, useCallback, useMemo } from "react";
import { dogVariants } from "@/components/DogPack";
import { useWhatsAppMessage } from "@/hooks/useWhatsAppMessage";

// Simple Mobile-First Widget
// - Scrolling images that auto-change
// - Refresh button
// - WhatsApp share only
// - NO floating assistant
// - NO scrollbars
// - Adaptable to user sites

const DoggyWidget = () => {
  const [currentDogIndex, setCurrentDogIndex] = useState(
    Math.floor(Math.random() * dogVariants.length)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentDog = dogVariants[currentDogIndex];
  const DogComponent = currentDog.Component;

  // Use memoized WhatsApp message hook
  const { getFullShareText } = useWhatsAppMessage(currentDog.name);

  // Auto-rotate through doggies
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentDogIndex(prev => (prev + 1) % dogVariants.length);
        setIsTransitioning(false);
      }, 200);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Shuffle to random doggy
  const shuffle = useCallback(() => {
    setIsPaused(true);
    setIsTransitioning(true);
    setTimeout(() => {
      let newIndex = Math.floor(Math.random() * dogVariants.length);
      // Avoid same dog
      while (newIndex === currentDogIndex && dogVariants.length > 1) {
        newIndex = Math.floor(Math.random() * dogVariants.length);
      }
      setCurrentDogIndex(newIndex);
      setIsTransitioning(false);
      // Resume after 5s
      setTimeout(() => setIsPaused(false), 5000);
    }, 200);
  }, [currentDogIndex]);

  // WhatsApp share with memoized personalized message + hashtag
  const shareWhatsApp = useCallback(() => {
    const text = getFullShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [getFullShareText]);

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: '#0a0a0a',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '240px',
          padding: '20px',
          borderRadius: '16px',
          border: '1px solid rgba(57, 255, 20, 0.25)',
          background: 'rgba(10, 10, 10, 0.98)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Doggy Display */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 200ms ease-out',
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? 'scale(0.9)' : 'scale(1)',
          }}
        >
          <DogComponent className="w-16 h-16" animated />
          <span 
            style={{
              marginTop: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              letterSpacing: '0.5px',
            }}
          >
            {currentDog.name}
          </span>
          <span 
            style={{
              marginTop: '6px',
              padding: '4px 10px',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: '#39FF14',
              border: '1px solid rgba(57, 255, 20, 0.35)',
              borderRadius: '999px',
            }}
          >
            {currentDog.status}
          </span>
        </div>

        {/* Action Buttons - Refresh & WhatsApp Only */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {/* Refresh Button */}
          <button
            onClick={shuffle}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: '500',
              color: '#39FF14',
              background: 'transparent',
              border: '1px solid rgba(57, 255, 20, 0.4)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 150ms',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
              e.currentTarget.style.borderColor = '#39FF14';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Shuffle
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={shareWhatsApp}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: '500',
              color: '#fff',
              background: '#25D366',
              border: '1px solid #25D366',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 150ms',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#20BD5A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#25D366';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share
          </button>
        </div>

        {/* Subtle CTA */}
        <a 
          href="https://techno.dog/doggies" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.45)',
            textDecoration: 'none',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#39FF14'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'; }}
        >
          techno.dog
        </a>
      </div>
    </div>
  );
};

export default DoggyWidget;
