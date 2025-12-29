import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Minimize2,
  Maximize2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'info';
  path?: string;
  action?: string;
}

interface AdminContext {
  healthAlerts: number;
  pendingSubmissions: number;
  totalApiRequests: number;
  gearGaps: number;
  artistCount: number;
}

export const AdminAIAssistant = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [context, setContext] = useState<AdminContext | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !context) {
      fetchQuickActions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchQuickActions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { action: 'quick-actions' }
      });
      
      if (error) throw error;
      
      setQuickActions(data.actions || []);
      setContext(data.context);
    } catch (err) {
      console.error('Failed to fetch quick actions:', err);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { action: 'analyze' }
      });
      
      if (error) throw error;
      
      setAnalysis(data.analysis);
      setContext(data.context);
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-ai-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            action: 'chat', 
            query: userMessage,
            context 
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted.');
        }
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            // Incomplete JSON, wait for more data
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setMessages(prev => prev.slice(0, -1)); // Remove empty assistant message
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (action.path) {
      navigate(action.path);
      setIsOpen(false);
    } else if (action.action) {
      toast.info(`Running ${action.label}...`);
      try {
        await supabase.functions.invoke(action.action);
        toast.success(`${action.label} completed`);
        fetchQuickActions();
      } catch (err) {
        toast.error('Action failed');
      }
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-crimson/50 bg-crimson/10 text-crimson';
      case 'medium': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
      case 'low': return 'border-blue-500/50 bg-blue-500/10 text-blue-500';
      default: return 'border-muted-foreground/50 bg-muted/10 text-muted-foreground';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-crimson shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        size="icon"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 px-4 rounded-full bg-gradient-to-br from-purple-600 to-crimson shadow-lg"
        >
          <Bot className="w-5 h-5 mr-2" />
          AI Assistant
          <Maximize2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] bg-zinc-900 border-crimson/30 shadow-2xl flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            AI ADMIN ASSISTANT
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col overflow-hidden p-3 pt-0">
        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="space-y-3 mb-3">
            <Button 
              onClick={runAnalysis} 
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="sm"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run System Analysis'}
            </Button>

            {analysis && (
              <div className="p-3 bg-zinc-800 border border-purple-500/30 rounded text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                {analysis}
              </div>
            )}

            {quickActions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono uppercase">Suggested Actions</p>
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={cn(
                      "w-full p-2 rounded border text-left transition-colors hover:bg-zinc-800",
                      getSeverityColor(action.severity)
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{action.label}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    <p className="text-[10px] opacity-70">{action.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-2 rounded text-xs",
                  msg.role === 'user' 
                    ? "bg-purple-600/20 border border-purple-500/30 ml-8" 
                    : "bg-zinc-800 border border-border mr-8"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 p-2 bg-zinc-800 border border-border rounded mr-8">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs text-muted-foreground">Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border flex-shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about system status..."
            className="text-xs h-8 bg-zinc-800"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-8 w-8 bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAIAssistant;
