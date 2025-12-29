import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  RefreshCw, 
  Zap, 
  MessageSquare, 
  Database, 
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface AgentStats {
  totalGear: number;
  withDescriptions: number;
  withTechnoApps: number;
  completionRate: number;
}

interface GearItem {
  id: string;
  name: string;
  brand: string;
  category?: string;
  short_description?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GearAgentAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [recentItems, setRecentItems] = useState<GearItem[]>([]);
  const [needsContent, setNeedsContent] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedGear, setSelectedGear] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStatus();
    }
  }, [isAdmin]);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'status' }
      });

      if (error) throw error;

      setStats(data.stats);
      setRecentItems(data.recentItems || []);
      setNeedsContent(data.needsContent || []);
    } catch (err) {
      console.error('Failed to fetch agent status:', err);
      toast({
        title: 'Failed to fetch status',
        description: 'Could not connect to Gear Expert Agent',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrichSingle = async (gearId: string) => {
    setSelectedGear(gearId);
    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'enrich', gearId }
      });

      if (error) throw error;

      toast({
        title: 'Enrichment complete',
        description: data.message
      });

      fetchStatus();
    } catch (err) {
      console.error('Enrichment failed:', err);
      toast({
        title: 'Enrichment failed',
        variant: 'destructive'
      });
    } finally {
      setIsEnriching(false);
      setSelectedGear(null);
    }
  };

  const handleBatchEnrich = async () => {
    setIsEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'batch-enrich' }
      });

      if (error) throw error;

      toast({
        title: 'Batch enrichment complete',
        description: data.message
      });

      fetchStatus();
    } catch (err) {
      console.error('Batch enrichment failed:', err);
      toast({
        title: 'Batch enrichment failed',
        variant: 'destructive'
      });
    } finally {
      setIsEnriching(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      const { data, error } = await supabase.functions.invoke('gear-expert-agent', {
        body: { action: 'chat', query: userMessage }
      });

      if (error) throw error;

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error('Chat failed:', err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-crimson" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                <Bot className="w-6 h-6 text-logo-green" />
                GEAR EXPERT AGENT
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                AI-powered gear database management
              </p>
            </div>
          </div>
          <Button onClick={fetchStatus} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Total Gear</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.totalGear || 0}</p>
                </div>
                <Database className="w-8 h-8 text-crimson/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">With Descriptions</p>
                  <p className="text-3xl font-bold text-logo-green">{stats?.withDescriptions || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-logo-green/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Techno Apps</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.withTechnoApps || 0}</p>
                </div>
                <Zap className="w-8 h-8 text-amber-500/60" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900 border-crimson/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono uppercase">Completion</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.completionRate || 0}%</p>
                </div>
                <div className="w-8 h-8 rounded-full border-4 border-crimson/30" 
                     style={{ 
                       background: `conic-gradient(hsl(var(--logo-green)) ${stats?.completionRate || 0}%, transparent 0)` 
                     }} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Needs Content Panel */}
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                NEEDS CONTENT
              </CardTitle>
              <Button 
                onClick={handleBatchEnrich} 
                disabled={isEnriching || needsContent.length === 0}
                size="sm"
                className="bg-logo-green hover:bg-logo-green/80"
              >
                {isEnriching ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Enrich Batch (3)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {needsContent.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    All gear items have content!
                  </p>
                ) : (
                  needsContent.map((gear) => (
                    <div 
                      key={gear.id} 
                      className="flex items-center justify-between p-2 bg-zinc-800 border border-border rounded"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{gear.name}</p>
                        <p className="text-xs text-muted-foreground">{gear.brand}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEnrichSingle(gear.id)}
                        disabled={isEnriching && selectedGear === gear.id}
                      >
                        {isEnriching && selectedGear === gear.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Items Panel */}
          <Card className="bg-zinc-900 border-crimson/20">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-crimson" />
                RECENT UPDATES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentItems.map((gear) => (
                  <div 
                    key={gear.id} 
                    className="flex items-center justify-between p-2 bg-zinc-800 border border-border rounded"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{gear.name}</p>
                      <p className="text-xs text-muted-foreground">{gear.brand}</p>
                    </div>
                    {gear.short_description ? (
                      <Badge variant="outline" className="text-logo-green border-logo-green/50 text-[10px]">
                        HAS CONTENT
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-[10px]">
                        NEEDS CONTENT
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="bg-zinc-900 border-crimson/20">
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-logo-green" />
              CHAT WITH GEAR EXPERT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="h-64 overflow-y-auto space-y-3 p-4 bg-zinc-800 border border-border rounded">
                {chatMessages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Ask me anything about gear in the database...
                  </p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded ${
                        msg.role === 'user' 
                          ? 'bg-crimson/20 ml-8' 
                          : 'bg-logo-green/10 mr-8'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1 font-mono uppercase">
                        {msg.role === 'user' ? 'You' : 'Gear Expert'}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="What synth is best for acid techno?"
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  className="flex-1 bg-zinc-800 border-border"
                />
                <Button 
                  onClick={handleChat} 
                  disabled={isChatting || !chatInput.trim()}
                  className="bg-logo-green hover:bg-logo-green/80"
                >
                  {isChatting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GearAgentAdmin;
