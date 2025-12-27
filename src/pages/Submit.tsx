import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import CommunitySubmissionForm from "@/components/CommunitySubmissionForm";

const Submit = () => {
  useScrollDepth({ pageName: "submit" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Submit to the Archive"
        description="Suggest artists, venues, festivals, and labels to add to the techno.dog knowledge base. Help build the underground techno archive."
        path="/submit"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-2xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // Contribute
              </div>
              <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6">
                Submit to the Archive
              </h1>
              <p className="font-mono text-base md:text-lg text-muted-foreground leading-relaxed">
                Know an artist, venue, festival, or label that belongs in the techno.dog archive? Submit your suggestion below. We're building this knowledge base together.
              </p>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">
                  Underground Only
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  We focus on underground techno culture. No mainstream EDM, festival headliners, or commercial acts.
                </p>
              </div>
              <div className="border border-border p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">
                  Quality Over Quantity
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Provide as much detail as possible. Why is this significant? What's the connection to the scene?
                </p>
              </div>
              <div className="border border-border p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">
                  Global Perspective
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  From Detroit to Tbilisi, Tokyo to Bogotá. We document techno culture worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="max-w-2xl mx-auto">
              <CommunitySubmissionForm />
            </div>
          </div>
        </section>

        {/* ASCII decoration */}
        <section className="border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="font-mono text-xs text-muted-foreground/30 text-center">
              // Building the archive together. Strictly non-mainstream.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;