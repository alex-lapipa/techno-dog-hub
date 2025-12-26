import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DJArtistSearch from '@/components/DJArtistSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Upload, Search, Database, Loader2 } from 'lucide-react';

const DJArtistsAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [artistCount, setArtistCount] = useState<number | null>(null);

  // Fetch current count on mount
  useState(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('dj_artists' as any)
        .select('*', { count: 'exact', head: true });
      setArtistCount(count);
    };
    fetchCount();
  });

  const handleUpload = async (clearExisting: boolean) => {
    if (!jsonInput.trim()) {
      toast.error('Please paste the JSON data');
      return;
    }

    let artists;
    try {
      artists = JSON.parse(jsonInput);
      if (!Array.isArray(artists)) {
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
        body: { artists, clearExisting }
      });

      if (error) throw error;

      setUploadResult(data);
      toast.success(`Uploaded ${data.uploaded} artists successfully`);
      
      // Refresh count
      const { count } = await supabase
        .from('dj_artists' as any)
        .select('*', { count: 'exact', head: true });
      setArtistCount(count);
      
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Upload failed');
      setUploadResult({ error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 lg:pt-16">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="max-w-md mx-auto text-center">
              <h1 className="font-mono text-2xl uppercase tracking-tight mb-4">Access Denied</h1>
              <p className="font-mono text-sm text-muted-foreground">
                You need admin privileges to access this page.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate('/admin')}>
                Go to Admin Login
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
              // Admin Panel
            </div>
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">
              DJ Artists RAG
            </h1>
            {artistCount !== null && (
              <div className="mt-2 font-mono text-sm text-muted-foreground">
                {artistCount} artists in database
              </div>
            )}
          </div>

          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="font-mono">
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DJArtistsAdmin;
