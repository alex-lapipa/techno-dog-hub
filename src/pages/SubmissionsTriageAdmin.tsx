import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Loader2,
  ArrowLeft,
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';

const SubmissionsTriageAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
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
      // Fetch submissions
      const { data: submissionData } = await supabase
        .from('community_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setSubmissions(submissionData || []);

      // Calculate stats
      const pending = submissionData?.filter(s => s.status === 'pending').length || 0;
      const approved = submissionData?.filter(s => s.status === 'approved').length || 0;
      const rejected = submissionData?.filter(s => s.status === 'rejected').length || 0;

      setStats({ pending, approved, rejected, total: submissionData?.length || 0 });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('submissions-triage');
      if (error) throw error;
      
      toast({
        title: 'Submissions Triage completed',
        description: data?.message || 'Submissions pre-screened'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-logo-green" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-crimson" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
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
                <FileCheck className="w-6 h-6 text-amber-500" />
                SUBMISSIONS TRIAGE
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Pre-screens community submissions for review
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runAgent} disabled={isRunning} size="sm" className="bg-amber-500 hover:bg-amber-600 text-black">
              {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Run Triage
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Total</p>
                <p className="text-3xl font-bold text-foreground">{stats?.total || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-amber-500/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Pending</p>
                <p className="text-3xl font-bold text-amber-500">{stats?.pending || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-logo-green/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Approved</p>
                <p className="text-3xl font-bold text-logo-green">{stats?.approved || 0}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/30">
            <CardContent className="pt-6">
              <div>
                <p className="text-xs text-muted-foreground font-mono uppercase">Rejected</p>
                <p className="text-3xl font-bold text-crimson">{stats?.rejected || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card className="bg-zinc-900 border-crimson/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              RECENT SUBMISSIONS
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/submissions')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No submissions found</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(sub.status)}
                      <div>
                        <p className="text-sm font-medium text-foreground">{sub.name || 'Unnamed submission'}</p>
                        <p className="text-xs text-muted-foreground">{sub.submission_type || sub.entity_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        sub.status === 'approved' ? 'default' : 
                        sub.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {sub.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString()}
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

export default SubmissionsTriageAdmin;
