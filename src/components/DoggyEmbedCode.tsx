import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Code } from 'lucide-react';
import DogSilhouette from './DogSilhouette';

const DoggyEmbedCode = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const widgetUrl = 'https://techno.dog/doggy-widget';

  const embedCodes = {
    iframe: `<iframe src="${widgetUrl}" width="300" height="280" style="border:none;border-radius:12px;" title="Techno Doggy"></iframe>`,

    responsive: `<div style="max-width:300px;aspect-ratio:300/280;">
  <iframe src="${widgetUrl}" style="width:100%;height:100%;border:none;border-radius:12px;" title="Techno Doggy"></iframe>
</div>`,

    badge: `<a href="https://techno.dog/doggies" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#0a0a0a;border:1px solid #39FF14;border-radius:8px;text-decoration:none;font-family:monospace;font-size:12px;color:#39FF14;">
  <svg viewBox="0 0 64 64" width="20" height="20" fill="none"><g stroke="#39FF14" stroke-width="2" fill="none"><path d="M16 28Q12 18 18 12Q22 14 24 22"/><path d="M48 28Q52 18 46 12Q42 14 40 22"/><ellipse cx="32" cy="36" rx="16" ry="14"/><ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#39FF14"/><path d="M26 46Q32 52 38 46"/></g></svg>
  Get a Techno Doggy
</a>`,

    markdown: `[![Get a Techno Doggy](https://img.shields.io/badge/Get_a-Techno_Doggy-39FF14?style=for-the-badge)](https://techno.dog/doggies)`,
  };

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast({ title: "Copied", description: "Embed code ready to paste" });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const CodeBlock = ({ code, type, label }: { code: string; type: string; label: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => copyToClipboard(code, type)}
          className="font-mono text-xs h-7"
        >
          {copiedCode === type ? (
            <><Check className="w-3 h-3 mr-1 text-logo-green" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3 mr-1" /> Copy</>
          )}
        </Button>
      </div>
      <pre className="p-3 rounded-lg bg-muted/50 border overflow-x-auto">
        <code className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
          {code}
        </code>
      </pre>
    </div>
  );

  return (
    <Card className="border-logo-green/30">
      <CardHeader className="pb-3">
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <Code className="w-4 h-4 text-logo-green" />
          Embed Widget
        </CardTitle>
        <CardDescription className="text-xs">
          Add the Techno Doggy widget to your site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Preview */}
        <div className="flex gap-4 items-start">
          <div className="border rounded-lg overflow-hidden bg-zinc-950" style={{ width: 150, height: 140 }}>
            <iframe 
              src="/doggy-widget" 
              className="w-full h-full border-0"
              style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
              title="Preview"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="font-mono text-[9px]">300×280px</Badge>
              <Badge variant="outline" className="font-mono text-[9px]">No scroll</Badge>
              <Badge variant="outline" className="font-mono text-[9px]">Dark theme</Badge>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              Auto-rotates through doggies. Shuffle button for interaction. Links to techno.dog.
            </p>
          </div>
        </div>

        {/* Embed Codes */}
        <Tabs defaultValue="iframe" className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-8">
            <TabsTrigger value="iframe" className="font-mono text-[9px]">iFrame</TabsTrigger>
            <TabsTrigger value="responsive" className="font-mono text-[9px]">Responsive</TabsTrigger>
            <TabsTrigger value="badge" className="font-mono text-[9px]">Badge</TabsTrigger>
            <TabsTrigger value="markdown" className="font-mono text-[9px]">Markdown</TabsTrigger>
          </TabsList>

          <TabsContent value="iframe" className="mt-3">
            <CodeBlock code={embedCodes.iframe} type="iframe" label="Simple embed - paste anywhere" />
          </TabsContent>

          <TabsContent value="responsive" className="mt-3">
            <CodeBlock code={embedCodes.responsive} type="responsive" label="Scales with container" />
          </TabsContent>

          <TabsContent value="badge" className="mt-3">
            <CodeBlock code={embedCodes.badge} type="badge" label="Static badge link" />
            <div className="mt-3 p-3 border rounded-lg bg-zinc-950 flex justify-center">
              <a 
                href="https://techno.dog/doggies" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-background border border-logo-green rounded-lg font-mono text-xs text-logo-green hover:bg-logo-green/10 transition-colors"
              >
                <DogSilhouette className="w-4 h-4" />
                Get a Techno Doggy
              </a>
            </div>
          </TabsContent>

          <TabsContent value="markdown" className="mt-3">
            <CodeBlock code={embedCodes.markdown} type="markdown" label="For GitHub READMEs" />
            <div className="mt-3 p-3 border rounded-lg flex justify-center">
              <img 
                src="https://img.shields.io/badge/Get_a-Techno_Doggy-39FF14?style=for-the-badge" 
                alt="Get a Techno Doggy"
                className="h-6"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick tips */}
        <p className="font-mono text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
          Works on Notion, WordPress, Webflow, Squarespace, and more
        </p>
      </CardContent>
    </Card>
  );
};

export default DoggyEmbedCode;
