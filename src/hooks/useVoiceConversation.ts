import { useConversation } from "@elevenlabs/react";
import { useCallback, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseVoiceConversationOptions {
  onMessage?: (message: Message) => void;
  onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void;
  onError?: (error: string) => void;
}

export function useVoiceConversation(options: UseVoiceConversationOptions = {}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const currentTranscriptRef = useRef<string>('');
  
  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice conversation connected");
      setConnectionStatus('connected');
      setIsConnecting(false);
      options.onStatusChange?.('connected');
    },
    onDisconnect: () => {
      console.log("Voice conversation disconnected");
      setConnectionStatus('disconnected');
      setIsConnecting(false);
      options.onStatusChange?.('disconnected');
    },
    onMessage: (message: unknown) => {
      console.log("Conversation message:", message);
      
      // Cast to record to access properties safely
      const msg = message as Record<string, unknown>;
      
      // Handle user transcript
      if (msg.type === 'user_transcript') {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        if (event?.user_transcript) {
          const userText = event.user_transcript as string;
          options.onMessage?.({
            role: 'user',
            content: userText,
            timestamp: new Date()
          });
          currentTranscriptRef.current = '';
        }
      }
      
      // Handle agent response
      if (msg.type === 'agent_response') {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        if (event?.agent_response) {
          const assistantText = event.agent_response as string;
          options.onMessage?.({
            role: 'assistant',
            content: assistantText,
            timestamp: new Date()
          });
        }
      }
      
      // Handle corrected response (after barge-in)
      if (msg.type === 'agent_response_correction') {
        const event = msg.agent_response_correction_event as Record<string, unknown> | undefined;
        if (event?.corrected_agent_response) {
          const correctedText = event.corrected_agent_response as string;
          options.onMessage?.({
            role: 'assistant',
            content: correctedText,
            timestamp: new Date()
          });
        }
      }
    },
    onError: (error: unknown) => {
      console.error("Conversation error:", error);
      const errorMessage = typeof error === 'string' ? error : 
        (error as Record<string, unknown>)?.message as string || 'Connection error';
      options.onError?.(errorMessage);
      setIsConnecting(false);
      setConnectionStatus('disconnected');
    },
  });

  const startConversation = useCallback(async () => {
    if (isConnecting || connectionStatus === 'connected') return;
    
    setIsConnecting(true);
    setConnectionStatus('connecting');
    options.onStatusChange?.('connecting');
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get conversation token from edge function
      const { data, error } = await supabase.functions.invoke("dog-conversation-token", {
        body: {}
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to get conversation token');
      }
      
      if (!data) {
        throw new Error('No token data received');
      }
      
      console.log("Token response mode:", data.mode);
      
      // Start the conversation based on the mode
      if (data.token) {
        // Agent mode with token
        await conversation.startSession({
          conversationToken: data.token,
          connectionType: 'webrtc',
        });
      } else if (data.signed_url) {
        // Signed URL mode
        await conversation.startSession({
          signedUrl: data.signed_url,
          connectionType: 'websocket',
        });
      } else {
        throw new Error('No valid connection method available');
      }
      
    } catch (error) {
      console.error("Failed to start conversation:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      options.onError?.(errorMessage);
      setIsConnecting(false);
      setConnectionStatus('disconnected');
      options.onStatusChange?.('disconnected');
    }
  }, [conversation, isConnecting, connectionStatus, options]);

  const endConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
    setConnectionStatus('disconnected');
    options.onStatusChange?.('disconnected');
  }, [conversation, options]);

  const sendTextMessage = useCallback((text: string) => {
    if (connectionStatus !== 'connected') return;
    conversation.sendUserMessage(text);
  }, [conversation, connectionStatus]);

  return {
    // State
    isConnecting,
    isConnected: connectionStatus === 'connected',
    isSpeaking: conversation.isSpeaking,
    connectionStatus,
    
    // Actions
    startConversation,
    endConversation,
    sendTextMessage,
    
    // Volume controls
    setVolume: conversation.setVolume,
    getInputVolume: conversation.getInputVolume,
    getOutputVolume: conversation.getOutputVolume,
  };
}
