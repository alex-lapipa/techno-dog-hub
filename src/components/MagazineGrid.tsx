import FeaturedArticle from "./FeaturedArticle";
import EditorialBlock from "./EditorialBlock";

const articles = [
  {
    category: "INTERVIEW",
    title: "Helena Hauff: The Analog Architect",
    excerpt: "From Hamburg's Golden Pudel Club to global recognition, the electro pioneer discusses her uncompromising approach to hardware-only performances and the future of raw electronic music.",
    readTime: "12 min",
    issue: "001",
    featured: true
  },
  {
    category: "SCENE",
    title: "Tbilisi: The New Underground Capital",
    excerpt: "How Bassiani and a generation of Georgian artists built one of the world's most vital techno scenes from the ground up.",
    readTime: "8 min",
    issue: "001",
    featured: false
  },
  {
    category: "GEAR",
    title: "The 303 Renaissance",
    excerpt: "Why acid's iconic silver box continues to define the sound of underground dance music four decades later.",
    readTime: "6 min",
    issue: "001",
    featured: false
  },
  {
    category: "ESSAY",
    title: "Detroit to Berlin: A Sonic Migration",
    excerpt: "Tracing the transatlantic journey of techno and how two cities shaped each other's musical identity through decades of exchange.",
    readTime: "15 min",
    issue: "001",
    featured: false
  }
];

const MagazineGrid = () => {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
            // Editorial
          </div>
          <div className="flex items-end justify-between gap-8">
            <h2 className="font-mono text-3xl md:text-5xl uppercase tracking-tight text-foreground">
              Issue #001
            </h2>
            <div className="hidden md:block font-mono text-xs text-muted-foreground uppercase tracking-wider">
              December 2025
            </div>
          </div>
        </div>

        {/* Editorial quote */}
        <EditorialBlock 
          issue="001"
          pullQuote="Techno is not just music. It's a complete way of life."
          author="Jeff Mills"
        />

        {/* Articles grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <FeaturedArticle key={index} {...article} />
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">
              4 articles in this issue
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              techno.dog © 2025 — All rights reserved
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MagazineGrid;
