import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { RefreshCw, Play, Search, CheckCircle, AlertTriangle, Clock, FileText } from 'lucide-react';

export default function ArtistEnrichmentAdmin() {
  const queryClient = useQueryClient();
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['enrichment-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('artist-enrichment-orchestrator', {
        body: { action: 'dashboard' }
      });
      if (error) throw error;
      return data.dashboard;
    }
  });

  const { data: artists } = useQuery({
    queryKey: ['canonical-artists-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('canonical_artists')
        .select('artist_id, canonical_name, slug')
        .order('canonical_name')
        .limit(100);
      return data || [];
    }
  });

  const enrichMutation = useMutation({
    mutationFn: async (artistId: string) => {
      const { data, error } = await supabase.functions.invoke('artist-enrichment-orchestrator', {
        body: { action: 'enrich_artist', artist_id: artistId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Enrichment complete for ${data.artist_name}`);
      queryClient.invalidateQueries({ queryKey: ['enrichment-dashboard'] });
    },
    onError: (err: Error) => {
      toast.error(`Enrichment failed: ${err.message}`);
    }
  });

  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('artist-enrichment-orchestrator', {
        body: { action: 'process_queue', limit: 3 }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Processed ${data.processed} artists from queue`);
      queryClient.invalidateQueries({ queryKey: ['enrichment-dashboard'] });
    }
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400';
      case 'partially_verified': return 'bg-yellow-500/20 text-yellow-400';
      case 'disputed': return 'bg-red-500/20 text-red-400';
      case 'success': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'running': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <PageLayout title="Artist Enrichment Engine" subtitle="Firecrawl + AI Knowledge Expansion">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{dashboard?.claims?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
              <div className="mt-2 flex gap-1 flex-wrap">
                <Badge className={statusColor('verified')}>{dashboard?.claims?.by_status?.verified || 0} verified</Badge>
                <Badge className={statusColor('disputed')}>{dashboard?.claims?.by_status?.disputed || 0} disputed</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{dashboard?.documents?.raw || 0}</div>
              <div className="text-sm text-muted-foreground">Raw Documents</div>
              <div className="text-xs mt-1">{dashboard?.documents?.enriched || 0} enriched docs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{dashboard?.artists?.with_verified_claims || 0}</div>
              <div className="text-sm text-muted-foreground">Artists Enriched</div>
              <div className="text-xs mt-1">{dashboard?.artists?.needing_enrichment || 0} need enrichment</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{dashboard?.queue?.pending || 0}</div>
              <div className="text-sm text-muted-foreground">Queue Pending</div>
              <Button size="sm" className="mt-2" onClick={() => processQueueMutation.mutate()} disabled={processQueueMutation.isPending}>
                <Play className="w-3 h-3 mr-1" /> Process
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <Tabs defaultValue="enrich">
          <TabsList>
            <TabsTrigger value="enrich">Enrich Artist</TabsTrigger>
            <TabsTrigger value="runs">Recent Runs</TabsTrigger>
            <TabsTrigger value="sources">Top Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="enrich" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Run Enrichment</CardTitle></CardHeader>
              <CardContent>
                <select
                  className="w-full p-2 bg-background border rounded mb-4"
                  value={selectedArtist || ''}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                >
                  <option value="">Select an artist...</option>
                  {artists?.map((a: any) => (
                    <option key={a.artist_id} value={a.artist_id}>{a.canonical_name}</option>
                  ))}
                </select>
                <Button
                  onClick={() => selectedArtist && enrichMutation.mutate(selectedArtist)}
                  disabled={!selectedArtist || enrichMutation.isPending}
                >
                  {enrichMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  {enrichMutation.isPending ? 'Enriching...' : 'Start Full Enrichment'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will: Research (Firecrawl) → Extract (Claude) → Verify (GPT) → Synthesize (Gemini)
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runs">
            <Card>
              <CardHeader><CardTitle>Recent Enrichment Runs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboard?.recent_runs?.map((run: any) => (
                    <div key={run.run_id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div>
                        <div className="font-medium">{run.artist_name || run.artist_id}</div>
                        <div className="text-xs text-muted-foreground">
                          {run.started_at ? new Date(run.started_at).toLocaleString() : 'Not started'}
                        </div>
                      </div>
                      <Badge className={statusColor(run.status)}>{run.status}</Badge>
                    </div>
                  ))}
                  {!dashboard?.recent_runs?.length && <p className="text-muted-foreground">No runs yet</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources">
            <Card>
              <CardHeader><CardTitle>Top Source Domains</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboard?.top_sources?.map((s: any) => (
                    <div key={s.domain} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span>{s.domain}</span>
                      <Badge variant="outline">{s.count} docs</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
