import Header from "@/components/Header";
import Footer from "@/components/Footer";

const UserStories = () => {
  const stories = [
    {
      id: 1,
      author: "DJ_Underground_88",
      location: "Berlin, Germany",
      title: "My First Night at Tresor",
      excerpt: "The bass hit different at 4am. I remember walking down those stairs, not knowing what to expect...",
      date: "2024-11-15",
      tags: ["Tresor", "Berlin", "first-time"]
    },
    {
      id: 2,
      author: "AcidQueen_Tbilisi",
      location: "Tbilisi, Georgia",
      title: "Bassiani Changed Everything",
      excerpt: "Growing up in Georgia, techno wasn't just music—it was resistance. When Bassiani opened...",
      date: "2024-10-22",
      tags: ["Bassiani", "Tbilisi", "culture"]
    },
    {
      id: 3,
      author: "warehouse_rat",
      location: "Detroit, USA",
      title: "Movement Festival 2019",
      excerpt: "Standing in Hart Plaza, watching Jeff Mills play as the sun set over the Detroit River...",
      date: "2024-09-08",
      tags: ["Movement", "Detroit", "Jeff Mills"]
    },
    {
      id: 4,
      author: "synth_nomad",
      location: "Tokyo, Japan",
      title: "Lost in Womb",
      excerpt: "The attention to sound in Japanese clubs is unmatched. At Womb, every frequency was perfect...",
      date: "2024-08-30",
      tags: ["Womb", "Tokyo", "sound-system"]
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // Community
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              Your Stories
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              Real experiences from the dancefloor. The moments that matter, told by those who lived them.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="border border-border p-6 mb-8 bg-card/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-1">
                  Share Your Story
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  Have a moment that changed you? We want to hear it.
                </p>
              </div>
              <button className="font-mono text-xs uppercase tracking-wider border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                Submit →
              </button>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="space-y-6">
            {stories.map((story) => (
              <article 
                key={story.id} 
                className="border border-border p-6 hover:bg-card transition-colors group cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                      {story.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="font-mono text-xs">@{story.author}</span>
                      <span className="font-mono text-xs">•</span>
                      <span className="font-mono text-xs">{story.location}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {story.date}
                  </span>
                </div>
                
                <p className="font-mono text-sm text-muted-foreground mb-4 leading-relaxed">
                  {story.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {story.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {stories.length} stories shared
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserStories;