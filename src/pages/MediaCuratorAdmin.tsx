import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Image,
  Camera,
  CheckCircle,
  XCircle,
  Clock,
  Play
} from 'lucide-react';

interface MediaJob {
  id: string;
  entity_type: string;
  entity_id: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

const MediaCuratorAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [mediaStats, setMediaStats] = useState({
    total: 0,
    withImages: 0,
    pending: 0,
    failed: 0
  });
  const [recentJobs, setRecentJobs] = useState<MediaJob[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch media assets count
      const { count: totalAssets } = await supabase
        .from('media_assets')
        .select('*', { count: 'exact', head: true });

      // Fetch artists with images
      const { data: artistsWithMedia } = await supabase
        .from('media_assets')
        .select('entity_id')
        .eq('entity_type', 'artist');

      const uniqueArtists = new Set(artistsWithMedia?.map(a => a.entity_id) || []);

      // Fetch recent agent reports for media jobs
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .eq('agent_name', 'media-curator')
        .order('created_at', { ascending: false })
        .limit(10);

      setMediaStats({
        total: totalAssets || 0,
        withImages: uniqueArtists.size,
        pending: reports?.filter(r => r.status === 'pending').length || 0,
        failed: reports?.filter(r => r.severity === 'error').length || 0
      });

      // Convert reports to job format
      const jobs: MediaJob[] = (reports || []).map(r => {
        const details = r.details as Record<string, any> | null;
        return {
          id: r.id,
          entity_type: details?.entity_type || 'unknown',
          entity_id: details?.entity_id || '',
          status: r.status,
          created_at: r.created_at,
          completed_at: r.reviewed_at || undefined
        };
      });
      setRecentJobs(jobs);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('media-curator');
      if (error) throw error;
      
      toast({
        title: 'Media Curator completed',
        description: data?.message || 'Pipeline run complete'
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Agent failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runPhotoPipeline = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('artist-photo-pipeline', {
        body: { action: 'process-batch', limit: 10 }
      });
      if (error) throw error;
      
      toast({
        title: 'Photo Pipeline completed',
        description: `Processed ${data?.processed || 0} artists`
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Pipeline failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-logo-green" />;
      case 'failed': return <XCircle className="w-4 h-4 text-crimson" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <AdminPageLayout
      title="Media Curator"
      description="Photo pipeline and image management"
      icon={Camera}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      runButtonText="Curate"
      actions={
        <Button 
          onClick={runPhotoPipeline} 
          disabled={isRunning}
          variant="outline" 
          size="sm" 
          className="font-mono text-xs uppercase"
        >
          <Play className="w-3.5 h-3.5 mr-1.5" />
          Photo Pipeline
        </Button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Assets"
          value={mediaStats.total}
          icon={Image}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Artists w/ Images"
          value={mediaStats.withImages}
          icon={Camera}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Pending Jobs"
          value={mediaStats.pending}
          icon={Clock}
          iconColor="text-amber-500"
        />
        <AdminStatsCard
          label="Failed Jobs"
          value={mediaStats.failed}
          icon={XCircle}
          iconColor="text-crimson"
        />
      </div>

      {/* Recent Jobs */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Camera className="w-4 h-4 text-logo-green" />
            RECENT MEDIA JOBS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent jobs. Run the curator to process media.
              </p>
            ) : (
              recentJobs.map((job) => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-mono text-sm">{job.entity_type}</p>
                      <p className="text-xs text-muted-foreground">{job.entity_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {job.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </AdminPageLayout>
  );
};

export default MediaCuratorAdmin;
