import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  List
} from 'lucide-react';

const SubmissionsTriageAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-logo-green" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-crimson" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <AdminPageLayout
      title="Submissions Triage"
      description="Pre-screen community submissions"
      icon={FileCheck}
      iconColor="text-amber-500"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      runButtonText="Triage"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total"
          value={stats?.total || 0}
          icon={List}
        />
        <AdminStatsCard
          label="Pending"
          value={stats?.pending || 0}
          icon={Clock}
          iconColor="text-amber-500"
          className="border-amber-500/30"
        />
        <AdminStatsCard
          label="Approved"
          value={stats?.approved || 0}
          icon={CheckCircle}
          iconColor="text-logo-green"
          className="border-logo-green/30"
        />
        <AdminStatsCard
          label="Rejected"
          value={stats?.rejected || 0}
          icon={XCircle}
          iconColor="text-crimson"
          className="border-crimson/30"
        />
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
    </AdminPageLayout>
  );
};

export default SubmissionsTriageAdmin;
