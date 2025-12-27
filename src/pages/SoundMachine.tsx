import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const SoundMachine = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO 
        title="T:DOG Sound Machine | AI-Powered Rhythm Machine"
        description="Next-gen AI-powered rhythm machine inspired by classic hardware. Create dark, warehouse techno patterns with the T:DOG Sound Machine."
        path="/sound-machine"
      />
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter mb-2">
              T<span className="text-logo-green">:</span>DOG
            </h1>
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              AI-Powered Rhythm Machine
            </p>
            <p className="text-muted-foreground/60 font-mono text-[10px] tracking-wider mt-1">
              NEXT-GEN • API-READY • v2.0
            </p>
          </div>

          {/* Embedded Sound Machine */}
          <div className="border border-border bg-card/30 rounded-lg overflow-hidden">
            <iframe 
              src="https://claude.site/public/artifacts/99cde411-6677-4e8e-8195-4998ec8b3cf5/embed" 
              title="T:DOG Sound Machine" 
              width="100%" 
              height="600" 
              frameBorder="0" 
              allow="clipboard-write" 
              allowFullScreen
              className="w-full"
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SoundMachine;
