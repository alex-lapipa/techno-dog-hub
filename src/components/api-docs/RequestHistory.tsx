import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  status: number;
  time: number;
  requestBody?: any;
  responseData: any;
}

interface RequestHistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onReplay?: (entry: HistoryEntry) => void;
}

const HistoryItem = ({ entry }: { entry: HistoryEntry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const methodColors = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PATCH: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusColor = entry.status >= 200 && entry.status < 300
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : entry.status >= 400
    ? "bg-crimson/20 text-crimson border-crimson/30"
    : "bg-amber-500/20 text-amber-400 border-amber-500/30";

  const handleCopy = () => {
    const data = {
      method: entry.method,
      url: entry.url,
      status: entry.status,
      requestBody: entry.requestBody,
      response: entry.responseData,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract path from full URL
  const path = entry.url.replace(/^https?:\/\/[^/]+\/functions\/v1\/admin-api/, "") || "/";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border/50 rounded-lg overflow-hidden bg-card/30 hover:bg-card/50 transition-colors">
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 flex items-center gap-2 text-left">
            <Badge className={`${methodColors[entry.method]} font-mono text-[10px] px-1.5 py-0`}>
              {entry.method}
            </Badge>
            <code className="text-xs font-mono text-foreground/80 truncate flex-1">{path}</code>
            <Badge className={`${statusColor} font-mono text-[10px] px-1.5 py-0`}>
              {entry.status}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono">{entry.time}ms</span>
            <span className="text-[10px] text-muted-foreground">
              {entry.timestamp.toLocaleTimeString()}
            </span>
            {isOpen ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Full URL</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <code className="text-[10px] font-mono text-foreground/70 block break-all">{entry.url}</code>
            
            {entry.requestBody && Object.keys(entry.requestBody).length > 0 && (
              <>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mt-2">Request Body</span>
                <pre className="text-[10px] font-mono text-foreground/70 bg-background/50 p-2 rounded overflow-x-auto max-h-24 overflow-y-auto">
                  {JSON.stringify(entry.requestBody, null, 2)}
                </pre>
              </>
            )}
            
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium block mt-2">Response</span>
            <pre className="text-[10px] font-mono text-foreground/70 bg-background/50 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
              {JSON.stringify(entry.responseData, null, 2)}
            </pre>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export const RequestHistory = ({ history, onClear }: RequestHistoryProps) => {
  if (history.length === 0) {
    return (
      <Card className="bg-card/30 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4" />
            Request History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-4">
            No requests yet. Use "Try It" on any endpoint to start.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/30 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4" />
            Request History
            <Badge variant="secondary" className="font-mono text-[10px]">{history.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs text-muted-foreground hover:text-crimson">
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-2">
            {history.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
