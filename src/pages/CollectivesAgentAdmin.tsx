import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Users, MapPin, Globe, Search, RefreshCw, Download, 
  Mail, MessageSquare, Activity, Building, Music, Code, Radio,
  CheckCircle, AlertCircle, Clock, Zap, Filter, Plus
} from "lucide-react";

const COLLECTIVE_TYPES = [
  { id: 'techno_collective', label: 'Techno Collective', icon: Music },
  { id: 'sound_system', label: 'Sound System', icon: Radio },
  { id: 'open_source_collective', label: 'Open Source', icon: Code },
  { id: 'live_coding_collective', label: 'Live Coding', icon: Zap },
  { id: 'hybrid_art_tech', label: 'Art/Tech Hybrid', icon: Building },
];

const REGIONS = ['Europe', 'UK', 'North America'];

export default function CollectivesAgentAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Europe', 'UK', 'North America']);
  const [searchDepth, setSearchDepth] = useState<string>('standard');
  const [isRunning, setIsRunning] = useState(false);
  
  // Outreach state
  const [selectedCollective, setSelectedCollective] = useState<string>('');
  const [proposal, setProposal] = useState('');
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('scene-native');
  const [generatedOutreach, setGeneratedOutreach] = useState<any>(null);

  // Fetch collectives
  const { data: collectives, isLoading: collectivesLoading } = useQuery({
    queryKey: ['collectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collectives')
        .select('*')
        .order('techno_doc_fit_score', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch key people
  const { data: keyPeople } = useQuery({
    queryKey: ['collective_key_people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collective_key_people')
        .select('*, collectives(collective_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch activities
  const { data: activities } = useQuery({
    queryKey: ['collective_activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collective_activities')
        .select('*, collectives(collective_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch agent runs
  const { data: agentRuns } = useQuery({
    queryKey: ['collective_agent_runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collective_agent_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Call agent
  const callAgent = async (action: string, params: any = {}) => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('collectives-agent', {
        body: { action, params },
      });
      
      if (error) throw error;
      
      toast({
        title: "Agent completed",
        description: `Action: ${action} - ${JSON.stringify(data).slice(0, 100)}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['collectives'] });
      queryClient.invalidateQueries({ queryKey: ['collective_agent_runs'] });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Agent error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsRunning(false);
    }
  };

  // Discovery mutation
  const discoverMutation = useMutation({
    mutationFn: () => callAgent('discover', {
      regions: selectedRegions,
      collectiveTypes: selectedTypes,
      depth: searchDepth,
    }),
  });

  // Enrich mutation
  const enrichMutation = useMutation({
    mutationFn: (collectiveId: string) => callAgent('enrich', { collectiveId }),
  });

  // Generate outreach
  const generateOutreachMutation = useMutation({
    mutationFn: async () => {
      const result = await callAgent('generate_outreach', {
        collectiveId: selectedCollective,
        proposal,
        goal,
        tone,
      });
      setGeneratedOutreach(result.outreach);
      return result;
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const result = await callAgent('export', { format: 'json' });
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'collectives-export.json';
      a.click();
      return result;
    },
  });

  // Stats
  const stats = {
    total: collectives?.length || 0,
    active: collectives?.filter(c => c.status === 'active').length || 0,
    europe: collectives?.filter(c => c.region === 'Europe').length || 0,
    uk: collectives?.filter(c => c.region === 'UK').length || 0,
    northAmerica: collectives?.filter(c => c.region === 'North America').length || 0,
    keyPeopleCount: keyPeople?.length || 0,
    avgFitScore: collectives?.length 
      ? Math.round(collectives.reduce((sum, c) => sum + (c.techno_doc_fit_score || 0), 0) / collectives.length) 
      : 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'inactive': return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>;
      default: return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Uncertain</Badge>;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500/20 text-green-400">{score}</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-500/20 text-yellow-400">{score}</Badge>;
    return <Badge className="bg-red-500/20 text-red-400">{score}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-mono text-2xl uppercase tracking-tight">Collectives Intelligence Agent</h1>
            <p className="text-sm text-muted-foreground">EU/UK + North America Scene Discovery</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {isRunning ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
            {isRunning ? 'Running...' : 'Ready'}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-8 w-full mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="collectives">Collectives</TabsTrigger>
            <TabsTrigger value="people">Key People</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Collectives</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.active}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.avgFitScore}%</p>
                      <p className="text-xs text-muted-foreground">Avg Fit Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.keyPeopleCount}</p>
                      <p className="text-xs text-muted-foreground">Key Contacts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Region breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Europe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.europe}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> UK
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.uk}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> North America
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.northAmerica}</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent runs */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">Recent Agent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {agentRuns?.map((run) => (
                      <div key={run.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          {run.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : run.status === 'running' ? (
                            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-mono text-xs">{run.run_type}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(run.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Discovery Configuration</CardTitle>
                <CardDescription>Configure parameters for collective discovery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Regions */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Regions</label>
                  <div className="flex gap-4">
                    {REGIONS.map((region) => (
                      <label key={region} className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedRegions.includes(region)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRegions([...selectedRegions, region]);
                            } else {
                              setSelectedRegions(selectedRegions.filter(r => r !== region));
                            }
                          }}
                        />
                        <span className="text-sm">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Collective Types */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Collective Types</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COLLECTIVE_TYPES.map((type) => (
                      <label key={type.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded cursor-pointer hover:bg-muted/50">
                        <Checkbox
                          checked={selectedTypes.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type.id]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type.id));
                            }
                          }}
                        />
                        <type.icon className="h-4 w-4" />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Depth */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search Depth</label>
                  <Select value={searchDepth} onValueChange={setSearchDepth}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light (fast)</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="exhaustive">Exhaustive (slow)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={() => discoverMutation.mutate()}
                  disabled={discoverMutation.isPending || selectedRegions.length === 0}
                  className="w-full"
                >
                  {discoverMutation.isPending ? (
                    <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Discovering...</>
                  ) : (
                    <><Search className="h-4 w-4 mr-2" /> Start Discovery</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collectives Tab */}
          <TabsContent value="collectives" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">{collectives?.length || 0} collectives</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportMutation.mutate()}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>

            <Card className="bg-card/50 border-border/50">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fit Score</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectivesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : collectives?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No collectives found. Run discovery to get started.
                        </TableCell>
                      </TableRow>
                    ) : collectives?.map((collective) => (
                      <TableRow key={collective.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{collective.collective_name}</p>
                            {collective.website_url && (
                              <a href={collective.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                {collective.website_url.replace(/https?:\/\//, '').slice(0, 30)}...
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {collective.collective_type?.slice(0, 2).map((t: string) => (
                              <Badge key={t} variant="outline" className="text-xs">
                                {t.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{collective.city}, {collective.country}</p>
                            <p className="text-xs text-muted-foreground">{collective.region}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(collective.status)}</TableCell>
                        <TableCell>{getScoreBadge(collective.techno_doc_fit_score || 0)}</TableCell>
                        <TableCell>{getScoreBadge(collective.verification_confidence || 0)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => enrichMutation.mutate(collective.id)}
                              disabled={enrichMutation.isPending}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Key People Tab */}
          <TabsContent value="people" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Key Contacts</CardTitle>
                <CardDescription>Organizers, founders, and key people</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Collective</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keyPeople?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No key people found yet. Enrich collectives to discover contacts.
                          </TableCell>
                        </TableRow>
                      ) : keyPeople?.map((person: any) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">{person.person_name}</TableCell>
                          <TableCell>{person.role_title || '-'}</TableCell>
                          <TableCell>{person.collectives?.collective_name || '-'}</TableCell>
                          <TableCell>
                            {person.email ? (
                              <a href={`mailto:${person.email}`} className="text-primary hover:underline text-sm">
                                {person.email}
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{getScoreBadge(person.enrichment_confidence || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Activities & Events</CardTitle>
                <CardDescription>Recurring events, workshops, and releases</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {activities?.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No activities recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activities?.map((activity: any) => (
                        <div key={activity.id} className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{activity.activity_type}</Badge>
                            <span className="text-xs text-muted-foreground">{activity.frequency}</span>
                          </div>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.collectives?.collective_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Saved Segments</CardTitle>
                <CardDescription>Create and manage filtered lists</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No segments created yet.</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" /> Create Segment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outreach Tab */}
          <TabsContent value="outreach" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Generate Outreach</CardTitle>
                  <CardDescription>Create personalized collaboration pitches</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Collective</label>
                    <Select value={selectedCollective} onValueChange={setSelectedCollective}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a collective..." />
                      </SelectTrigger>
                      <SelectContent>
                        {collectives?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.collective_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Proposal</label>
                    <Textarea 
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      placeholder="Describe your collaboration idea..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Goal</label>
                    <Input 
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g., Interview, Partnership, Archive project"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scene-native">Scene Native</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={() => generateOutreachMutation.mutate()}
                    disabled={!selectedCollective || !proposal || generateOutreachMutation.isPending}
                    className="w-full"
                  >
                    {generateOutreachMutation.isPending ? (
                      <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                    ) : (
                      <><MessageSquare className="h-4 w-4 mr-2" /> Generate Outreach</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedOutreach ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {generatedOutreach.email_subject && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Email Subject</label>
                            <p className="text-sm bg-muted/30 p-2 rounded">{generatedOutreach.email_subject}</p>
                          </div>
                        )}
                        {generatedOutreach.email_body && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Email Body</label>
                            <pre className="text-sm bg-muted/30 p-2 rounded whitespace-pre-wrap">{generatedOutreach.email_body}</pre>
                          </div>
                        )}
                        {generatedOutreach.dm_text && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">DM Version</label>
                            <p className="text-sm bg-muted/30 p-2 rounded">{generatedOutreach.dm_text}</p>
                          </div>
                        )}
                        {generatedOutreach.proposal_summary && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Proposal Summary</label>
                            <p className="text-sm bg-muted/30 p-2 rounded">{generatedOutreach.proposal_summary}</p>
                          </div>
                        )}
                        {generatedOutreach.next_steps && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Next Steps</label>
                            <p className="text-sm bg-muted/30 p-2 rounded">{generatedOutreach.next_steps}</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generated outreach will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Agent Settings</CardTitle>
                <CardDescription>Configure scoring weights and refresh cadence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Activity Score Weight</label>
                    <Input type="number" defaultValue={40} min={0} max={100} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Credibility Score Weight</label>
                    <Input type="number" defaultValue={30} min={0} max={100} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fit Score Weight</label>
                    <Input type="number" defaultValue={30} min={0} max={100} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Confidence Threshold</label>
                    <Input type="number" defaultValue={50} min={0} max={100} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Refresh Cadence</label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
