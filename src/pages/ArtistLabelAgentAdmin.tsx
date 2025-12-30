import { useState, useEffect } from 'react';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, Building2, Music, Mail, RefreshCw, Download, Search, 
  Loader2, CheckCircle, AlertCircle, Globe, Phone, ExternalLink,
  UserCheck, Filter, Send, Clock, Target
} from 'lucide-react';

interface DashboardStats {
  totalArtists: number;
  activeArtists: number;
  totalManagers: number;
  totalLabels: number;
  totalLabelContacts: number;
  avgConfidence: number;
  recentRuns: number;
}

interface Artist {
  id: string;
  artist_name: string;
  region_focus: string;
  country_base: string;
  active_status: string;
  verification_confidence: number;
  last_verified_at: string;
}

interface Manager {
  id: string;
  artist_id: string;
  manager_name: string;
  manager_role: string;
  management_company: string;
  email: string;
  region_coverage: string;
  enrichment_confidence: number;
  artists_active?: { artist_name: string };
}

interface Label {
  id: string;
  label_name: string;
  label_type: string;
  headquarters_country: string;
  general_email: string;
  label_website_url: string;
  verification_confidence: number;
}

interface LabelContact {
  id: string;
  label_id: string;
  contact_person_name: string;
  role_title: string;
  department: string;
  email: string;
  enrichment_confidence: number;
  labels?: { label_name: string };
}

