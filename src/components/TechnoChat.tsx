import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Badge } from '@/components/ui/badge';

// Create URL-friendly slug from artist name
const createArtistSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ArtistMeta {
  name: string;
  rank: number;
  nationality: string | null;
  subgenres: string[] | null;
  labels: string[] | null;
}

const TechnoChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referencedArtists, setReferencedArtists] = useState<ArtistMeta[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { trackEvent, trackSearch, trackError } = useAnalytics();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    const userMessage: Message = { role: 'user', content: userQuery };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setReferencedArtists([]);
    
    trackSearch(userQuery, 0);

    let assistantContent = '';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ query: input, stream: true }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Límite de uso alcanzado',
            description: 'Por favor, espera unos segundos e intenta de nuevo.',
            variant: 'destructive',
          });
          throw new Error('Rate limit exceeded');
        }
        if (response.status === 402) {
          toast({
            title: 'Créditos agotados',
            description: 'Por favor, añade créditos para continuar.',
            variant: 'destructive',
          });
          throw new Error('Payment required');
        }
        throw new Error('Request failed');
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Check for metadata event (artists)
            if (parsed.type === 'metadata' && parsed.artists) {
              setReferencedArtists(parsed.artists);
              continue;
            }
            
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === 'assistant') {
                  newMessages[lastIndex] = { ...newMessages[lastIndex], content: assistantContent };
                }
                return newMessages;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      trackError(error instanceof Error ? error.message : 'Chat error');
      if (!assistantContent) {
        setMessages(prev => prev.filter(m => m.content !== ''));
      }
    } finally {
      setIsLoading(false);
      if (assistantContent) {
        trackEvent({ eventType: 'chat', eventName: 'chat_response', metadata: { responseLength: assistantContent.length } });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section id="chat" className="py-20 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="border border-border mb-8">
          <div className="border-b border-border px-4 py-2 flex items-center gap-2 bg-muted/30">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              techno_knowledge_base.exe
            </span>
          </div>
          
          <div className="p-6">
            <h2 className="font-mono text-2xl md:text-3xl font-bold mb-2">
              <span className="text-primary">&gt;</span> CONSULTA LA BASE DE CONOCIMIENTO
            </h2>
            <p className="text-muted-foreground font-mono text-sm mb-6">
              Pregunta sobre artistas, sellos, festivales o cualquier tema de la escena techno underground.
            </p>

            {/* Chat Messages */}
            <div className="h-80 overflow-y-auto border border-border bg-background/50 p-4 mb-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground font-mono text-sm py-8">
                  <p>// Escribe tu pregunta para empezar</p>
                  <p className="mt-2 text-xs">Ejemplos:</p>
                  <p className="text-xs">"¿Quién es Jeff Mills?"</p>
                  <p className="text-xs">"¿Qué artistas lanzaron en Tresor?"</p>
                  <p className="text-xs">"Háblame del techno de Detroit"</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`font-mono text-sm ${
                    msg.role === 'user' 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}
                >
                  <span className="text-muted-foreground">
                    {msg.role === 'user' ? '> user: ' : '> system: '}
                  </span>
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                  {msg.role === 'assistant' && isLoading && msg.content === messages[messages.length - 1]?.content && (
                    <span className="animate-blink">_</span>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Referenced Artists Cards */}
            {referencedArtists.length > 0 && (
              <div className="mb-4">
                <p className="font-mono text-xs text-muted-foreground mb-2">// Artistas referenciados:</p>
                <div className="flex flex-wrap gap-2">
                  {referencedArtists.map((artist, idx) => (
                    <Link 
                      key={idx}
                      to={`/artists/${createArtistSlug(artist.name)}`}
                      className="border border-border bg-muted/30 px-3 py-2 hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {artist.name}
                        </span>
                        <Badge variant="outline" className="text-xs font-mono">
                          #{artist.rank}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {artist.nationality && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {artist.nationality}
                          </span>
                        )}
                        {artist.subgenres?.slice(0, 2).map((genre, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] font-mono">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                className="flex-1 bg-background border border-border px-4 py-2 font-mono text-sm 
                         focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <Button
                variant="brutalist"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? 'PROCESANDO...' : 'ENVIAR'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnoChat;
