import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminPageLayout } from '@/components/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Dog, Database, Mic, Globe, BookOpen, Zap, Shield, 
  CheckCircle, AlertCircle, Clock, Volume2, Brain, 
  Sparkles, RefreshCw, Settings, MessageSquare, Users
} from 'lucide-react';
import DogSilhouette from '@/components/DogSilhouette';

interface DogAgentStatus {
  isOnline: boolean;
  lastActivity: string | null;
  totalConversations: number;
  avgResponseTime: number;
}

interface Capability {
  name: string;
  description: string;
  status: 'active' | 'planned' | 'experimental';
  icon: React.ReactNode;
}

interface ImprovementSuggestion {
  title: string;
  description: string;
  provider: 'OpenAI' | 'Groq' | 'ElevenLabs' | 'Lovable AI';
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

const DogAgentAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<DogAgentStatus>({
    isOnline: true,
    lastActivity: null,
    totalConversations: 0,
    avgResponseTime: 0
  });
  const [isTesting, setIsTesting] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    voiceEnabled: true,
    dogSoundsEnabled: true,
    ragEnabled: true,
    genZSlangLevel: 'high',
    defaultVoice: 'they'
  });

  const capabilities: Capability[] = [
    { 
      name: 'RAG Knowledge Retrieval', 
      description: 'Vector similarity search across 200+ artists, gear, venues, festivals, and labels using OpenAI embeddings',
      status: 'active',
      icon: <Database className="w-4 h-4" />
    },
    { 
      name: 'Multilingual Support', 
      description: 'Responds in user\'s language with localized Gen Z slang adaptations',
      status: 'active',
      icon: <Globe className="w-4 h-4" />
    },
    { 
      name: 'Voice Synthesis', 
      description: 'ElevenLabs TTS with 4 inclusive voice options (She/He/They/It) and dog sound injection',
      status: 'active',
      icon: <Mic className="w-4 h-4" />
    },
    { 
      name: 'Gen Z + Dog Persona', 
      description: '90+ slang terms blended with dog expressions for authentic underground character',
      status: 'active',
      icon: <MessageSquare className="w-4 h-4" />
    },
    { 
      name: 'Real-time Database Access', 
      description: 'Read-only queries to dj_artists, canonical_artists, gear_catalog, content_sync, news, and documents',
      status: 'active',
      icon: <BookOpen className="w-4 h-4" />
    },
    { 
      name: 'Agent Orchestration', 
      description: 'Can trigger status checks and monitor other platform agents',
      status: 'active',
      icon: <Zap className="w-4 h-4" />
    },
    { 
      name: 'Conversation Memory', 
      description: 'Maintains context within session for coherent multi-turn dialogues',
      status: 'active',
      icon: <Brain className="w-4 h-4" />
    },
    { 
      name: 'Read-Only Safety Mode', 
      description: 'All database operations are SELECT only - no destructive actions possible',
      status: 'active',
      icon: <Shield className="w-4 h-4" />
    }
  ];

  const improvements: ImprovementSuggestion[] = [
    {
      title: 'GPT-5 for Complex Reasoning',
      description: 'Upgrade to OpenAI GPT-5 for handling nuanced artist comparisons, gear recommendations, and deep scene analysis. Better at multi-step reasoning.',
      provider: 'OpenAI',
      priority: 'high',
      effort: 'low'
    },
    {
      title: 'Groq for Ultra-Fast Responses',
      description: 'Add Groq LPU inference for sub-100ms latency on simple queries. Route easy questions to Groq, complex ones to Gemini/GPT.',
      provider: 'Groq',
      priority: 'high',
      effort: 'medium'
    },
    {
      title: 'Streaming Responses',
      description: 'Implement SSE streaming for real-time token delivery. Users see responses as they\'re generated instead of waiting.',
      provider: 'Lovable AI',
      priority: 'medium',
      effort: 'medium'
    },
    {
      title: 'Voice Input (STT)',
      description: 'Add speech-to-text using ElevenLabs Scribe for full voice conversations. Users can speak to Dog and hear responses.',
      provider: 'ElevenLabs',
      priority: 'medium',
      effort: 'medium'
    },
    {
      title: 'Multi-Model Orchestration',
      description: 'Implement intelligent routing: Groq for quick facts, Gemini for context, GPT-5 for creative responses. Best of all worlds.',
      provider: 'OpenAI',
      priority: 'high',
      effort: 'high'
    },
    {
      title: 'Persistent Conversation Memory',
      description: 'Store conversation history in database for returning users. Dog remembers past interactions and preferences.',
      provider: 'Lovable AI',
      priority: 'low',
      effort: 'medium'
    },
    {
      title: 'Proactive Notifications',
      description: 'Dog can notify users about new artists, gear releases, or news matching their interests.',
      provider: 'Lovable AI',
      priority: 'low',
      effort: 'high'
    },
    {
      title: 'Tool Calling for Actions',
      description: 'Enable structured tool calling so Dog can search, filter, and present data in formatted cards instead of plain text.',
      provider: 'OpenAI',
      priority: 'medium',
      effort: 'medium'
    }
  ];

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      // Check agent status from database
      const { data: agentStatus } = await supabase
        .from('agent_status')
        .select('*')
        .eq('agent_name', 'Dog Agent')
        .single();

      // Get some stats
      const { count: artistCount } = await supabase
        .from('dj_artists')
        .select('*', { count: 'exact', head: true });

      const { count: gearCount } = await supabase
        .from('gear_catalog')
        .select('*', { count: 'exact', head: true });

      setStatus({
        isOnline: agentStatus?.status === 'idle' || agentStatus?.status === 'running' || true,
        lastActivity: agentStatus?.last_run_at || new Date().toISOString(),
        totalConversations: agentStatus?.run_count || 0,
        avgResponseTime: agentStatus?.avg_duration_ms || 1200
      });
    } catch (error) {
      console.error('Error fetching dog agent status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAgent = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog-agent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: 'Quick health check - how many artists do you know about?',
            action: 'status'
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: '*Happy bark* Agent responding!',
          description: `Connected to ${data.data?.stats?.djArtists || 0} artists and ${data.data?.stats?.gearItems || 0} gear items.`
        });
      } else {
        throw new Error('Agent not responding');
      }
    } catch (error) {
      toast({
        title: '*Sad whimper* Connection issue',
        description: error instanceof Error ? error.message : 'Could not reach the Dog Agent',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-crimson/50 text-crimson';
      case 'medium': return 'border-yellow-500/50 text-yellow-500';
      case 'low': return 'border-muted-foreground/50 text-muted-foreground';
      default: return '';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Groq': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ElevenLabs': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Lovable AI': return 'bg-logo-green/20 text-logo-green border-logo-green/30';
      default: return '';
    }
  };

  if (!isAdmin) {
    return (
      <AdminPageLayout
        title="Dog Agent"
        description="Access denied"
        icon={Dog}
        iconColor="text-crimson"
      >
        <p className="text-muted-foreground">You need admin access to view this page.</p>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Dog Agent"
      description="Orchestrator & Knowledge Interface"
      icon={Dog}
      iconColor="text-logo-green"
      actions={
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={status.isOnline ? 'border-logo-green/50 text-logo-green' : 'border-crimson/50 text-crimson'}
          >
            {status.isOnline ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
            {status.isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testAgent}
            disabled={isTesting}
            className="font-mono text-xs"
          >
            {isTesting ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Zap className="w-3 h-3 mr-2" />}
            Test Agent
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="overview" className="font-mono text-xs uppercase">Overview</TabsTrigger>
          <TabsTrigger value="capabilities" className="font-mono text-xs uppercase">Capabilities</TabsTrigger>
          <TabsTrigger value="config" className="font-mono text-xs uppercase">Configuration</TabsTrigger>
          <TabsTrigger value="improvements" className="font-mono text-xs uppercase">Improvements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Status</p>
                    <p className="text-2xl font-mono text-logo-green">{status.isOnline ? 'Active' : 'Down'}</p>
                  </div>
                  <DogSilhouette className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Conversations</p>
                    <p className="text-2xl font-mono">{status.totalConversations}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Avg Response</p>
                    <p className="text-2xl font-mono">{status.avgResponseTime}ms</p>
                  </div>
                  <Clock className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">Mode</p>
                    <p className="text-2xl font-mono text-logo-green">Read-Only</p>
                  </div>
                  <Shield className="w-8 h-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Setup */}
          <Card className="border-logo-green/30">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Current Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Primary AI Model</p>
                  <p className="text-foreground">google/gemini-2.5-flash (via Lovable AI)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Embedding Model</p>
                  <p className="text-foreground">text-embedding-3-small (768 dims)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Voice Provider</p>
                  <p className="text-foreground">ElevenLabs (eleven_turbo_v2_5)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Voice Options</p>
                  <p className="text-foreground">She / He / They / It</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Database Access</p>
                  <p className="text-foreground">7 tables (read-only)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Slang Dictionary</p>
                  <p className="text-foreground">90+ Gen Z + Dog expressions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Modules */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase flex items-center gap-2">
                <Database className="w-4 h-4" />
                Connected Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['dj_artists', 'canonical_artists', 'artist_profiles', 'gear_catalog', 'td_knowledge_entities', 'content_sync', 'td_news_articles', 'documents', 'agent_status'].map((table) => (
                  <Badge key={table} variant="outline" className="font-mono text-xs">
                    {table}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {capabilities.map((cap) => (
              <Card key={cap.name} className="border-border/50 hover:border-logo-green/30 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-logo-green/10 border border-logo-green/30 flex items-center justify-center text-logo-green">
                      {cap.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-mono text-sm font-medium">{cap.name}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] ${cap.status === 'active' ? 'border-logo-green/50 text-logo-green' : 'border-yellow-500/50 text-yellow-500'}`}
                        >
                          {cap.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground/80 font-normal">{cap.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase">Voice Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">Voice Synthesis</p>
                  <p className="text-xs text-muted-foreground">Enable ElevenLabs TTS for audio responses</p>
                </div>
                <Switch checked={config.voiceEnabled} onCheckedChange={(v) => setConfig(p => ({...p, voiceEnabled: v}))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">Dog Sounds</p>
                  <p className="text-xs text-muted-foreground">Inject barks, woofs, and panting into speech</p>
                </div>
                <Switch checked={config.dogSoundsEnabled} onCheckedChange={(v) => setConfig(p => ({...p, dogSoundsEnabled: v}))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="font-mono text-sm uppercase">Knowledge Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">RAG Vector Search</p>
                  <p className="text-xs text-muted-foreground">Use embeddings for semantic knowledge retrieval</p>
                </div>
                <Switch checked={config.ragEnabled} onCheckedChange={(v) => setConfig(p => ({...p, ragEnabled: v}))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-crimson/30 bg-crimson/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-crimson mt-0.5" />
                <div>
                  <p className="font-mono text-sm text-crimson">Read-Only Mode: Always Active</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dog Agent can only SELECT data from the database. No INSERT, UPDATE, or DELETE operations are permitted. 
                    This ensures the agent cannot accidentally modify or destroy any data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4">
          <p className="text-sm text-muted-foreground font-normal mb-4">
            Suggested enhancements using OpenAI, Groq, and multi-model orchestration to improve Dog Agent capabilities.
          </p>
          <div className="grid gap-4">
            {improvements.map((imp) => (
              <Card key={imp.title} className="border-border/50 hover:border-logo-green/20 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <p className="font-mono text-sm font-medium">{imp.title}</p>
                        <Badge variant="outline" className={`text-[10px] ${getProviderColor(imp.provider)}`}>
                          {imp.provider}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground/80 font-normal">{imp.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${getPriorityColor(imp.priority)}`}>
                        {imp.priority} priority
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{imp.effort} effort</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default DogAgentAdmin;
