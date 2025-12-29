import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AdminPageLayout, AdminStatsCard } from '@/components/admin';
import { 
  Search,
  Users,
  Music,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const KnowledgeGapAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [gaps, setGaps] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch counts
      const [artists, venues, festivals, gear] = await Promise.all([
        supabase.from('canonical_artists').select('*', { count: 'exact', head: true }),
        supabase.from('content_sync').select('*', { count: 'exact', head: true }).eq('entity_type', 'venue'),
        supabase.from('content_sync').select('*', { count: 'exact', head: true }).eq('entity_type', 'festival'),
        supabase.from('gear_catalog').select('*', { count: 'exact', head: true }),
      ]);

      // Check for artists without photos
      const { count: artistsWithoutPhotos } = await supabase
        .from('canonical_artists')
        .select('*', { count: 'exact', head: true })
        .is('photo_url', null);

      // Check for gear without descriptions
      const { count: gearWithoutDesc } = await supabase
        .from('gear_catalog')
        .select('*', { count: 'exact', head: true })
        .is('short_description', null);

      setStats({
        artists: artists.count || 0,
        venues: venues.count || 0,
        festivals: festivals.count || 0,
        gear: gear.count || 0,
        artistsWithoutPhotos: artistsWithoutPhotos || 0,
        gearWithoutDesc: gearWithoutDesc || 0,
      });

      // Create gaps list
      const gapsList = [];
      if (artistsWithoutPhotos && artistsWithoutPhotos > 0) {
        gapsList.push({ type: 'Artists', issue: 'Missing photos', count: artistsWithoutPhotos, severity: 'medium' });
      }
      if (gearWithoutDesc && gearWithoutDesc > 0) {
        gapsList.push({ type: 'Gear', issue: 'Missing descriptions', count: gearWithoutDesc, severity: 'medium' });
      }
      setGaps(gapsList);

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAgent = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-gap-detector');
      if (error) throw error;
      
      toast({
        title: 'Knowledge Gap Detector completed',
        description: data?.message || 'Gaps analyzed'
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

  const totalGaps = gaps.reduce((acc, g) => acc + g.count, 0);
  const totalItems = (stats?.artists || 0) + (stats?.gear || 0);
  const completionRate = totalItems > 0 ? Math.round(((totalItems - totalGaps) / totalItems) * 100) : 100;

  return (
    <AdminPageLayout
      title="Knowledge Gaps"
      description="Missing artists, data, and content"
      icon={Search}
      iconColor="text-amber-500"
      onRefresh={fetchData}
      onRunAgent={runAgent}
      isLoading={isLoading}
      isRunning={isRunning}
      runButtonText="Detect"
    >
      {/* Coverage Overview */}
      <Card className="bg-zinc-900 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono uppercase">Knowledge Coverage</p>
              <p className="text-4xl font-bold text-logo-green">{completionRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{totalGaps} gaps found</p>
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Database Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdminStatsCard
          label="Artists"
          value={stats?.artists || 0}
          icon={Users}
          iconColor="text-crimson"
        />
        <AdminStatsCard
          label="Gear"
          value={stats?.gear || 0}
          icon={Music}
          iconColor="text-logo-green"
        />
        <AdminStatsCard
          label="Venues"
          value={stats?.venues || 0}
          icon={MapPin}
          iconColor="text-amber-500"
        />
        <AdminStatsCard
          label="Festivals"
          value={stats?.festivals || 0}
          icon={Calendar}
        />
      </div>

      {/* Gaps List */}
      <Card className="bg-zinc-900 border-crimson/20">
        <CardHeader>
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            IDENTIFIED GAPS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gaps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium text-logo-green">No gaps detected!</p>
                <p className="text-sm text-muted-foreground mt-1">All content appears complete</p>
              </div>
            ) : (
              gaps.map((gap, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-800 border border-border rounded">
                  <div>
                    <p className="font-medium text-foreground">{gap.type}</p>
                    <p className="text-sm text-muted-foreground">{gap.issue}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-amber-500">{gap.count}</span>
                    <Badge variant={gap.severity === 'high' ? 'destructive' : 'outline'}>
                      {gap.severity}
                    </Badge>
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

export default KnowledgeGapAdmin;
