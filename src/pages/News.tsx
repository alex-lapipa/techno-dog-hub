import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublishedNewsArticles from "@/components/PublishedNewsArticles";
import TrendingTopics from "@/components/TrendingTopics";

const newsItems = [
  {
    id: "bassiani-anniversary",
    category: "SCENE",
    title: "Bassiani Celebrates 10 Years of Resistance",
    excerpt: "The Tbilisi institution marks a decade of cultural revolution beneath the stadium.",
    date: "2024-12-01",
    readTime: "8 min",
    featured: true
  },
  {
    id: "surgeon-live",
    category: "INTERVIEW",
    title: "Surgeon: 30 Years of Birmingham Techno",
    excerpt: "Anthony Child on three decades of modular exploration and the evolution of British techno.",
    date: "2024-11-28",
    readTime: "15 min",
    featured: true
  },
  {
    id: "tresor-berlin",
    category: "VENUE",
    title: "Tresor: The Vault That Changed Everything",
    excerpt: "How a department store vault became the bridge between Detroit and Berlin.",
    date: "2024-11-25",
    readTime: "12 min",
    featured: false
  },
  {
    id: "polegroup-madrid",
    category: "LABEL",
    title: "PoleGroup: Madrid's Hypnotic Collective",
    excerpt: "Oscar Mulero's label continues to define Spanish techno.",
    date: "2024-11-20",
    readTime: "10 min",
    featured: false
  },
  {
    id: "fold-london",
    category: "VENUE",
    title: "Fold: 24 Hours in the Dark",
    excerpt: "Inside East London's marathon warehouse sessions.",
    date: "2024-11-15",
    readTime: "7 min",
    featured: false
  },
  {
    id: "detroit-movement",
    category: "FESTIVAL",
    title: "Movement Detroit: Back to the Source",
    excerpt: "The annual pilgrimage to Hart Plaza and the birthplace of techno.",
    date: "2024-11-10",
    readTime: "9 min",
    featured: false
  }
];

const NewsPage = () => {
  const { user } = useAuth();
  const featured = newsItems.filter(n => n.featured);
  const regular = newsItems.filter(n => !n.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Hero with Featured Article */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Left: Header */}
            <div className="space-y-4">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                // Latest transmissions
              </div>
              <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
                News
              </h1>
              <p className="font-mono text-sm text-muted-foreground max-w-md">
                Curated stories from the global underground. No hype, just substance.
              </p>
              <div className="flex gap-4 pt-4">
                <Link 
                  to="/news/archive" 
                  className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  → Browse Archive
                </Link>
              </div>
              {user && (
                <div className="flex gap-4 mt-4">
                  <Link 
                    to="/news/archive" 
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    → Archive
                  </Link>
                  <Link 
                    to="/news/drafts" 
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    → View Drafts
                  </Link>
                  <Link 
                    to="/admin/news-agent" 
                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    → News Agent
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Featured Article */}
            {featured[0] && (
              <Link
                to={`/news/${featured[0].id}`}
                className="group block border border-border p-6 md:p-8 hover:bg-card transition-colors bg-card/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary border border-primary px-2 py-1">
                    Featured
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {featured[0].readTime}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                  {featured[0].category}
                </span>
                <h2 className="font-mono text-xl md:text-2xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                  {featured[0].title}
                </h2>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-4">
                  {featured[0].excerpt}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  <span>Read Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}
          </div>

          {/* Trending Topics */}
          <TrendingTopics />

          {/* Community-Agent generated articles */}
          <div className="mb-16">
            <PublishedNewsArticles />
          </div>

          {/* Featured (excluding hero featured) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {featured.slice(1).map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group block border border-border p-6 md:p-8 hover:bg-card transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-foreground border border-foreground px-2 py-1 group-hover:animate-glitch">
                    {item.category}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.readTime}
                  </span>
                </div>
                <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-4 group-hover:animate-glitch">
                  {item.title}
                </h2>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">
                  {item.excerpt}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  <span>Read</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Regular news */}
          <div className="border-t border-border">
            {regular.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group flex items-start justify-between gap-4 border-b border-border py-6 hover:bg-card transition-colors px-4 -mx-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-mono text-lg md:text-xl uppercase tracking-tight group-hover:animate-glitch">
                    {item.title}
                  </h3>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all mt-2" />
              </Link>
            ))}
          </div>

          {/* Cross-links */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Festivals →', path: '/festivals' },
              { label: 'Artists →', path: '/artists' },
              { label: 'Releases →', path: '/releases' },
              { label: 'Mad Stuff →', path: '/mad' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block border border-border p-4 font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-card hover:animate-glitch transition-colors text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPage;