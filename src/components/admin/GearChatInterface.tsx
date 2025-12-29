import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GearChatInterfaceProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  isChatting: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export const GearChatInterface = ({
  chatMessages,
  chatInput,
  isChatting,
  onInputChange,
  onSendMessage
}: GearChatInterfaceProps) => {
  return (
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
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="What synth is best for acid techno?"
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
              className="flex-1 bg-zinc-800 border-border"
            />
            <Button 
              onClick={onSendMessage} 
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
  );
};

export default GearChatInterface;
