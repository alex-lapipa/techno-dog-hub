import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Users, Quote } from "lucide-react";
import { getCrewById, crews } from "@/data/crews";
import { PageLayout } from "@/components/layout";
import CuratedChannelVideos from "@/components/CuratedChannelVideos";

const CrewDetail = () => {
  const { id } = useParams<{ id: string }>();
  const crew = id ? getCrewById(id) : null;

  const typeLabels: Record<string, string> = {
    'sound system': 'Sound System',
    'collective': 'Collective',
    'party series': 'Party Series',
    'rave crew': 'Rave Crew'
  };

  if (!crew) {
    return (
      <PageLayout title="Crew Not Found" path={`/crews/${id}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="font-mono text-muted-foreground">Crew not found</p>
          <Link to="/crews" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
            ← Back to Crews
          </Link>
        </div>
      </PageLayout>
    );
  }

  const relatedCrews = crews
    .filter(c => c.id !== crew.id && (c.type === crew.type || c.country === crew.country))
    .slice(0, 4);

  const crewSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": crew.name,
    "description": crew.description || `${crew.name} - ${crew.type} from ${crew.city}, ${crew.country}`,
    "url": `https://techno.dog/crews/${crew.id}`,
    "location": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": crew.city, "addressCountry": crew.country } },
    ...(crew.founded && { "foundingDate": crew.founded.toString() }),
    "keywords": crew.tags.join(", ")
  };

  return (
    <PageLayout
      title={`${crew.name} - Techno ${typeLabels[crew.type] || crew.type}`}
      description={crew.description || `${crew.name} - ${crew.type} from ${crew.city}, ${crew.country}.`}
      path={`/crews/${crew.id}`}
      structuredData={crewSchema}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/crews" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Crews
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div className="aspect-square sm:aspect-[4/3] lg:aspect-square relative overflow-hidden border border-border bg-card/50 flex items-center justify-center">
              <div className="text-center p-6">
                <Users className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2">{crew.name}</h2>
                <p className="font-mono text-xs text-muted-foreground">{crew.city}, {crew.country}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {crew.tags.map(tag => (<span key={tag} className="font-mono text-[10px] sm:text-xs bg-background/90 border border-border px-1.5 sm:px-2 py-0.5 sm:py-1">{tag}</span>))}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">// {typeLabels[crew.type] || crew.type}</div>
                <h1 className="font-mono text-2xl sm:text-4xl lg:text-5xl xl:text-6xl uppercase tracking-tight mb-2 hover:animate-glitch break-words">{crew.name}</h1>
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-3 h-3 sm:w-4 sm:h-4" />{crew.city}, {crew.country}</div>
                {crew.founded && (<div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-3 h-3 sm:w-4 sm:h-4" />Est. {crew.founded}</div>)}
                <span className={`font-mono text-xs px-2 py-1 border ${crew.active ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'}`}>{crew.active ? 'Active' : 'Inactive'}</span>
              </div>
              {crew.description && <p className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground">{crew.description}</p>}
              {crew.ideology && (<div className="border-l-2 border-foreground pl-4 py-2"><Quote className="w-4 h-4 text-muted-foreground mb-2" /><p className="font-mono text-xs sm:text-sm italic text-muted-foreground">"{crew.ideology}"</p></div>)}
            </div>
          </div>

          {crew.soundSystem && (<section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8"><h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">Sound System</h2><div className="border border-border p-4 sm:p-6 bg-card/30"><p className="font-mono text-xs sm:text-sm text-muted-foreground">{crew.soundSystem}</p></div></section>)}

          {crew.members && crew.members.length > 0 && (<section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8"><h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3"><Users className="w-4 h-4 sm:w-5 sm:h-5" />Members</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">{crew.members.map((member, i) => (<div key={i} className="border border-border p-3 sm:p-4 hover:bg-card transition-colors"><span className="font-mono text-xs sm:text-sm">{member}</span></div>))}</div></section>)}

          {/* Curated Archive Videos */}
          <CuratedChannelVideos 
            pageType="crew" 
            entitySlug={crew.id} 
            title="From Our Archive"
          />

        {relatedCrews.length > 0 && (<section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8"><h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">Related Crews</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">{relatedCrews.map((c) => (<Link key={c.id} to={`/crews/${c.id}`} className="border border-border p-3 sm:p-4 hover:bg-card transition-colors group"><span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{typeLabels[c.type] || c.type}</span><h3 className="font-mono text-xs sm:text-sm uppercase group-hover:animate-glitch">{c.name}</h3><p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">{c.city}, {c.country}</p></Link>))}</div></section>)}
      </div>
    </PageLayout>
  );
};

export default CrewDetail;
