import { Link } from "react-router-dom";
import { ArrowRight, Disc } from "lucide-react";
import { labels } from "@/data/labels";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const LabelsPage = () => {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Techno Record Labels",
    "description": "Underground techno record labels defining the sound",
    "numberOfItems": labels.length,
    "itemListElement": labels.map((label, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": label.name,
        "url": `https://techno.dog/labels/${label.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Techno Record Labels"
        description="The imprints that define the underground. Quality over quantity. Essential techno labels worldwide."
        path="/labels"
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4 py-8 md:py-12 border-b border-border">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // Archive
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              Labels
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              The imprints that define the underground. Quality over quantity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 py-8">
            {labels.map((label) => (
              <Link
                key={label.id}
                to={`/labels/${label.id}`}
                className="group block border border-border p-6 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <Disc className="w-6 h-6 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {label.founded}
                  </span>
                </div>
                
                <h2 className="font-mono text-xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                  {label.name}
                </h2>
                
                <div className="font-mono text-xs text-muted-foreground mb-4">
                  {label.city}, {label.country}
                </div>
                
                {label.description && (
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-4">
                    {label.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {label.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  <span>View catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 font-mono text-xs text-muted-foreground">
            {labels.length} labels in archive
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabelsPage;