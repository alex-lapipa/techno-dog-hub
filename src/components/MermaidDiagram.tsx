import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ChevronDown, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#39FF14',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#39FF14',
    lineColor: '#39FF14',
    secondaryColor: '#1a1a1a',
    tertiaryColor: '#0d0d0d',
    background: '#0d0d0d',
    mainBkg: '#1a1a1a',
    nodeBorder: '#39FF14',
    clusterBkg: '#1a1a1a',
    clusterBorder: '#333333',
    titleColor: '#ffffff',
    edgeLabelBackground: '#1a1a1a',
    nodeTextColor: '#ffffff',
    actorTextColor: '#ffffff',
    actorBkg: '#1a1a1a',
    actorBorder: '#39FF14',
    signalColor: '#39FF14',
    signalTextColor: '#ffffff',
    labelBoxBkgColor: '#1a1a1a',
    labelBoxBorderColor: '#39FF14',
    labelTextColor: '#ffffff',
    loopTextColor: '#ffffff',
    noteBorderColor: '#39FF14',
    noteBkgColor: '#1a1a1a',
    noteTextColor: '#ffffff',
    activationBorderColor: '#39FF14',
    activationBkgColor: '#1a1a1a',
    sequenceNumberColor: '#0d0d0d',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
    nodeSpacing: 50,
    rankSpacing: 50,
    htmlLabels: true,
  },
  sequence: {
    mirrorActors: false,
    bottomMarginAdj: 10,
    actorFontSize: 14,
    actorFontWeight: 400,
    noteFontSize: 12,
    messageFontSize: 14,
  },
});

interface MermaidDiagramProps {
  chart: string;
  title: string;
  className?: string;
  defaultExpanded?: boolean;
}

const MermaidDiagram = ({ chart, title, className, defaultExpanded = false }: MermaidDiagramProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!isExpanded && !isFullscreen) return;

    const renderDiagram = async () => {
      try {
        setError(null);
        const { svg } = await mermaid.render(idRef.current, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [chart, isExpanded, isFullscreen]);

  return (
    <>
      <div className={cn("border border-border bg-card rounded-lg overflow-hidden", className)}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
        >
          <span className="font-mono text-sm uppercase tracking-wider">{title}</span>
          <div className="flex items-center gap-2">
            {isExpanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(true);
                }}
                className="p-1 hover:bg-accent rounded"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </button>
        {isExpanded && (
          <div className="p-4 border-t border-border bg-background/80 overflow-x-auto">
            {error ? (
              <div className="text-destructive font-mono text-sm">{error}</div>
            ) : svg ? (
              <div 
                ref={containerRef}
                className="mermaid-container flex justify-center items-center min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-pulse text-muted-foreground font-mono text-sm">Rendering...</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-mono text-lg uppercase tracking-wider">{title}</h3>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-accent rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start">
            {svg && (
              <div 
                className="mermaid-fullscreen transform scale-110 origin-top"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MermaidDiagram;
