import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const newsItems = [
  {
    id: "bassiani-anniversary",
    category: { en: "SCENE", es: "ESCENA" },
    title: { en: "Bassiani Celebrates 10 Years of Resistance", es: "Bassiani Celebra 10 Años de Resistencia" },
    excerpt: { en: "The Tbilisi institution marks a decade of cultural revolution beneath the stadium.", es: "La institución de Tbilisi marca una década de revolución cultural bajo el estadio." },
    date: "2024-12-01",
    readTime: "8 min",
    featured: true
  },
  {
    id: "surgeon-live",
    category: { en: "INTERVIEW", es: "ENTREVISTA" },
    title: { en: "Surgeon: 30 Years of Birmingham Techno", es: "Surgeon: 30 Años de Techno de Birmingham" },
    excerpt: { en: "Anthony Child on three decades of modular exploration and the evolution of British techno.", es: "Anthony Child sobre tres décadas de exploración modular y la evolución del techno británico." },
    date: "2024-11-28",
    readTime: "15 min",
    featured: true
  },
  {
    id: "tresor-berlin",
    category: { en: "VENUE", es: "CLUB" },
    title: { en: "Tresor: The Vault That Changed Everything", es: "Tresor: La Bóveda que lo Cambió Todo" },
    excerpt: { en: "How a department store vault became the bridge between Detroit and Berlin.", es: "Cómo una bóveda de unos almacenes se convirtió en el puente entre Detroit y Berlín." },
    date: "2024-11-25",
    readTime: "12 min",
    featured: false
  },
  {
    id: "polegroup-madrid",
    category: { en: "LABEL", es: "SELLO" },
    title: { en: "PoleGroup: Madrid's Hypnotic Collective", es: "PoleGroup: El Colectivo Hipnótico de Madrid" },
    excerpt: { en: "Oscar Mulero's label continues to define Spanish techno.", es: "El sello de Oscar Mulero sigue definiendo el techno español." },
    date: "2024-11-20",
    readTime: "10 min",
    featured: false
  },
  {
    id: "fold-london",
    category: { en: "VENUE", es: "CLUB" },
    title: { en: "Fold: 24 Hours in the Dark", es: "Fold: 24 Horas en la Oscuridad" },
    excerpt: { en: "Inside East London's marathon warehouse sessions.", es: "Dentro de las sesiones maratón del almacén del este de Londres." },
    date: "2024-11-15",
    readTime: "7 min",
    featured: false
  },
  {
    id: "detroit-movement",
    category: { en: "FESTIVAL", es: "FESTIVAL" },
    title: { en: "Movement Detroit: Back to the Source", es: "Movement Detroit: Volver al Origen" },
    excerpt: { en: "The annual pilgrimage to Hart Plaza and the birthplace of techno.", es: "La peregrinación anual a Hart Plaza y el lugar de nacimiento del techno." },
    date: "2024-11-10",
    readTime: "9 min",
    featured: false
  }
];

const NewsPage = () => {
  const { language } = useLanguage();
  const featured = newsItems.filter(n => n.featured);
  const regular = newsItems.filter(n => !n.featured);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // {language === 'en' ? 'Latest transmissions' : 'Últimas transmisiones'}
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'News' : 'Noticias'}
            </h1>
          </div>

          {/* Featured */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {featured.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group block border border-border p-6 md:p-8 hover:bg-card transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-foreground border border-foreground px-2 py-1 group-hover:animate-glitch">
                    {item.category[language]}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.readTime}
                  </span>
                </div>
                <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-4 group-hover:animate-glitch">
                  {item.title[language]}
                </h2>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">
                  {item.excerpt[language]}
                </p>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'Read' : 'Leer'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Regular news */}
          <div className="border-t border-border">
            {regular.map((item, index) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group flex items-start justify-between gap-4 border-b border-border py-6 hover:bg-card transition-colors px-4 -mx-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                      {item.category[language]}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                  <h3 className="font-mono text-lg md:text-xl uppercase tracking-tight group-hover:animate-glitch">
                    {item.title[language]}
                  </h3>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all mt-2" />
              </Link>
            ))}
          </div>

          {/* Cross-links */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: { en: 'Festivals →', es: 'Festivales →' }, path: '/festivals' },
              { label: { en: 'Artists →', es: 'Artistas →' }, path: '/artists' },
              { label: { en: 'Releases →', es: 'Lanzamientos →' }, path: '/releases' },
              { label: { en: 'Mad Stuff →', es: 'Locuras →' }, path: '/mad' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block border border-border p-4 font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-card hover:animate-glitch transition-colors text-center"
              >
                {link.label[language]}
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
