import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Heart, Play, X, Youtube, Users, Sparkles, Globe, HandHeart } from "lucide-react";
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

// Curated videos about legendary advertising, John Hegarty, Levi's, and music in advertising
const CURATED_PROPER_MARKETING_VIDEOS = [
  {
    id: "GjZt1kH2f_k",
    title: "John Hegarty - The Art of Advertising Documentary",
    thumbnail: "https://i.ytimg.com/vi/GjZt1kH2f_k/hqdefault.jpg",
    description: "The legendary creative director on what makes advertising art."
  },
  {
    id: "qp0HIF3SfI4",
    title: "Flat Beat - Mr Oizo & Levi's - When Music Became the Message",
    thumbnail: "https://i.ytimg.com/vi/qp0HIF3SfI4/hqdefault.jpg",
    description: "The iconic yellow puppet that changed how brands used electronic music."
  },
  {
    id: "XmVruRF9_6w",
    title: "Levi's Advertising History - Engineered Jeans & Music Culture",
    thumbnail: "https://i.ytimg.com/vi/XmVruRF9_6w/hqdefault.jpg",
    description: "How Levi's used underground music to build cultural credibility."
  },
  {
    id: "9qPx4UmGGhQ",
    title: "Spaceman - Babylon Zoo & The Power of Music in Advertising",
    thumbnail: "https://i.ytimg.com/vi/9qPx4UmGGhQ/hqdefault.jpg",
    description: "When a 30-second ad changed music history."
  },
  {
    id: "RxMhOaTmJ4Q",
    title: "Bombastic - Shaggy & The Art of Surprise in Marketing",
    thumbnail: "https://i.ytimg.com/vi/RxMhOaTmJ4Q/hqdefault.jpg",
    description: "Breaking expectations through unexpected musical choices."
  },
  {
    id: "6sFP7UmGGhE",
    title: "The Golden Age of Music in Advertising",
    thumbnail: "https://i.ytimg.com/vi/6sFP7UmGGhE/hqdefault.jpg",
    description: "How the right track transforms a commercial into culture."
  }
];

// Search queries for proper marketing documentaries - long-form content (40+ min)
const PROPER_MARKETING_SEARCH_QUERIES = [
  "John Hegarty advertising documentary",
  "Levi's advertising history documentary",
  "Levi's engineered jeans campaign",
  "music in advertising documentary",
  "Flat Beat Mr Oizo Levi's full documentary",
  "creative advertising documentary music",
  "BBH advertising history",
  "iconic TV commercials music documentary"
];

