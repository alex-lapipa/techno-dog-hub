import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageSEO from '@/components/PageSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Book, FileText, Users, Shield, Scale, Heart, TrendingUp, 
  Settings, RefreshCw, Search, Copy, Download, MessageSquare,
  CheckCircle, AlertCircle, Clock, Loader2, Plus, Eye
} from 'lucide-react';

const SECTION_KEYS = [
  { key: 'philosophy', label: 'Philosophy & Principles', icon: Book },
  { key: 'governance', label: 'Governance & Roles', icon: Users },
  { key: 'contribution', label: 'Contribution Workflows', icon: FileText },
  { key: 'code_of_conduct', label: 'Code of Conduct', icon: Shield },
  { key: 'licensing', label: 'Licensing & IP', icon: Scale },
  { key: 'rituals', label: 'Community Rituals', icon: Heart },
  { key: 'sustainability', label: 'Sustainability & Funding', icon: TrendingUp },
  { key: 'metrics', label: 'Community Health Metrics', icon: TrendingUp }
];

const TEMPLATE_TYPES = [
  'issue_template', 'PR_template', 'RFC', 'meeting_notes', 
  'contributor_onboarding', 'code_review', 'content_submission', 
  'release_notes', 'incident_report'
];

const PlaybookAgentAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [sections, setSections] = useState<any[]>([]);
  const [principles, setPrinciples] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [governance, setGovernance] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [question, setQuestion] = useState('');
  const [auditContext, setAuditContext] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);

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
    setLoading(true);
    try {
      const [
        sectionsRes,
        principlesRes,
        templatesRes,
        policiesRes,
        decisionsRes,
        metricsRes,
        governanceRes,
        workflowsRes,
        runsRes
      ] = await Promise.all([
        supabase.from('playbook_sections').select('*').order('section_key'),
        supabase.from('principles_values').select('*').order('principle_name'),
        supabase.from('templates_assets').select('*').order('template_name'),
        supabase.from('policies').select('*').order('policy_name'),
        supabase.from('decision_records').select('*').order('created_at', { ascending: false }),
        supabase.from('community_health_metrics').select('*').order('metric_name'),
        supabase.from('governance_models').select('*').order('model_name'),
        supabase.from('processes_workflows').select('*').order('workflow_name'),
        supabase.from('playbook_agent_runs').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      setSections(sectionsRes.data || []);
      setPrinciples(principlesRes.data || []);
      setTemplates(templatesRes.data || []);
      setPolicies(policiesRes.data || []);
      setDecisions(decisionsRes.data || []);
      setMetrics(metricsRes.data || []);
      setGovernance(governanceRes.data || []);
      setWorkflows(workflowsRes.data || []);
      setRuns(runsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load playbook data');
    } finally {
      setLoading(false);
    }
  };

  const callAgent = async (action: string, params: any = {}) => {
    setLoading(true);
    setAiResponse(null);
    try {
      const response = await supabase.functions.invoke('playbook-agent', {
        body: { action, ...params }
      });

      if (response.error) throw response.error;
      
      setAiResponse(response.data);
      toast.success(`${action} completed successfully`);
      fetchData();
    } catch (error) {
      console.error('Agent error:', error);
      toast.error('Agent action failed');
    } finally {
      setLoading(false);
    }
  };

  const generateSection = () => {
    if (!selectedSection) {
      toast.error('Please select a section');
      return;
    }
    callAgent('generate_section', { sectionKey: selectedSection });
  };

  const generateTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template type');
      return;
    }
    callAgent('generate_template', { templateType: selectedTemplate });
  };

  const askPlaybook = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    callAgent('ask_playbook', { question });
  };

  const auditPractices = () => {
    callAgent('audit_practices', { context: auditContext || 'Current project state' });
  };

  const refreshPlaybook = () => {
    callAgent('refresh_playbook');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportPlaybook = () => {
    const playbook = {
      sections,
      principles,
      policies,
      templates,
      governance,
      workflows,
      metrics,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(playbook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techno-doc-playbook-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Playbook exported');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Draft</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-500/20 text-blue-400">Reviewed</Badge>;
      case 'deprecated':
        return <Badge className="bg-red-500/20 text-red-400">Deprecated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageSEO 
        title="Playbook Agent | Admin"
        description="Open-Source Operating System Playbook for Techno.doc"
        path="/admin/playbook-agent"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Book className="h-8 w-8 text-primary" />
              Open-Source Playbook Agent
            </h1>
            <p className="text-muted-foreground mt-2">
              Living handbook for community governance, contribution workflows, and open-source culture
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportPlaybook}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={refreshPlaybook} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-9 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="handbook">Handbook</TabsTrigger>
            <TabsTrigger value="processes">Processes</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sections.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {sections.filter(s => s.status === 'active').length} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{templates.length}</div>
                  <p className="text-xs text-muted-foreground">Ready to use</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Policies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{policies.length}</div>
                  <p className="text-xs text-muted-foreground">Defined</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{decisions.length}</div>
                  <p className="text-xs text-muted-foreground">Recorded</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Section</CardTitle>
                  <CardDescription>Create or update a playbook section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_KEYS.map(s => (
                        <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={generateSection} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Generate Section
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ask the Playbook</CardTitle>
                  <CardDescription>Get guidance on specific situations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="What should we do when a contributor violates the code of conduct?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <Button onClick={askPlaybook} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                    Ask
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AI Response */}
            {aiResponse && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Agent Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(aiResponse, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Recent Runs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Agent Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.slice(0, 10).map(run => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{run.run_type}</TableCell>
                        <TableCell>
                          {run.status === 'completed' ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          ) : run.status === 'running' ? (
                            <Badge className="bg-blue-500/20 text-blue-400">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Running
                            </Badge>
                          ) : (
                            <Badge variant="outline">{run.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(run.started_at || run.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {run.finished_at && run.started_at 
                            ? `${Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s`
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Handbook Tab */}
          <TabsContent value="handbook">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search handbook..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Section List */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {SECTION_KEYS.map(s => {
                      const section = sections.find(sec => sec.section_key === s.key);
                      const Icon = s.icon;
                      return (
                        <Button
                          key={s.key}
                          variant={selectedContent?.section_key === s.key ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setSelectedContent(section || { section_key: s.key, section_title: s.label })}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {s.label}
                          {section && getStatusBadge(section.status)}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Content View */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedContent?.section_title || 'Select a section'}
                  </CardTitle>
                  {selectedContent && (
                    <div className="flex gap-2">
                      {getStatusBadge(selectedContent.status || 'none')}
                      {selectedContent.version_number && (
                        <Badge variant="outline">v{selectedContent.version_number}</Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedContent?.section_content_markdown ? (
                    <ScrollArea className="h-[500px]">
                      <div className="prose prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">
                          {selectedContent.section_content_markdown}
                        </pre>
                      </div>
                    </ScrollArea>
                  ) : selectedContent ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No content yet for this section</p>
                      <Button onClick={() => {
                        setSelectedSection(selectedContent.section_key);
                        generateSection();
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Content
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-12">
                      Select a section from the left to view its content
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Processes Tab */}
          <TabsContent value="processes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflows</CardTitle>
                  <CardDescription>Standard operating procedures</CardDescription>
                </CardHeader>
                <CardContent>
                  {workflows.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workflows.map(wf => (
                          <TableRow key={wf.id}>
                            <TableCell className="font-medium">{wf.workflow_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{wf.workflow_category}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No workflows defined yet. Generate the "contribution" section to create workflows.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Principles & Values</CardTitle>
                </CardHeader>
                <CardContent>
                  {principles.length > 0 ? (
                    <div className="space-y-4">
                      {principles.map(p => (
                        <div key={p.id} className="border border-border rounded-lg p-4">
                          <h4 className="font-medium">{p.principle_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{p.principle_summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No principles defined yet. Generate the "philosophy" section first.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Governance Models</CardTitle>
                  <CardDescription>Evaluated governance structures</CardDescription>
                </CardHeader>
                <CardContent>
                  {governance.length > 0 ? (
                    <div className="space-y-4">
                      {governance.map(g => (
                        <div key={g.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{g.model_name}</h4>
                            {g.recommended_for_techno_doc && (
                              <Badge className="bg-green-500/20 text-green-400">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{g.description}</p>
                          {g.best_for && (
                            <p className="text-xs mt-2"><strong>Best for:</strong> {g.best_for}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No governance models analyzed yet. Generate the "governance" section.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audit Practices</CardTitle>
                  <CardDescription>Compare against open-source best practices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Describe your current practices to audit..."
                    value={auditContext}
                    onChange={(e) => setAuditContext(e.target.value)}
                    rows={5}
                  />
                  <Button onClick={auditPractices} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    Run Audit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {policies.length > 0 ? policies.map(policy => (
                <Card key={policy.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {policy.policy_name}
                    </CardTitle>
                    <Badge variant="outline">{policy.policy_type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-sm whitespace-pre-wrap">
                        {policy.policy_content_markdown || 'No content yet'}
                      </pre>
                    </ScrollArea>
                    {policy.enforcement_process && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          <strong>Enforcement:</strong> {policy.enforcement_process}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )) : (
                <Card className="col-span-2">
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No policies defined yet</p>
                    <Button onClick={() => {
                      setSelectedSection('code_of_conduct');
                      generateSection();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Code of Conduct
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Generate Template</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select template type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={generateTemplate} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {template.template_name}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(template.template_content_markdown)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                    <Badge variant="outline">{template.template_type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                        {template.template_content_markdown}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Decision Records (ADR/RFC)</CardTitle>
                <CardDescription>Architectural Decision Records and Requests for Comments</CardDescription>
              </CardHeader>
              <CardContent>
                {decisions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {decisions.map(d => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{d.decision_type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(d.status)}</TableCell>
                          <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No decision records yet. Use the RFC template to create one.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Community Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics.length > 0 ? (
                    <div className="space-y-4">
                      {metrics.map(m => (
                        <div key={m.id} className="border border-border rounded-lg p-4">
                          <h4 className="font-medium">{m.metric_name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                          <p className="text-xs mt-2"><strong>How to measure:</strong> {m.how_to_measure}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No metrics defined yet. Generate the "metrics" section.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Playbook Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {SECTION_KEYS.map(s => {
                      const section = sections.find(sec => sec.section_key === s.key);
                      const hasContent = !!section?.section_content_markdown;
                      return (
                        <div key={s.key} className="flex items-center justify-between">
                          <span className="text-sm">{s.label}</span>
                          {hasContent ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Refresh Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Refresh Cadence</label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={refreshPlaybook} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" onClick={exportPlaybook} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export as Markdown (coming soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default PlaybookAgentAdmin;
