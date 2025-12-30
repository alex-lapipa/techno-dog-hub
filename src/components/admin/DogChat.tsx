import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Heart, Volume2, Square, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import DogSilhouette from "@/components/DogSilhouette";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Voice conversation mode
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualizationInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceDetectionRef = useRef<number | null>(null);
  
  const { toast } = useToast();

  const SILENCE_THRESHOLD = 2000; // 2 seconds of silence before responding
  const VOICE_THRESHOLD = 15; // Audio level threshold for detecting speech

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoiceMode();
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

  // Monitor audio levels for voice activity detection
  const startVoiceActivityDetection = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const checkAudioLevel = () => {
      if (!voiceModeActive) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

      if (average > VOICE_THRESHOLD) {
        // User is speaking
        lastSpeechTimeRef.current = Date.now();
        
        // If AI is speaking, stop it (barge-in)
        if (isSpeaking) {
          console.log("User barge-in detected, stopping AI speech");
          stopSpeaking();
        }
        
        setIsListening(true);
      } else {
        // Silence detected
        const silenceDuration = Date.now() - lastSpeechTimeRef.current;
        
        if (silenceDuration > SILENCE_THRESHOLD && isListening && !isLoading && !isSpeaking) {
          // User stopped talking for 2 seconds, process what they said
          console.log("2 seconds of silence detected, processing speech");
          setIsListening(false);
          processRecordedAudio();
        }
      }

      silenceDetectionRef.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  }, [voiceModeActive, isSpeaking, isListening, isLoading]);

  const processRecordedAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    // Skip if audio is too short (less than 500ms)
    if (audioBlob.size < 5000) {
      console.log("Audio too short, skipping");
      return;
    }

    try {
      setIsLoading(true);
      
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      // Send to transcription
      const transcribeResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dog-transcribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ audio: base64Audio }),
        }
      );

      if (!transcribeResponse.ok) {
        throw new Error("Transcription failed");
      }

      const { text } = await transcribeResponse.json();
      
      if (text && text.trim()) {
        setPartialTranscript('');
        await sendMessageWithVoice(text.trim());
      }
    } catch (error) {
      console.error("Audio processing error:", error);
      toast({
        title: "*confused head tilt*",
        description: "Couldn't hear that clearly. Try again?",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageWithVoice = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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
            message: text,
            conversationHistory
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent = data.response || data.bark || "*Confused head tilt* Woof?";

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak the response in voice mode
      if (voiceModeActive) {
        await speakMessageAuto(assistantContent);
      }
    } catch (error) {
      console.error('Dog chat error:', error);
      toast({
        title: "*Sad whimper*",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessageAuto = async (text: string) => {
    setIsSpeaking(true);

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
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        throw new Error(`Voice request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // Reset speech detection timer after AI finishes speaking
        lastSpeechTimeRef.current = Date.now();
      };
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error('Voice error:', error);
      setIsSpeaking(false);
    }
  };

  const startVoiceMode = async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Set up audio context for voice activity detection
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Start recording in chunks
      mediaRecorderRef.current.start(500); // Collect data every 500ms

      setVoiceModeActive(true);
      lastSpeechTimeRef.current = Date.now();

      toast({
        title: "*perks up ears*",
        description: "Voice mode active! Speak naturally, I'm listening.",
      });

      // Start voice activity detection
      startVoiceActivityDetection();

    } catch (error) {
      console.error("Microphone access error:", error);
      toast({
        title: "*sad whimper*",
        description: "Couldn't access microphone. Check permissions!",
        variant: "destructive"
      });
    }
  };

  const stopVoiceMode = () => {
    if (silenceDetectionRef.current) {
      cancelAnimationFrame(silenceDetectionRef.current);
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    stopSpeaking();
    setVoiceModeActive(false);
    setIsListening(false);
    setPartialTranscript('');
    audioChunksRef.current = [];
  };

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

  return (
    <Card className="border-logo-green/30 bg-gradient-to-br from-background via-background to-logo-green/5 h-full flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4 shrink-0">
        <CardTitle className="font-mono text-lg flex items-center gap-3">
          {/* Dog Avatar with Audio Visualization */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-logo-green/30 to-logo-green/10 flex items-center justify-center border-2 border-logo-green shadow-[0_0_20px_hsl(var(--logo-green)/0.3)] transition-all duration-300 ${isSpeaking ? 'animate-pulse' : ''} ${voiceModeActive ? 'ring-2 ring-crimson ring-offset-2 ring-offset-background' : ''}`}>
              <DogSilhouette className="w-8 h-8" animated={isSpeaking || isListening} />
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
            {/* Listening indicator */}
            {voiceModeActive && isListening && !isSpeaking && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-crimson rounded-full animate-pulse flex items-center justify-center">
                <Mic className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tracking-tight">Techno Dog</span>
              {voiceModeActive && (
                <Badge variant="outline" className="text-[10px] font-mono border-crimson/50 text-crimson uppercase tracking-wider shrink-0">
                  <Phone className="w-3 h-3 mr-1" />
                  Voice Call
                </Badge>
              )}
              {isSpeaking && (
                <Badge variant="outline" className="text-[10px] font-mono border-logo-green/50 text-logo-green uppercase tracking-wider animate-pulse shrink-0">
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speaking
                </Badge>
              )}
              {isListening && !isSpeaking && (
                <Badge variant="outline" className="text-[10px] font-mono border-crimson/50 text-crimson uppercase tracking-wider animate-pulse shrink-0">
                  <Mic className="w-3 h-3 mr-1" />
                  Listening
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              {voiceModeActive ? "Voice mode active — speak naturally" : "One scene, one pack 🖤"}
            </p>
          </div>
          
          {/* Voice Mode Toggle */}
          <Button
            variant={voiceModeActive ? "default" : "outline"}
            size="sm"
            onClick={voiceModeActive ? stopVoiceMode : startVoiceMode}
            className={`shrink-0 ${voiceModeActive ? 'bg-crimson hover:bg-crimson/90' : 'border-logo-green/50 hover:bg-logo-green/10'}`}
          >
            {voiceModeActive ? (
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
            
            {/* Partial transcript in voice mode */}
            {voiceModeActive && partialTranscript && (
              <div className="flex justify-end animate-fade-in">
                <div className="bg-primary/50 text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                  <p className="text-sm italic opacity-70">{partialTranscript}</p>
                </div>
              </div>
            )}
            
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
        {messages.length === 1 && !voiceModeActive && (
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
        {voiceModeActive && (
          <div className="px-4 py-3 bg-crimson/10 border-t border-crimson/20 shrink-0">
            <div className="flex items-center justify-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-crimson animate-pulse' : isSpeaking ? 'bg-logo-green animate-pulse' : 'bg-muted-foreground/50'}`} />
              <p className="text-xs font-mono text-center">
                {isSpeaking 
                  ? "Techno Dog is speaking... (interrupt anytime)" 
                  : isListening 
                    ? "Listening..." 
                    : isLoading 
                      ? "Processing..." 
                      : "Waiting for you to speak..."}
              </p>
            </div>
          </div>
        )}
        
        {/* Input Area - Hidden in voice mode */}
        {!voiceModeActive && (
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
