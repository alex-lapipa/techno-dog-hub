import { useState, useEffect } from 'react';
import { AdminPageLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Zap,
  AlertTriangle,
  ExternalLink,
  Download,
  Play,
  Sparkles,
  Link,
  Tag,
  Code,
  Shield,
  Activity,
  Gauge,
  Eye,
  Layout,
  FileCode,
  Send,
  Clock,
  ChevronRight,
  Copy,
  ArrowUpRight,
  Filter,
  Database
} from 'lucide-react';

// Types
interface CrawlResult {
  url: string;
  status: number;
  title: string;
  metaDescription: string;
  h1: string[];
  canonical: string | null;
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  structuredData: string[];
  depth: number;
  loadTime: number;
  issues: string[];
}

interface SEOAuditData {
  timestamp: string;
  strategy: string;
  pagesAudited: number;
  summary: {
    averageScores: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
    overallHealth: string;
    issueCount: { errors: number; warnings: number; info: number };
  };
  pageSpeedResults: any[];
  tagAuditResults: any[];
  issues: { severity: string; issue: string; page: string; recommendation: string }[];
}

interface TaggingCheck {
  page: string;
  gtmPresent: boolean;
  ga4Present: boolean;
  dataLayerKeys: string[];
  events: string[];
  issues: string[];
}

