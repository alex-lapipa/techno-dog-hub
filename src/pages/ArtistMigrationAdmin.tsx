/**
 * Artist Migration Admin Panel
 * 
 * Admin interface for managing the canonical artist database migration.
 * Provides controls for running migrations, viewing status, and managing merge candidates.
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  useMigrationStatus, 
  useMigrationOperations,
  useCanonicalArtists,
} from '@/hooks/useCanonicalData';
import { 
  getFeatureFlags, 
  setMigrationPhase, 
  getCurrentMigrationPhase,
  setFeatureFlag,
  type MigrationPhase,
} from '@/lib/featureFlags';
import { 
  Database, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Users,
  FileText,
  Zap,
  Settings,
  ArrowRight,
} from 'lucide-react';

export default function ArtistMigrationAdmin() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(getCurrentMigrationPhase());
  const [flags, setFlags] = useState(getFeatureFlags());
  
  const { data: migrationStatus, isLoading: statusLoading, refetch: refetchStatus } = useMigrationStatus();
  const { data: canonicalArtists, isLoading: artistsLoading } = useCanonicalArtists();
  const { runMigration, syncEmbeddings } = useMigrationOperations();

  const handleRunMigration = async (action: 'migrate_rag' | 'migrate_all', dryRun: boolean = false) => {
    setIsRunning(true);
    try {
      const result = await runMigration(action, { dryRun });
      toast({
        title: dryRun ? 'Dry Run Complete' : 'Migration Complete',
        description: `Processed: ${result.stats.processed}, Created: ${result.stats.created}, Merged: ${result.stats.merged}`,
      });
      refetchStatus();
    } catch (error) {
      toast({
        title: 'Migration Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSyncEmbeddings = async () => {
    setIsRunning(true);
    try {
      const result = await syncEmbeddings({ batchSize: 10 });
      toast({
        title: 'Embedding Sync Complete',
        description: `Created: ${result.created}, Updated: ${result.updated}`,
      });
      refetchStatus();
    } catch (error) {
      toast({
        title: 'Embedding Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handlePhaseChange = (phase: MigrationPhase) => {
    setMigrationPhase(phase);
    setCurrentPhase(phase);
    setFlags(getFeatureFlags());
    toast({
      title: 'Migration Phase Updated',
      description: `Now in ${phase} mode`,
    });
  };

  const handleFlagToggle = (flag: keyof typeof flags) => {
    const newValue = !flags[flag];
    setFeatureFlag(flag, newValue);
    setFlags({ ...flags, [flag]: newValue });
    toast({
      title: 'Feature Flag Updated',
      description: `${flag}: ${newValue ? 'enabled' : 'disabled'}`,
    });
  };

  const phaseColors: Record<MigrationPhase, string> = {
    legacy: 'bg-gray-500',
    dual_write: 'bg-yellow-500',
    dual_read: 'bg-blue-500',
    canonical: 'bg-green-500',
  };

  return (
    <PageLayout title="Artist Migration" description="Manage canonical artist database migration" path="/admin/artist-migration">
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Artist Migration Control</h1>
            <p className="text-muted-foreground">
              Unified artist database migration and management
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={phaseColors[currentPhase]}>
              Phase: {currentPhase.toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetchStatus()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="status" className="space-y-4">
          <TabsList>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="migration">Run Migration</TabsTrigger>
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="artists">Canonical Artists</TabsTrigger>
          </TabsList>

          {/* Status Tab */}
          <TabsContent value="status" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Canonical Artists</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statusLoading ? '...' : migrationStatus?.canonical?.artists || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total unified artist records
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">RAG Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statusLoading ? '...' : migrationStatus?.canonical?.documents || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Artist documents with embeddings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statusLoading ? '...' : migrationStatus?.canonical?.pendingReviews || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Merge candidates awaiting review
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Source Data Comparison</CardTitle>
                <CardDescription>
                  Records in each data source vs. migrated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>dj_artists (RAG)</span>
                    <span>{migrationStatus?.sources?.dj_artists || 0} records</span>
                  </div>
                  <Progress 
                    value={migrationStatus?.canonical?.artists 
                      ? (migrationStatus.canonical.artists / (migrationStatus.sources?.dj_artists || 1)) * 100 
                      : 0} 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>artists-legacy.ts</span>
                    <span>{migrationStatus?.sources?.legacy_ts || 70} records</span>
                  </div>
                  <Progress value={0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>content_sync (photos)</span>
                    <span>{migrationStatus?.sources?.content_sync || 0} records</span>
                  </div>
                  <Progress value={0} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Migration Tab */}
          <TabsContent value="migration" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Non-Destructive Migration</AlertTitle>
              <AlertDescription>
                All operations preserve existing data. Use dry run first to preview changes.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Migrate RAG Artists
                  </CardTitle>
                  <CardDescription>
                    Import artists from dj_artists table with deduplication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleRunMigration('migrate_rag', true)}
                      disabled={isRunning}
                    >
                      Dry Run
                    </Button>
                    <Button 
                      onClick={() => handleRunMigration('migrate_rag', false)}
                      disabled={isRunning}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Migration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Sync Embeddings
                  </CardTitle>
                  <CardDescription>
                    Generate RAG documents and embeddings for all canonical artists
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleSyncEmbeddings}
                    disabled={isRunning}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Sync All Embeddings
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Full Migration
                  </CardTitle>
                  <CardDescription>
                    Run all migrations in sequence: RAG → Content Sync → Embeddings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleRunMigration('migrate_all', true)}
                      disabled={isRunning}
                    >
                      Dry Run All
                    </Button>
                    <Button 
                      variant="default"
                      onClick={() => handleRunMigration('migrate_all', false)}
                      disabled={isRunning}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Full Migration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Migration Phase
                </CardTitle>
                <CardDescription>
                  Control the rollout phase for reading and writing artist data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['legacy', 'dual_write', 'dual_read', 'canonical'] as MigrationPhase[]).map((phase) => (
                    <Button
                      key={phase}
                      variant={currentPhase === phase ? 'default' : 'outline'}
                      onClick={() => handlePhaseChange(phase)}
                      className="w-full"
                    >
                      {phase.replace('_', ' ').toUpperCase()}
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Legacy:</strong> Read/write only from legacy sources</li>
                    <li><strong>Dual Write:</strong> Write to both legacy + canonical</li>
                    <li><strong>Dual Read:</strong> Read from canonical, write to both</li>
                    <li><strong>Canonical:</strong> Full canonical mode (recommended after validation)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Individual Feature Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(flags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="font-mono text-sm">
                      {key}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={() => handleFlagToggle(key as keyof typeof flags)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artists Preview Tab */}
          <TabsContent value="artists" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Canonical Artists Preview</CardTitle>
                <CardDescription>
                  {artistsLoading ? 'Loading...' : `${canonicalArtists?.length || 0} artists in canonical database`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {artistsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : canonicalArtists && canonicalArtists.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {canonicalArtists.slice(0, 24).map((artist) => (
                      <div 
                        key={artist.artist_id}
                        className="p-2 border rounded text-center text-sm"
                      >
                        <div className="font-medium truncate">{artist.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {artist.country || 'Unknown'}
                        </div>
                        {artist.rank && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            #{artist.rank}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No canonical artists yet. Run migration to populate.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
