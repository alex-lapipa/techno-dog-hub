import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Image,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Percent
} from 'lucide-react';

const MediaMonitorAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch media pipeline jobs
      const { data: jobData } = await supabase
        .from('media_pipeline_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setJobs(jobData || []);

      // Calculate stats
      const pending = jobData?.filter(j => j.status === 'pending').length || 0;
      const completed = jobData?.filter(j => j.status === 'completed').length || 0;
      const failed = jobData?.filter(j => j.status === 'failed').length || 0;
      const processing = jobData?.filter(j => j.status === 'processing').length || 0;

      setStats({ pending, completed, failed, processing, total: jobData?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('media-monitor');
      if (error) throw error;
      
      toast({
        title: 'Media Monitor completed',
        description: data?.message || 'Pipeline status checked'
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

  const successRate = stats?.total ? Math.round((stats.completed / stats.total) * 100) : 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-logo-green" />;
      case 'failed': return <XCircle className="w-4 h-4 text-crimson" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <AdminPageLayout
      title="MEDIA MONITOR"
      description="Tracks media pipeline status and failed jobs"
      icon={Image}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      agentButtonText="Run Monitor"
      agentButtonColor="bg-logo-green hover:bg-logo-green/80"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AdminStatsCard
          label="Total Jobs"
          value={stats?.total || 0}
          icon={Image}
        />
        <AdminStatsCard
          label="Completed"
          value={stats?.completed || 0}
          icon={CheckCircle}
          iconColor="text-logo-green"
          className="border-logo-green/30"
        />
        <AdminStatsCard
          label="Processing"
          value={stats?.processing || 0}
          icon={Clock}
          iconColor="text-amber-500"
          className="border-amber-500/30"
        />
        <AdminStatsCard
          label="Failed"
          value={stats?.failed || 0}
          icon={XCircle}
          iconColor="text-crimson"
          className="border-crimson/30"
        />
        <AdminStatsCard
          label="Success Rate"
          value={`${successRate}%`}
          icon={Percent}
        />
      </div>

      {/* Progress */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pipeline Health</span>
            <span className="text-sm font-medium">{successRate}%</span>
          </div>
          <Progress value={successRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Image className="w-4 h-4 text-logo-green" />
            RECENT JOBS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No media jobs found</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{job.entity_name}</p>
                      <p className="text-xs text-muted-foreground">{job.entity_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      job.status === 'completed' ? 'default' : 
                      job.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
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

export default MediaMonitorAdmin;
