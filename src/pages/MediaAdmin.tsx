import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/hooks/useActivityLog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  RefreshCw, Play, CheckCircle, XCircle, Clock, Image, Upload, Users, Building, Calendar,
  Search, Link, Trash2, Eye, Download, ExternalLink, ImagePlus, Filter, SortAsc, Grid, List
} from "lucide-react";
import { toast } from "sonner";

interface MediaAsset {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  source_url: string;
  storage_url: string | null;
  storage_path: string | null;
  provider: string;
  license_status: string;
  copyright_risk: string;
  match_score: number;
  quality_score: number;
  final_selected: boolean;
  alt_text: string | null;
  reasoning_summary: string | null;
  openai_verified: boolean;
  created_at: string;
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
  const { logActivity } = useActivityLog();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [bulkEnqueuing, setBulkEnqueuing] = useState(false);
  const [missingEntities, setMissingEntities] = useState<MissingEntity[]>([]);
  const [scanningMissing, setScanningMissing] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  
  // URL Fetch state
  const [fetchUrl, setFetchUrl] = useState("");
  const [fetchEntityType, setFetchEntityType] = useState<string>("artist");
  const [fetchEntityId, setFetchEntityId] = useState("");
  const [fetchEntityName, setFetchEntityName] = useState("");
  const [fetching, setFetching] = useState(false);
  
