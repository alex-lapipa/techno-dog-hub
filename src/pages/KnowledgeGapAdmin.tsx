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
  Search,
  Users,
  Music,
  MapPin,
  Calendar,
  AlertTriangle
} from 'lucide-react';

const KnowledgeGapAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [gaps, setGaps] = useState<any[]>([]);

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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

  const totalGaps = gaps.reduce((acc, g) => acc + g.count, 0);
  const totalItems = (stats?.artists || 0) + (stats?.gear || 0);
  const completionRate = totalItems > 0 ? Math.round(((totalItems - totalGaps) / totalItems) * 100) : 100;

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
                <Search className="w-6 h-6 text-amber-500" />
                KNOWLEDGE GAP DETECTOR
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Identifies missing artists, data, and content gaps
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
              Detect Gaps
            </Button>
          </div>
        </div>

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
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Artists</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.artists || 0}</p>
                </div>
                <Users className="w-8 h-8 text-crimson/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Gear</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.gear || 0}</p>
                </div>
                <Music className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Venues</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.venues || 0}</p>
                </div>
                <MapPin className="w-8 h-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Festivals</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.festivals || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground/60" />
              </div>
            </CardContent>
          </Card>
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
      </div>
    </div>
  );
};

export default KnowledgeGapAdmin;
