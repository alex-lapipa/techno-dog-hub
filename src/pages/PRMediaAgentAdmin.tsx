import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/admin';
import { 
  Newspaper, Users, Building2, Mail, ListFilter, Settings, 
  Search, RefreshCw, Download, Trash2, ExternalLink, Globe,
  TrendingUp, AlertCircle, CheckCircle, Clock, Send,
  BarChart3, MapPin, Zap, Eye, Edit, Plus
} from 'lucide-react';

interface DashboardStats {
  totalOutlets: number;
  totalContacts: number;
  totalOutreach: number;
  outletsByRegion: Record<string, number>;
  outletsByType: Record<string, number>;
  contactsByStatus: Record<string, number>;
  activeContacts: number;
  outreachByStatus: Record<string, number>;
  recentRuns: any[];
  avgAuthorityScore: number;
}

interface MediaOutlet {
  id: string;
  outlet_name: string;
  outlet_type: string;
  region: string;
  country: string;
  city: string;
  website_url: string;
  authority_score: number;
  underground_credibility_score: number;
  genres_focus: string[];
  activity_status: string;
  last_verified_at: string;
}

interface JournalistContact {
  id: string;
  full_name: string;
  role_title: string;
  email: string;
  outlet_id: string;
  media_outlets?: MediaOutlet;
  location_country: string;
  coverage_focus_tags: string[];
  relationship_status: string;
  authority_score: number;
  underground_credibility_score: number;
  what_makes_them_tick: string;
  is_active: boolean;
  last_verified_at: string;
}