  // Manual add dialog
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    entityType: "artist",
    entityId: "",
    entityName: "",
    sourceUrl: "",
    altText: "",
    provider: "manual",
    licenseStatus: "unknown",
    copyrightRisk: "medium"
  });
  const [addingManual, setAddingManual] = useState(false);

  // Asset detail view
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let assetsQuery = supabase.from('media_assets').select('*');
      
      // Apply filters
      if (filterType !== "all") {
        assetsQuery = assetsQuery.eq('entity_type', filterType);
      }
      if (filterStatus === "selected") {
        assetsQuery = assetsQuery.eq('final_selected', true);
      } else if (filterStatus === "verified") {
        assetsQuery = assetsQuery.eq('openai_verified', true);
      } else if (filterStatus === "unverified") {
        assetsQuery = assetsQuery.eq('openai_verified', false);
      }
      if (searchQuery) {
        assetsQuery = assetsQuery.ilike('entity_name', `%${searchQuery}%`);
      }
      
      assetsQuery = assetsQuery.order(sortBy, { ascending: false }).limit(200);
      
      const [assetsRes, jobsRes] = await Promise.all([
        assetsQuery,
        supabase.from('media_pipeline_jobs').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (assetsRes.data) setAssets(assetsRes.data);
      if (jobsRes.data) setJobs(jobsRes.data);

      // Calculate stats
      const allAssetsRes = await supabase.from('media_assets').select('id, final_selected, openai_verified, entity_type');
      const assetData = allAssetsRes.data || [];
      
      const assetStats = {
        total: assetData.length,
        selected: assetData.filter(a => a.final_selected).length,
        verified: assetData.filter(a => a.openai_verified).length,
        byType: {
          artist: assetData.filter(a => a.entity_type === 'artist').length,
          venue: assetData.filter(a => a.entity_type === 'venue').length,
          festival: assetData.filter(a => a.entity_type === 'festival').length,
        }
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
      toast.error('Failed to fetch media data');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, searchQuery, sortBy]);

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, fetchData]);

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
      const [artistsModule, venuesModule, festivalsModule] = await Promise.all([
        import('@/data/artists-legacy'),
        import('@/data/venues-legacy'),
        import('@/data/festivals-legacy'),
      ]);

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

      for (const artist of artistsModule.artists) {
        const key = `artist:${artist.id}`;
        if (!existingAssets.has(key) && !pendingJobs.has(key) && !artist.image?.url) {
          missing.push({ id: artist.id, name: artist.name, type: 'artist' });
        }
      }

      for (const venue of venuesModule.venues) {
        const key = `venue:${venue.id}`;
        if (!existingAssets.has(key) && !pendingJobs.has(key) && !venue.image?.url) {
          missing.push({ id: venue.id, name: venue.name, type: 'venue' });
        }
      }

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

  const selectAsset = async (asset: MediaAsset) => {
    try {
      // Deselect other assets for this entity
      await supabase
        .from('media_assets')
        .update({ final_selected: false })
        .eq('entity_type', asset.entity_type)
        .eq('entity_id', asset.entity_id);
      
      // Select this asset
      await supabase
        .from('media_assets')
        .update({ final_selected: true })
        .eq('id', asset.id);
        
      toast.success('Asset selected');
      
      // Log the selection
      logActivity({
        action_type: "media_asset_selected",
        entity_type: asset.entity_type,
        entity_id: asset.entity_id,
        details: {
          asset_id: asset.id,
          entity_name: asset.entity_name,
          source_url: asset.source_url,
        },
      });
      
      fetchData();
    } catch (error) {
      toast.error('Failed to select asset');
    }
  };

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Delete this asset permanently?')) return;
    
    // Find the asset before deleting for logging
    const assetToDelete = assets.find(a => a.id === assetId);
    
    try {
      const { error } = await supabase.from('media_assets').delete().eq('id', assetId);
      if (error) throw error;
      toast.success('Asset deleted');
      
      // Log the deletion
      if (assetToDelete) {
        logActivity({
          action_type: "media_asset_deleted",
          entity_type: assetToDelete.entity_type,
          entity_id: assetToDelete.entity_id,
          details: {
            asset_id: assetId,
            entity_name: assetToDelete.entity_name,
          },
        });
      }
      
      fetchData();
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const fetchFromUrl = async () => {
    if (!fetchUrl || !fetchEntityId || !fetchEntityName) {
      toast.error('Please fill all required fields');
      return;
    }
    setFetching(true);
    try {
      const { data, error } = await supabase.from('media_assets').insert({
        entity_type: fetchEntityType,
        entity_id: fetchEntityId,
        entity_name: fetchEntityName,
        source_url: fetchUrl,
        provider: 'url_fetch',
        license_status: 'unknown',
        copyright_risk: 'medium',
        match_score: 80,
        quality_score: 70,
        final_selected: false,
        openai_verified: false
      }).select().single();
      
      if (error) throw error;
      toast.success('Image added from URL');
      setFetchUrl("");
      setFetchEntityId("");
      setFetchEntityName("");
      fetchData();
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to add image from URL');
    } finally {
      setFetching(false);
    }
  };

  const addManualAsset = async () => {
    if (!manualForm.entityId || !manualForm.entityName || !manualForm.sourceUrl) {
      toast.error('Please fill required fields');
      return;
    }
    setAddingManual(true);
    try {
      const { error } = await supabase.from('media_assets').insert({
        entity_type: manualForm.entityType,
        entity_id: manualForm.entityId,
        entity_name: manualForm.entityName,
        source_url: manualForm.sourceUrl,
        alt_text: manualForm.altText || null,
        provider: manualForm.provider,
        license_status: manualForm.licenseStatus,
        copyright_risk: manualForm.copyrightRisk,
        match_score: 90,
        quality_score: 85,
        final_selected: false,
        openai_verified: false
      });
      
      if (error) throw error;
      toast.success('Asset added successfully');
      
      // Log the manual addition
      logActivity({
        action_type: "media_asset_added",
        entity_type: manualForm.entityType,
        entity_id: manualForm.entityId,
        details: {
          entity_name: manualForm.entityName,
          source_url: manualForm.sourceUrl,
          provider: manualForm.provider,
        },
      });
      
      setManualDialogOpen(false);
      setManualForm({
        entityType: "artist",
        entityId: "",
        entityName: "",
        sourceUrl: "",
        altText: "",
        provider: "manual",
        licenseStatus: "unknown",
        copyrightRisk: "medium"
      });
      fetchData();
    } catch (error) {
      console.error('Add error:', error);
      toast.error('Failed to add asset');
    } finally {
      setAddingManual(false);
    }
  };

  const triggerVerification = async (asset: MediaAsset) => {
    try {
      const { error } = await supabase.functions.invoke('media-verify', {
        body: { 
          entityType: asset.entity_type,
          entityId: asset.entity_id,
          entityName: asset.entity_name,
          assetId: asset.id
        }
      });
      if (error) throw error;
      toast.success('Verification triggered');
      fetchData();
    } catch (error) {
      toast.error('Failed to trigger verification');
    }
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'default',
      medium: 'secondary', 
      high: 'destructive',
      unknown: 'outline'
    };
    return <Badge variant={variants[risk] || 'outline'}>{risk}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      complete: 'text-green-500',
      failed: 'text-red-500',
      queued: 'text-yellow-500',
      running: 'text-blue-500'
    };
    return <Badge variant="outline" className={colors[status]}>{status}</Badge>;
  };

  const navigate = useNavigate();
  
  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!isAdmin) { navigate("/admin"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-mono font-bold">Media Curator</h1>
            <p className="text-muted-foreground text-sm mt-1">Retrieve, manage, and curate photos for all entities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchData()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={processQueue} disabled={processing}>
              <Play className="w-4 h-4 mr-2" />
              Process Queue
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Assets</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{stats.assets.total}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Selected</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-500">{stats.assets.selected}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Artists</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-crimson">{stats.assets.byType?.artist || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Venues</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-purple-500">{stats.assets.byType?.venue || 0}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Queued</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-yellow-500">{stats.jobs.queued}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Failed</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-500">{stats.jobs.failed}</div></CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="assets">
          <TabsList className="mb-4">
            <TabsTrigger value="assets"><Image className="w-4 h-4 mr-2" />Assets</TabsTrigger>
            <TabsTrigger value="retrieve"><Search className="w-4 h-4 mr-2" />Retrieve</TabsTrigger>
            <TabsTrigger value="jobs"><Clock className="w-4 h-4 mr-2" />Jobs</TabsTrigger>
            <TabsTrigger value="bulk"><Upload className="w-4 h-4 mr-2" />Bulk Enqueue</TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-4">
            {/* Search & Filter Bar */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-xs">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by entity name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Type</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="artist">Artists</SelectItem>
                        <SelectItem value="venue">Venues</SelectItem>
                        <SelectItem value="festival">Festivals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="selected">Selected</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="unverified">Unverified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-36">
                    <Label className="text-xs">Sort</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Added</SelectItem>
                        <SelectItem value="match_score">Match Score</SelectItem>
                        <SelectItem value="quality_score">Quality</SelectItem>
                        <SelectItem value="entity_name">Name</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1">
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                      <List className="w-4 h-4" />
                    </Button>
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                      <Grid className="w-4 h-4" />
                    </Button>
                  </div>
                  <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><ImagePlus className="w-4 h-4 mr-2" />Add Manual</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Photo Manually</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Entity Type</Label>
                            <Select value={manualForm.entityType} onValueChange={(v) => setManualForm({...manualForm, entityType: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="artist">Artist</SelectItem>
                                <SelectItem value="venue">Venue</SelectItem>
                                <SelectItem value="festival">Festival</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Entity ID</Label>
                            <Input value={manualForm.entityId} onChange={(e) => setManualForm({...manualForm, entityId: e.target.value})} placeholder="e.g., surgeon" />
                          </div>
                        </div>
                        <div>
                          <Label>Entity Name</Label>
                          <Input value={manualForm.entityName} onChange={(e) => setManualForm({...manualForm, entityName: e.target.value})} placeholder="e.g., Surgeon" />
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input value={manualForm.sourceUrl} onChange={(e) => setManualForm({...manualForm, sourceUrl: e.target.value})} placeholder="https://..." />
                        </div>
                        <div>
                          <Label>Alt Text</Label>
                          <Input value={manualForm.altText} onChange={(e) => setManualForm({...manualForm, altText: e.target.value})} placeholder="Description for accessibility" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>License Status</Label>
                            <Select value={manualForm.licenseStatus} onValueChange={(v) => setManualForm({...manualForm, licenseStatus: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cc0">CC0 Public Domain</SelectItem>
                                <SelectItem value="cc-by">CC-BY</SelectItem>
                                <SelectItem value="cc-by-sa">CC-BY-SA</SelectItem>
                                <SelectItem value="fair_use">Fair Use</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Copyright Risk</Label>
                            <Select value={manualForm.copyrightRisk} onValueChange={(v) => setManualForm({...manualForm, copyrightRisk: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setManualDialogOpen(false)}>Cancel</Button>
                        <Button onClick={addManualAsset} disabled={addingManual}>
                          {addingManual ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                          Add Asset
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Assets Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {assets.map(asset => (
                  <Card 
                    key={asset.id} 
                    className={`cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${asset.final_selected ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => { setSelectedAsset(asset); setDetailDialogOpen(true); }}
                  >
                    <div className="aspect-square relative overflow-hidden rounded-t-md">
                      {asset.source_url ? (
                        <img src={asset.storage_url || asset.source_url} alt={asset.entity_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {asset.final_selected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <p className="text-xs font-medium truncate">{asset.entity_name}</p>
                      <p className="text-xs text-muted-foreground">{asset.entity_type}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map(asset => (
                  <Card key={asset.id} className={asset.final_selected ? 'border-green-500/50' : ''}>
                    <CardContent className="p-4 flex gap-4">
                      <div 
                        className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted cursor-pointer hover:opacity-80"
                        onClick={() => { setSelectedAsset(asset); setDetailDialogOpen(true); }}
                      >
                        {asset.source_url ? (
                          <img src={asset.storage_url || asset.source_url} alt={asset.alt_text || `${asset.entity_name} media asset`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Image className="w-6 h-6 text-muted-foreground" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{asset.entity_name}</span>
                          <Badge variant="outline">{asset.entity_type}</Badge>
                          {asset.final_selected && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {asset.openai_verified && <Badge variant="secondary" className="text-xs">AI Verified</Badge>}
                        </div>
                        <div className="flex gap-2 text-sm text-muted-foreground mb-1">
                          <span>Match: {asset.match_score}%</span>
                          <span>Quality: {asset.quality_score}%</span>
                          {asset.copyright_risk && getRiskBadge(asset.copyright_risk)}
                          <Badge variant="outline" className="text-xs">{asset.provider || 'unknown'}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{asset.reasoning_summary || asset.alt_text || 'No description'}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!asset.final_selected && (
                          <Button size="sm" variant="outline" onClick={() => selectAsset(asset)}>
                            <CheckCircle className="w-3 h-3 mr-1" />Select
                          </Button>
                        )}
                        {!asset.openai_verified && (
                          <Button size="sm" variant="ghost" onClick={() => triggerVerification(asset)}>
                            <Eye className="w-3 h-3 mr-1" />Verify
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteAsset(asset.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Retrieve Tab - Photo Retrieval Tools */}
          <TabsContent value="retrieve" className="mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* URL Fetch */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Link className="w-5 h-5" />Fetch from URL</CardTitle>
                  <CardDescription>Add an image directly from a URL</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Image URL</Label>
                    <Input value={fetchUrl} onChange={(e) => setFetchUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Entity Type</Label>
                      <Select value={fetchEntityType} onValueChange={setFetchEntityType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="artist">Artist</SelectItem>
                          <SelectItem value="venue">Venue</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Entity ID</Label>
                      <Input value={fetchEntityId} onChange={(e) => setFetchEntityId(e.target.value)} placeholder="e.g., surgeon" />
                    </div>
                  </div>
                  <div>
                    <Label>Entity Name</Label>
                    <Input value={fetchEntityName} onChange={(e) => setFetchEntityName(e.target.value)} placeholder="e.g., Surgeon" />
                  </div>
                  <Button onClick={fetchFromUrl} disabled={fetching} className="w-full">
                    {fetching ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    Fetch & Add
                  </Button>
                </CardContent>
              </Card>

              {/* Auto-Retrieve */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5" />Auto-Retrieve</CardTitle>
                  <CardDescription>Queue entity for automatic image search</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Entity Type</Label>
                      <Select value={fetchEntityType} onValueChange={setFetchEntityType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="artist">Artist</SelectItem>
                          <SelectItem value="venue">Venue</SelectItem>
                          <SelectItem value="festival">Festival</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Entity ID</Label>
                      <Input value={fetchEntityId} onChange={(e) => setFetchEntityId(e.target.value)} placeholder="e.g., surgeon" />
                    </div>
                  </div>
                  <div>
                    <Label>Entity Name</Label>
                    <Input value={fetchEntityName} onChange={(e) => setFetchEntityName(e.target.value)} placeholder="e.g., Surgeon" />
                  </div>
                  <Button 
                    onClick={async () => {
                      if (!fetchEntityId || !fetchEntityName) {
                        toast.error('Fill entity ID and name');
                        return;
                      }
                      try {
                        await supabase.functions.invoke('media-curator', {
                          body: { action: 'enqueue', entityType: fetchEntityType, entityId: fetchEntityId, entityName: fetchEntityName }
                        });
                        toast.success('Queued for auto-retrieval');
                        fetchData();
                      } catch (e) {
                        toast.error('Failed to queue');
                      }
                    }} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Queue for Auto-Search
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Queue from existing entities */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Enqueue from Catalog</CardTitle>
                <CardDescription>Search your existing entities and queue them for image retrieval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Search artists, venues, festivals..." className="flex-1" />
                  <Button variant="outline"><Search className="w-4 h-4" /></Button>
                </div>
                <p className="text-sm text-muted-foreground">Use the Bulk Enqueue tab to scan all entities for missing images.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="mt-4">
            <div className="flex gap-2 mb-4">
              <Button onClick={processQueue} disabled={processing}>
                <Play className="w-4 h-4 mr-2" />Process Next Batch
              </Button>
              <Button variant="outline" onClick={async () => {
                try {
                  await supabase.functions.invoke('media-scheduler', { body: { action: 'cleanup-failed' }});
                  toast.success('Reset failed jobs');
                  fetchData();
                } catch { toast.error('Failed'); }
              }}>
                <RefreshCw className="w-4 h-4 mr-2" />Reset Failed
              </Button>
              <Button variant="outline" onClick={async () => {
                try {
                  await supabase.functions.invoke('media-scheduler', { body: { action: 'cleanup-stale' }});
                  toast.success('Reset stale jobs');
                  fetchData();
                } catch { toast.error('Failed'); }
              }}>
                <Clock className="w-4 h-4 mr-2" />Reset Stale
              </Button>
            </div>
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
                      <div className="text-sm text-muted-foreground">
                        {job.entity_type} • Attempts: {job.attempts}
                        {job.error_log && <span className="text-red-400 ml-2">• {job.error_log.slice(0, 50)}...</span>}
                      </div>
                    </div>
                    {getStatusBadge(job.status)}
                  </CardContent>
                </Card>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">No jobs in queue</div>
              )}
            </div>
          </TabsContent>

          {/* Bulk Enqueue Tab */}
          <TabsContent value="bulk" className="mt-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Bulk Enqueue Missing Images</CardTitle>
                <CardDescription>Scan all artists, venues, and festivals to find entities without images</CardDescription>
              </CardHeader>
              <CardContent>
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
                        <Users className="w-4 h-4 mr-2" />Artists Only
                      </Button>
                      <Button onClick={() => bulkEnqueue('venue')} disabled={bulkEnqueuing} variant="outline" size="sm">
                        <Building className="w-4 h-4 mr-2" />Venues Only
                      </Button>
                      <Button onClick={() => bulkEnqueue('festival')} disabled={bulkEnqueuing} variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />Festivals Only
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

        {/* Asset Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedAsset && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedAsset.entity_name}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {selectedAsset.source_url && (
                      <img 
                        src={selectedAsset.storage_url || selectedAsset.source_url} 
                        alt={selectedAsset.entity_name} 
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Badge>{selectedAsset.entity_type}</Badge>
                      {selectedAsset.final_selected && <Badge variant="default">Selected</Badge>}
                      {selectedAsset.openai_verified && <Badge variant="secondary">AI Verified</Badge>}
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Entity ID:</span> {selectedAsset.entity_id}</p>
                      <p><span className="text-muted-foreground">Provider:</span> {selectedAsset.provider || 'Unknown'}</p>
                      <p><span className="text-muted-foreground">Match Score:</span> {selectedAsset.match_score}%</p>
                      <p><span className="text-muted-foreground">Quality:</span> {selectedAsset.quality_score}%</p>
                      <p><span className="text-muted-foreground">License:</span> {selectedAsset.license_status}</p>
                      <p><span className="text-muted-foreground">Copyright Risk:</span> {selectedAsset.copyright_risk}</p>
                    </div>
                    {selectedAsset.reasoning_summary && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">AI Analysis:</p>
                        <p className="text-sm">{selectedAsset.reasoning_summary}</p>
                      </div>
                    )}
                    {selectedAsset.alt_text && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Alt Text:</p>
                        <p className="text-sm">{selectedAsset.alt_text}</p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  {selectedAsset.source_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedAsset.source_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />Source
                      </a>
                    </Button>
                  )}
                  {!selectedAsset.final_selected && (
                    <Button size="sm" onClick={() => { selectAsset(selectedAsset); setDetailDialogOpen(false); }}>
                      <CheckCircle className="w-4 h-4 mr-2" />Select as Primary
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => { deleteAsset(selectedAsset.id); setDetailDialogOpen(false); }}>
                    <Trash2 className="w-4 h-4 mr-2" />Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default MediaAdmin;
