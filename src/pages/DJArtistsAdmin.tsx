import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import DJArtistSearch from '@/components/DJArtistSearch';
import DJArtistCharts from '@/components/admin/DJArtistCharts';
import DJArtistTable from '@/components/admin/DJArtistTable';
import ArtistDatabaseManager from '@/components/admin/ArtistDatabaseManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Search, Database, Loader2, Users, BarChart3, List, Brain } from 'lucide-react';

interface DJArtist {
  id: number;
  artist_name: string;
  nationality: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
  rank: number;
  known_for: string | null;
  real_name: string | null;
  years_active: string | null;
}

const DJArtistsAdmin = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [artists, setArtists] = useState<DJArtist[]>([]);
  const [artistCount, setArtistCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    const { data, count, error } = await supabase
      .from('dj_artists')
      .select('*', { count: 'exact' })
      .order('rank', { ascending: true });
    
    if (!error && data) {
      setArtists(data as unknown as DJArtist[]);
      setArtistCount(count);
    }
    setLoading(false);
  };

  const handleUpload = async (clearExisting: boolean) => {
    if (!jsonInput.trim()) {
      toast.error('Please paste the JSON data');
      return;
    }

    let artistsData;
    try {
      artistsData = JSON.parse(jsonInput);
      if (!Array.isArray(artistsData)) {
        throw new Error('JSON must be an array');
      }
    } catch (err) {
      toast.error('Invalid JSON format');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('upload-dj-artists', {
        body: { artists: artistsData, clearExisting }
      });

      if (error) throw error;

      setUploadResult(data);
      toast.success(`Uploaded ${data.uploaded} artists successfully`);
      fetchArtists();
      
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed');
      setUploadResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminPageLayout
      title="DJ Artists RAG"
      description={artistCount !== null ? `${artistCount} artists in database` : 'Vector database for artist search'}
      icon={Users}
      iconColor="text-purple-500"
      onRefresh={fetchArtists}
      isLoading={loading}
    >
      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList className="font-mono flex-wrap">
          <TabsTrigger value="agents" className="gap-2">
            <Brain className="w-4 h-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="visualize" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Visualize
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Database className="w-4 h-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Agents Tab - Artist Database Manager */}
        <TabsContent value="agents">
          <ArtistDatabaseManager />
        </TabsContent>

        {/* Visualize Tab */}
        <TabsContent value="visualize">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DJArtistCharts artists={artists} />
          )}
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DJArtistTable artists={artists} />
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono uppercase">
                Vector Search
              </CardTitle>
              <CardDescription>
                Search artists using semantic similarity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DJArtistSearch 
                onSelectArtist={(artist) => {
                  toast.info(`Selected: ${artist.artist_name}`);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono uppercase">
                Upload Artists
              </CardTitle>
              <CardDescription>
                Paste JSON array of artists to upload with embeddings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder='[{"rank": 1, "artist_name": "Jeff Mills", ...}]'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleUpload(false)} 
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Artists
                    </>
                  )}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleUpload(true)} 
                  disabled={isUploading}
                >
                  Replace All
                </Button>
              </div>

              {uploadResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <pre className="font-mono text-xs overflow-auto">
                      {JSON.stringify(uploadResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono uppercase">
                Database Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-border rounded">
                  <div className="font-mono text-2xl">{artistCount ?? '—'}</div>
                  <div className="text-sm text-muted-foreground">Total Artists</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="font-mono text-2xl">1536</div>
                  <div className="text-sm text-muted-foreground">Embedding Dims</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="font-mono text-2xl">ada-002</div>
                  <div className="text-sm text-muted-foreground">Model</div>
                </div>
                <div className="p-4 border border-border rounded">
                  <div className="font-mono text-2xl">IVFFlat</div>
                  <div className="text-sm text-muted-foreground">Index Type</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default DJArtistsAdmin;
