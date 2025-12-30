import { useCallback, useState, useRef, useEffect } from "react";

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

  const optionsRef = useRef(options);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);

  // Refs for stable callbacks inside SpeechRecognition handlers
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const processUserInputRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  // Initialize speech recognition (once)
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
      optionsRef.current.onTranscript?.(displayTranscript, !!finalTranscript);

      // Reset silence timeout when speech detected
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // If we got a final transcript, process it after a short pause
      if (finalTranscript && finalTranscript.trim()) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (!isProcessingRef.current) {
            processUserInputRef.current(finalTranscript.trim());
          }
        }, 1500); // Wait 1.5s of silence before processing
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        optionsRef.current.onError?.(event.error);
      }
    };

    recognition.onend = () => {
      // Restart if we should still be listening
      if (isListeningRef.current && !isProcessingRef.current && !isSpeakingRef.current) {
        try {
          recognition.start();
        } catch {
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
      } catch {
        // Ignore errors
      }
      recognitionRef.current = null;
    };
  }, []);

  // Process user input and get AI response
  const processUserInput = useCallback(async (text: string) => {
    if (isProcessingRef.current || !text.trim()) return;

    isProcessingRef.current = true;
    setStatus('processing');
    optionsRef.current.onStatusChange?.('processing');
    setCurrentTranscript('');

    // Stop listening while processing
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    messagesRef.current.push(userMessage);
    optionsRef.current.onMessage?.(userMessage);

    try {
      // Get AI response from dog-agent (same endpoint as text chat)
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
            conversationHistory: messagesRef.current.slice(-10).map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) throw new Error("Rate limit exceeded");
        if (response.status === 402) throw new Error("Credits exhausted");
        throw new Error(`Request failed: ${response.status}`);
      }

      const chatData = await response.json();
      if (chatData.error) throw new Error(chatData.error);

      const assistantText = chatData?.response || chatData?.bark || "Woof! I'm having trouble thinking right now.";

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantText,
        timestamp: new Date()
      };
      messagesRef.current.push(assistantMessage);
      optionsRef.current.onMessage?.(assistantMessage);

      // Speak the response
      await speakResponse(assistantText);

    } catch (error) {
      console.error("Error processing input:", error);
      optionsRef.current.onError?.(error instanceof Error ? error.message : "Error processing request");
    } finally {
      isProcessingRef.current = false;

      // Resume listening if voice mode is still active
      if (isListeningRef.current) {
        setStatus('listening');
        optionsRef.current.onStatusChange?.('listening');
        try {
          recognitionRef.current?.start();
        } catch {
          // Ignore
        }
      } else {
        setStatus('idle');
        optionsRef.current.onStatusChange?.('idle');
      }
    }
  }, []);

  useEffect(() => {
    processUserInputRef.current = (text: string) => {
      void processUserInput(text);
    };
  }, [processUserInput]);

  // Speak response using ElevenLabs TTS
  const speakResponse = useCallback(async (text: string) => {
    setStatus('speaking');
    optionsRef.current.onStatusChange?.('speaking');
    setIsSpeaking(true);
    isSpeakingRef.current = true;

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
          isSpeakingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = (e) => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          URL.revokeObjectURL(audioUrl);
          reject(e);
        };
        audio.play().catch(reject);
      });

    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      throw error;
    }
  }, []);

  // Start voice conversation
  const startListening = useCallback(async () => {
    if (!isSpeechRecognitionSupported()) {
      optionsRef.current.onError?.("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      isListeningRef.current = true;
      setIsListening(true);
      setStatus('listening');
      optionsRef.current.onStatusChange?.('listening');
      messagesRef.current = []; // Reset conversation

      recognitionRef.current?.start();
    } catch (error) {
      console.error("Failed to start listening:", error);
      optionsRef.current.onError?.("Failed to access microphone. Please grant permission.");
    }
  }, []);

  // Stop voice conversation
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setStatus('idle');
    optionsRef.current.onStatusChange?.('idle');

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    isSpeakingRef.current = false;
    setIsSpeaking(false);
    setCurrentTranscript('');
  }, []);

  // Stop speaking (barge-in)
  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    isSpeakingRef.current = false;
    setIsSpeaking(false);

    // Resume listening
    if (isListeningRef.current && !isProcessingRef.current) {
      setStatus('listening');
      try {
        recognitionRef.current?.start();
      } catch {
        // Ignore
      }
    }
  }, []);

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
