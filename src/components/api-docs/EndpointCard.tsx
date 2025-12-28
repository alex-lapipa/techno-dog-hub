import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';
import { TryItPanel } from './TryItPanel';
import { CodeBlock } from './CodeBlock';

interface EndpointCardProps {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  baseUrl: string;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: { name: string; type: string; description: string; required?: boolean }[];
  response?: string;
  example?: string;
}

const methodColors = {
  GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PATCH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export const EndpointCard = ({ 
  method, 
  path, 
  description, 
  baseUrl,
  params, 
  body,
  response,
  example 
}: EndpointCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-card/50 border-border/50 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${methodColors[method]} font-mono text-xs px-2 py-0.5`}>
              {method}
            </Badge>
            <code className="text-sm font-mono text-foreground/90">{path}</code>
          </div>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 h-7">
                <Play className="h-3 w-3" />
                Try It
                {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params && params.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Query Parameters</h4>
            <div className="space-y-2">
              {params.map((param) => (
                <div key={param.name} className="flex items-start gap-2 text-sm">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{param.name}</code>
                  <span className="text-muted-foreground text-xs">({param.type})</span>
                  {param.required && <Badge variant="outline" className="text-xs">required</Badge>}
                  <span className="text-foreground/70">{param.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {body && body.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Request Body</h4>
            <div className="space-y-2">
              {body.map((field) => (
                <div key={field.name} className="flex items-start gap-2 text-sm">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{field.name}</code>
                  <span className="text-muted-foreground text-xs">({field.type})</span>
                  {field.required && <Badge variant="outline" className="text-xs">required</Badge>}
                  <span className="text-foreground/70">{field.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Try It Panel */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <TryItPanel method={method} path={path} baseUrl={baseUrl} params={params} body={body} />
          </CollapsibleContent>
        </Collapsible>

        {example && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Example</h4>
            <CodeBlock code={example} />
          </div>
        )}

        {response && (
          <div>
            <h4 className="text-sm font-medium text-foreground/80 mb-2">Response</h4>
            <CodeBlock code={response} language="json" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