const ProperMarketing = () => {
  const [videos, setVideos] = useState<CuratedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const allFetchedVideos: CuratedVideo[] = [];
      const seenIds = new Set<string>();

      try {
        // Fetch videos for each search query related to proper marketing
        const searchPromises = PROPER_MARKETING_SEARCH_QUERIES.slice(0, 4).map(query =>
          supabase.functions.invoke('youtube-search', {
            body: { 
              artistName: query,
              minDuration: 40, // 40+ minutes for documentary-length content
              forceRefresh: false
            }
          })
        );

        const results = await Promise.all(searchPromises);

        for (const { data, error } of results) {
          if (!error && data?.videos && Array.isArray(data.videos)) {
            for (const video of data.videos) {
              if (!seenIds.has(video.id)) {
                seenIds.add(video.id);
                allFetchedVideos.push(video);
              }
            }
          }
        }

        if (allFetchedVideos.length > 0) {
          setVideos(allFetchedVideos.slice(0, 12));
        } else {
          // Fall back to curated videos
          setVideos(CURATED_PROPER_MARKETING_VIDEOS);
        }
      } catch (err) {
        console.warn('Using curated video collection:', err);
        setVideos(CURATED_PROPER_MARKETING_VIDEOS);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Proper Marketing - Brands Who Care",
    "description": "Exploring brands that contribute to communities through authentic partnerships and cultural investment",
    "url": "https://techno.dog/scenes/proper-marketing"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Proper Marketing - Brands Who Care"
        description="Brands that contribute to communities. Cultural credibility over commercial exploitation. Authentic partnerships that support artists and scenes."
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
              // Philosophy
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border border-border bg-card flex items-center justify-center">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-crimson" />
              </div>
              <div>
                <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight">
                  Proper Marketing
                </h1>
                <p className="font-mono text-sm sm:text-base text-muted-foreground mt-2">
                  Brands Who Care. Brands Who Contribute.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-crimson/20 text-crimson border border-crimson/30">
                Community First
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-logo-green/20 text-logo-green border border-logo-green/30">
                Authentic Partnerships
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 bg-foreground/10 text-foreground border border-border">
                Culture Over Commerce
              </span>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <HandHeart className="w-4 h-4 text-crimson" />
                  The Philosophy
                </h2>
                <div className="font-mono text-sm text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Proper marketing</strong> isn't about selling. 
                    It's about <strong className="text-foreground">contributing</strong>. When brands invest in 
                    communities—genuinely, without strings—they become part of the culture rather than 
                    parasites feeding on it.
                  </p>
                  <p>
                    The best partnerships in music history weren't sponsorships. They were collaborations 
                    that launched careers, funded education, created jobs, and gave platforms to artists 
                    who would otherwise remain unheard.
                  </p>
                  <p>
                    This is about brands that choose to <strong className="text-foreground">give back</strong> rather 
                    than just take. Brands that understand culture isn't a resource to be extracted—it's an 
                    ecosystem to be nurtured.
                  </p>
                </div>
              </div>

              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-logo-green" />
                  Core Principles
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
                  <li className="flex items-start gap-2">
                    <span className="text-logo-green mt-1">▸</span>
                    <span>Profit through principles, not extraction</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border border-border p-6 bg-card/30">
                <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-crimson" />
                  A Culture of Belonging
                </h2>
                <div className="font-mono text-sm text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    The most meaningful brand partnerships understand that 
                    <strong className="text-foreground"> culture sits within people, not walls</strong>. 
                    They invest in building spaces—physical and digital—where communities can connect and thrive.
                  </p>
                  <p>
                    This means funding music education programs. Supporting emerging artists with resources, 
                    not just exposure. Creating worker wellbeing initiatives that empower everyone in the 
                    supply chain.
                  </p>
                  <p>
                    It means recognizing that the human need to <strong className="text-foreground">belong</strong> is 
                    fundamental, and that brands can choose to satisfy that need authentically—or exploit it.
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
                    For the music community, proper marketing represents a potential bridge—when done 
                    correctly—between commercial interests and cultural preservation.
                  </p>
                  <p>
                    The key is ensuring that brand involvement <strong className="text-foreground">supports</strong> rather 
                    than dilutes the scene: funding events, supporting emerging artists, providing resources 
                    for education, and respecting the ethos of the underground.
                  </p>
                  <p>
                    <strong className="text-foreground">When the world zigs, zag.</strong> Choose art over 
                    advertising. Choose culture over clicks. Choose to contribute.
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
                Culture in Action
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                Brands that got it right
              </span>
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                      <p className="font-mono text-[10px] text-foreground line-clamp-2">
                        {video.title}
                      </p>
                      {video.description && (
                        <p className="font-mono text-[9px] text-muted-foreground mt-1 line-clamp-1">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-mono text-xs text-muted-foreground">
                  Curated examples of brands that contribute to communities
                </p>
              </div>
            )}
          </div>

          {/* Quote Section */}
          <div className="border-l-4 border-logo-green pl-6 py-4 mb-8">
            <p className="font-mono text-lg text-foreground italic">
              "Choose art over advertising. Choose culture over clicks. Choose to contribute."
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              — The philosophy of proper marketing
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProperMarketing;