export default function PRMediaAgentAdmin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [outlets, setOutlets] = useState<MediaOutlet[]>([]);
  const [contacts, setContacts] = useState<JournalistContact[]>([]);
  const [technoJournalists, setTechnoJournalists] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [outreachHistory, setOutreachHistory] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  
  // Discovery form state
  const [discoverParams, setDiscoverParams] = useState({
    regions: ['europe', 'north_america'],
    genres: ['techno', 'acid', 'industrial', 'minimal'],
    outletTypes: ['magazine', 'blog', 'podcast', 'youtube', 'radio'],
    languages: ['en', 'de', 'fr', 'es'],
    depth: 'standard' as 'light' | 'standard' | 'exhaustive'
  });
  
  // Outreach form state
  const [outreachForm, setOutreachForm] = useState({
    contactId: '',
    promotion: '',
    tone: 'underground' as 'formal' | 'underground' | 'friendly' | 'bold',
    angle: 'cultural'
  });
  const [generatedOutreach, setGeneratedOutreach] = useState<any>(null);
  
  // Filters
  const [contactFilter, setContactFilter] = useState({ region: 'all', status: 'all', search: '' });
  const [outletFilter, setOutletFilter] = useState({ region: 'all', type: 'all', search: '' });

  const callAgent = useCallback(async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke('pr-media-agent', {
      body: { action, ...params }
    });
    if (error) throw error;
    return data;
  }, []);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await callAgent('dashboard');
      setStats(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch dashboard', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [callAgent, toast]);

  const fetchOutlets = useCallback(async () => {
    try {
      const data = await callAgent('get_outlets', { limit: 200 });
      setOutlets(data.outlets || []);
    } catch (error) {
      console.error('Failed to fetch outlets:', error);
    }
  }, [callAgent]);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await callAgent('get_contacts', { limit: 200 });
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  }, [callAgent]);

  const fetchSegments = useCallback(async () => {
    try {
      const data = await callAgent('get_segments');
      setSegments(data.segments || []);
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    }
  }, [callAgent]);

  const fetchOutreachHistory = useCallback(async () => {
    try {
      const data = await callAgent('get_outreach_history', { limit: 100 });
      setOutreachHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch outreach history:', error);
    }
  }, [callAgent]);

  const fetchAuditLog = useCallback(async () => {
    try {
      const data = await callAgent('get_audit_log');
      setAuditLog(data.auditLog || []);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
    }
  }, [callAgent]);

  const fetchTechnoJournalists = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('techno_journalists')
        .select('*')
        .order('verification_confidence', { ascending: false });
      if (error) throw error;
      setTechnoJournalists(data || []);
    } catch (error) {
      console.error('Failed to fetch techno journalists:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchOutlets();
    fetchContacts();
    fetchSegments();
    fetchOutreachHistory();
    fetchTechnoJournalists();
  }, [fetchDashboard, fetchOutlets, fetchContacts, fetchSegments, fetchOutreachHistory, fetchTechnoJournalists]);

  const runDiscovery = async () => {
    setIsLoading(true);
    try {
      const result = await callAgent('discover', discoverParams);
      toast({
        title: 'Discovery Complete',
        description: `Found ${result.outletsFound} outlets and ${result.contactsFound} contacts`
      });
      fetchDashboard();
      fetchOutlets();
      fetchContacts();
    } catch (error) {
      toast({ title: 'Discovery Failed', description: 'Check console for details', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runEnrichment = async (contactIds?: string[]) => {
    setIsLoading(true);
    try {
      const result = await callAgent('enrich', { contactIds });
      toast({
        title: 'Enrichment Complete',
        description: `Enriched ${result.enriched} contacts`
      });
      fetchContacts();
    } catch (error) {
      toast({ title: 'Enrichment Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const runWeeklyRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await callAgent('weekly_refresh');
      toast({
        title: 'Weekly Refresh Complete',
        description: `Verified ${result.verified} contacts, ${result.updated} role changes detected`
      });
      fetchContacts();
      fetchAuditLog();
    } catch (error) {
      toast({ title: 'Refresh Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const generateOutreach = async () => {
    if (!outreachForm.contactId || !outreachForm.promotion) {
      toast({ title: 'Missing Fields', description: 'Select a contact and enter promotion details', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const result = await callAgent('generate_outreach', outreachForm);
      setGeneratedOutreach(result);
      toast({ title: 'Outreach Generated', description: 'Review and customize before sending' });
    } catch (error) {
      toast({ title: 'Generation Failed', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveOutreach = async () => {
    if (!generatedOutreach) return;
    try {
      await callAgent('save_outreach', {
        journalist_id: outreachForm.contactId,
        outreach_type: 'email',
        subject_line: generatedOutreach.email_subject,
        message_content: generatedOutreach.email_body,
        message_summary: outreachForm.promotion.substring(0, 100),
        status: 'draft'
      });
      toast({ title: 'Saved', description: 'Outreach saved to history' });
      fetchOutreachHistory();
    } catch (error) {
      toast({ title: 'Save Failed', variant: 'destructive' });
    }
  };

  const exportData = async (type: 'contacts' | 'outlets') => {
    try {
      const result = await callAgent('export_csv', { type });
      const csv = convertToCSV(result.data);
      downloadCSV(csv, `techno_pr_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      toast({ title: 'Export Complete', description: `Downloaded ${result.data.length} ${type}` });
    } catch (error) {
      toast({ title: 'Export Failed', variant: 'destructive' });
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Delete this contact? This cannot be undone.')) return;
    try {
      await callAgent('delete_contact', { id });
      toast({ title: 'Contact Deleted' });
      fetchContacts();
      fetchDashboard();
    } catch (error) {
      toast({ title: 'Delete Failed', variant: 'destructive' });
    }
  };

  const deleteOutlet = async (id: string) => {
    if (!confirm('Delete this outlet? This cannot be undone.')) return;
    try {
      await callAgent('delete_outlet', { id });
      toast({ title: 'Outlet Deleted' });
      fetchOutlets();
      fetchDashboard();
    } catch (error) {
      toast({ title: 'Delete Failed', variant: 'destructive' });
    }
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredContacts = contacts.filter(c => {
    if (contactFilter.region !== 'all' && c.location_country !== contactFilter.region) return false;
    if (contactFilter.status !== 'all' && c.relationship_status !== contactFilter.status) return false;
    if (contactFilter.search && !c.full_name.toLowerCase().includes(contactFilter.search.toLowerCase())) return false;
    return true;
  });

  const filteredOutlets = outlets.filter(o => {
    if (outletFilter.region !== 'all' && o.region !== outletFilter.region) return false;
    if (outletFilter.type !== 'all' && o.outlet_type !== outletFilter.type) return false;
    if (outletFilter.search && !o.outlet_name.toLowerCase().includes(outletFilter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminPageLayout
      title="Techno PR & Media Relations Agent"
      description="Multi-model orchestrated PR database: OpenAI + Anthropic + Grok"
      icon={Newspaper}
      onRefresh={fetchDashboard}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Ethics Notice */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>This agent uses only publicly available information. All data can be deleted on request (GDPR compliant).</span>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="dashboard"><BarChart3 className="h-4 w-4 mr-1" /> Dashboard</TabsTrigger>
            <TabsTrigger value="journalists"><Newspaper className="h-4 w-4 mr-1" /> Journalists</TabsTrigger>
            <TabsTrigger value="discover"><Search className="h-4 w-4 mr-1" /> Discover</TabsTrigger>
            <TabsTrigger value="contacts"><Users className="h-4 w-4 mr-1" /> Contacts</TabsTrigger>
            <TabsTrigger value="outlets"><Building2 className="h-4 w-4 mr-1" /> Outlets</TabsTrigger>
            <TabsTrigger value="outreach"><Mail className="h-4 w-4 mr-1" /> Outreach</TabsTrigger>
            <TabsTrigger value="segments"><ListFilter className="h-4 w-4 mr-1" /> Segments</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats?.totalOutlets || 0}</CardTitle>
                  <CardDescription>Media Outlets</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats?.totalContacts || 0}</CardTitle>
                  <CardDescription>Journalist Contacts</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats?.activeContacts || 0}</CardTitle>
                  <CardDescription>Active Contacts</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats?.avgAuthorityScore || 0}</CardTitle>
                  <CardDescription>Avg Authority Score</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outlets by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats?.outletsByRegion || {}).map(([region, count]) => (
                      <div key={region} className="flex justify-between items-center">
                        <span className="capitalize">{region.replace('_', ' ')}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contacts by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats?.contactsByStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="capitalize">{status}</span>
                        <Badge variant={status === 'partner' ? 'default' : 'secondary'}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Agent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Outlets</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead>Started</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(stats?.recentRuns || []).map((run: any) => (
                        <TableRow key={run.id}>
                          <TableCell className="capitalize">{run.run_type}</TableCell>
                          <TableCell>
                            <Badge variant={run.status === 'completed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{run.outlets_processed}</TableCell>
                          <TableCell>{run.contacts_processed}</TableCell>
                          <TableCell>{new Date(run.started_at).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JOURNALISTS DB TAB */}
          <TabsContent value="journalists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-logo-green" />
                  Techno Journalists Database
                  <Badge className="ml-2 bg-logo-green/20 text-logo-green">{technoJournalists.length} journalists</Badge>
                </CardTitle>
                <CardDescription>
                  Curated database of techno journalists, writers, and critics for outreach and PR campaigns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{technoJournalists.filter(j => j.region === 'UK').length}</div>
                      <div className="text-xs text-muted-foreground">UK Based</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{technoJournalists.filter(j => j.region === 'Europe').length}</div>
                      <div className="text-xs text-muted-foreground">Europe Based</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{technoJournalists.filter(j => j.region === 'North America').length}</div>
                      <div className="text-xs text-muted-foreground">North America</div>
                    </CardContent>
                  </Card>
                </div>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Publications</TableHead>
                        <TableHead>Focus Areas</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {technoJournalists.map((journalist) => (
                        <TableRow key={journalist.id}>
                          <TableCell className="font-medium">
                            <div>{journalist.journalist_name}</div>
                            {journalist.journalist_name_citation && (
                              <a 
                                href={journalist.journalist_name_citation} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-logo-green flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" /> Source
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(journalist.publications || []).slice(0, 3).map((pub: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {pub.name}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(journalist.focus_areas || []).slice(0, 2).map((area: any, i: number) => (
                                <Badge key={i} className="text-xs bg-primary/20 text-primary">
                                  {area.area}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{journalist.city || journalist.country || journalist.region}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={journalist.verification_confidence >= 80 ? 'bg-green-500/20 text-green-400' : journalist.verification_confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                              {journalist.verification_confidence}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Mail className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DISCOVER TAB */}
          <TabsContent value="discover" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-logo-green" />
                  Discovery Engine
                </CardTitle>
                <CardDescription>
                  Multi-model orchestration: Grok scans → Firecrawl discovers → OpenAI extracts → Anthropic evaluates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Regions</Label>
                    <div className="flex flex-wrap gap-2">
                      {['europe', 'north_america'].map(region => (
                        <div key={region} className="flex items-center gap-2">
                          <Checkbox
                            checked={discoverParams.regions.includes(region)}
                            onCheckedChange={(checked) => {
                              setDiscoverParams(prev => ({
                                ...prev,
                                regions: checked 
                                  ? [...prev.regions, region]
                                  : prev.regions.filter(r => r !== region)
                              }));
                            }}
                          />
                          <span className="capitalize">{region.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Depth Level</Label>
                    <Select 
                      value={discoverParams.depth} 
                      onValueChange={(v: any) => setDiscoverParams(prev => ({ ...prev, depth: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light (5 queries)</SelectItem>
                        <SelectItem value="standard">Standard (10 queries)</SelectItem>
                        <SelectItem value="exhaustive">Exhaustive (20 queries)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Outlet Types</Label>
                  <div className="flex flex-wrap gap-2">
                    {['magazine', 'blog', 'podcast', 'youtube', 'radio', 'streaming_platform', 'newsletter', 'festival_media'].map(type => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          checked={discoverParams.outletTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            setDiscoverParams(prev => ({
                              ...prev,
                              outletTypes: checked 
                                ? [...prev.outletTypes, type]
                                : prev.outletTypes.filter(t => t !== type)
                            }));
                          }}
                        />
                        <span className="capitalize text-sm">{type.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Genres Focus</Label>
                  <div className="flex flex-wrap gap-2">
                    {['techno', 'acid', 'industrial', 'minimal', 'dub techno', 'hard techno', 'ambient', 'experimental'].map(genre => (
                      <div key={genre} className="flex items-center gap-2">
                        <Checkbox
                          checked={discoverParams.genres.includes(genre)}
                          onCheckedChange={(checked) => {
                            setDiscoverParams(prev => ({
                              ...prev,
                              genres: checked 
                                ? [...prev.genres, genre]
                                : prev.genres.filter(g => g !== genre)
                            }));
                          }}
                        />
                        <span className="capitalize text-sm">{genre}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={runDiscovery} disabled={isLoading} className="w-full">
                  {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                  Run Discovery
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTACTS TAB */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search contacts..."
                value={contactFilter.search}
                onChange={(e) => setContactFilter(prev => ({ ...prev, search: e.target.value }))}
                className="max-w-xs"
              />
              <Select value={contactFilter.status} onValueChange={(v) => setContactFilter(prev => ({ ...prev, status: v }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="engaged">Engaged</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="avoid">Avoid</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => runEnrichment()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Enrich All
              </Button>
              <Button variant="outline" onClick={() => exportData('contacts')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Outlet</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Authority</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.full_name}</TableCell>
                          <TableCell>{contact.role_title || '-'}</TableCell>
                          <TableCell>{contact.media_outlets?.outlet_name || '-'}</TableCell>
                          <TableCell>{contact.location_country || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={
                              contact.relationship_status === 'partner' ? 'default' :
                              contact.relationship_status === 'avoid' ? 'destructive' : 'secondary'
                            }>
                              {contact.relationship_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {contact.authority_score}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-[150px]">
                              {(contact.coverage_focus_tags || []).slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{contact.full_name}</DialogTitle>
                                    <DialogDescription>{contact.role_title} at {contact.media_outlets?.outlet_name}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-muted-foreground">Email</Label>
                                        <p>{contact.email || 'Not available'}</p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">Location</Label>
                                        <p>{contact.location_country || 'Unknown'}</p>
                                      </div>
                                    </div>
                                    {contact.what_makes_them_tick && (
                                      <div>
                                        <Label className="text-muted-foreground">What Makes Them Tick</Label>
                                        <p className="text-sm">{contact.what_makes_them_tick}</p>
                                      </div>
                                    )}
                                    <div>
                                      <Label className="text-muted-foreground">Coverage Tags</Label>
                                      <div className="flex gap-2 flex-wrap mt-1">
                                        {(contact.coverage_focus_tags || []).map(tag => (
                                          <Badge key={tag} variant="outline">{tag}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-4">
                                      <div>
                                        <Label className="text-muted-foreground">Authority Score</Label>
                                        <p className="text-2xl font-bold">{contact.authority_score}</p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">Credibility Score</Label>
                                        <p className="text-2xl font-bold">{contact.underground_credibility_score}</p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" onClick={() => deleteContact(contact.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OUTLETS TAB */}
          <TabsContent value="outlets" className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search outlets..."
                value={outletFilter.search}
                onChange={(e) => setOutletFilter(prev => ({ ...prev, search: e.target.value }))}
                className="max-w-xs"
              />
              <Select value={outletFilter.region} onValueChange={(v) => setOutletFilter(prev => ({ ...prev, region: v }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="europe">Europe</SelectItem>
                  <SelectItem value="north_america">North America</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
              <Select value={outletFilter.type} onValueChange={(v) => setOutletFilter(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="magazine">Magazine</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => exportData('outlets')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Outlet Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Authority</TableHead>
                        <TableHead>Credibility</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOutlets.map((outlet) => (
                        <TableRow key={outlet.id}>
                          <TableCell className="font-medium">{outlet.outlet_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{outlet.outlet_type?.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{outlet.region?.replace('_', ' ')}</TableCell>
                          <TableCell>{outlet.country || '-'}</TableCell>
                          <TableCell>
                            {outlet.website_url && (
                              <a href={outlet.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-logo-green hover:underline">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Link
                              </a>
                            )}
                          </TableCell>
                          <TableCell>{outlet.authority_score}</TableCell>
                          <TableCell>{outlet.underground_credibility_score}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => deleteOutlet(outlet.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OUTREACH TAB */}
          <TabsContent value="outreach" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Outreach</CardTitle>
                  <CardDescription>AI-powered personalized pitch generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Contact</Label>
                    <Select 
                      value={outreachForm.contactId} 
                      onValueChange={(v) => setOutreachForm(prev => ({ ...prev, contactId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a journalist..." />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.full_name} - {c.media_outlets?.outlet_name || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>What are you promoting?</Label>
                    <Textarea
                      placeholder="Describe the release, event, artist, or campaign..."
                      value={outreachForm.promotion}
                      onChange={(e) => setOutreachForm(prev => ({ ...prev, promotion: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tone</Label>
                      <Select 
                        value={outreachForm.tone} 
                        onValueChange={(v: any) => setOutreachForm(prev => ({ ...prev, tone: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="underground">Underground</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Angle</Label>
                      <Select 
                        value={outreachForm.angle} 
                        onValueChange={(v) => setOutreachForm(prev => ({ ...prev, angle: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="sonic">Sonic/Musical</SelectItem>
                          <SelectItem value="innovation">Innovation</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="vinyl">Vinyl/Physical</SelectItem>
                          <SelectItem value="politics">Politics/Social</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={generateOutreach} disabled={isLoading} className="w-full">
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Generate with Anthropic
                  </Button>
                </CardContent>
              </Card>

              {generatedOutreach && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Outreach</CardTitle>
                    <CardDescription>Review and customize before sending</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Email Subject</Label>
                      <p className="font-medium">{generatedOutreach.email_subject}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email Body</Label>
                      <ScrollArea className="h-40 border rounded-md p-3">
                        <p className="text-sm whitespace-pre-wrap">{generatedOutreach.email_body}</p>
                      </ScrollArea>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Instagram DM</Label>
                      <p className="text-sm">{generatedOutreach.instagram_dm}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Best Time to Send</Label>
                      <p className="text-sm">{generatedOutreach.best_time_to_send}</p>
                    </div>
                    <Button onClick={saveOutreach} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Save to Outreach History
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Outreach History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outreachHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.journalist_contacts?.full_name || '-'}</TableCell>
                          <TableCell className="capitalize">{item.outreach_type}</TableCell>
                          <TableCell>{item.subject_line || item.message_summary?.substring(0, 50)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              item.status === 'success' ? 'default' :
                              item.status === 'replied' ? 'default' :
                              item.status === 'sent' ? 'secondary' : 'outline'
                            }>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(item.outreach_date).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEGMENTS TAB */}
          <TabsContent value="segments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Segments</CardTitle>
                <CardDescription>Create and manage contact lists for targeted outreach</CardDescription>
              </CardHeader>
              <CardContent>
                {segments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListFilter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No segments created yet</p>
                    <p className="text-sm">Use filters in Contacts tab and save as segment</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contacts</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {segments.map((seg) => (
                        <TableRow key={seg.id}>
                          <TableCell className="font-medium">{seg.name}</TableCell>
                          <TableCell className="capitalize">{seg.segment_type}</TableCell>
                          <TableCell>{seg.contact_ids?.length || 0}</TableCell>
                          <TableCell>{new Date(seg.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agent Configuration</CardTitle>
                <CardDescription>Manage scoring logic, defaults, and refresh schedules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Default Region</Label>
                    <Select defaultValue="europe">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="north_america">North America</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Min Authority Score</Label>
                    <Input type="number" defaultValue={30} min={0} max={100} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Weekly Refresh</h4>
                  <div className="flex items-center gap-4">
                    <Button onClick={runWeeklyRefresh} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Run Weekly Refresh Now
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Verifies top 200 contacts, updates roles and activity status
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Audit Log</h4>
                  <Button variant="outline" onClick={fetchAuditLog}>
                    <Clock className="h-4 w-4 mr-2" />
                    View Scrape Audit Log
                  </Button>
                  {auditLog.length > 0 && (
                    <ScrollArea className="h-48 mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Records</TableHead>
                            <TableHead>Models</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditLog.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="capitalize">{log.action}</TableCell>
                              <TableCell>{log.records_affected}</TableCell>
                              <TableCell>{(log.models_used || []).join(', ')}</TableCell>
                              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