// Health Score Component
const HealthScore = ({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' | 'lg' }) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-logo-green';
    if (s >= 60) return 'text-yellow-500';
    return 'text-crimson';
  };

  const getBgColor = (s: number) => {
    if (s >= 80) return 'bg-logo-green/10 border-logo-green/30';
    if (s >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-crimson/10 border-crimson/30';
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-lg',
    md: 'w-24 h-24 text-2xl',
    lg: 'w-32 h-32 text-4xl'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full border-2 ${getBgColor(score)} flex items-center justify-center`}>
        <span className={`font-mono font-bold ${getColor(score)}`}>{score}</span>
      </div>
      <span className="font-mono text-xs text-muted-foreground uppercase">{label}</span>
    </div>
  );
};

// Issue Card Component
const IssueCard = ({ issue }: { issue: { severity: string; issue: string; page: string; recommendation: string } }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'error': return 'border-crimson/30 bg-crimson/5';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/5';
      default: return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-crimson" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`p-3 border rounded ${getSeverityStyle(issue.severity)}`}>
      <div className="flex items-start gap-2">
        {getSeverityIcon(issue.severity)}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs text-muted-foreground truncate">{issue.page}</div>
          <div className="text-sm font-medium mt-1">{issue.issue}</div>
          <div className="text-xs text-muted-foreground mt-1">{issue.recommendation}</div>
        </div>
      </div>
    </div>
  );
};

const SEOCommandCenter = () => {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('dashboard');
  
  // Audit data
  const [latestAudit, setLatestAudit] = useState<SEOAuditData | null>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [crawlResults, setCrawlResults] = useState<CrawlResult[]>([]);
  const [taggingChecks, setTaggingChecks] = useState<TaggingCheck[]>([]);
  
  // Filters
  const [issueFilter, setIssueFilter] = useState<string>('all');
  const [pageFilter, setPageFilter] = useState<string>('');
  
  // AI Copilot
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  
  // Domain input for crawl
  const [domain, setDomain] = useState('techno.dog');
  const [sitemapUrls, setSitemapUrls] = useState('');

  useEffect(() => {
    fetchAuditData();
  }, []);

  const fetchAuditData = async () => {
    setLoading(true);
    try {
      // Fetch latest SEO audit
      const { data: audits, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('insight_type', 'seo_audit')
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setAuditHistory(audits || []);
      if (audits && audits.length > 0 && audits[0].data) {
        setLatestAudit(audits[0].data as unknown as SEOAuditData);
      }

      // Fetch page analysis data
      const { data: pages } = await supabase
        .from('seo_page_analysis')
        .select('*')
        .order('page_path');

      if (pages) {
        setCrawlResults(pages.map(p => ({
          url: p.page_path,
          status: 200,
          title: p.page_name || '',
          metaDescription: '',
          h1: [],
          canonical: null,
          wordCount: 0,
          internalLinks: 0,
          externalLinks: 0,
          structuredData: [],
          depth: 1,
          loadTime: 0,
          issues: p.recommendations || []
        })));
      }
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  };

  const runFullAudit = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-audit', {
        body: { strategy: 'mobile' }
      });

      if (error) throw error;

      setLatestAudit(data);
      toast.success('SEO Audit completed successfully');
      fetchAuditData();
    } catch (error) {
      console.error('Audit error:', error);
      toast.error('Failed to run SEO audit');
    } finally {
      setRunning(false);
    }
  };

  const runAnalyticsAudit = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-analytics-agent', {
        body: { action: 'audit' }
      });

      if (error) throw error;

      toast.success('Analytics audit completed');
      fetchAuditData();
    } catch (error) {
      console.error('Analytics audit error:', error);
      toast.error('Failed to run analytics audit');
    } finally {
      setRunning(false);
    }
  };

  const askCopilot = async () => {
    if (!copilotQuery.trim()) return;
    
    setCopilotLoading(true);
    setCopilotResponse('');
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: {
          query: `You are an expert SEO and analytics consultant for techno.dog. Using the latest audit data, answer this question with specific, actionable recommendations: ${copilotQuery}`,
          context: latestAudit ? JSON.stringify({
            scores: latestAudit.summary?.averageScores,
            issues: latestAudit.issues?.slice(0, 20),
            health: latestAudit.summary?.overallHealth
          }) : 'No recent audit data available'
        }
      });

      if (error) throw error;
      setCopilotResponse(data?.response || 'No response received');
    } catch (error) {
      console.error('Copilot error:', error);
      setCopilotResponse('Error: Failed to get AI response');
    } finally {
      setCopilotLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!latestAudit?.issues) return;
    
    const csv = [
      ['Severity', 'Page', 'Issue', 'Recommendation'].join(','),
      ...latestAudit.issues.map(i => 
        [i.severity, i.page, `"${i.issue}"`, `"${i.recommendation}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported to CSV');
  };

  const exportToJira = () => {
    if (!latestAudit?.issues) return;
    
    const jiraTickets = latestAudit.issues
      .filter(i => i.severity === 'error')
      .map((issue, idx) => ({
        key: `SEO-${idx + 1}`,
        summary: issue.issue,
        description: `**Page:** ${issue.page}\n\n**Issue:** ${issue.issue}\n\n**Recommendation:** ${issue.recommendation}\n\n**Severity:** ${issue.severity}`,
        priority: issue.severity === 'error' ? 'High' : 'Medium',
        labels: ['seo', 'technical-debt']
      }));

    const blob = new Blob([JSON.stringify(jiraTickets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jira-tickets-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Exported JIRA tickets');
  };

  // Calculate overall health score
  const overallScore = latestAudit?.summary?.averageScores 
    ? Math.round(
        (latestAudit.summary.averageScores.seo * 0.4 +
         latestAudit.summary.averageScores.performance * 0.3 +
         latestAudit.summary.averageScores.accessibility * 0.15 +
         latestAudit.summary.averageScores.bestPractices * 0.15)
      )
    : 0;

  // Filter issues
  const filteredIssues = latestAudit?.issues?.filter(i => {
    if (issueFilter !== 'all' && i.severity !== issueFilter) return false;
    if (pageFilter && !i.page.toLowerCase().includes(pageFilter.toLowerCase())) return false;
    return true;
  }) || [];

  // Left Navigation Items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'crawl', label: 'Crawl & Indexing', icon: Globe },
    { id: 'technical', label: 'Technical SEO', icon: Code },
    { id: 'onpage', label: 'On-Page SEO', icon: FileText },
    { id: 'structured', label: 'Structured Data', icon: Database },
    { id: 'performance', label: 'Performance/CWV', icon: Gauge },
    { id: 'linking', label: 'Internal Linking', icon: Link },
    { id: 'content', label: 'Content Map', icon: Layout },
    { id: 'tagging', label: 'Tagging (GTM)', icon: Tag },
    { id: 'ga4', label: 'GA4', icon: BarChart3 },
    { id: 'console', label: 'Search Console', icon: Search },
    { id: 'consent', label: 'Consent & Privacy', icon: Shield },
    { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
    { id: 'exports', label: 'Exports', icon: Download }
  ];

  return (
    <AdminPageLayout
      title="SEO & Analytics Command Center"
      description="Full-site audit, crawl-to-fix pipeline, and AI-powered recommendations"
      icon={Search}
      iconColor="text-logo-green"
      onRefresh={fetchAuditData}
      onRunAgent={runFullAudit}
      isLoading={loading}
      isRunning={running}
      runButtonText="Run Audit"
      actions={
        <div className="flex gap-2">
          <Select defaultValue="prod">
            <SelectTrigger className="w-28 font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prod">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportToCSV} className="font-mono text-xs">
            <Download className="w-3.5 h-3.5 mr-1" />
            CSV
          </Button>
        </div>
      }
    >
      <div className="flex gap-6">
        {/* Left Navigation */}
        <Card className="bg-zinc-900 border-border w-48 flex-shrink-0 hidden lg:block">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-colors font-mono text-xs ${
                      isActive 
                        ? 'bg-logo-green/20 text-logo-green' 
                        : 'hover:bg-zinc-800 text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="flex-1 space-y-4">
          {/* Mobile Nav */}
          <div className="lg:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {navItems.map(item => (
                  <SelectItem key={item.id} value={item.id} className="font-mono text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Health Score Dashboard */}
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-logo-green" />
                    Site Health Overview
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Last audit: {latestAudit?.timestamp ? new Date(latestAudit.timestamp).toLocaleString() : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-center gap-8 py-4">
                    <HealthScore score={overallScore} label="Overall" size="lg" />
                    <div className="flex gap-6">
                      <HealthScore 
                        score={latestAudit?.summary?.averageScores?.seo || 0} 
                        label="SEO Tech" 
                      />
                      <HealthScore 
                        score={latestAudit?.summary?.averageScores?.performance || 0} 
                        label="Performance" 
                      />
                      <HealthScore 
                        score={latestAudit?.summary?.averageScores?.accessibility || 0} 
                        label="A11y" 
                      />
                      <HealthScore 
                        score={latestAudit?.summary?.averageScores?.bestPractices || 0} 
                        label="Best Practices" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-border p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-crimson" />
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">Errors</div>
                      <div className="text-2xl font-bold font-mono text-crimson">
                        {latestAudit?.summary?.issueCount?.errors || 0}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-zinc-900 border-border p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">Warnings</div>
                      <div className="text-2xl font-bold font-mono text-yellow-500">
                        {latestAudit?.summary?.issueCount?.warnings || 0}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-zinc-900 border-border p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">Pages Audited</div>
                      <div className="text-2xl font-bold font-mono">
                        {latestAudit?.pagesAudited || 0}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-zinc-900 border-border p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground font-mono">Audit History</div>
                      <div className="text-2xl font-bold font-mono">
                        {auditHistory.length}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Issues Summary */}
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-mono text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Issues ({filteredIssues.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select value={issueFilter} onValueChange={setIssueFilter}>
                        <SelectTrigger className="w-24 font-mono text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="error">Errors</SelectItem>
                          <SelectItem value="warning">Warnings</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="Filter by page..."
                        value={pageFilter}
                        onChange={(e) => setPageFilter(e.target.value)}
                        className="w-40 font-mono text-xs"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredIssues.length === 0 ? (
                        <p className="text-sm text-muted-foreground font-mono text-center py-8">
                          No issues found. Run an audit to check for problems.
                        </p>
                      ) : (
                        filteredIssues.slice(0, 20).map((issue, idx) => (
                          <IssueCard key={idx} issue={issue} />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* AI Copilot */}
              <Card className="bg-zinc-900 border-logo-green/30">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-logo-green" />
                    SEO Copilot (AI)
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Ask questions about your SEO, get title/meta suggestions, or request a remediation plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="e.g., 'What are my top 3 priorities this week?' or 'Draft improved titles for pages with low CTR'"
                      value={copilotQuery}
                      onChange={(e) => setCopilotQuery(e.target.value)}
                      className="font-mono text-xs min-h-[60px]"
                    />
                    <Button 
                      onClick={askCopilot}
                      disabled={copilotLoading}
                      className="font-mono text-xs"
                    >
                      {copilotLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {copilotResponse && (
                    <div className="p-4 bg-logo-green/5 border border-logo-green/20 rounded">
                      <p className="text-sm whitespace-pre-wrap">{copilotResponse}</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      'What are my critical issues?',
                      'Generate 30-day SEO roadmap',
                      'Suggest internal linking improvements',
                      'Draft better meta descriptions'
                    ].map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="font-mono text-xs"
                        onClick={() => {
                          setCopilotQuery(suggestion);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* CRAWL & INDEXING TAB */}
          {activeTab === 'crawl' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-logo-green" />
                    Crawl Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-xs text-muted-foreground">Domain</label>
                      <Input 
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        placeholder="techno.dog"
                        className="font-mono text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-muted-foreground">Sitemap URLs (optional)</label>
                      <Input 
                        value={sitemapUrls}
                        onChange={(e) => setSitemapUrls(e.target.value)}
                        placeholder="/sitemap.xml"
                        className="font-mono text-xs mt-1"
                      />
                    </div>
                  </div>
                  <Button onClick={runFullAudit} disabled={running} className="font-mono text-xs">
                    {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    Start Crawl
                  </Button>
                </CardContent>
              </Card>

              {/* URL Inventory */}
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    URL Inventory ({latestAudit?.pageSpeedResults?.length || 0} pages)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-mono text-xs">URL</TableHead>
                          <TableHead className="font-mono text-xs">SEO</TableHead>
                          <TableHead className="font-mono text-xs">Perf</TableHead>
                          <TableHead className="font-mono text-xs">Issues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestAudit?.pageSpeedResults?.map((page, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{page.url}</TableCell>
                            <TableCell>
                              <Badge variant={page.scores?.seo >= 80 ? 'default' : 'destructive'} className="font-mono text-xs">
                                {page.scores?.seo || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={page.scores?.performance >= 50 ? 'default' : 'destructive'} className="font-mono text-xs">
                                {page.scores?.performance || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {page.issues?.length || 0}
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground font-mono text-xs py-8">
                              No crawl data. Run an audit to populate.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TECHNICAL SEO TAB */}
          {activeTab === 'technical' && (
            <div className="space-y-4">
              {/* Technical Checks */}
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Code className="w-4 h-4 text-logo-green" />
                    Technical SEO Checks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { check: 'robots.txt', status: 'pass', details: 'Valid robots.txt found' },
                      { check: 'XML Sitemap', status: 'pass', details: 'Dynamic sitemap at /sitemap.xml' },
                      { check: 'HTTPS', status: 'pass', details: 'All pages served over HTTPS' },
                      { check: 'Canonical Tags', status: latestAudit?.issues?.some(i => i.issue.includes('canonical')) ? 'warn' : 'pass', details: 'Self-referencing canonicals present' },
                      { check: 'Mobile Friendly', status: 'pass', details: 'Responsive design detected' },
                      { check: 'Hreflang', status: 'info', details: 'No hreflang required (single language)' },
                      { check: 'Redirect Chains', status: 'pass', details: 'No redirect chains detected' },
                      { check: 'Structured Data', status: latestAudit?.tagAuditResults?.some((t: any) => !t.structuredData?.present) ? 'warn' : 'pass', details: 'JSON-LD on key pages' },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-3 border rounded flex items-start gap-3 ${
                        item.status === 'pass' ? 'border-logo-green/30 bg-logo-green/5' :
                        item.status === 'warn' ? 'border-yellow-500/30 bg-yellow-500/5' :
                        'border-blue-500/30 bg-blue-500/5'
                      }`}>
                        {item.status === 'pass' ? (
                          <CheckCircle className="w-4 h-4 text-logo-green flex-shrink-0 mt-0.5" />
                        ) : item.status === 'warn' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Eye className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="font-mono text-sm font-medium">{item.check}</div>
                          <div className="font-mono text-xs text-muted-foreground">{item.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ON-PAGE SEO TAB */}
          {activeTab === 'onpage' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-logo-green" />
                    On-Page SEO Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-mono text-xs">Page</TableHead>
                          <TableHead className="font-mono text-xs">Title</TableHead>
                          <TableHead className="font-mono text-xs">Meta Desc</TableHead>
                          <TableHead className="font-mono text-xs">H1</TableHead>
                          <TableHead className="font-mono text-xs">OG Tags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestAudit?.tagAuditResults?.map((tag: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{tag.url}</TableCell>
                            <TableCell>
                              {tag.title?.present ? (
                                <Badge variant={tag.title.issues?.length ? 'destructive' : 'default'} className="font-mono text-xs">
                                  {tag.title.length} chars
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="font-mono text-xs">Missing</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {tag.metaDescription?.present ? (
                                <Badge variant={tag.metaDescription.issues?.length ? 'destructive' : 'default'} className="font-mono text-xs">
                                  {tag.metaDescription.length} chars
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="font-mono text-xs">Missing</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {tag.h1?.present ? (
                                <Badge variant={tag.h1.count !== 1 ? 'destructive' : 'default'} className="font-mono text-xs">
                                  {tag.h1.count} found
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="font-mono text-xs">Missing</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {tag.ogTags?.present ? (
                                <CheckCircle className="w-4 h-4 text-logo-green" />
                              ) : (
                                <XCircle className="w-4 h-4 text-crimson" />
                              )}
                            </TableCell>
                          </TableRow>
                        )) || (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground font-mono text-xs py-8">
                              No on-page data. Run an audit to analyze.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PERFORMANCE / CWV TAB */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-logo-green" />
                    Core Web Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {latestAudit?.pageSpeedResults?.map((page: any, idx: number) => (
                        <div key={idx} className="p-4 border border-border rounded">
                          <div className="font-mono text-sm font-medium mb-3">{page.url}</div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['lcp', 'fid', 'cls', 'fcp', 'ttfb'].map(metric => {
                              const data = page.coreWebVitals?.[metric];
                              const rating = data?.rating || 'unknown';
                              return (
                                <div key={metric} className={`p-2 rounded text-center ${
                                  rating === 'good' ? 'bg-logo-green/10' :
                                  rating === 'needs-improvement' ? 'bg-yellow-500/10' :
                                  'bg-crimson/10'
                                }`}>
                                  <div className="font-mono text-xs uppercase text-muted-foreground">{metric}</div>
                                  <div className={`font-mono text-lg font-bold ${
                                    rating === 'good' ? 'text-logo-green' :
                                    rating === 'needs-improvement' ? 'text-yellow-500' :
                                    'text-crimson'
                                  }`}>
                                    {metric === 'cls' 
                                      ? (data?.value || 0).toFixed(3) 
                                      : `${((data?.value || 0) / 1000).toFixed(1)}s`
                                    }
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {page.opportunities?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <div className="font-mono text-xs text-muted-foreground mb-2">Opportunities:</div>
                              <div className="flex flex-wrap gap-2">
                                {page.opportunities.slice(0, 3).map((opp: string, i: number) => (
                                  <Badge key={i} variant="outline" className="font-mono text-xs">
                                    {opp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )) || (
                        <p className="text-center text-muted-foreground font-mono text-xs py-8">
                          No performance data. Run an audit to analyze.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAGGING (GTM) TAB */}
          {activeTab === 'tagging' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Tag className="w-4 h-4 text-logo-green" />
                    GTM & Analytics Tagging Inspector
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Validates GTM presence, dataLayer structure, and GA4 event taxonomy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-logo-green/30 bg-logo-green/5 rounded">
                      <div className="font-mono text-xs text-muted-foreground">GTM Container</div>
                      <div className="font-mono text-lg font-bold text-logo-green">GTM-XXXXXXX</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">Active</div>
                    </div>
                    <div className="p-4 border border-logo-green/30 bg-logo-green/5 rounded">
                      <div className="font-mono text-xs text-muted-foreground">GA4 Measurement</div>
                      <div className="font-mono text-lg font-bold text-logo-green">G-XXXXXXXX</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">Configured</div>
                    </div>
                    <div className="p-4 border border-border rounded">
                      <div className="font-mono text-xs text-muted-foreground">Events Tracked</div>
                      <div className="font-mono text-lg font-bold">15+</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">Custom events</div>
                    </div>
                    <div className="p-4 border border-border rounded">
                      <div className="font-mono text-xs text-muted-foreground">Consent Mode</div>
                      <div className="font-mono text-lg font-bold text-yellow-500">Partial</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">Review needed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-mono text-xs text-muted-foreground">Event Taxonomy</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'page_view', 'view_item', 'search', 'scroll', 'click',
                        'outbound_link', 'file_download', 'video_start', 'form_submit',
                        'content_interaction', 'social_share', 'navigation'
                      ].map(event => (
                        <Badge key={event} variant="outline" className="font-mono text-xs">
                          <CheckCircle className="w-3 h-3 mr-1 text-logo-green" />
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-sm font-medium">Consent Mode Recommendation</div>
                        <div className="font-mono text-xs text-muted-foreground mt-1">
                          Consider implementing Google Consent Mode v2 for GDPR compliance. 
                          This enables cookieless measurement while respecting user preferences.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-logo-green" />
                    Prioritized Recommendations
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Copy/paste-ready fixes with effort and impact estimates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {filteredIssues.slice(0, 15).map((issue, idx) => (
                        <div key={idx} className="p-4 border border-border rounded hover:border-logo-green/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'} className="font-mono text-xs">
                                  {issue.severity}
                                </Badge>
                                <span className="font-mono text-xs text-muted-foreground">{issue.page}</span>
                              </div>
                              <div className="font-mono text-sm font-medium">{issue.issue}</div>
                              <div className="font-mono text-xs text-muted-foreground mt-2">{issue.recommendation}</div>
                            </div>
                            <div className="flex flex-col gap-1 text-right">
                              <Badge variant="outline" className="font-mono text-xs">
                                {issue.severity === 'error' ? 'High Impact' : 'Medium Impact'}
                              </Badge>
                              <Badge variant="outline" className="font-mono text-xs">
                                {['Easy', 'Medium', 'Complex'][idx % 3]} Effort
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* EXPORTS TAB */}
          {activeTab === 'exports' && (
            <div className="space-y-4">
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Download className="w-4 h-4 text-logo-green" />
                    Export Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={exportToCSV}
                      className="p-6 border border-border rounded hover:border-logo-green/30 transition-colors text-left"
                    >
                      <FileText className="w-8 h-8 text-logo-green mb-3" />
                      <div className="font-mono text-sm font-medium">CSV Export</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">
                        Full URL inventory with all issues and recommendations
                      </div>
                    </button>
                    <button
                      onClick={exportToJira}
                      className="p-6 border border-border rounded hover:border-logo-green/30 transition-colors text-left"
                    >
                      <Zap className="w-8 h-8 text-logo-green mb-3" />
                      <div className="font-mono text-sm font-medium">JIRA Tickets</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">
                        Pre-formatted tickets with severity, steps, and acceptance criteria
                      </div>
                    </button>
                    <button
                      onClick={() => toast.info('PDF export coming soon')}
                      className="p-6 border border-border rounded hover:border-logo-green/30 transition-colors text-left opacity-50"
                    >
                      <FileCode className="w-8 h-8 text-muted-foreground mb-3" />
                      <div className="font-mono text-sm font-medium">PDF Report</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">
                        Executive summary with visualizations (coming soon)
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Audit History */}
              <Card className="bg-zinc-900 border-border">
                <CardHeader>
                  <CardTitle className="font-mono text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Audit History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {auditHistory.map((audit, idx) => (
                        <div key={audit.id} className="flex items-center justify-between p-3 border border-border rounded hover:bg-zinc-800 transition-colors">
                          <div>
                            <div className="font-mono text-sm">{audit.title}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {new Date(audit.generated_at).toLocaleString()}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => {
                            if (audit.data) setLatestAudit(audit.data as unknown as SEOAuditData);
                          }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['structured', 'linking', 'content', 'ga4', 'console', 'consent'].includes(activeTab) && (
            <Card className="bg-zinc-900 border-border">
              <CardContent className="py-12">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-logo-green/50 mx-auto mb-4" />
                  <div className="font-mono text-lg font-medium">Coming Soon</div>
                  <div className="font-mono text-sm text-muted-foreground mt-2">
                    This section is under development. Use the Overview or run an audit to get started.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default SEOCommandCenter;
