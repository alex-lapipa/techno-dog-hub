import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  Map, 
  Users, 
  GitBranch, 
  Database, 
  Server, 
  Activity,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Zap,
  Shield,
  Code
} from 'lucide-react';
import { 
  sitemapSections, 
  userRoles, 
  userFlows, 
  dataTables, 
  apiEndpoints, 
  analyticsEvents,
  mermaidDiagrams,
  architectureMetadata 
} from '@/config/architecture-config';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mermaid diagram component
const MermaidDiagram = ({ chart, title }: { chart: string; title: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border border-border bg-card rounded-lg overflow-hidden">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors"
      >
        <span className="font-mono text-sm uppercase tracking-wider">{title}</span>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isExpanded && (
        <div className="p-4 border-t border-border bg-background/50">
          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap text-muted-foreground">
            {chart}
          </pre>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Render this diagram at mermaid.live or in any Mermaid-compatible viewer
          </p>
        </div>
      )}
    </div>
  );
};

const Architecture = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Core Content']));

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <PageLayout
      title="Architecture Blueprint"
      description="Complete technical blueprint for techno.dog - information architecture, user flows, system design, and data models."
      path="/architecture"
    >
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="w-8 h-8 text-logo-green" />
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-wider">
              Architecture Blueprint
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm max-w-3xl mb-6">
            Living documentation of the techno.dog platform. Information architecture, 
            user flows, system design, and data models in one place.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(architectureMetadata.stats).map(([key, value]) => (
              <div key={key} className="bg-card border border-border p-3 text-center">
                <div className="font-mono text-2xl text-logo-green">{value}</div>
                <div className="font-mono text-xs text-muted-foreground uppercase">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="sitemap" className="space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
            <TabsTrigger value="sitemap" className="font-mono text-xs uppercase data-[state=active]:bg-logo-green data-[state=active]:text-background">
              <Map className="w-4 h-4 mr-2" /> Sitemap
            </TabsTrigger>
            <TabsTrigger value="roles" className="font-mono text-xs uppercase data-[state=active]:bg-logo-green data-[state=active]:text-background">
              <Users className="w-4 h-4 mr-2" /> Roles
            </TabsTrigger>
            <TabsTrigger value="flows" className="font-mono text-xs uppercase data-[state=active]:bg-logo-green data-[state=active]:text-background">
              <GitBranch className="w-4 h-4 mr-2" /> Flows
            </TabsTrigger>
            <TabsTrigger value="system" className="font-mono text-xs uppercase data-[state=active]:bg-logo-green data-[state=active]:text-background">
              <Server className="w-4 h-4 mr-2" /> System
            </TabsTrigger>
            <TabsTrigger value="data" className="font-mono text-xs uppercase data-[state=active]:bg-logo-green data-[state=active]:text-background">
              <Database className="w-4 h-4 mr-2" /> Data
            </TabsTrigger>
            <TabsTrigger value="api" className="font-mono text-xs uppercase data-[state=active]:bg-logo-green data-[state=active]:text-background">
              <Zap className="w-4 h-4 mr-2" /> API
            </TabsTrigger>
          </TabsList>

          {/* SITEMAP TAB */}
          <TabsContent value="sitemap" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Map className="w-6 h-6 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-wider">Information Architecture</h2>
            </div>
            
            <MermaidDiagram chart={mermaidDiagrams.sitemap} title="Visual Sitemap Diagram" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {sitemapSections.map((section) => (
                <Collapsible 
                  key={section.title} 
                  open={expandedSections.has(section.title)}
                  onOpenChange={() => toggleSection(section.title)}
                >
                  <div className="border border-border bg-card">
                    <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors">
                      <div>
                        <h3 className="font-mono text-sm uppercase tracking-wider text-left">{section.title}</h3>
                        <p className="text-xs text-muted-foreground text-left">{section.description}</p>
                      </div>
                      <Badge variant="secondary" className="font-mono text-xs ml-2">
                        {section.routes.length}
                      </Badge>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-1">
                        {section.routes.map((route) => (
                          <div key={route.path} className="flex items-center gap-2 text-xs font-mono py-1">
                            <span className="text-muted-foreground">{route.path}</span>
                            {route.dynamic && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1">dynamic</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          </TabsContent>

          {/* ROLES TAB */}
          <TabsContent value="roles" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-6 h-6 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-wider">User Role Matrix</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-mono text-sm uppercase text-muted-foreground">Role</th>
                    <th className="text-left p-4 font-mono text-sm uppercase text-muted-foreground">Description</th>
                    <th className="text-left p-4 font-mono text-sm uppercase text-muted-foreground">Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.map((role, idx) => (
                    <tr key={role.role} className={idx % 2 === 0 ? 'bg-card' : 'bg-background'}>
                      <td className="p-4 font-mono text-sm font-semibold text-logo-green align-top whitespace-nowrap">
                        {role.role}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground align-top max-w-xs">
                        {role.description}
                      </td>
                      <td className="p-4 align-top">
                        <ul className="space-y-1">
                          {role.capabilities.map((cap, i) => (
                            <li key={i} className="text-xs font-mono text-foreground flex items-start gap-2">
                              <span className="text-logo-green mt-0.5">•</span>
                              {cap}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* FLOWS TAB */}
          <TabsContent value="flows" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <GitBranch className="w-6 h-6 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-wider">Core User Flows</h2>
            </div>

            <div className="space-y-4">
              <MermaidDiagram chart={mermaidDiagrams.authFlow} title="Auth Flow Sequence" />
              <MermaidDiagram chart={mermaidDiagrams.paymentFlow} title="Payment Flow Sequence" />
              <MermaidDiagram chart={mermaidDiagrams.dataFlow} title="Data Ingestion Flow" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {userFlows.map((flow) => (
                <div key={flow.name} className="border border-border bg-card p-6">
                  <h3 className="font-mono text-lg uppercase tracking-wider mb-2">{flow.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{flow.description}</p>
                  <ol className="space-y-2">
                    {flow.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-mono">
                        <span className="w-6 h-6 rounded-full bg-logo-green/20 text-logo-green flex items-center justify-center text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Server className="w-6 h-6 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-wider">System Architecture</h2>
            </div>
            
            <MermaidDiagram chart={mermaidDiagrams.systemArchitecture} title="System Architecture Diagram" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="border border-border bg-card p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider text-logo-green mb-4">Frontend</h3>
                <ul className="space-y-2 text-sm font-mono">
                  <li>React 18 + Vite</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Shadcn/ui</li>
                  <li>Zustand</li>
                  <li>React Query</li>
                  <li>React Router</li>
                </ul>
              </div>
              
              <div className="border border-border bg-card p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider text-logo-green mb-4">Backend</h3>
                <ul className="space-y-2 text-sm font-mono">
                  <li>Lovable Cloud (Supabase)</li>
                  <li>PostgreSQL</li>
                  <li>Edge Functions (Deno)</li>
                  <li>Row Level Security</li>
                  <li>Realtime Subscriptions</li>
                  <li>Storage Buckets</li>
                </ul>
              </div>
              
              <div className="border border-border bg-card p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider text-logo-green mb-4">AI Layer</h3>
                <ul className="space-y-2 text-sm font-mono">
                  <li>4-Tier Model Router</li>
                  <li>Gemini 2.5/3 Pro</li>
                  <li>GPT-5</li>
                  <li>Groq LPU (fast tier)</li>
                  <li>ElevenLabs TTS</li>
                  <li>Vector Embeddings</li>
                </ul>
              </div>
              
              <div className="border border-border bg-card p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider text-logo-green mb-4">Integrations</h3>
                <ul className="space-y-2 text-sm font-mono">
                  <li>Stripe Payments</li>
                  <li>YouTube API</li>
                  <li>Firecrawl Scraping</li>
                  <li>GA4 + GTM</li>
                  <li>SendGrid Email</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* DATA TAB */}
          <TabsContent value="data" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Database className="w-6 h-6 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-wider">Data Model</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Table</th>
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Description</th>
                    <th className="text-left p-3 font-mono text-xs uppercase text-muted-foreground">Key Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {dataTables.map((table, idx) => (
                    <tr key={table.name} className={idx % 2 === 0 ? 'bg-background' : 'bg-card/50'}>
                      <td className="p-3 font-mono text-logo-green whitespace-nowrap">{table.name}</td>
                      <td className="p-3 text-muted-foreground">{table.description}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {table.keyFields.map((field) => (
                            <Badge key={field} variant="outline" className="font-mono text-[10px]">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* API TAB */}
          <TabsContent value="api" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-logo-green" />
              <h2 className="font-mono text-xl uppercase tracking-wider">API & Events</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Edge Functions */}
              <div>
                <h3 className="font-mono text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-logo-green" />
                  Edge Functions ({apiEndpoints.length})
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {['AI', 'Research', 'Content', 'Orchestration', 'Infrastructure', 'Public API', 'Webhooks'].map((category) => (
                    <div key={category} className="border border-border bg-card">
                      <div className="px-4 py-2 bg-accent/30 font-mono text-xs uppercase tracking-wider">
                        {category}
                      </div>
                      <div className="p-2">
                        {apiEndpoints.filter(e => e.category === category).map((endpoint) => (
                          <div key={endpoint.name} className="px-2 py-1.5 hover:bg-accent/20 rounded">
                            <div className="font-mono text-sm text-logo-green">{endpoint.name}</div>
                            <div className="text-xs text-muted-foreground">{endpoint.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Analytics Events */}
              <div>
                <h3 className="font-mono text-lg uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-logo-green" />
                  Analytics Events ({analyticsEvents.length})
                </h3>
                <div className="space-y-3">
                  {analyticsEvents.map((event) => (
                    <div key={event.name} className="border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-logo-green">{event.name}</span>
                        <Badge variant="secondary" className="font-mono text-[10px]">{event.trigger}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {event.data.map((field) => (
                          <Badge key={field} variant="outline" className="font-mono text-[10px]">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Last updated: {new Date(architectureMetadata.lastUpdated).toLocaleDateString()} • 
            Version {architectureMetadata.version}
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            This is a living document. Update <code className="bg-accent px-1 rounded">src/config/architecture-config.ts</code> when adding new features.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Architecture;
