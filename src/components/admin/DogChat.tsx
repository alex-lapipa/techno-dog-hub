import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Heart, Volume2, Square, Phone, PhoneOff, Wifi, WifiOff } from "lucide-react";
import DogSilhouette from "@/components/DogSilhouette";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DogChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "*zoomies* Woof! Techno Dog here. The sound, the gear, the community — I sniff it all. Ask anything. Let's dig.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [audioVisualization, setAudioVisualization] = useState<number[]>([0.3, 0.5, 0.7, 0.5, 0.3]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizationInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Voice conversation hook for live ElevenLabs conversation
  const voiceConversation = useVoiceConversation({
    onMessage: (message) => {
      setMessages(prev => [...prev, message]);
    },
    onStatusChange: (status) => {
      if (status === 'connected') {
        toast({
          title: "*perks up ears*",
          description: "Voice call connected! Speak naturally — I'll respond when you pause.",
        });
      } else if (status === 'disconnected') {
        // Only show if was previously connected
        console.log("Voice conversation disconnected");
      }
    },
    onError: (error) => {
      toast({
        title: "*sad whimper*",
        description: error,
        variant: "destructive"
      });
    }
  });

  // Sync speaking state from conversation hook
  useEffect(() => {
    if (voiceConversation.isConnected) {
      setIsSpeaking(voiceConversation.isSpeaking);
    }
  }, [voiceConversation.isSpeaking, voiceConversation.isConnected]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceConversation.isConnected) {
        voiceConversation.endConversation();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (visualizationInterval.current) {
        clearInterval(visualizationInterval.current);
      }
    };
  }, []);

  // Audio visualization when speaking
  useEffect(() => {
    if (isSpeaking) {
      visualizationInterval.current = setInterval(() => {
        setAudioVisualization([
          0.2 + Math.random() * 0.6,
          0.3 + Math.random() * 0.7,
          0.4 + Math.random() * 0.6,
          0.3 + Math.random() * 0.7,
          0.2 + Math.random() * 0.6,
        ]);
      }, 100);
    } else {
      if (visualizationInterval.current) {
        clearInterval(visualizationInterval.current);
      }
      setAudioVisualization([0.3, 0.5, 0.7, 0.5, 0.3]);
    }

    return () => {
      if (visualizationInterval.current) {
        clearInterval(visualizationInterval.current);
      }
    };
  }, [isSpeaking]);

  const speakMessage = async (text: string, messageIndex: number) => {
    if (isSpeaking && speakingMessageIndex === messageIndex) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    setIsSpeaking(true);
    setSpeakingMessageIndex(messageIndex);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog-voice`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voice: 'it' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Voice request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "*confused head tilt*",
          description: "Audio playback failed, bestie!",
          variant: "destructive"
        });
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Voice error:', error);
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
      toast({
        title: "*sad whimper*",
        description: error instanceof Error ? error.message : "Couldn't speak that one. Try again!",
        variant: "destructive"
      });
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setSpeakingMessageIndex(null);
  };

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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            conversationHistory
          }),
        }
      );

      if (response.status === 429) {
        throw new Error("Too many requests! Slow down, bestie — even dogs need breaks!");
      }

      if (response.status === 402) {
        throw new Error("Need more treats (credits)! Check workspace settings.");
      }

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.bark || "*Confused head tilt* Woof? Something went wrong, that's mid!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Dog chat error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "*Sad whimper*",
        description: errorMessage,
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `*Worried whine* Arf... I had trouble fetching that — ${errorMessage}. Could you try asking again, bestie?`,
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
    "What's techno.dog about? fr fr",
    "Who are the goat techno artists?",
    "Tell me about underground venues",
    "How can I contribute?"
  ];

  const isVoiceActive = voiceConversation.isConnected || voiceConversation.isConnecting;

  return (
    <Card className="border-logo-green/30 bg-gradient-to-br from-background via-background to-logo-green/5 h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4 shrink-0">
        <CardTitle className="font-mono text-lg flex items-center gap-3">
          {/* Dog Avatar with Audio Visualization */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-logo-green/30 to-logo-green/10 flex items-center justify-center border-2 border-logo-green shadow-[0_0_20px_hsl(var(--logo-green)/0.3)] transition-all duration-300 ${isSpeaking ? 'animate-pulse' : ''} ${isVoiceActive ? 'ring-2 ring-crimson ring-offset-2 ring-offset-background' : ''}`}>
              <DogSilhouette className="w-8 h-8" animated={isSpeaking || voiceConversation.isConnected} />
            </div>
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="absolute -bottom-1 -right-1 flex items-end gap-[2px] h-3">
                {audioVisualization.map((height, i) => (
                  <div
                    key={i}
                    className="w-1 bg-logo-green rounded-full transition-all duration-100"
                    style={{ height: `${height * 12}px` }}
                  />
                ))}
              </div>
            )}
            {/* Connection indicator */}
            {voiceConversation.isConnected && !isSpeaking && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-logo-green rounded-full animate-pulse flex items-center justify-center">
                <Wifi className="w-2.5 h-2.5 text-background" />
              </div>
            )}
            {voiceConversation.isConnecting && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse flex items-center justify-center">
                <Loader2 className="w-2.5 h-2.5 text-background animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tracking-tight">Techno Dog</span>
              {voiceConversation.isConnected && (
                <Badge variant="outline" className="text-[10px] font-mono border-logo-green/50 text-logo-green uppercase tracking-wider shrink-0">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              {voiceConversation.isConnecting && (
                <Badge variant="outline" className="text-[10px] font-mono border-yellow-500/50 text-yellow-500 uppercase tracking-wider shrink-0">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Connecting
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="outline" className="text-[10px] font-mono border-logo-green/50 text-logo-green uppercase tracking-wider animate-pulse shrink-0">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speaking
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              {voiceConversation.isConnected 
                ? "Voice call active — speak naturally, I'll respond" 
                : voiceConversation.isConnecting
                  ? "Connecting to voice..."
                  : "One scene, one pack 🖤"}
            </p>
          </div>
          
          {/* Voice Mode Toggle */}
          <Button
            variant={isVoiceActive ? "default" : "outline"}
            size="sm"
            onClick={isVoiceActive ? voiceConversation.endConversation : voiceConversation.startConversation}
            disabled={voiceConversation.isConnecting}
            className={`shrink-0 ${isVoiceActive ? 'bg-crimson hover:bg-crimson/90' : 'border-logo-green/50 hover:bg-logo-green/10'}`}
          >
            {voiceConversation.isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Connecting...
              </>
            ) : isVoiceActive ? (
              <>
                <PhoneOff className="w-4 h-4 mr-1.5" />
                End Call
              </>
            ) : (
              <>
                <Phone className="w-4 h-4 mr-1.5" />
                Voice Call
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted/50 border border-border/50 rounded-bl-md'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <DogSilhouette className="w-4 h-4" />
                        <span className="text-xs font-mono text-logo-green/80 uppercase tracking-wider font-normal">Techno Dog</span>
                      </div>
                      {!voiceConversation.isConnected && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 transition-all ${
                            isSpeaking && speakingMessageIndex === index 
                              ? 'bg-crimson/20 hover:bg-crimson/30' 
                              : 'hover:bg-logo-green/20'
                          }`}
                          onClick={() => speakMessage(message.content, index)}
                          title={isSpeaking && speakingMessageIndex === index ? "Stop speaking" : "Listen to this message"}
                        >
                          {isSpeaking && speakingMessageIndex === index ? (
                            <Square className="w-3.5 h-3.5 text-crimson" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-logo-green" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed font-normal text-foreground/80">
                    {message.content}
                  </p>
                  <p className="text-[10px] opacity-50 mt-1.5 font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <DogSilhouette className="w-5 h-5 animate-bounce" />
                    <span className="text-xs font-mono text-muted-foreground/70 italic font-normal">
                      *sniffing through the crates fr fr...*
                    </span>
                    <Loader2 className="w-4 h-4 animate-spin text-logo-green" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Suggested Questions */}
        {messages.length === 1 && !isVoiceActive && (
          <div className="px-4 pb-2 shrink-0">
            <p className="text-xs text-muted-foreground/70 mb-2 font-mono font-normal">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-3 rounded-full border-logo-green/30 hover:bg-logo-green/10 hover:border-logo-green/50 transition-all"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Voice Mode Status Banner */}
        {voiceConversation.isConnected && (
          <div className="px-4 py-3 bg-logo-green/10 border-t border-logo-green/20 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-3 h-3 rounded-full shrink-0 ${
                  isSpeaking ? 'bg-logo-green animate-pulse' : 'bg-logo-green/50'
                }`} />
                <p className="text-xs font-mono">
                  {isSpeaking 
                    ? "Speaking... (interrupt anytime)" 
                    : "Listening — speak when ready"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={voiceConversation.endConversation}
                className="text-crimson hover:text-crimson hover:bg-crimson/20 text-xs font-mono"
              >
                <PhoneOff className="w-3 h-3 mr-1" />
                End Call
              </Button>
            </div>
          </div>
        )}
        
        {/* Input Area - Hidden in voice mode */}
        {!voiceConversation.isConnected && (
          <div className="p-4 border-t border-border/50 bg-background/50 shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Techno Dog anything... (any language, bestie)"
                className="flex-1 bg-background border-border/50 focus:border-logo-green transition-colors"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-logo-green hover:bg-logo-green/90 text-background px-4 transition-all hover:shadow-[0_0_12px_hsl(var(--logo-green)/0.4)]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 mt-2 text-center flex items-center justify-center gap-1 font-mono uppercase tracking-wider font-normal">
              <Heart className="w-3 h-3 text-crimson/70" />
              Built by the scene, for the scene — no cap
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DogChat;
