import { useState, useEffect } from 'react';
import { AdminPageLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Search, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Globe,
  Target,
  FileText,
  RefreshCw,
  Loader2,
  BarChart3,
  BookOpen,
  Lightbulb,
  Play,
  Zap,
  Calendar,
  GraduationCap,
  MessageSquare,
  ArrowRight,
  CheckSquare,
  Clock,
  AlertTriangle,
  Send,
  Sparkles
} from 'lucide-react';

interface StrategySection {
  id: string;
  section_key: string;
  section_name: string;
  description: string;
  content: string | null;
  status: string;
  last_analyzed_at: string | null;
}

interface StrategyAction {
  id: string;
  section_id: string;
  action_name: string;
  description: string;
  action_type: string;
  priority: string;
  status: string;
  estimated_impact: string;
  implementation_notes: string;
  page_target: string | null;
}

interface PageAnalysis {
  id: string;
  page_path: string;
  page_name: string;
  seo_score: number | null;
  recommendations: string[];
  last_analyzed_at: string | null;
}

interface TrainingModule {
  id: string;
  module_key: string;
  module_name: string;
  description: string;
  content: string | null;
  learning_objectives: string[];
  completion_status: string;
}

interface KeywordStrategy {
  id: string;
  keyword: string;
  keyword_type: string;
  search_volume_estimate: string;
  competition_level: string;
  target_pages: string[];
  content_strategy: string;
  status: string;
}

const SECTION_KEYS = [
  'technical_seo',
  'on_page_optimization', 
  'structured_data',
  'content_strategy',
  'keyword_strategy',
  'internal_linking',
  'local_international',
  'ga4_gtm_setup',
  'search_console',
  'performance_metrics'
];

const TRAINING_MODULES = [
  'seo_fundamentals',
  'ga4_mastery',
  'search_console_mastery',
  'content_optimization',
  'keyword_research'
];

const GoogleOrganicStrategyAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [sections, setSections] = useState<StrategySection[]>([]);
  const [actions, setActions] = useState<StrategyAction[]>([]);
  const [pageAnalysis, setPageAnalysis] = useState<PageAnalysis[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [keywords, setKeywords] = useState<KeywordStrategy[]>([]);
  
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        sectionsRes,
        actionsRes,
        pagesRes,
        modulesRes,
        keywordsRes
      ] = await Promise.all([
        supabase.from('seo_strategy_sections').select('*').order('priority'),
        supabase.from('seo_strategy_actions').select('*').order('priority'),
        supabase.from('seo_page_analysis').select('*').order('page_path'),
        supabase.from('seo_training_modules').select('*').order('module_key'),
        supabase.from('seo_keyword_strategy').select('*').order('keyword')
      ]);

      setSections(sectionsRes.data || []);
      setActions(actionsRes.data || []);
      setPageAnalysis(pagesRes.data || []);
      setTrainingModules(modulesRes.data || []);
      setKeywords(keywordsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load strategy data');
    } finally {
      setLoading(false);
    }
  };

  const callAgent = async (action: string, params: any = {}) => {
    setRunningAction(action);
    setAiResponse(null);
    try {
      const response = await supabase.functions.invoke('seo-strategy-agent', {
        body: { action, ...params }
      });

      if (response.error) throw response.error;
      
      if (response.data?.result?.answer) {
        setAiResponse(response.data.result.answer);
      }
      
      toast.success(`${action.replace('_', ' ')} completed`);
      fetchData();
      return response.data;
    } catch (error) {
      console.error('Agent error:', error);
      toast.error('Agent action failed');
    } finally {
      setRunningAction(null);
    }
  };

  const initializePlaybook = () => callAgent('initialize');
  const runFullAnalysis = () => callAgent('full_analysis');
  
  const generateSection = () => {
    if (!selectedSection) {
      toast.error('Please select a section');
      return;
    }
    callAgent('generate_section', { sectionKey: selectedSection });
  };

  const generateTraining = () => {
    if (!selectedModule) {
      toast.error('Please select a module');
      return;
    }
    callAgent('generate_training', { sectionKey: selectedModule });
  };

  const askQuestion = () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    callAgent('ask_question', { question });
  };

  const completeAction = async (actionId: string) => {
    await callAgent('complete_action', { actionId });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-crimson border-crimson/50 bg-crimson/10';
      case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'text-logo-green border-logo-green/50 bg-logo-green/10';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-logo-green" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'implement': return <Zap className="w-3 h-3" />;
      case 'audit': return <Search className="w-3 h-3" />;
      case 'optimize': return <TrendingUp className="w-3 h-3" />;
      case 'monitor': return <BarChart3 className="w-3 h-3" />;
      case 'research': return <Lightbulb className="w-3 h-3" />;
      case 'content': return <FileText className="w-3 h-3" />;
      default: return <ArrowRight className="w-3 h-3" />;
    }
  };

  const completedActions = actions.filter(a => a.status === 'completed').length;
  const totalActions = actions.length;
  const progressPercent = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

  const pendingActions = actions.filter(a => a.status === 'pending');
  const criticalActions = pendingActions.filter(a => a.priority === 'critical');
  const highActions = pendingActions.filter(a => a.priority === 'high');

  return (
    <AdminPageLayout
      title="Google Organic Traffic Strategy"
      description="Comprehensive SEO playbook & training center for Alex — powered by Google Gemini AI"
      icon={Globe}
      iconColor="text-logo-green"
      onRefresh={fetchData}
      onRunAgent={runFullAnalysis}
      isLoading={loading}
      isRunning={!!runningAction}
      runButtonText="Full Analysis"
      actions={
        <Button 
          variant="outline" 
          size="sm" 
          className="font-mono text-xs uppercase"
          onClick={initializePlaybook}
          disabled={!!runningAction}
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Initialize
        </Button>
      }
    >
      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-logo-green" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Progress</div>
              <div className="text-2xl font-bold font-mono text-logo-green">
                {Math.round(progressPercent)}%
              </div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-logo-green" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Completed</div>
              <div className="text-2xl font-bold font-mono">{completedActions}/{totalActions}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-crimson" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Critical</div>
              <div className="text-2xl font-bold font-mono text-crimson">{criticalActions.length}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Pages</div>
              <div className="text-2xl font-bold font-mono">{pageAnalysis.length}</div>
            </div>
          </div>
        </Card>
        <Card className="bg-zinc-900 border-border p-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground font-mono">Modules</div>
              <div className="text-2xl font-bold font-mono">{trainingModules.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card className="bg-zinc-900 border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm">Strategy Implementation Progress</span>
            <span className="font-mono text-sm text-logo-green">{completedActions} of {totalActions} actions</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="ask">Ask AI</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quick Actions */}
            <Card className="bg-zinc-900 border-border">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-logo-green" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="flex-1 font-mono text-xs">
                      <SelectValue placeholder="Select section..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTION_KEYS.map(key => (
                        <SelectItem key={key} value={key} className="font-mono text-xs">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={generateSection}
                    disabled={!!runningAction}
                    className="font-mono text-xs"
                  >
                    {runningAction === 'generate_section' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger className="flex-1 font-mono text-xs">
                      <SelectValue placeholder="Select training module..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAINING_MODULES.map(key => (
                        <SelectItem key={key} value={key} className="font-mono text-xs">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={generateTraining}
                    disabled={!!runningAction}
                    variant="outline"
                    className="font-mono text-xs"
                  >
                    {runningAction === 'generate_training' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <GraduationCap className="w-3 h-3 mr-1" />
                        Train
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Critical Actions */}
            <Card className="bg-zinc-900 border-crimson/30">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2 text-crimson">
                  <AlertTriangle className="w-4 h-4" />
                  Critical Actions ({criticalActions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {criticalActions.length === 0 ? (
                      <p className="text-xs text-muted-foreground font-mono">
                        No critical actions. Run Full Analysis to generate.
                      </p>
                    ) : (
                      criticalActions.slice(0, 5).map(action => (
                        <div key={action.id} className="flex items-center justify-between p-2 bg-crimson/10 border border-crimson/20 rounded">
                          <span className="text-xs font-mono truncate flex-1">{action.action_name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => completeAction(action.id)}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* High Priority Actions */}
          <Card className="bg-zinc-900 border-orange-500/30">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2 text-orange-500">
                <TrendingUp className="w-4 h-4" />
                High Priority Actions ({highActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {highActions.length === 0 ? (
                    <p className="text-xs text-muted-foreground font-mono">
                      No high priority actions yet.
                    </p>
                  ) : (
                    highActions.map(action => (
                      <div key={action.id} className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getActionTypeIcon(action.action_type)}
                            <span className="text-sm font-mono">{action.action_name}</span>
                          </div>
                          {action.page_target && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Target: {action.page_target}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-3 font-mono text-xs"
                          onClick={() => completeAction(action.id)}
                        >
                          Complete
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(section => {
              const sectionContent = section.content ? JSON.parse(section.content) : null;
              const sectionActions = actions.filter(a => a.section_id === section.id);
              
              return (
                <Card key={section.id} className="bg-zinc-900 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-mono text-sm">{section.section_name}</CardTitle>
                      <Badge variant="outline" className={section.status === 'active' ? 'text-logo-green' : ''}>
                        {section.status}
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sectionContent ? (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="overview">
                          <AccordionTrigger className="font-mono text-xs">Overview</AccordionTrigger>
                          <AccordionContent className="text-xs text-muted-foreground">
                            {sectionContent.overview || 'No overview generated yet.'}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="practices">
                          <AccordionTrigger className="font-mono text-xs">Best Practices</AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-1">
                              {sectionContent.bestPractices?.map((practice: string, i: number) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 mt-0.5 text-logo-green flex-shrink-0" />
                                  {practice}
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="actions">
                          <AccordionTrigger className="font-mono text-xs">
                            Actions ({sectionActions.length})
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {sectionActions.slice(0, 5).map(action => (
                                <div key={action.id} className="flex items-center justify-between p-2 border border-border rounded">
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(action.status)}
                                    <span className="text-xs font-mono">{action.action_name}</span>
                                  </div>
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(action.priority)}`}>
                                    {action.priority}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground font-mono mb-3">
                          No content generated yet
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-mono text-xs"
                          onClick={() => {
                            setSelectedSection(section.section_key);
                            callAgent('generate_section', { sectionKey: section.section_key });
                          }}
                          disabled={!!runningAction}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generate Content
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <Card className="bg-zinc-900 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm">All Action Items</CardTitle>
              <CardDescription className="font-mono text-xs">
                Actionable SEO tasks organized by priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {actions.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-mono text-center py-8">
                      No actions yet. Run Full Analysis or generate strategy sections.
                    </p>
                  ) : (
                    actions.map(action => (
                      <div 
                        key={action.id} 
                        className={`p-4 border rounded transition-colors ${
                          action.status === 'completed' 
                            ? 'bg-logo-green/5 border-logo-green/20' 
                            : 'border-border hover:border-foreground/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(action.status)}
                              <span className="font-mono text-sm font-medium">{action.action_name}</span>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(action.priority)}`}>
                                {action.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getActionTypeIcon(action.action_type)}
                                <span className="ml-1">{action.action_type}</span>
                              </Badge>
                            </div>
                            {action.description && (
                              <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                            )}
                            {action.page_target && (
                              <span className="text-xs font-mono text-logo-green">
                                Target: {action.page_target}
                              </span>
                            )}
                            {action.estimated_impact && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Impact: {action.estimated_impact}
                              </p>
                            )}
                          </div>
                          {action.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="font-mono text-xs"
                              onClick={() => completeAction(action.id)}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card className="bg-zinc-900 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Page-by-Page Analysis</CardTitle>
              <CardDescription className="font-mono text-xs">
                SEO scores and recommendations for each page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {pageAnalysis.map(page => (
                    <div key={page.id} className="p-4 border border-border rounded hover:border-foreground/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-mono text-sm font-medium">{page.page_name}</span>
                          <span className="font-mono text-xs text-muted-foreground ml-2">{page.page_path}</span>
                        </div>
                        {page.seo_score !== null && (
                          <Badge variant="outline" className={`font-mono ${
                            page.seo_score >= 80 ? 'text-logo-green' :
                            page.seo_score >= 60 ? 'text-yellow-500' : 'text-crimson'
                          }`}>
                            Score: {page.seo_score}
                          </Badge>
                        )}
                      </div>
                      {page.recommendations && page.recommendations.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground font-mono">Recommendations:</span>
                          <ul className="mt-1 space-y-1">
                            {page.recommendations.slice(0, 3).map((rec, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {page.last_analyzed_at && (
                        <span className="text-xs text-muted-foreground/50 font-mono mt-2 block">
                          Last analyzed: {new Date(page.last_analyzed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-4">
          <Card className="bg-zinc-900 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Keyword Strategy</CardTitle>
              <CardDescription className="font-mono text-xs">
                Target keywords and content opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {keywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-mono text-center py-8">
                      No keywords yet. Run Full Analysis to discover keyword opportunities.
                    </p>
                  ) : (
                    keywords.map(kw => (
                      <div key={kw.id} className="p-4 border border-border rounded hover:border-foreground/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-medium">{kw.keyword}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{kw.keyword_type}</Badge>
                            <Badge variant="outline" className={`text-xs ${
                              kw.competition_level === 'low' ? 'text-logo-green' :
                              kw.competition_level === 'medium' ? 'text-yellow-500' : 'text-crimson'
                            }`}>
                              {kw.competition_level}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Est. Volume: {kw.search_volume_estimate}
                        </p>
                        {kw.content_strategy && (
                          <p className="text-xs text-muted-foreground">
                            Strategy: {kw.content_strategy}
                          </p>
                        )}
                        {kw.target_pages && kw.target_pages.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {kw.target_pages.map((page, i) => (
                              <Badge key={i} variant="outline" className="text-xs font-mono">
                                {page}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingModules.map(module => {
              const moduleContent = module.content ? JSON.parse(module.content) : null;
              
              return (
                <Card key={module.id} className="bg-zinc-900 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-mono text-sm flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-logo-green" />
                        {module.module_name}
                      </CardTitle>
                      <Badge variant="outline" className={
                        module.completion_status === 'completed' ? 'text-logo-green' :
                        module.completion_status === 'in_progress' ? 'text-yellow-500' : ''
                      }>
                        {module.completion_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {module.learning_objectives && (
                      <div className="mb-4">
                        <span className="text-xs text-muted-foreground font-mono">Learning Objectives:</span>
                        <ul className="mt-1 space-y-1">
                          {module.learning_objectives.map((obj, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <Target className="w-3 h-3 mt-0.5 text-logo-green flex-shrink-0" />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {moduleContent ? (
                      <Accordion type="single" collapsible>
                        <AccordionItem value="intro">
                          <AccordionTrigger className="font-mono text-xs">Introduction</AccordionTrigger>
                          <AccordionContent className="text-xs text-muted-foreground">
                            {moduleContent.introduction}
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="concepts">
                          <AccordionTrigger className="font-mono text-xs">Key Concepts</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {moduleContent.keyConcepts?.map((concept: any, i: number) => (
                                <div key={i} className="p-2 bg-background/50 rounded">
                                  <span className="text-xs font-mono font-medium">{concept.concept}</span>
                                  <p className="text-xs text-muted-foreground mt-1">{concept.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="exercises">
                          <AccordionTrigger className="font-mono text-xs">Exercises</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              {moduleContent.exercises?.map((exercise: any, i: number) => (
                                <div key={i} className="p-2 border border-logo-green/20 rounded">
                                  <span className="text-xs font-mono font-medium text-logo-green">{exercise.title}</span>
                                  <p className="text-xs text-muted-foreground mt-1">{exercise.description}</p>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <div className="text-center py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-mono text-xs"
                          onClick={() => {
                            setSelectedModule(module.module_key);
                            callAgent('generate_training', { sectionKey: module.module_key });
                          }}
                          disabled={!!runningAction}
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Generate Training
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Ask AI Tab */}
        <TabsContent value="ask" className="space-y-4">
          <Card className="bg-zinc-900 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-logo-green" />
                Ask the SEO Strategy AI
              </CardTitle>
              <CardDescription className="font-mono text-xs">
                Get personalized answers about SEO, GA4, GTM, and Search Console for techno.dog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask about SEO strategy, GA4 setup, keyword opportunities, or any SEO question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="font-mono text-sm min-h-[100px]"
                />
              </div>
              <Button 
                onClick={askQuestion}
                disabled={!!runningAction || !question.trim()}
                className="font-mono text-xs"
              >
                {runningAction === 'ask_question' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask Question
                  </>
                )}
              </Button>
              
              {aiResponse && (
                <Card className="bg-background/50 border-logo-green/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-logo-green flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-foreground whitespace-pre-wrap font-mono">
                        {aiResponse}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Example Questions */}
          <Card className="bg-zinc-900 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm">Example Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "What's the best title tag format for artist pages?",
                  "How should I set up GA4 conversion tracking for the store?",
                  "What structured data should I add to festival pages?",
                  "How can I improve internal linking for the gear section?",
                  "What keywords should I target for the Berlin techno scene?",
                  "How do I set up Search Console for techno.dog?"
                ].map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="justify-start font-mono text-xs h-auto py-2 px-3 text-left"
                    onClick={() => setQuestion(q)}
                  >
                    <Lightbulb className="w-3 h-3 mr-2 flex-shrink-0 text-logo-green" />
                    <span className="truncate">{q}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default GoogleOrganicStrategyAdmin;
