import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import AudioPlayer from "@/components/audio/AudioPlayer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Radio, Waves, Zap, Headphones } from "lucide-react";

const SoundMachine = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO 
        title="Audio Lab | Techno Dog"
        description="T-DOG Sound Engine - AI-powered rhythm machine for dark, warehouse techno. Create patterns with the next-gen sound engine at tdog.studio."
        path="/sound-machine"
      />
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter mb-2">
              Audio Lab
            </h1>
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Creative Sound Tools
            </p>
          </div>

          <div className="space-y-8">
            {/* Audio Player Section */}
            <div className="border border-border bg-card/30 rounded-lg overflow-hidden">
              <div className="border-b border-border p-4 bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-mono text-lg font-bold tracking-tight">
                      Audio Player
                    </h2>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      Embedded Playback Component
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <AudioPlayer 
                  title="Demo Track"
                  artist="Techno Dog Audio Lab"
                />
                <p className="mt-4 text-xs text-muted-foreground font-mono">
                  Load your own audio files or connect to streaming sources. Player supports MP3, WAV, and OGG formats.
                </p>
              </div>
            </div>

            {/* T-DOG Sound Engine Card */}
            <div className="border border-border bg-card/30 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="border-b border-border p-6 bg-card/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-logo-green/20 border border-logo-green/50 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-logo-green" />
                  </div>
                  <div>
                    <h2 className="font-mono text-xl font-bold tracking-tight">
                      T<span className="text-logo-green">:</span>DOG Sound Engine
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                      AI-Powered Rhythm Machine
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  The <span className="text-foreground font-medium">Techno Dog Sound Engine</span> is a next-generation, 
                  AI-powered rhythm machine built for creating dark, warehouse techno patterns. Inspired by classic 
                  hardware drum machines but enhanced with modern AI capabilities.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                    <Waves className="w-5 h-5 text-logo-green mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-mono text-sm font-medium mb-1">Pattern Generation</h3>
                      <p className="text-xs text-muted-foreground">AI-assisted beat patterns optimized for driving, hypnotic techno.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50 border border-border/50">
                    <Zap className="w-5 h-5 text-logo-green mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-mono text-sm font-medium mb-1">Real-Time Synthesis</h3>
                      <p className="text-xs text-muted-foreground">Web Audio API-powered synthesis engine with low latency performance.</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 border-t border-border/50">
                  <a 
                    href="https://tdog.studio" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button 
                      variant="outline" 
                      className="font-mono text-sm uppercase tracking-wider border-logo-green/50 text-logo-green hover:bg-logo-green/10 hover:border-logo-green"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Launch T:DOG Studio
                    </Button>
                  </a>
                  <p className="mt-3 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                    tdog.studio — Standalone Web Application
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SoundMachine;
