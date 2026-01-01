import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Megaphone, Play, X, Youtube, Users, Award, Target, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { supabase } from "@/integrations/supabase/client";

interface CuratedVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  description?: string;
}

const ProperMarketing = () => {
  const [videos, setVideos] = useState<CuratedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // Fetch videos from F Communications / Motive channel
        const { data, error } = await supabase.functions.invoke('youtube-search', {
          body: { 
            artistName: 'F Communications Motive BBH',
            channelId: 'fcommunications'
          }
        });

        if (error) {
          console.warn('YouTube search error:', error);
          setLoading(false);
          return;
        }

        if (data?.videos && Array.isArray(data.videos)) {
          setVideos(data.videos.slice(0, 8));
        }
      } catch (err) {
        console.warn('Failed to fetch videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Motive Communications (BBH London)",
    "description": "Strategic communications agency specializing in electronic music and underground culture",
    "url": "https://techno.dog/scenes/proper-marketing",
    "parentOrganization": {
      "@type": "Organization",
      "name": "BBH (Bartle Bogle Hegarty)"
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Proper Marketing"
        description="BBH / Motive Communications - London agency connecting brands with electronic music culture."
        path="/scenes/proper-marketing"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="pt-16 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              to="/labels" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Scenes
            </Link>
          </div>

          {/* Hero Section */}
          <div className="mb-12 space-y-6">
            <div className="font-mono text-[10px] sm:text-xs text-crimson uppercase tracking-[0.3em]">
              // Industry Partners
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border border-border bg-card flex items-center justify-center">
                <Megaphone className="w-8 h-8 sm:w-10 sm:h-10 text-crimson" />
              </div>
              <div>
                <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight">
                  Proper Marketing
                </h1>
                <p className="font-mono text-sm sm:text-base text-muted-foreground mt-2">
                  BBH / Motive Communications
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-crimson/20 text-crimson border border-crimson/30">
                London
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-logo-green/20 text-logo-green border border-logo-green/30">
                Strategic Communications
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-foreground/10 text-foreground border border-border">
                Electronic Music
              </span>
            </div>
          </div>

          {/* About Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-crimson" />
                  About Motive
                </h2>
                <div className="font-mono text-sm text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Motive Communications</strong> is a specialist division of 
                    <strong className="text-foreground"> BBH (Bartle Bogle Hegarty)</strong>, one of the world's most 
                    influential creative agencies headquartered in London.
                  </p>
                  <p>
                    Motive focuses on strategic communications that bridge the gap between global brands and 
                    underground culture—particularly in electronic music, nightlife, and youth movements.
                  </p>
                  <p>
                    Their approach is rooted in authenticity: working directly with artists, promoters, and 
                    cultural institutions rather than simply appropriating aesthetic elements.
                  </p>
                </div>
              </div>

              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-logo-green" />
                  Philosophy
                </h2>
                <ul className="font-mono text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-logo-green mt-1">▸</span>
                    <span>Cultural credibility over commercial exploitation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-logo-green mt-1">▸</span>
                    <span>Long-term artist partnerships, not one-off sponsorships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-logo-green mt-1">▸</span>
                    <span>Community-first brand integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-logo-green mt-1">▸</span>
                    <span>Respect for underground values and spaces</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-crimson" />
                  BBH Legacy
                </h2>
                <div className="font-mono text-sm text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Founded in 1982 by John Bartle, Nigel Bogle, and John Hegarty, BBH has consistently pushed 
                    boundaries in advertising and brand strategy. Their famous black sheep logo represents 
                    their ethos: "When the world zigs, zag."
                  </p>
                  <p>
                    Notable campaigns include work for Levi's, Audi, Axe/Lynx, and Mentos. The agency has won 
                    numerous Cannes Lions and D&AD awards.
                  </p>
                </div>
              </div>

              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-logo-green" />
                  Why It Matters
                </h2>
                <div className="font-mono text-sm text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    For the techno community, agencies like Motive represent a potential bridge—when done 
                    correctly—between commercial interests and cultural preservation.
                  </p>
                  <p>
                    The key is ensuring that brand involvement supports rather than dilutes the scene: 
                    funding events, supporting emerging artists, and respecting the ethos of the underground.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Showcase */}
          <div className="border border-border p-6 bg-card/30 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-mono text-lg uppercase tracking-wide flex items-center gap-2">
                <Youtube className="w-5 h-5 text-crimson" />
                Video Showcase
              </h2>
              <a 
                href="https://www.youtube.com/@fcommunications"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-muted-foreground hover:text-logo-green transition-colors flex items-center gap-1"
              >
                @fcommunications
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Video Player */}
            {selectedVideo && (
              <div className="mb-6 relative">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute -top-2 -right-2 z-10 p-1 bg-background border border-border hover:border-crimson transition-colors"
                  aria-label="Close video"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="aspect-video bg-black border border-border">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="mt-2 font-mono text-sm text-foreground">
                  {selectedVideo.title}
                </div>
              </div>
            )}

            {/* Video Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="font-mono text-xs text-muted-foreground animate-pulse">
                  Loading videos...
                </div>
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group text-left border border-border hover:border-logo-green transition-all overflow-hidden"
                  >
                    <div className="aspect-video relative overflow-hidden bg-card">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Youtube className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="font-mono text-[10px] text-muted-foreground line-clamp-2">
                        {video.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Youtube className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-mono text-xs text-muted-foreground">
                  Videos from @fcommunications channel
                </p>
                <a 
                  href="https://www.youtube.com/@fcommunications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 font-mono text-xs text-logo-green hover:underline"
                >
                  Visit Channel
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.bartleboglehegarty.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 border border-border hover:border-logo-green hover:text-logo-green transition-colors"
            >
              BBH Website
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.youtube.com/@fcommunications"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider px-4 py-2 border border-crimson/50 text-crimson hover:bg-crimson/10 transition-colors"
            >
              <Youtube className="w-3 h-3" />
              YouTube Channel
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProperMarketing;
