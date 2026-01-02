import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine, Calendar, MapPin, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";

interface ArchiveStory {
  id: string;
  author: string;
  location: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  type: 'experience' | 'opinion' | 'memory';
}

// Sample archive stories - these would come from the database
const sampleStories: ArchiveStory[] = [
  {
    id: "1",
    author: "DJ_Underground_88",
    location: "Berlin, Germany",
    title: "My First Night at Tresor",
    excerpt: "The bass hit different at 4am. I remember walking down those stairs, not knowing what to expect. The vault was exactly what I'd dreamed about—raw, uncompromising, and utterly transformative.",
    date: "2024-11-15",
    tags: ["Tresor", "Berlin", "first-time"],
    type: 'experience'
  },
  {
    id: "2",
    author: "AcidQueen_Tbilisi",
    location: "Tbilisi, Georgia",
    title: "Bassiani Changed Everything",
    excerpt: "Growing up in Georgia, techno wasn't just music—it was resistance. When Bassiani opened, it became a safe space for expression in a country where being different could cost you everything.",
    date: "2024-10-22",
    tags: ["Bassiani", "Tbilisi", "culture", "resistance"],
    type: 'opinion'
  },
  {
    id: "3",
    author: "warehouse_rat",
    location: "Detroit, USA",
    title: "Movement Festival 2019: Back to the Source",
    excerpt: "Standing in Hart Plaza, watching Jeff Mills play as the sun set over the Detroit River. This is where it all started. The birthplace of techno felt alive, pulsing with four decades of history.",
    date: "2024-09-08",
    tags: ["Movement", "Detroit", "Jeff Mills", "festival"],
    type: 'memory'
  },
  {
    id: "4",
    author: "synth_nomad",
    location: "Tokyo, Japan",
    title: "Lost in Womb",
    excerpt: "The attention to sound in Japanese clubs is unmatched. At Womb, every frequency was perfect. The precision of the Funktion-One system made European venues feel almost careless.",
    date: "2024-08-30",
    tags: ["Womb", "Tokyo", "sound-system", "Japan"],
    type: 'experience'
  },
  {
    id: "5",
    author: "dark_selector",
    location: "London, UK",
    title: "Why Fold Matters for UK Techno",
    excerpt: "In an era where clubs close weekly, Fold represents something crucial—a 24-hour space where the culture can breathe. It's not just a venue; it's a statement about what London's nightlife could be.",
    date: "2024-08-15",
    tags: ["Fold", "London", "UK-techno", "nightlife"],
    type: 'opinion'
  },
  {
    id: "6",
    author: "vinyl_priest",
    location: "Manchester, UK",
    title: "The Night Surgeon Played Until Sunrise",
    excerpt: "Four hours of modular techno in a converted mill. No phones, no chatter—just 200 heads locked into Anthony Child's vision. Manchester hasn't seen anything like it since the Haçienda.",
    date: "2024-07-20",
    tags: ["Surgeon", "Manchester", "modular", "live"],
    type: 'memory'
  }
];

const typeLabels = {
  experience: { label: 'Experience', color: 'text-logo-green border-logo-green' },
  opinion: { label: 'Opinion', color: 'text-crimson border-crimson' },
  memory: { label: 'Memory', color: 'text-foreground border-foreground' }
};

const ArchivesPage = () => {
  const [stories] = useState<ArchiveStory[]>(sampleStories);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredStories = selectedType 
    ? stories.filter(s => s.type === selectedType)
    : stories;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Archives | Community Stories & Opinions"
        description="User-submitted experiences, opinions, and memories from the global techno community. Share your stories from the underground."
        path="/archives"
      />
      <Header />
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // Community archives
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              Archives
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-lg">
              Experiences, opinions, and memories from the scene. Real stories from the dancefloor, told by those who lived them.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="border-2 border-crimson/50 p-6 mb-8 bg-card/30 hover:border-crimson transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-crimson" />
                  Share Your Story
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  A night that changed you? An opinion on the scene? A memory worth preserving?
                </p>
              </div>
              <Link to="/submit">
                <Button 
                  variant="outline" 
                  className="font-mono text-xs uppercase tracking-wider border-crimson text-crimson hover:bg-crimson hover:text-background"
                >
                  Submit Story →
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedType(null)}
              className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                !selectedType 
                  ? 'border-foreground bg-foreground text-background' 
                  : 'border-border hover:border-foreground'
              }`}
            >
              All
            </button>
            {Object.entries(typeLabels).map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                  selectedType === key 
                    ? `${color} bg-current/10` 
                    : 'border-border hover:border-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Stories List */}
          <div className="space-y-6">
            {filteredStories.map((story) => (
              <article 
                key={story.id} 
                className="group border border-border p-6 hover:bg-card transition-colors cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${typeLabels[story.type].color}`}>
                        {typeLabels[story.type].label}
                      </span>
                    </div>
                    <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight group-hover:text-logo-green transition-colors">
                      {story.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground mt-2">
                      <span className="font-mono text-xs flex items-center gap-1">
                        <User className="w-3 h-3" />
                        @{story.author}
                      </span>
                      <span className="font-mono text-xs flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {story.location}
                      </span>
                      <span className="font-mono text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {story.date}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-4">
                  {story.excerpt}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {story.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="font-mono text-[10px] text-muted-foreground border border-border px-2 py-0.5 hover:text-foreground hover:border-foreground transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Read full story</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Count */}
          <div className="mt-8 font-mono text-[10px] text-muted-foreground">
            {filteredStories.length} {selectedType ? typeLabels[selectedType as keyof typeof typeLabels].label.toLowerCase() + 's' : 'stories'} in archive
          </div>

          {/* Cross links */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/news" 
                className="font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors"
              >
                ← Back to News
              </Link>
              <Link 
                to="/info" 
                className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Info Hub
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArchivesPage;
