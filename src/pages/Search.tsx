import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Music2, MapPin, Radio, Disc3, Users, Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageSEO from '@/components/PageSEO';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

// Import data sources
import { festivals } from '@/data/festivals';
import { venues } from '@/data/venues';
import { labels } from '@/data/labels';
import { gear } from '@/data/gear';

interface SearchResult {
  id: string;
  type: 'artist' | 'festival' | 'venue' | 'label' | 'gear' | 'crew';
  name: string;
  subtitle?: string;
  url: string;
  image?: string;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [artistResults, setArtistResults] = useState<SearchResult[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { trackSearch } = useGA4Analytics();

  // Static data search results
  const staticResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return { festivals: [], venues: [], labels: [], gear: [] };
    
    const q = query.toLowerCase();
    
    return {
      festivals: festivals
        .filter(f => f.name.toLowerCase().includes(q) || f.country.toLowerCase().includes(q))
        .slice(0, 10)
        .map(f => ({
          id: f.id,
          type: 'festival' as const,
          name: f.name,
          subtitle: `${f.country} • ${f.months?.join(', ') || 'TBA'}`,
          url: `/festivals/${f.id}`,
        })),
      venues: venues
        .filter(v => v.name.toLowerCase().includes(q) || v.city.toLowerCase().includes(q))
        .slice(0, 10)
        .map(v => ({
          id: v.id,
          type: 'venue' as const,
          name: v.name,
          subtitle: `${v.city}, ${v.country}`,
          url: `/venues/${v.id}`,
        })),
      labels: labels
        .filter(l => l.name.toLowerCase().includes(q) || (l.city && l.city.toLowerCase().includes(q)))
        .slice(0, 10)
        .map(l => ({
          id: l.id,
          type: 'label' as const,
          name: l.name,
          subtitle: l.city ? `${l.city}, ${l.country}` : l.country,
          url: `/labels/${l.id}`,
        })),
      gear: gear
        .filter(g => g.name.toLowerCase().includes(q) || g.manufacturer.toLowerCase().includes(q))
        .slice(0, 10)
        .map(g => ({
          id: g.id,
          type: 'gear' as const,
          name: g.name,
          subtitle: `${g.manufacturer} • ${g.category}`,
          url: `/gear/${g.id}`,
        })),
    };
  }, [query]);

  // Search artists via API
  const searchArtists = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setArtistResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-dj-artists', {
        body: { query: searchQuery, matchCount: 15, threshold: 0.3 }
      });

      if (error) throw error;

      const results: SearchResult[] = (data.results || []).map((artist: any) => ({
        id: String(artist.id),
        type: 'artist' as const,
        name: artist.artist_name,
        subtitle: artist.nationality || artist.known_for?.substring(0, 50),
        url: `/artists/${artist.id}`,
      }));

      setArtistResults(results);
    } catch (err) {
      console.error('Artist search error:', err);
      setArtistResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setSearchParams({ q: query });
    searchArtists(query);
    
    // Track search
    const totalResults = 
      artistResults.length + 
      staticResults.festivals.length + 
      staticResults.venues.length + 
      staticResults.labels.length + 
      staticResults.gear.length;
    
    trackSearch(query, 'global', totalResults);
  };

  // Search on initial load if query param exists
  useEffect(() => {
    if (initialQuery) {
      searchArtists(initialQuery);
    }
  }, []);

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Combine all results for "All" tab
  const allResults = useMemo(() => [
    ...artistResults,
    ...staticResults.festivals,
    ...staticResults.venues,
    ...staticResults.labels,
    ...staticResults.gear,
  ], [artistResults, staticResults]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'artist': return <Music2 className="w-4 h-4" />;
      case 'festival': return <Radio className="w-4 h-4" />;
      case 'venue': return <MapPin className="w-4 h-4" />;
      case 'label': return <Disc3 className="w-4 h-4" />;
      case 'gear': return <Package className="w-4 h-4" />;
      case 'crew': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'artist': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'festival': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'venue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'label': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'gear': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <Link 
      to={result.url}
      className="flex items-center gap-4 p-4 bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-card transition-all group"
    >
      <div className={`p-2 rounded border ${getTypeBadgeColor(result.type)}`}>
        {getTypeIcon(result.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-mono text-sm font-medium group-hover:text-primary transition-colors truncate">
          {result.name}
        </h3>
        {result.subtitle && (
          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
        )}
      </div>
      <Badge variant="outline" className={`text-[10px] uppercase ${getTypeBadgeColor(result.type)}`}>
        {result.type}
      </Badge>
    </Link>
  );

  const ResultsList = ({ results, emptyMessage }: { results: SearchResult[], emptyMessage: string }) => (
    <div className="space-y-2">
      {results.length > 0 ? (
        results.map(result => <ResultCard key={`${result.type}-${result.id}`} result={result} />)
      ) : (
        <div className="text-center py-12 text-muted-foreground font-mono text-sm">
          {query.length >= 2 ? emptyMessage : 'Type at least 2 characters to search'}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Search | techno.dog"
        description="Search the techno.dog database for artists, festivals, venues, labels, and gear."
        path="/search"
      />
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="max-w-2xl mx-auto mb-12">
            <h1 className="font-mono text-3xl uppercase tracking-tight text-center mb-6">
              Search
            </h1>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search artists, festivals, venues, labels, gear..."
                  className="pl-10 font-mono"
                  autoFocus
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching} variant="brutalist">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </div>
            {query && (
              <p className="text-xs text-muted-foreground mt-2 text-center font-mono">
                {allResults.length} results for "{query}"
              </p>
            )}
          </div>

          {/* Results Tabs */}
          <div className="max-w-4xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start mb-6 bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
                <TabsTrigger 
                  value="all" 
                  className="font-mono text-xs uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  All ({allResults.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="artists" 
                  className="font-mono text-xs uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Artists ({artistResults.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="festivals" 
                  className="font-mono text-xs uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Festivals ({staticResults.festivals.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="venues" 
                  className="font-mono text-xs uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Venues ({staticResults.venues.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="labels" 
                  className="font-mono text-xs uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Labels ({staticResults.labels.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="gear" 
                  className="font-mono text-xs uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  Gear ({staticResults.gear.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <ResultsList results={allResults} emptyMessage="No results found" />
              </TabsContent>
              <TabsContent value="artists">
                <ResultsList results={artistResults} emptyMessage="No artists found" />
              </TabsContent>
              <TabsContent value="festivals">
                <ResultsList results={staticResults.festivals} emptyMessage="No festivals found" />
              </TabsContent>
              <TabsContent value="venues">
                <ResultsList results={staticResults.venues} emptyMessage="No venues found" />
              </TabsContent>
              <TabsContent value="labels">
                <ResultsList results={staticResults.labels} emptyMessage="No labels found" />
              </TabsContent>
              <TabsContent value="gear">
                <ResultsList results={staticResults.gear} emptyMessage="No gear found" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