export default function ArtistLabelAgentAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [labelContacts, setLabelContacts] = useState<LabelContact[]>([]);
  
  // Filters
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Ingest settings
  const [ingestRegions, setIngestRegions] = useState<string[]>(['EU', 'UK', 'North America']);
  const [batchSize, setBatchSize] = useState(20);
  
  // Outreach
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [collaborationType, setCollaborationType] = useState('interview');
  const [outreachTone, setOutreachTone] = useState('scene-native');
  const [projectContext, setProjectContext] = useState('techno.doc - underground techno knowledge and archive platform');
  const [outreachGoal, setOutreachGoal] = useState('');
  const [generatedOutreach, setGeneratedOutreach] = useState<any>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'artists') loadArtists();
    if (activeTab === 'managers') loadManagers();
    if (activeTab === 'labels') loadLabels();
    if (activeTab === 'contacts') loadLabelContacts();
  }, [activeTab, regionFilter, statusFilter]);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const [artistsRes, managersRes, labelsRes, contactsRes, runsRes] = await Promise.all([
        supabase.from('artists_active').select('id, active_status, verification_confidence'),
        supabase.from('artist_managers').select('id'),
        supabase.from('labels').select('id'),
        supabase.from('label_contacts').select('id'),
        supabase.from('artist_label_agent_runs').select('id').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const artistsData = artistsRes.data || [];
      const avgConf = artistsData.length > 0 
        ? Math.round(artistsData.reduce((sum, a) => sum + (a.verification_confidence || 0), 0) / artistsData.length)
        : 0;

      setStats({
        totalArtists: artistsData.length,
        activeArtists: artistsData.filter(a => a.active_status === 'active').length,
        totalManagers: managersRes.data?.length || 0,
        totalLabels: labelsRes.data?.length || 0,
        totalLabelContacts: contactsRes.data?.length || 0,
        avgConfidence: avgConf,
        recentRuns: runsRes.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadArtists = async () => {
    let query = supabase.from('artists_active').select('*').order('artist_name');
    if (regionFilter !== 'all') query = query.eq('region_focus', regionFilter);
    if (statusFilter !== 'all') query = query.eq('active_status', statusFilter);
    const { data } = await query.limit(100);
    setArtists(data || []);
  };

  const loadManagers = async () => {
    const { data } = await supabase
      .from('artist_managers')
      .select('*, artists_active(artist_name)')
      .order('manager_name')
      .limit(100);
    setManagers(data || []);
  };

  const loadLabels = async () => {
    const { data } = await supabase
      .from('labels')
      .select('*')
      .order('label_name')
      .limit(100);
    setLabels(data || []);
  };

  const loadLabelContacts = async () => {
    const { data } = await supabase
      .from('label_contacts')
      .select('*, labels(label_name)')
      .order('contact_person_name')
      .limit(100);
    setLabelContacts(data || []);
  };

  const runAgentAction = async (action: string, params: any = {}) => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('artist-label-agent', {
        body: { action, params }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast.success(`${action} completed successfully`, {
          description: JSON.stringify(data).slice(0, 100)
        });
        loadDashboardStats();
        return data;
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Agent error:', error);
      toast.error('Agent action failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  const handleIngestArtists = () => runAgentAction('ingest_artists', { regionFocus: ingestRegions, batchSize });
  const handleFindManagers = () => runAgentAction('find_managers', { batchSize });
  const handleFindLabels = () => runAgentAction('find_labels', { batchSize });
  const handleVerifyFreshness = () => runAgentAction('verify_freshness', { batchSize: 20 });
  const handleWeeklyRefresh = () => runAgentAction('weekly_refresh');

  const handleGenerateOutreach = async () => {
    if (!selectedContact) {
      toast.error('Please select a contact');
      return;
    }
    
    const result = await runAgentAction('generate_outreach', {
      contactId: selectedContact,
      collaborationType,
      tone: outreachTone,
      projectContext,
      goal: outreachGoal
    });

    if (result?.outreach) {
      setGeneratedOutreach(result.outreach);
    }
  };

  const exportData = async (type: 'artists' | 'managers' | 'labels' | 'contacts') => {
    let data: any[] = [];
    
    switch (type) {
      case 'artists':
        const { data: artistData } = await supabase.from('artists_active').select('*');
        data = artistData || [];
        break;
      case 'managers':
        const { data: managerData } = await supabase.from('artist_managers').select('*, artists_active(artist_name)');
        data = managerData || [];
        break;
      case 'labels':
        const { data: labelData } = await supabase.from('labels').select('*');
        data = labelData || [];
        break;
      case 'contacts':
        const { data: contactData } = await supabase.from('label_contacts').select('*, labels(label_name)');
        data = contactData || [];
        break;
    }

    const csv = convertToCSV(data);
    downloadFile(csv, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast.success(`Exported ${data.length} ${type}`);
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-500/20 text-green-400">High ({confidence}%)</Badge>;
    if (confidence >= 50) return <Badge className="bg-yellow-500/20 text-yellow-400">Medium ({confidence}%)</Badge>;
    return <Badge className="bg-red-500/20 text-red-400">Low ({confidence}%)</Badge>;
  };

  return (
    <AdminPageLayout
      title="Artist & Label Intelligence Agent"
      description="EU/UK/North America artist management & label contacts"
      icon={Users}
      iconColor="text-purple-500"
      onRefresh={loadDashboardStats}
      isLoading={isLoading}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ingest">Ingest</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="labels">Labels</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Active Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeArtists || 0}</div>
                <p className="text-xs text-muted-foreground">of {stats?.totalArtists || 0} total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalManagers || 0}</div>
                <p className="text-xs text-muted-foreground">contacts found</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLabels || 0}</div>
                <p className="text-xs text-muted-foreground">in database</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-mono uppercase text-muted-foreground">Label Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalLabelContacts || 0}</div>
                <p className="text-xs text-muted-foreground">A&R/PR/etc</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleIngestArtists} 
                  disabled={isRunning} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                  Ingest Artists from Database
                </Button>
                <Button 
                  onClick={handleFindManagers} 
                  disabled={isRunning} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserCheck className="w-4 h-4 mr-2" />}
                  Find Manager Contacts
                </Button>
                <Button 
                  onClick={handleFindLabels} 
                  disabled={isRunning} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Building2 className="w-4 h-4 mr-2" />}
                  Find Labels & Contacts
                </Button>
                <Button 
                  onClick={handleVerifyFreshness} 
                  disabled={isRunning} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Verify Freshness (Top 20)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono uppercase">Data Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Confidence</span>
                    <span className="font-mono">{stats?.avgConfidence || 0}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${stats?.avgConfidence || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats?.recentRuns || 0} agent runs in the last 7 days
                </div>
                <Button 
                  onClick={handleWeeklyRefresh} 
                  disabled={isRunning}
                  variant="brutalist"
                  className="w-full"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clock className="w-4 h-4 mr-2" />}
                  Run Weekly Refresh (Top 200)
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase">GDPR & Ethics Notice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <strong>Professional relationship data only.</strong> All contacts are publicly available professional information. 
                  Data is collected from official websites, press portals, and public business profiles. 
                  Users can request deletion of their data. Source URLs are stored for traceability.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ingest Tab */}
        <TabsContent value="ingest" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingest Artists from Existing Database</CardTitle>
              <CardDescription>
                Read from canonical_artists (read-only) and filter for EU/UK/North America active artists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Regions to Include</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['EU', 'UK', 'North America'].map(region => (
                      <Badge 
                        key={region}
                        variant={ingestRegions.includes(region) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setIngestRegions(prev => 
                          prev.includes(region) 
                            ? prev.filter(r => r !== region)
                            : [...prev, region]
                        )}
                      >
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Batch Size</label>
                  <Select value={String(batchSize)} onValueChange={v => setBatchSize(Number(v))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 artists</SelectItem>
                      <SelectItem value="20">20 artists</SelectItem>
                      <SelectItem value="50">50 artists</SelectItem>
                      <SelectItem value="100">100 artists</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleIngestArtists} 
                disabled={isRunning || ingestRegions.length === 0}
                variant="brutalist"
              >
                {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                Start Ingest
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discovery Workflows</CardTitle>
              <CardDescription>Find managers, labels, and contacts for ingested artists</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <Button 
                onClick={handleFindManagers} 
                disabled={isRunning}
                variant="outline"
                className="h-auto py-4 flex-col"
              >
                <UserCheck className="w-6 h-6 mb-2" />
                <span>Find Managers</span>
                <span className="text-xs text-muted-foreground">Search for representation</span>
              </Button>
              <Button 
                onClick={handleFindLabels} 
                disabled={isRunning}
                variant="outline"
                className="h-auto py-4 flex-col"
              >
                <Building2 className="w-6 h-6 mb-2" />
                <span>Find Labels</span>
                <span className="text-xs text-muted-foreground">Identify label affiliations</span>
              </Button>
              <Button 
                onClick={() => runAgentAction('enrich_contacts', { batchSize })} 
                disabled={isRunning}
                variant="outline"
                className="h-auto py-4 flex-col"
              >
                <Mail className="w-6 h-6 mb-2" />
                <span>Enrich Contacts</span>
                <span className="text-xs text-muted-foreground">Add emails & details</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Artists</CardTitle>
                <CardDescription>{artists.length} artists loaded</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="EU">EU</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="uncertain">Uncertain</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => exportData('artists')}>
                  <Download className="w-4 h-4 mr-1" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Last Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {artists.map(artist => (
                    <TableRow key={artist.id}>
                      <TableCell className="font-medium">{artist.artist_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{artist.region_focus || 'Unknown'}</Badge>
                      </TableCell>
                      <TableCell>{artist.country_base || '-'}</TableCell>
                      <TableCell>
                        <Badge className={
                          artist.active_status === 'active' ? 'bg-green-500/20 text-green-400' :
                          artist.active_status === 'uncertain' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {artist.active_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getConfidenceBadge(artist.verification_confidence)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {artist.last_verified_at ? new Date(artist.last_verified_at).toLocaleDateString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Managers Tab */}
        <TabsContent value="managers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Artist Managers & Agents</CardTitle>
                <CardDescription>{managers.length} contacts loaded</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportData('managers')}>
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Manager</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map(manager => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">{manager.manager_name}</TableCell>
                      <TableCell>{manager.management_company || '-'}</TableCell>
                      <TableCell>{manager.artists_active?.artist_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{manager.manager_role || 'manager'}</Badge>
                      </TableCell>
                      <TableCell>
                        {manager.email ? (
                          <a href={`mailto:${manager.email}`} className="text-primary hover:underline text-sm">
                            {manager.email}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{manager.region_coverage || '-'}</TableCell>
                      <TableCell>{getConfidenceBadge(manager.enrichment_confidence)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Record Labels</CardTitle>
                <CardDescription>{labels.length} labels in database</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportData('labels')}>
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labels.map(label => (
                    <TableRow key={label.id}>
                      <TableCell className="font-medium">{label.label_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{label.label_type || 'independent'}</Badge>
                      </TableCell>
                      <TableCell>{label.headquarters_country || '-'}</TableCell>
                      <TableCell>
                        {label.general_email ? (
                          <a href={`mailto:${label.general_email}`} className="text-primary hover:underline text-sm">
                            {label.general_email}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {label.label_website_url ? (
                          <a href={label.label_website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getConfidenceBadge(label.verification_confidence)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Label Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Label Contacts</CardTitle>
                <CardDescription>{labelContacts.length} contacts loaded</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportData('contacts')}>
                <Download className="w-4 h-4 mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labelContacts.map(contact => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.contact_person_name || 'Unknown'}</TableCell>
                      <TableCell>{contact.labels?.label_name || '-'}</TableCell>
                      <TableCell>{contact.role_title || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{contact.department || 'general'}</Badge>
                      </TableCell>
                      <TableCell>
                        {contact.email ? (
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline text-sm">
                            {contact.email}
                          </a>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getConfidenceBadge(contact.enrichment_confidence)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Outreach</CardTitle>
                <CardDescription>Create personalized outreach for managers or label contacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Contact</label>
                  <Select value={selectedContact} onValueChange={setSelectedContact}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose a manager or label contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" disabled>-- Managers --</SelectItem>
                      {managers.slice(0, 20).map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.manager_name} ({m.artists_active?.artist_name || 'Unknown artist'})
                        </SelectItem>
                      ))}
                      <SelectItem value="" disabled>-- Label Contacts --</SelectItem>
                      {labelContacts.slice(0, 20).map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.contact_person_name} ({c.labels?.label_name || 'Unknown label'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Collaboration Type</label>
                  <Select value={collaborationType} onValueChange={setCollaborationType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interview">Interview/Feature</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="archive">Archive Collaboration</SelectItem>
                      <SelectItem value="content">Content Series</SelectItem>
                      <SelectItem value="event">Event Partnership</SelectItem>
                      <SelectItem value="documentary">Documentary Feature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <Select value={outreachTone} onValueChange={setOutreachTone}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scene-native">Scene-Native (Underground)</SelectItem>
                      <SelectItem value="formal">Formal/Industry</SelectItem>
                      <SelectItem value="journalistic">Journalistic</SelectItem>
                      <SelectItem value="friendly">Friendly/Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Goal/Pitch</label>
                  <Textarea 
                    value={outreachGoal}
                    onChange={e => setOutreachGoal(e.target.value)}
                    placeholder="What do you want to achieve? E.g., 'Feature their studio setup in our gear archive series'"
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={handleGenerateOutreach} 
                  disabled={isRunning || !selectedContact}
                  variant="brutalist"
                  className="w-full"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Generate Outreach
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>AI-generated outreach materials</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedOutreach ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground">Subject</label>
                      <p className="text-sm mt-1 p-2 bg-muted rounded">{generatedOutreach.email_subject}</p>
                    </div>
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground">Email Body</label>
                      <pre className="text-sm mt-1 p-2 bg-muted rounded whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {generatedOutreach.email_body}
                      </pre>
                    </div>
                    {generatedOutreach.dm_script && (
                      <div>
                        <label className="text-xs font-mono uppercase text-muted-foreground">DM Script</label>
                        <p className="text-sm mt-1 p-2 bg-muted rounded">{generatedOutreach.dm_script}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-mono uppercase text-muted-foreground">Timing</label>
                      <p className="text-sm mt-1">{generatedOutreach.recommended_timing}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a contact and generate outreach</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
              <CardDescription>Configure scoring weights and refresh cadence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Default Batch Size</label>
                  <Select value={String(batchSize)} onValueChange={v => setBatchSize(Number(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Default Project Context</label>
                  <Textarea 
                    value={projectContext}
                    onChange={e => setProjectContext(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Scoring Weights (Display Only)</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded">
                    <div className="text-muted-foreground">Officialness</div>
                    <div className="font-mono text-lg">40%</div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-muted-foreground">Recency</div>
                    <div className="font-mono text-lg">30%</div>
                  </div>
                  <div className="p-3 bg-muted rounded">
                    <div className="text-muted-foreground">Multi-Source</div>
                    <div className="font-mono text-lg">30%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}
