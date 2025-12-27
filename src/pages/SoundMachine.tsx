import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const SoundMachine = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO 
        title="Audio Lab | Techno Dog"
        description="Experimental audio tools and creative sound applications."
        path="/sound-machine"
      />
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tighter mb-2">
              Audio Lab
            </h1>
            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              Creative Sound Tools
            </p>
            <p className="text-muted-foreground/60 font-mono text-[10px] tracking-wider mt-1">
              Coming Soon
            </p>
          </div>

          {/* Placeholder for new app */}
          <div className="border border-border bg-card/30 rounded-lg overflow-hidden p-12 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              New audio application coming soon.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SoundMachine;
