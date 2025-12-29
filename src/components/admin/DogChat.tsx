import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Dog, Loader2, Sparkles, Heart } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DogChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "*tail wagging to 140bpm* 🐕‍🦺 Woof! I'm Techno Dog — your underground guide.\n\nFrom Detroit to Berlin to Tbilisi, I know the scene. Artists, labels, venues, the gear that makes the sound, and why we built this open-source platform for the global techno community.\n\nWhat's on your mind? Ask in any language. Let's dig deep. 🖤",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke('dog-agent', {
        body: {
          message: userMessage.content,
          conversationHistory
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.bark || "*Confused head tilt* Woof? Something went wrong!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Dog chat error:', error);
      toast({
        title: "*Sad whimper*",
        description: "Dog couldn't fetch that response. Please try again!",
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "*Worried whine* Arf... I had trouble fetching that. Could you try asking again? 🐕",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Why is this open-source & community-led?",
    "How can I contribute to the scene?",
    "What makes techno.dog different?",
    "Tell me about the global underground"
  ];

  return (
    <Card className="border-logo-green/30 bg-gradient-to-br from-background via-background to-logo-green/5 h-[600px] flex flex-col">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="font-mono text-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-logo-green/30 to-logo-green/10 flex items-center justify-center border-2 border-logo-green shadow-[0_0_20px_hsl(var(--logo-green)/0.3)]">
            <Dog className="w-7 h-7 text-logo-green" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="tracking-tight">Techno Dog</span>
              <Badge variant="outline" className="text-[10px] font-mono border-logo-green/50 text-logo-green uppercase tracking-wider">
                <Sparkles className="w-3 h-3 mr-1" />
                Underground Guide
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              From Detroit to Tbilisi — one scene, one pack 🖤
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted/50 border border-border/50 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Dog className="w-4 h-4 text-logo-green" />
                      <span className="text-xs font-mono text-logo-green uppercase tracking-wider">Techno Dog</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-[10px] opacity-50 mt-1.5 font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Dog className="w-4 h-4 text-logo-green animate-bounce" />
                    <span className="text-xs font-mono text-muted-foreground italic">
                      *digging through the crates...*
                    </span>
                    <Loader2 className="w-4 h-4 animate-spin text-logo-green" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2 font-mono">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-3 rounded-full border-logo-green/30 hover:bg-logo-green/10 hover:border-logo-green/50"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Techno Dog anything... (any language)"
              className="flex-1 bg-background border-border/50 focus:border-logo-green"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-logo-green hover:bg-logo-green/90 text-background px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1 font-mono uppercase tracking-wider">
            <Heart className="w-3 h-3 text-crimson" />
            Built by the scene, for the scene
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DogChat;
