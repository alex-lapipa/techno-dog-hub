import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Disc, MapPin, Calendar, Users, Music, Globe, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getLabelById } from "@/data/labels";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LabelData {
  id: string;
  slug: string;
  label_name: string;
  headquarters_city: string;
  headquarters_country: string;
  founded_year: number;
  is_active: boolean;
  description: string;
  bio_short: string;
  bio_long: string;
  philosophy: string;
  known_for: string;
  founders: string[];
  key_artists: string[];
  key_releases: any[];
  subgenres: string[];
  tags: string[];
  label_website_url: string;
  discogs_url: string;
  bandcamp_url: string;
  soundcloud_url: string;
  instagram_url: string;
  logo_url: string;
  image_url: string;
  enrichment_score: number;
}

const LabelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [label, setLabel] = useState<LabelData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLabel = async () => {
      setIsLoading(true);
      
      // Try to fetch from database first
      const { data: dbLabel } = await supabase
        .from('labels')
        .select('*')
        .eq('slug', id)
        .single();

      if (dbLabel) {
        setLabel(dbLabel as LabelData);
      } else {
        // Fall back to static data
        const staticLabel = getLabelById(id || '');
        if (staticLabel) {
          setLabel({
            id: staticLabel.id,
            slug: staticLabel.id,
            label_name: staticLabel.name,
            headquarters_city: staticLabel.city,
            headquarters_country: staticLabel.country,
            founded_year: staticLabel.founded,
            is_active: staticLabel.active,
            description: staticLabel.description || '',
            bio_short: '',
            bio_long: '',
            philosophy: '',
            known_for: '',
            founders: staticLabel.founders || [],
            key_artists: staticLabel.artists || [],
            key_releases: staticLabel.keyReleases?.map(r => ({ title: r })) || [],
            subgenres: [],
            tags: staticLabel.tags || [],
            label_website_url: '',
            discogs_url: '',
            bandcamp_url: '',
            soundcloud_url: '',
            instagram_url: '',
            logo_url: '',
            image_url: '',
            enrichment_score: 0,
          } as LabelData);
        }
      }
      
      setIsLoading(false);
    };

    if (id) {
      fetchLabel();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-16 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-12 w-96 mb-8" />
            <div className="grid gap-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!label) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-16 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-mono text-2xl mb-4">Label not found</h1>
            <Link to="/labels" className="text-primary hover:underline">
              ← Back to Labels
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const labelSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": label.label_name,
    "description": label.bio_short || label.description,
    "foundingDate": label.founded_year?.toString(),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": label.headquarters_city,
      "addressCountry": label.headquarters_country
    },
    "url": label.label_website_url || undefined
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={`${label.label_name} - Techno Record Label`}
        description={label.bio_short || label.description || `${label.label_name} - ${label.headquarters_city}, ${label.headquarters_country}`}
        path={`/labels/${label.slug}`}
        structuredData={labelSchema}
      />
      <Header />
      
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link 
            to="/labels" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Labels
          </Link>

          {/* Header section */}
          <div className="mb-12 border-b border-border pb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mb-2">
                  // Record Label
                </div>
                <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight mb-4">
                  {label.label_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 font-mono text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {label.headquarters_city}, {label.headquarters_country}
                  </span>
                  {label.founded_year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Est. {label.founded_year}
                    </span>
                  )}
                  <Badge variant={label.is_active ? "default" : "secondary"}>
                    {label.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {label.enrichment_score > 0 && (
                <div className="font-mono text-xs text-muted-foreground">
                  Data completeness: {label.enrichment_score}%
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              {(label.bio_long || label.description) && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h2 className="font-mono text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Disc className="w-4 h-4" />
                      About
                    </h2>
                    <div className="font-mono text-sm text-muted-foreground leading-relaxed space-y-4">
                      {label.bio_long ? (
                        label.bio_long.split('\n').map((p, i) => <p key={i}>{p}</p>)
                      ) : (
                        <p>{label.description}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Philosophy */}
              {label.philosophy && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h2 className="font-mono text-sm uppercase tracking-wide mb-4">Philosophy</h2>
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                      {label.philosophy}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Known For */}
              {label.known_for && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h2 className="font-mono text-sm uppercase tracking-wide mb-4">Known For</h2>
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                      {label.known_for}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Key Releases */}
              {label.key_releases && label.key_releases.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h2 className="font-mono text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Key Releases
                    </h2>
                    <div className="space-y-2">
                      {label.key_releases.map((release: any, i: number) => (
                        <div key={i} className="font-mono text-sm text-muted-foreground">
                          {typeof release === 'string' ? release : `${release.artist} - ${release.title}${release.year ? ` (${release.year})` : ''}`}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Founders */}
              {label.founders && label.founders.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h3 className="font-mono text-xs uppercase tracking-wide mb-3 text-muted-foreground">
                      Founders
                    </h3>
                    <div className="space-y-1">
                      {label.founders.map((founder, i) => (
                        <p key={i} className="font-mono text-sm">{founder}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Artists */}
              {label.key_artists && label.key_artists.length > 0 && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h3 className="font-mono text-xs uppercase tracking-wide mb-3 text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Roster
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {label.key_artists.map((artist, i) => (
                        <Badge key={i} variant="outline" className="font-mono text-xs">
                          {artist}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subgenres / Tags */}
              {((label.subgenres && label.subgenres.length > 0) || (label.tags && label.tags.length > 0)) && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h3 className="font-mono text-xs uppercase tracking-wide mb-3 text-muted-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Sound
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(label.subgenres || label.tags || []).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="font-mono text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Links */}
              {(label.label_website_url || label.discogs_url || label.bandcamp_url || label.soundcloud_url || label.instagram_url) && (
                <Card className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <h3 className="font-mono text-xs uppercase tracking-wide mb-3 text-muted-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Links
                    </h3>
                    <div className="space-y-2">
                      {label.label_website_url && (
                        <a 
                          href={label.label_website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Official Website
                        </a>
                      )}
                      {label.discogs_url && (
                        <a 
                          href={label.discogs_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Discogs
                        </a>
                      )}
                      {label.bandcamp_url && (
                        <a 
                          href={label.bandcamp_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Bandcamp
                        </a>
                      )}
                      {label.soundcloud_url && (
                        <a 
                          href={label.soundcloud_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          SoundCloud
                        </a>
                      )}
                      {label.instagram_url && (
                        <a 
                          href={label.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LabelDetail;
