import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { releases } from "@/data/releases";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const ReleasesPage = () => {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Techno Releases",
    "description": "Essential techno records, vinyl and digital releases",
    "numberOfItems": releases.length,
    "itemListElement": releases.slice(0, 20).map((release, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MusicAlbum",
        "name": release.title,
        "byArtist": { "@type": "MusicGroup", "name": release.artist },
        "url": `https://techno.dog/releases/${release.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Techno Releases Archive"
        description="The records that shaped the sound. Essential techno vinyl and digital releases from the underground."
        path="/releases"
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
              Releases
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              The records that shaped the sound. Vinyl, digital, essential.
            </p>
          </div>

          <div className="border-t border-border">
            {releases.map((release, index) => (
              <Link
                key={release.id}
                to={`/releases/${release.id}`}
                className="group block border-b border-border py-6 hover:bg-card transition-colors px-4 -mx-4"
              >
                <div className="grid grid-cols-12 gap-4 items-start">
                  {/* Index */}
                  <div className="col-span-1 font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  
                  {/* Main info */}
                  <div className="col-span-7 md:col-span-5">
                    <h2 className="font-mono text-lg md:text-xl uppercase tracking-tight mb-1 group-hover:animate-glitch">
                      {release.title}
                    </h2>
                    <div className="font-mono text-sm text-muted-foreground">
                      {release.artist}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="hidden md:block col-span-3 font-mono text-xs text-muted-foreground uppercase">
                    {release.label}
                  </div>
                  
                  {/* Year & Format */}
                  <div className="col-span-3 md:col-span-2 text-right">
                    <div className="font-mono text-xs text-muted-foreground mb-1">
                      {release.year}
                    </div>
                    <div className="flex justify-end gap-1">
                      {release.format.map(f => (
                        <span key={f} className="font-mono text-xs text-muted-foreground border border-border px-1.5 py-0.5">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="col-span-1 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex gap-2 mt-3 pl-8 md:pl-12">
                  {release.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="font-mono text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 font-mono text-xs text-muted-foreground">
            {releases.length} releases in archive
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReleasesPage;