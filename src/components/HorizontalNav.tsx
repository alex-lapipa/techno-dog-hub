import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalNavProps {
  activeSection: number;
  onSectionChange: (index: number) => void;
  sections: string[];
}

const HorizontalNav = ({ activeSection, onSectionChange, sections }: HorizontalNavProps) => {
  const { t } = useLanguage();
  
  const handlePrev = () => {
    if (activeSection > 0) {
      onSectionChange(activeSection - 1);
    }
  };

  const handleNext = () => {
    if (activeSection < sections.length - 1) {
      onSectionChange(activeSection + 1);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            disabled={activeSection === 0}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Section Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-4">
            {sections.map((section, index) => (
              <button
                key={section}
                onClick={() => onSectionChange(index)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeSection === index
                    ? 'text-foreground bg-foreground/10 border border-foreground/30'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            disabled={activeSection === sections.length - 1}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-px bg-border">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${((activeSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default HorizontalNav;
