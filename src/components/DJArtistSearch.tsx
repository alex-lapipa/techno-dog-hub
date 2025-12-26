import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, User, Disc, MapPin } from 'lucide-react';

interface ArtistResult {
  id: number;
  rank: number;
  artist_name: string;
  real_name: string | null;
  nationality: string | null;
  years_active: string | null;
  subgenres: string[];
  labels: string[];
  top_tracks: string[];
  known_for: string | null;
  similarity: number;
}

interface DJArtistSearchProps {
  onSelectArtist?: (artist: ArtistResult) => void;
  className?: string;
}

const DJArtistSearch = ({ onSelectArtist, className = '' }: DJArtistSearchProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArtistResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('search-dj-artists', {
        body: { query, matchCount: 10, threshold: 0.3 }
      });

      if (fnError) throw fnError;

      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search artists by name, genre, label, track..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 font-mono"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Search'
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive font-mono">
          Error: {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Found {results.length} matching artists
          </div>
          
          {results.map((artist) => (
            <Card 
              key={artist.id} 
              className="hover:bg-card/80 transition-colors cursor-pointer"
              onClick={() => onSelectArtist?.(artist)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="font-mono text-lg uppercase">
                        {artist.artist_name}
                      </CardTitle>
                      {artist.real_name && (
                        <div className="text-sm text-muted-foreground">
                          {artist.real_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{artist.rank}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {(artist.similarity * 100).toFixed(0)}% match
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Location & Years */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {artist.nationality && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {artist.nationality}
                    </div>
                  )}
                  {artist.years_active && (
                    <div>Active: {artist.years_active}</div>
                  )}
                </div>

                {/* Subgenres */}
                {artist.subgenres?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artist.subgenres.map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Labels */}
                {artist.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {artist.labels.slice(0, 5).map((label) => (
                      <Badge key={label} variant="secondary" className="text-xs">
                        <Disc className="w-3 h-3 mr-1" />
                        {label}
                      </Badge>
                    ))}
                    {artist.labels.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{artist.labels.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Top Tracks */}
                {artist.top_tracks?.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Top tracks: </span>
                    {artist.top_tracks.slice(0, 3).join(' • ')}
                    {artist.top_tracks.length > 3 && ` (+${artist.top_tracks.length - 3} more)`}
                  </div>
                )}

                {/* Known For */}
                {artist.known_for && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {artist.known_for}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isSearching && query && results.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground font-mono text-sm">
          No artists found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default DJArtistSearch;
