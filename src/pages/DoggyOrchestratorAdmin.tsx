import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Dog,
  Play,
  Heart,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';

const DoggyOrchestratorAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isSelfHealing, setIsSelfHealing] = useState(false);
  const [stats, setStats] = useState({
    totalDoggies: 0,
    activeDoggies: 0,
    shares: 0,
    lastOrchestration: ''
  });
  const [recentActions, setRecentActions] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch doggy-related stats from agent reports
      const { data: doggyReports, count: reportCount } = await supabase
        .from('agent_reports')
        .select('*', { count: 'exact' })
        .ilike('agent_name', '%doggy%')
        .order('created_at', { ascending: false })
        .limit(20);

      const totalDoggies = reportCount || 0;
      const shares = 0; // Shares tracked via analytics

      // Fetch recent orchestrator reports
      const { data: reports } = await supabase
        .from('agent_reports')
        .select('*')
        .or('agent_name.eq.doggy-orchestrator,agent_name.eq.doggy-self-heal')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalDoggies: totalDoggies || 0,
        activeDoggies: 0, // Would need active session tracking
        shares: shares || 0,
        lastOrchestration: reports?.[0]?.created_at 
          ? new Date(reports[0].created_at).toLocaleDateString() 
          : 'Never'
      });

      setRecentActions(reports || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runOrchestrator = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('doggy-orchestrator');
      if (error) throw error;
      
      toast({
        title: 'Orchestrator completed',
        description: data?.message || 'Doggy systems synchronized'
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Orchestration failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runSelfHeal = async () => {
    setIsSelfHealing(true);
    try {
      const { data, error } = await supabase.functions.invoke('doggy-self-heal');
      if (error) throw error;
      
      toast({
        title: 'Self-heal completed',
        description: data?.message || 'System health restored'
      });
      
      fetchData();
    } catch (err) {
      toast({
        title: 'Self-heal failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsSelfHealing(false);
    }
  };

  return (
    <AdminPageLayout
      title="Doggy Orchestrator"
      description="Techno Doggy system coordination and health"
      icon={Dog}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      isLoading={isLoading}
      actions={
        <div className="flex gap-2">
          <Button 
            onClick={runSelfHeal} 
            disabled={isRunning || isSelfHealing}
            variant="outline" 
            size="sm" 
            className="font-mono text-xs uppercase"
          >
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            {isSelfHealing ? 'Healing...' : 'Self-Heal'}
          </Button>
          <Button 
            onClick={runOrchestrator} 
            disabled={isRunning || isSelfHealing}
            variant="brutalist" 
            size="sm" 
            className="font-mono text-xs uppercase"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {isRunning ? 'Running...' : 'Orchestrate'}
          </Button>
        </div>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Total Doggies"
          value={stats.totalDoggies}
          icon={Dog}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Active Packs"
          value={stats.activeDoggies}
          icon={Sparkles}
          iconColor="text-amber-500"
        />
        <AdminStatsCard
          label="Total Shares"
          value={stats.shares}
          icon={TrendingUp}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Last Sync"
          value={stats.lastOrchestration}
          icon={Activity}
        />
      </div>

      {/* System Overview */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-logo-green" />
            DOGGY SYSTEMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-800 border border-logo-green/30 rounded text-center">
              <Dog className="w-6 h-6 text-logo-green mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">Generator</p>
              <Badge variant="outline" className="mt-1 text-logo-green text-[10px]">Online</Badge>
            </div>
            <div className="p-4 bg-zinc-800 border border-logo-green/30 rounded text-center">
              <Heart className="w-6 h-6 text-logo-green mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">Self-Heal</p>
              <Badge variant="outline" className="mt-1 text-logo-green text-[10px]">Ready</Badge>
            </div>
            <div className="p-4 bg-zinc-800 border border-logo-green/30 rounded text-center">
              <TrendingUp className="w-6 h-6 text-logo-green mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">Analytics</p>
              <Badge variant="outline" className="mt-1 text-logo-green text-[10px]">Active</Badge>
            </div>
            <div className="p-4 bg-zinc-800 border border-logo-green/30 rounded text-center">
              <Sparkles className="w-6 h-6 text-logo-green mx-auto mb-2" />
              <p className="font-mono text-xs text-muted-foreground">Widget</p>
              <Badge variant="outline" className="mt-1 text-logo-green text-[10px]">Deployed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-logo-green" />
            RECENT ACTIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentActions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent actions. Run the orchestrator to synchronize systems.
              </p>
            ) : (
              recentActions.map((action) => (
                <div 
                  key={action.id} 
                  className="flex items-center justify-between p-3 bg-zinc-800 border border-border rounded"
                >
                  <div>
                    <p className="font-mono text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.agent_name}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`font-mono text-[10px] ${
                        action.severity === 'info' ? 'text-logo-green' : 'text-amber-500'
                      }`}
                    >
                      {action.severity}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(action.created_at).toLocaleDateString()}
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

export default DoggyOrchestratorAdmin;
