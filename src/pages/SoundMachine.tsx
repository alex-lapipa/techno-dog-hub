import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { ExternalLink, Radio, Waves, Zap, Code, Music, Sliders, Users, TestTube, FileText, Rocket } from "lucide-react";
import tdogStudioPreview from "@/assets/tdog-studio-preview.png";
import ContributorContactForm from "@/components/ContributorContactForm";

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

                {/* Collaborative Project Info */}
                <div className="p-4 rounded-lg bg-logo-green/5 border border-logo-green/20">
                  <h3 className="font-mono text-sm font-medium mb-2 flex items-center gap-2 text-logo-green">
                    <span className="inline-block w-2 h-2 rounded-full bg-logo-green" />
                    Open Collaborative Project
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    The Techno Dog Sound Engine is a <span className="text-foreground font-medium">collaborative project launched in January 2026</span> that 
                    aims to build a powerful techno-focused instrument, <span className="text-foreground font-medium">free to use for the community</span>.
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    If you have skills and would like to contribute to this project, please get in touch. 
                    We really need community support to make this happen. Thank you.
                  </p>
                </div>

                {/* Product Preview */}
                <div>
                  <h3 className="font-mono text-sm font-medium mb-3 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-logo-green" />
                    Product Preview
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-border/50 bg-background/50">
                    <img 
                      src={tdogStudioPreview} 
                      alt="T:DOG Studio - Techno Drum Machine Interface" 
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50">
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
                      tdog.studio — Full-Featured Web Application
                    </p>
                  </div>
                </div>

                {/* Open Source Call Section */}
                <div className="border-t border-border/50 pt-6">
                  <div className="p-5 rounded-lg bg-gradient-to-br from-logo-green/10 via-background to-background border border-logo-green/30">
                    <h3 className="font-mono text-lg font-bold mb-3 text-logo-green flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Open-Source & Techno Communities: Skills Needed
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We're building a <span className="text-foreground font-medium">free, open-source drum instrument built for techno</span> — and we want to build it with the community.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      This project is fully open to contributors: <span className="text-foreground">developers, sound designers, producers, testers, writers, and makers</span>.
                      If you want to help create a modern digital instrument that stays free to use, hackable, and owned by the culture — here are the skills we're looking for:
                    </p>
                  </div>
                </div>

                {/* Core Skills Section */}
                <div className="space-y-6">
                  <h4 className="font-mono text-base font-bold text-logo-green flex items-center gap-2">
                    🔥 Core Skills We Need
                  </h4>

                  {/* Audio / DSP Engineering */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <Waves className="w-4 h-4 text-logo-green" />
                      Audio / DSP Engineering
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">Help build the sound engine:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Real-time audio processing (low latency, stable performance)</li>
                      <li>• Drum synthesis (kick, snare, hats, percussion engines)</li>
                      <li>• Sample playback + slicing + pitch control</li>
                      <li>• Effects (distortion, compression, EQ, delay, reverb)</li>
                      <li>• CPU optimisation + real-time safe programming</li>
                    </ul>
                  </div>

                  {/* Sequencer + Timing */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-logo-green" />
                      Sequencer + Timing
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">Techno lives in timing. We need:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Step sequencer development (patterns, chaining, swing/groove)</li>
                      <li>• Probability + variation systems (ratchets, generative triggers, fills)</li>
                      <li>• Tight clocking + sync (MIDI clock / host sync)</li>
                      <li>• Performance modes (muting, live triggering, pattern switching)</li>
                    </ul>
                  </div>

                  {/* Plugin / Standalone App Engineering */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4 text-logo-green" />
                      Plugin / Standalone App Engineering
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">Bring it to the real world:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Cross-platform builds (macOS / Windows / Linux)</li>
                      <li>• Plugin formats (VST3 / AU) and standalone app packaging</li>
                      <li>• MIDI input/output + mapping</li>
                      <li>• Build tooling + release pipeline automation (CI/CD)</li>
                    </ul>
                  </div>

                  {/* UI / Interaction Design */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-logo-green" />
                      UI / Interaction Design
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">This must feel like an instrument:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Instrument UI/UX design (fast, playable, minimal friction)</li>
                      <li>• Grid/pad layouts, parameter control systems, workflow design</li>
                      <li>• Frontend development (depending on stack: JUCE UI / web UI / hybrid)</li>
                      <li>• Visual feedback + micro-interactions</li>
                    </ul>
                  </div>
                </div>

                {/* Creative + Community Skills */}
                <div className="space-y-6">
                  <h4 className="font-mono text-base font-bold text-logo-green flex items-center gap-2">
                    🎛 Creative + Community Skills (Critical)
                  </h4>

                  {/* Sound Design + Kit Building */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <Music className="w-4 h-4 text-logo-green" />
                      Sound Design + Kit Building
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">Make it sound insane out of the box:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Drum sound creation (techno-focused)</li>
                      <li>• Sample kits + preset banks</li>
                      <li>• Gain staging + mix-ready kit design</li>
                      <li>• Pack curation (raw / industrial / hypnotic / experimental)</li>
                    </ul>
                  </div>

                  {/* Testing + QA */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <TestTube className="w-4 h-4 text-logo-green" />
                      Testing + QA
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">To keep it stable and credible:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Cross-platform testing and bug reproduction</li>
                      <li>• Latency/performance testing</li>
                      <li>• Regression testing (sequencer timing + playback stability)</li>
                    </ul>
                  </div>

                  {/* Documentation + Tutorials */}
                  <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                    <h5 className="font-mono text-sm font-bold mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-logo-green" />
                      Documentation + Tutorials
                    </h5>
                    <p className="text-muted-foreground text-sm mb-3">Open source only scales with clarity:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Setup/build documentation</li>
                      <li>• Contribution guidelines</li>
                      <li>• Tutorials, example kits, beginner onboarding</li>
                      <li>• Community support + issue triage</li>
                    </ul>
                  </div>
                </div>

                {/* Contribution Paths */}
                <div className="p-5 rounded-lg bg-logo-green/5 border border-logo-green/20">
                  <h4 className="font-mono text-base font-bold mb-3 text-logo-green flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    🚀 Contribution Paths (So Anyone Can Jump In)
                  </h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Whether you can contribute <span className="text-foreground font-medium">code, sound, design, or testing</span>, you're welcome.
                    Choose a role, pick an issue, and help shape the instrument.
                  </p>
                  <p className="text-foreground font-medium">
                    → Join the project, grab a task, and build the future of techno tools with us.
                  </p>
                </div>

                {/* Closing Statement */}
                <div className="text-center py-6 border-t border-border/50">
                  <p className="font-mono text-lg text-foreground font-bold mb-2">
                    This isn't a product. It's a community instrument.
                  </p>
                  <p className="text-muted-foreground font-mono text-sm">
                    Built in public. Free to use. Open forever.
                  </p>
                </div>

                {/* Contributor Contact Form */}
                <ContributorContactForm />

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
