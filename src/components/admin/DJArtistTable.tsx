import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

interface DJArtist {
  id: number;
  artist_name: string;
  nationality: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
  rank: number;
  known_for: string | null;
}

interface DJArtistTableProps {
  artists: DJArtist[];
}

type SortKey = 'rank' | 'artist_name' | 'nationality';
type SortDir = 'asc' | 'desc';

export const DJArtistTable = ({ artists }: DJArtistTableProps) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredArtists = useMemo(() => {
    let filtered = artists;
    
    if (search) {
      const lower = search.toLowerCase();
      filtered = artists.filter(a =>
        a.artist_name.toLowerCase().includes(lower) ||
        a.nationality?.toLowerCase().includes(lower) ||
        a.subgenres?.some(s => s.toLowerCase().includes(lower)) ||
        a.labels?.some(l => l.toLowerCase().includes(lower))
      );
    }
    
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'rank') {
        cmp = a.rank - b.rank;
      } else if (sortKey === 'artist_name') {
        cmp = a.artist_name.localeCompare(b.artist_name);
      } else if (sortKey === 'nationality') {
        cmp = (a.nationality || '').localeCompare(b.nationality || '');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [artists, search, sortKey, sortDir]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === 'asc' 
      ? <ChevronUp className="w-3 h-3 inline ml-1" />
      : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm uppercase tracking-wider">
            All Artists ({filteredArtists.length})
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 font-mono text-xs h-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 bg-card border-b border-border">
              <tr>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('rank')}
                >
                  #<SortIcon column="rank" />
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('artist_name')}
                >
                  Artist<SortIcon column="artist_name" />
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('nationality')}
                >
                  Origin<SortIcon column="nationality" />
                </th>
                <th className="text-left p-2">Subgenres</th>
                <th className="text-left p-2">Labels</th>
              </tr>
            </thead>
            <tbody>
              {filteredArtists.map((artist) => (
                <tr 
                  key={artist.id} 
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-2 text-muted-foreground">{artist.rank}</td>
                  <td className="p-2 font-medium">{artist.artist_name}</td>
                  <td className="p-2 text-muted-foreground">
                    {artist.nationality?.split(/[,(]/)[0].trim() || '—'}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(artist.subgenres || []).slice(0, 2).map((sg, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className="text-[10px] px-1 py-0"
                        >
                          {sg}
                        </Badge>
                      ))}
                      {(artist.subgenres || []).length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          +{(artist.subgenres?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-2 text-muted-foreground text-[10px] max-w-[150px] truncate">
                    {(artist.labels || []).slice(0, 2).map(l => 
                      l.replace(/\s*\(.*?\)\s*/g, '').trim()
                    ).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DJArtistTable;
