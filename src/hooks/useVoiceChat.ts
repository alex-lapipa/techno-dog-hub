import { useCallback, useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseVoiceChatOptions {
  onMessage?: (message: Message) => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
  onError?: (error: string) => void;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
}

// Check if Web Speech API is available
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const displayTranscript = finalTranscript || interimTranscript;
      setCurrentTranscript(displayTranscript);
      options.onTranscript?.(displayTranscript, !!finalTranscript);
      
      // Reset silence timeout when speech detected
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // If we got a final transcript, process it after a short pause
      if (finalTranscript && finalTranscript.trim()) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (!isProcessingRef.current) {
            processUserInput(finalTranscript.trim());
          }
        }, 1500); // Wait 1.5s of silence before processing
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        options.onError?.(event.error);
      }
    };
    
    recognition.onend = () => {
      // Restart if we should still be listening
      if (isListening && !isProcessingRef.current && !isSpeaking) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore errors when restarting
        }
      }
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors
      }
    };
  }, [isListening, isSpeaking]);

  // Process user input and get AI response
  const processUserInput = useCallback(async (text: string) => {
    if (isProcessingRef.current || !text.trim()) return;
    
    isProcessingRef.current = true;
    setStatus('processing');
    options.onStatusChange?.('processing');
    setCurrentTranscript('');
    
    // Stop listening while processing
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    messagesRef.current.push(userMessage);
    options.onMessage?.(userMessage);
    
    try {
      // Get AI response from rag-chat
      const { data: chatData, error: chatError } = await supabase.functions.invoke("rag-chat", {
        body: { 
          message: text,
          conversationHistory: messagesRef.current.slice(-10) // Last 10 messages for context
        }
      });
      
      if (chatError) throw chatError;
      
      const assistantText = chatData?.response || chatData?.message || "Woof! I'm having trouble thinking right now.";
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantText,
        timestamp: new Date()
      };
      messagesRef.current.push(assistantMessage);
      options.onMessage?.(assistantMessage);
      
      // Speak the response
      await speakResponse(assistantText);
      
    } catch (error) {
      console.error("Error processing input:", error);
      options.onError?.(error instanceof Error ? error.message : "Error processing request");
    } finally {
      isProcessingRef.current = false;
      
      // Resume listening if voice mode is still active
      if (isListening) {
        setStatus('listening');
        options.onStatusChange?.('listening');
        try {
          recognitionRef.current?.start();
        } catch (e) {
          // Ignore
        }
      } else {
        setStatus('idle');
        options.onStatusChange?.('idle');
      }
    }
  }, [isListening, options]);

  // Speak response using ElevenLabs TTS
  const speakResponse = useCallback(async (text: string) => {
    setStatus('speaking');
    options.onStatusChange?.('speaking');
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
        throw new Error(`TTS request failed: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (e) => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          reject(e);
        };
        audio.play().catch(reject);
      });
      
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      throw error;
    }
  }, [options]);

  // Start voice conversation
  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionSupported()) {
      options.onError?.("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsListening(true);
      setStatus('listening');
      options.onStatusChange?.('listening');
      messagesRef.current = []; // Reset conversation
      
      recognitionRef.current?.start();
    } catch (error) {
      console.error("Failed to start listening:", error);
      options.onError?.("Failed to access microphone. Please grant permission.");
    }
  }, [options]);

  // Stop voice conversation
  const stopListening = useCallback(() => {
    setIsListening(false);
    setStatus('idle');
    options.onStatusChange?.('idle');
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(false);
    setCurrentTranscript('');
  }, [options]);

  // Stop speaking (barge-in)
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    
    // Resume listening
    if (isListening && !isProcessingRef.current) {
      setStatus('listening');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        // Ignore
      }
    }
  }, [isListening]);

  return {
    // State
    status,
    isListening,
    isSpeaking,
    isProcessing: status === 'processing',
    currentTranscript,
    
    // Actions
    startListening,
    stopListening,
    stopSpeaking,
    processUserInput, // Allow manual text input
    speakResponse, // Allow manual TTS
  };
}
