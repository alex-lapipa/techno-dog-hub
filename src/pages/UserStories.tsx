import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const UserStories = () => {
  const { language } = useLanguage();

  const stories = [
    {
      id: 1,
      author: "DJ_Underground_88",
      location: { en: "Berlin, Germany", es: "Berlín, Alemania" },
      title: { en: "My First Night at Tresor", es: "Mi Primera Noche en Tresor" },
      excerpt: { 
        en: "The bass hit different at 4am. I remember walking down those stairs, not knowing what to expect...", 
        es: "El bajo golpeaba diferente a las 4am. Recuerdo bajar esas escaleras, sin saber qué esperar..." 
      },
      date: "2024-11-15",
      tags: ["Tresor", "Berlin", "first-time"]
    },
    {
      id: 2,
      author: "AcidQueen_Tbilisi",
      location: { en: "Tbilisi, Georgia", es: "Tiflis, Georgia" },
      title: { en: "Bassiani Changed Everything", es: "Bassiani Lo Cambió Todo" },
      excerpt: { 
        en: "Growing up in Georgia, techno wasn't just music—it was resistance. When Bassiani opened...", 
        es: "Creciendo en Georgia, el techno no era solo música—era resistencia. Cuando Bassiani abrió..." 
      },
      date: "2024-10-22",
      tags: ["Bassiani", "Tbilisi", "culture"]
    },
    {
      id: 3,
      author: "warehouse_rat",
      location: { en: "Detroit, USA", es: "Detroit, EE.UU." },
      title: { en: "Movement Festival 2019", es: "Movement Festival 2019" },
      excerpt: { 
        en: "Standing in Hart Plaza, watching Jeff Mills play as the sun set over the Detroit River...", 
        es: "De pie en Hart Plaza, viendo a Jeff Mills tocar mientras el sol se ponía sobre el río Detroit..." 
      },
      date: "2024-09-08",
      tags: ["Movement", "Detroit", "Jeff Mills"]
    },
    {
      id: 4,
      author: "synth_nomad",
      location: { en: "Tokyo, Japan", es: "Tokio, Japón" },
      title: { en: "Lost in Womb", es: "Perdido en Womb" },
      excerpt: { 
        en: "The attention to sound in Japanese clubs is unmatched. At Womb, every frequency was perfect...", 
        es: "La atención al sonido en los clubs japoneses es inigualable. En Womb, cada frecuencia era perfecta..." 
      },
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
              // {language === 'en' ? 'Community' : 'Comunidad'}
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Your Stories' : 'Tus Historias'}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'Real experiences from the dancefloor. The moments that matter, told by those who lived them.' 
                : 'Experiencias reales desde la pista. Los momentos que importan, contados por quienes los vivieron.'}
            </p>
          </div>

          {/* Submit CTA */}
          <div className="border border-border p-6 mb-8 bg-card/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wider mb-1">
                  {language === 'en' ? 'Share Your Story' : 'Comparte Tu Historia'}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">
                  {language === 'en' 
                    ? 'Have a moment that changed you? We want to hear it.' 
                    : '¿Tienes un momento que te cambió? Queremos escucharlo.'}
                </p>
              </div>
              <button className="font-mono text-xs uppercase tracking-wider border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors">
                {language === 'en' ? 'Submit →' : 'Enviar →'}
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
                      {story.title[language]}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span className="font-mono text-xs">@{story.author}</span>
                      <span className="font-mono text-xs">•</span>
                      <span className="font-mono text-xs">{story.location[language]}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground shrink-0">
                    {story.date}
                  </span>
                </div>
                
                <p className="font-mono text-sm text-muted-foreground mb-4 leading-relaxed">
                  {story.excerpt[language]}
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
            {stories.length} {language === 'en' ? 'stories shared' : 'historias compartidas'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserStories;