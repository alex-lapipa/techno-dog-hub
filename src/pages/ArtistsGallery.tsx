import { useState } from "react";
import { Link } from "react-router-dom";
import { Grid3X3, LayoutGrid, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import FilmFrame from "@/components/FilmFrame";
import { Button } from "@/components/ui/button";
import { useArtists } from "@/hooks/useData";

const ArtistsGallery = () => {
  const { data: allArtists = [], isLoading: loading } = useArtists();
  const [gridSize, setGridSize] = useState<'small' | 'large'>('large');

  // Filter to only artists with photos for the gallery
  const artists = allArtists.filter(a => a.photoUrl);

  const gridClasses = gridSize === 'small' 
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Artist Gallery - Techno Artists Film Strip"
        description="Visual gallery of techno artists in film strip aesthetic. Browse DJ photos with VHS-style effects."
        path="/artists/gallery"
      />
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Film Strip Header */}
        <div className="border-y border-crimson/30 bg-zinc-900/50 py-4 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link 
                  to="/artists" 
                  className="flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-crimson transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Artists
                </Link>
                
                <div className="hidden sm:flex items-center gap-2">
                  {/* Sprocket decoration */}
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-2 h-3 bg-zinc-800 rounded-sm border border-zinc-700" />
                  ))}
                </div>
              </div>

              <h1 className="font-mono text-lg md:text-xl uppercase tracking-[0.2em] text-crimson">
                Film Strip Gallery
              </h1>

              <div className="flex items-center gap-2">
                {/* Sprocket decoration */}
                <div className="hidden sm:flex items-center gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-2 h-3 bg-zinc-800 rounded-sm border border-zinc-700" />
                  ))}
                </div>

                {/* Grid toggle */}
                <div className="flex border border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGridSize('large')}
                    className={`rounded-none px-2 ${gridSize === 'large' ? 'bg-crimson/20 text-crimson' : ''}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setGridSize('small')}
                    className={`rounded-none px-2 ${gridSize === 'small' ? 'bg-crimson/20 text-crimson' : ''}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-6 font-mono text-xs text-muted-foreground">
            <span>{artists.length} FRAMES LOADED</span>
            <span className="text-crimson">REC ●</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className={`grid ${gridClasses} gap-4`}>
              {artists.map((artist, index) => (
                <Link
                  key={artist.id}
                  to={`/artists/${artist.id}`}
                  className="group block"
                >
                  <div className="relative">
                    <FilmFrame
                      src={artist.photoUrl!}
                      alt={artist.name}
                      frameNumber={String(index + 1).padStart(2, '0')}
                      aspectRatio="square"
                      size={gridSize === 'small' ? 'sm' : 'md'}
                      showSprockets={gridSize === 'large'}
                    />
                    
                    {/* Artist name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-mono text-sm uppercase tracking-wider text-foreground truncate">
                        {artist.name}
                      </h3>
                      <p className="font-mono text-[10px] text-crimson truncate">
                        {artist.city}, {artist.country}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Film strip footer decoration */}
          <div className="mt-12 flex items-center justify-center gap-2 opacity-40">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-3 h-4 bg-zinc-800 rounded-sm border border-zinc-700" />
            ))}
          </div>
          
          <div className="text-center mt-4 font-mono text-xs text-muted-foreground">
            END OF REEL
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArtistsGallery;
