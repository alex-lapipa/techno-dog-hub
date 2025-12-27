import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Play, CheckCircle, XCircle, Clock, Image, Upload, Users, Building, Calendar } from "lucide-react";
import { toast } from "sonner";

interface MediaAsset {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  source_url: string;
  storage_url: string | null;
  provider: string;
  license_status: string;
  copyright_risk: string;
  match_score: number;
  quality_score: number;
  final_selected: boolean;
  alt_text: string | null;
  reasoning_summary: string | null;
  openai_verified: boolean;
}

interface PipelineJob {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  status: string;
  attempts: number;
  error_log: string | null;
  created_at: string;
}

interface MissingEntity {
  id: string;
  name: string;
  type: 'artist' | 'venue' | 'festival';
}

const MediaAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bulkEnqueuing, setBulkEnqueuing] = useState(false);
  const [missingEntities, setMissingEntities] = useState<MissingEntity[]>([]);
  const [scanningMissing, setScanningMissing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, jobsRes] = await Promise.all([
        supabase.from('media_assets').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('media_pipeline_jobs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (assetsRes.data) setAssets(assetsRes.data);
      if (jobsRes.data) setJobs(jobsRes.data);

      // Calculate stats
      const assetStats = {
        total: assetsRes.data?.length || 0,
        selected: assetsRes.data?.filter(a => a.final_selected).length || 0,
        verified: assetsRes.data?.filter(a => a.openai_verified).length || 0,
      };
      const jobStats = {
        queued: jobsRes.data?.filter(j => j.status === 'queued').length || 0,
        running: jobsRes.data?.filter(j => j.status === 'running').length || 0,
        complete: jobsRes.data?.filter(j => j.status === 'complete').length || 0,
        failed: jobsRes.data?.filter(j => j.status === 'failed').length || 0,
      };
      setStats({ assets: assetStats, jobs: jobStats });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const processQueue = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('media-scheduler', {
        body: { action: 'process-queue', batchSize: 3 }
      });
      if (error) throw error;
      toast.success(`Processed ${data.processed} jobs`);
      fetchData();
    } catch (error) {
      toast.error('Failed to process queue');
    } finally {
      setProcessing(false);
    }
  };

  const scanForMissingImages = async () => {
    setScanningMissing(true);
    try {
      // Load all entity data
      const [artistsModule, venuesModule, festivalsModule] = await Promise.all([
        import('@/data/artists-legacy'),
        import('@/data/venues-legacy'),
        import('@/data/festivals-legacy'),
      ]);

      // Get existing assets and queued jobs
      const [assetsRes, jobsRes] = await Promise.all([
        supabase.from('media_assets').select('entity_type, entity_id').eq('final_selected', true),
        supabase.from('media_pipeline_jobs').select('entity_type, entity_id').in('status', ['queued', 'running']),
      ]);

      const existingAssets = new Set(
        (assetsRes.data || []).map(a => `${a.entity_type}:${a.entity_id}`)
      );
      const pendingJobs = new Set(
        (jobsRes.data || []).map(j => `${j.entity_type}:${j.entity_id}`)
      );

      const missing: MissingEntity[] = [];

      // Check artists
      for (const artist of artistsModule.artists) {
        const key = `artist:${artist.id}`;
        if (!existingAssets.has(key) && !pendingJobs.has(key) && !artist.image?.url) {
          missing.push({ id: artist.id, name: artist.name, type: 'artist' });
        }
      }

      // Check venues
      for (const venue of venuesModule.venues) {
        const key = `venue:${venue.id}`;
        if (!existingAssets.has(key) && !pendingJobs.has(key) && !venue.image?.url) {
          missing.push({ id: venue.id, name: venue.name, type: 'venue' });
        }
      }

      // Check festivals
      for (const festival of festivalsModule.festivals) {
        const key = `festival:${festival.id}`;
        if (!existingAssets.has(key) && !pendingJobs.has(key)) {
          missing.push({ id: festival.id, name: festival.name, type: 'festival' });
        }
      }

      setMissingEntities(missing);
      toast.success(`Found ${missing.length} entities without images`);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan for missing images');
    } finally {
      setScanningMissing(false);
    }
  };

  const bulkEnqueue = async (entityType?: 'artist' | 'venue' | 'festival') => {
    const toEnqueue = entityType 
      ? missingEntities.filter(e => e.type === entityType)
      : missingEntities;
    
    if (toEnqueue.length === 0) {
      toast.info('No entities to enqueue');
      return;
    }

    setBulkEnqueuing(true);
    let enqueued = 0;
    const batchSize = 10;

    try {
      for (let i = 0; i < toEnqueue.length; i += batchSize) {
        const batch = toEnqueue.slice(i, i + batchSize);
        const promises = batch.map(entity =>
          supabase.functions.invoke('media-curator', {
            body: { action: 'enqueue', entityType: entity.type, entityId: entity.id, entityName: entity.name }
          })
        );
        await Promise.all(promises);
        enqueued += batch.length;
        toast.info(`Enqueued ${enqueued}/${toEnqueue.length}...`);
      }
      toast.success(`Successfully enqueued ${enqueued} entities`);
      setMissingEntities(prev => prev.filter(e => !toEnqueue.includes(e)));
      fetchData();
    } catch (error) {
      console.error('Bulk enqueue error:', error);
      toast.error(`Enqueued ${enqueued} before error`);
    } finally {
      setBulkEnqueuing(false);
    }
  };

  const selectAsset = async (assetId: string) => {
    try {
      const { error } = await supabase.functions.invoke('media-api', {
        body: JSON.stringify({ assetId }),
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Asset selected');
      fetchData();
    } catch (error) {
      toast.error('Failed to select asset');
    }
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive',
    };
    return <Badge variant={variants[risk] || 'secondary'}>{risk}</Badge>;
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-background flex items-center justify-center">Access denied</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-mono font-bold">Media Curator</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={processQueue} disabled={processing}>
              <Play className="w-4 h-4 mr-2" />
              Process Queue
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Assets</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.assets.total}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Selected</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-500">{stats.assets.selected}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Jobs Queued</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-yellow-500">{stats.jobs.queued}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Jobs Failed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-500">{stats.jobs.failed}</div></CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="assets">
          <TabsList>
            <TabsTrigger value="assets"><Image className="w-4 h-4 mr-2" />Assets</TabsTrigger>
            <TabsTrigger value="jobs"><Clock className="w-4 h-4 mr-2" />Jobs</TabsTrigger>
            <TabsTrigger value="bulk"><Upload className="w-4 h-4 mr-2" />Bulk Enqueue</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-4">
            <div className="grid gap-4">
              {assets.map(asset => (
                <Card key={asset.id} className={asset.final_selected ? 'border-green-500/50' : ''}>
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {asset.source_url && <img src={asset.storage_url || asset.source_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{asset.entity_name}</span>
                        <Badge variant="outline">{asset.entity_type}</Badge>
                        {asset.final_selected && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="flex gap-2 text-sm text-muted-foreground mb-2">
                        <span>Match: {asset.match_score}%</span>
                        <span>Quality: {asset.quality_score}%</span>
                        {asset.copyright_risk && getRiskBadge(asset.copyright_risk)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{asset.reasoning_summary}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!asset.final_selected && (
                        <Button size="sm" variant="outline" onClick={() => selectAsset(asset.id)}>Select</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="mt-4">
            <div className="space-y-2">
              {jobs.map(job => (
                <Card key={job.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {job.status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {job.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                    {job.status === 'queued' && <Clock className="w-5 h-5 text-yellow-500" />}
                    {job.status === 'running' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                    <div className="flex-1">
                      <div className="font-medium">{job.entity_name}</div>
                      <div className="text-sm text-muted-foreground">{job.entity_type} • Attempts: {job.attempts}</div>
                    </div>
                    <Badge>{job.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="mt-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Bulk Enqueue Missing Images</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan all artists, venues, and festivals to find entities without images, then enqueue them for processing.
                </p>
                <div className="flex gap-2 mb-6">
                  <Button onClick={scanForMissingImages} disabled={scanningMissing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${scanningMissing ? 'animate-spin' : ''}`} />
                    Scan for Missing Images
                  </Button>
                </div>

                {missingEntities.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {missingEntities.filter(e => e.type === 'artist').length} Artists
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Building className="w-3 h-3" />
                        {missingEntities.filter(e => e.type === 'venue').length} Venues
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="w-3 h-3" />
                        {missingEntities.filter(e => e.type === 'festival').length} Festivals
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button onClick={() => bulkEnqueue()} disabled={bulkEnqueuing} size="sm">
                        {bulkEnqueuing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                        Enqueue All ({missingEntities.length})
                      </Button>
                      <Button onClick={() => bulkEnqueue('artist')} disabled={bulkEnqueuing} variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Artists Only
                      </Button>
                      <Button onClick={() => bulkEnqueue('venue')} disabled={bulkEnqueuing} variant="outline" size="sm">
                        <Building className="w-4 h-4 mr-2" />
                        Venues Only
                      </Button>
                      <Button onClick={() => bulkEnqueue('festival')} disabled={bulkEnqueuing} variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Festivals Only
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                        {missingEntities.slice(0, 100).map(entity => (
                          <div key={`${entity.type}-${entity.id}`} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                            {entity.type === 'artist' && <Users className="w-4 h-4 text-muted-foreground" />}
                            {entity.type === 'venue' && <Building className="w-4 h-4 text-muted-foreground" />}
                            {entity.type === 'festival' && <Calendar className="w-4 h-4 text-muted-foreground" />}
                            <span className="truncate">{entity.name}</span>
                          </div>
                        ))}
                        {missingEntities.length > 100 && (
                          <div className="p-2 text-sm text-muted-foreground">
                            ...and {missingEntities.length - 100} more
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default MediaAdmin;
