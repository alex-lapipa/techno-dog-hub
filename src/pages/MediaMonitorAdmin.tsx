import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Loader2,
  ArrowLeft,
  Image,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const MediaMonitorAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                <Image className="w-6 h-6 text-logo-green" />
                MEDIA MONITOR
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Tracks media pipeline status and failed jobs
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runAgent} disabled={isRunning} size="sm" className="bg-logo-green hover:bg-logo-green/80">
              {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Run Monitor
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Total Jobs</p>
                <p className="text-3xl font-bold text-foreground">{stats?.total || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-logo-green/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Completed</p>
                <p className="text-3xl font-bold text-logo-green">{stats?.completed || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-amber-500/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Processing</p>
                <p className="text-3xl font-bold text-amber-500">{stats?.processing || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Failed</p>
                <p className="text-3xl font-bold text-crimson">{stats?.failed || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Success Rate</p>
                <p className="text-3xl font-bold text-foreground">{successRate}%</p>
              </div>
            </CardContent>
          </Card>
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
      </div>
    </div>
  );
};

export default MediaMonitorAdmin;
