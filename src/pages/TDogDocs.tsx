import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageSEO from '@/components/PageSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, Code, Zap, Music, Volume2, Sliders, Play, Square, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const TDogDocs = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const embedCode = `<iframe 
  src="https://claude.site/public/artifacts/99cde411-6677-4e8e-8195-4998ec8b3cf5/embed" 
  title="T:DOG Sound Machine" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allow="clipboard-write" 
  allowfullscreen
></iframe>`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO 
        title="T:DOG Documentation | Developer Docs"
        description="Technical documentation for the T:DOG AI-Powered Rhythm Machine. Embed the sound machine, API reference, and integration guides."
        path="/developer/tdog"
      />
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back navigation */}
          <Link 
            to="/developer" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-mono text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Developer Hub
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Badge variant="outline" className="font-mono text-xs border-logo-green text-logo-green">
                v2.0
              </Badge>
              <Badge variant="outline" className="font-mono text-xs">
                BETA
              </Badge>
            </div>
            <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              T<span className="text-logo-green">:</span>DOG
            </h1>
            <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase mb-2">
              AI-Powered Rhythm Machine
            </p>
            <p className="text-muted-foreground/60 max-w-2xl mx-auto">
              Next-generation drum machine inspired by classic hardware. Create dark, warehouse techno patterns with AI-assisted generation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <Link to="/sound-machine">
              <Card className="h-full hover:border-logo-green transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <Play className="w-8 h-8 text-logo-green mb-2" />
                  <CardTitle className="font-mono text-lg">Try T:DOG</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Launch the live sound machine</CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <Code className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="font-mono text-lg">Embed</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Add T:DOG to your website</CardDescription>
              </CardContent>
            </Card>
            <Card className="h-full opacity-50">
              <CardHeader className="pb-2">
                <Zap className="w-8 h-8 text-muted-foreground mb-2" />
                <CardTitle className="font-mono text-lg">API</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Coming soon</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Documentation Sections */}
          <Accordion type="multiple" defaultValue={["overview", "embed"]} className="space-y-4">
            {/* Overview */}
            <AccordionItem value="overview" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-logo-green" />
                  <span className="font-mono text-lg">Overview</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
                <p>
                  T:DOG is a browser-based drum machine built for the underground techno community. 
                  It features 8 synthesized drum voices, preset patterns, and AI-assisted beat generation.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 border border-border rounded bg-background text-center">
                    <div className="text-2xl font-bold text-foreground">8</div>
                    <div className="text-xs text-muted-foreground">Drum Voices</div>
                  </div>
                  <div className="p-4 border border-border rounded bg-background text-center">
                    <div className="text-2xl font-bold text-foreground">16</div>
                    <div className="text-xs text-muted-foreground">Step Sequencer</div>
                  </div>
                  <div className="p-4 border border-border rounded bg-background text-center">
                    <div className="text-2xl font-bold text-foreground">5</div>
                    <div className="text-xs text-muted-foreground">Presets</div>
                  </div>
                  <div className="p-4 border border-border rounded bg-background text-center">
                    <div className="text-2xl font-bold text-foreground">∞</div>
                    <div className="text-xs text-muted-foreground">Possibilities</div>
                  </div>
                </div>

                <h4 className="text-foreground font-bold mt-6 mb-2">Drum Voices</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['KICK', 'SNARE', 'CLAP', 'CH', 'OH', 'PERC', 'TOM', 'ACID'].map((voice) => (
                    <div key={voice} className="px-3 py-2 border border-border rounded bg-background">
                      <code className="text-xs text-logo-green">{voice}</code>
                    </div>
                  ))}
                </div>

                <h4 className="text-foreground font-bold mt-6 mb-2">Preset Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  {['BERLIN', 'DETROIT', 'WAREHOUSE', 'HYPNOTIC', 'INDUSTRIAL'].map((preset) => (
                    <Badge key={preset} variant="outline" className="font-mono text-xs">
                      {preset}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Embed */}
            <AccordionItem value="embed" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg">Embed T:DOG</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
                <p>
                  Add the T:DOG sound machine to your website with a simple iframe embed.
                </p>
                
                <div className="relative">
                  <pre className="bg-background border border-border rounded p-4 overflow-x-auto text-xs">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(embedCode)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <h4 className="text-foreground font-bold mt-6 mb-2">Customization Options</h4>
                <div className="space-y-3">
                  <div className="p-3 border border-border rounded bg-background">
                    <code className="text-xs text-logo-green">width</code>
                    <span className="text-xs ml-2">— Set to any value (default: 100%)</span>
                  </div>
                  <div className="p-3 border border-border rounded bg-background">
                    <code className="text-xs text-logo-green">height</code>
                    <span className="text-xs ml-2">— Minimum recommended: 600px</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Controls */}
            <AccordionItem value="controls" className="border border-border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Sliders className="w-5 h-5 text-primary" />
                  <span className="font-mono text-lg">Controls Reference</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded bg-background">
                    <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4" /> Transport
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li><strong>Play/Stop</strong> — Start or stop the sequencer</li>
                      <li><strong>BPM</strong> — Tempo control (60-200 BPM)</li>
                      <li><strong>Clear</strong> — Reset all steps</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-border rounded bg-background">
                    <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> Master Effects
                    </h4>
                    <ul className="space-y-1 text-xs">
                      <li><strong>Drive</strong> — Add saturation/distortion</li>
                      <li><strong>Cutoff</strong> — Low-pass filter frequency</li>
                      <li><strong>Reso</strong> — Filter resonance</li>
                      <li><strong>Swing</strong> — Groove timing offset</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-border rounded bg-background">
                    <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-logo-green" /> AI Generate
                    </h4>
                    <p className="text-xs">
                      Select style tags and click Generate to create AI-assisted patterns based on your selected vibe.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* API (Coming Soon) */}
            <AccordionItem value="api" className="border border-border rounded-lg px-6 bg-card opacity-60">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-muted-foreground" />
                  <span className="font-mono text-lg">API Reference</span>
                  <Badge variant="outline" className="ml-2 font-mono text-[10px]">COMING SOON</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
                <p>
                  The T:DOG API will allow programmatic control of patterns, tempo, and sound parameters. 
                  Stay tuned for the v3.0 release.
                </p>
                
                <div className="p-4 border border-dashed border-border rounded bg-background/50">
                  <h4 className="text-muted-foreground font-bold mb-2">Planned Endpoints</h4>
                  <ul className="space-y-1 text-xs">
                    <li className="opacity-50"><code>POST /api/tdog/pattern</code> — Generate pattern</li>
                    <li className="opacity-50"><code>GET /api/tdog/presets</code> — List presets</li>
                    <li className="opacity-50"><code>POST /api/tdog/render</code> — Export audio</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Live Demos */}
          <div className="mt-12 space-y-8">
            <h2 className="font-mono text-xl font-bold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-logo-green" />
              Live Demos
            </h2>
            
            {/* Demo 1 */}
            <div className="border border-border bg-card/30 rounded-lg overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-card/50">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Demo 1</span>
              </div>
              <iframe 
                src="https://claude.site/public/artifacts/b2055d9e-8a20-4c9c-be9b-d6b2297cbcc4/embed" 
                title="T:DOG Demo 1" 
                width="100%" 
                height="600" 
                frameBorder="0" 
                allow="clipboard-write" 
                allowFullScreen
                className="w-full"
              />
            </div>

            {/* Demo 2 */}
            <div className="border border-border bg-card/30 rounded-lg overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-card/50">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Demo 2</span>
              </div>
              <iframe 
                src="https://claude.site/public/artifacts/7162bc0f-4101-43e1-b190-bf4ba91a35d0/embed" 
                title="T:DOG Demo 2" 
                width="100%" 
                height="600" 
                frameBorder="0" 
                allow="clipboard-write" 
                allowFullScreen
                className="w-full"
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link to="/sound-machine">
              <Button className="bg-logo-green/20 border border-logo-green text-logo-green hover:bg-logo-green/30 font-mono uppercase tracking-widest">
                <Play className="w-4 h-4 mr-2" />
                Launch T:DOG
              </Button>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TDogDocs;
