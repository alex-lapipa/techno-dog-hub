import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Code, Smartphone, Monitor } from 'lucide-react';

const DoggyEmbedCode = () => {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [widgetType, setWidgetType] = useState<'simple' | 'advanced'>('simple');

  const widgetUrl = 'https://techno.dog/doggy-widget';

  // SIMPLE WIDGET - Mobile-first, minimal, no assistant
  const simpleEmbedCodes = {
    iframe: `<iframe 
  src="${widgetUrl}" 
  width="280" 
  height="260" 
  style="border:none;border-radius:16px;overflow:hidden;" 
  title="Techno Doggy"
></iframe>`,

    responsive: `<div style="width:100%;max-width:280px;aspect-ratio:280/260;">
  <iframe 
    src="${widgetUrl}" 
    style="width:100%;height:100%;border:none;border-radius:16px;overflow:hidden;" 
    title="Techno Doggy"
  ></iframe>
</div>`,

    html: `<!-- Techno Doggy Widget - Mobile First -->
<div id="techno-doggy-widget" style="width:100%;max-width:280px;margin:0 auto;">
  <iframe 
    src="${widgetUrl}"
    style="width:100%;aspect-ratio:280/260;border:none;border-radius:16px;overflow:hidden;"
    loading="lazy"
    title="Techno Doggy"
  ></iframe>
</div>`,
  };

  // ADVANCED WIDGET - For CMS platforms
  const advancedEmbedCodes = {
    wordpress: `<!-- WordPress Block/Widget -->
<div class="techno-doggy-container" style="text-align:center;padding:20px;">
  <iframe 
    src="${widgetUrl}" 
    width="280" 
    height="260" 
    style="border:none;border-radius:16px;max-width:100%;" 
    title="Techno Doggy Widget"
    loading="lazy"
  ></iframe>
</div>

<!-- Add to theme functions.php for sidebar widget -->
<?php
function techno_doggy_widget() {
  echo '<iframe src="${widgetUrl}" width="280" height="260" style="border:none;border-radius:16px;max-width:100%;" title="Techno Doggy"></iframe>';
}
?>`,

    notion: `<!-- Notion: Use /embed command, paste this URL -->
${widgetUrl}

<!-- Or create a linked bookmark -->
[🐕 Get a Techno Doggy](https://techno.dog/doggies)`,

    webflow: `<!-- Webflow Custom Code Embed -->
<div class="techno-doggy-embed" style="display:flex;justify-content:center;padding:2rem 0;">
  <iframe 
    src="${widgetUrl}" 
    width="280" 
    height="260" 
    style="border:none;border-radius:16px;box-shadow:0 4px 20px rgba(57,255,20,0.15);" 
    title="Techno Doggy"
    loading="lazy"
  ></iframe>
</div>

<style>
.techno-doggy-embed iframe {
  transition: transform 0.3s ease;
}
.techno-doggy-embed iframe:hover {
  transform: scale(1.02);
}
</style>`,

    squarespace: `<!-- Squarespace Code Block -->
<div style="display:flex;justify-content:center;padding:40px 20px;">
  <iframe 
    src="${widgetUrl}" 
    width="280" 
    height="260" 
    style="border:none;border-radius:16px;" 
    title="Techno Doggy"
  ></iframe>
</div>`,

    markdown: `[![Get a Techno Doggy](https://img.shields.io/badge/🖤_Get_a-Techno_Doggy-39FF14?style=for-the-badge&labelColor=0a0a0a)](https://techno.dog/doggies)`,

    badge: `<a href="https://techno.dog/doggies" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:#0a0a0a;border:1px solid #39FF14;border-radius:10px;text-decoration:none;font-family:monospace;font-size:13px;color:#39FF14;transition:all 0.2s;">
  <svg viewBox="0 0 64 64" width="22" height="22" fill="none"><g stroke="#39FF14" stroke-width="2.5" fill="none"><path d="M16 28Q12 18 18 12Q22 14 24 22"/><path d="M48 28Q52 18 46 12Q42 14 40 22"/><ellipse cx="32" cy="36" rx="16" ry="14"/><ellipse cx="32" cy="40" rx="3" ry="2.5" fill="#39FF14"/><path d="M26 46Q32 52 38 46"/></g></svg>
  Get a Techno Doggy
</a>`,
  };

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast({ title: "Copied!", description: "Embed code ready to paste" });
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
          className="font-mono text-xs h-7 gap-1"
        >
          {copiedCode === type ? (
            <><Check className="w-3 h-3 text-logo-green" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3" /> Copy</>
          )}
        </Button>
      </div>
      <pre className="p-3 rounded-lg bg-muted/50 border overflow-x-auto max-h-40">
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
          Add the Techno Doggy widget to any site — no assistant, no scrollbars
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Widget Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={widgetType === 'simple' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWidgetType('simple')}
            className="flex-1 font-mono text-xs gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Simple (Mobile-First)
          </Button>
          <Button
            variant={widgetType === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setWidgetType('advanced')}
            className="flex-1 font-mono text-xs gap-1.5"
          >
            <Monitor className="w-3.5 h-3.5" />
            Advanced (CMS)
          </Button>
        </div>

        {/* Live Preview */}
        <div className="flex gap-4 items-start">
          <div 
            className="border border-logo-green/20 rounded-xl overflow-hidden bg-zinc-950 flex-shrink-0" 
            style={{ width: 140, height: 130 }}
          >
            <iframe 
              src="/doggy-widget" 
              className="border-0"
              style={{ 
                transform: 'scale(0.5)', 
                transformOrigin: 'top left', 
                width: '280px', 
                height: '260px' 
              }}
              title="Preview"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-1 flex-wrap">
              <Badge variant="outline" className="font-mono text-[9px]">280×260px</Badge>
              <Badge variant="outline" className="font-mono text-[9px]">No scrollbars</Badge>
              <Badge variant="outline" className="font-mono text-[9px]">No assistant</Badge>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              Auto-rotates doggies. Shuffle + WhatsApp share buttons. Clean mobile-first design.
            </p>
          </div>
        </div>

        {/* SIMPLE WIDGET CODES */}
        {widgetType === 'simple' && (
          <Tabs defaultValue="responsive" className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-8">
              <TabsTrigger value="responsive" className="font-mono text-[9px]">Responsive</TabsTrigger>
              <TabsTrigger value="iframe" className="font-mono text-[9px]">Fixed Size</TabsTrigger>
              <TabsTrigger value="html" className="font-mono text-[9px]">Full HTML</TabsTrigger>
            </TabsList>

            <TabsContent value="responsive" className="mt-3">
              <CodeBlock 
                code={simpleEmbedCodes.responsive} 
                type="responsive" 
                label="Scales with container — recommended for mobile" 
              />
            </TabsContent>

            <TabsContent value="iframe" className="mt-3">
              <CodeBlock 
                code={simpleEmbedCodes.iframe} 
                type="iframe" 
                label="Fixed 280×260px — paste anywhere" 
              />
            </TabsContent>

            <TabsContent value="html" className="mt-3">
              <CodeBlock 
                code={simpleEmbedCodes.html} 
                type="html" 
                label="Centered with lazy loading" 
              />
            </TabsContent>
          </Tabs>
        )}

        {/* ADVANCED WIDGET CODES */}
        {widgetType === 'advanced' && (
          <Tabs defaultValue="wordpress" className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-8 mb-1">
              <TabsTrigger value="wordpress" className="font-mono text-[9px]">WordPress</TabsTrigger>
              <TabsTrigger value="webflow" className="font-mono text-[9px]">Webflow</TabsTrigger>
              <TabsTrigger value="squarespace" className="font-mono text-[9px]">Squarespace</TabsTrigger>
            </TabsList>
            <TabsList className="grid grid-cols-3 w-full h-8">
              <TabsTrigger value="notion" className="font-mono text-[9px]">Notion</TabsTrigger>
              <TabsTrigger value="markdown" className="font-mono text-[9px]">Markdown</TabsTrigger>
              <TabsTrigger value="badge" className="font-mono text-[9px]">Badge</TabsTrigger>
            </TabsList>

            <TabsContent value="wordpress" className="mt-3">
              <CodeBlock 
                code={advancedEmbedCodes.wordpress} 
                type="wordpress" 
                label="WordPress block or sidebar widget" 
              />
            </TabsContent>

            <TabsContent value="webflow" className="mt-3">
              <CodeBlock 
                code={advancedEmbedCodes.webflow} 
                type="webflow" 
                label="Webflow custom code embed with hover effect" 
              />
            </TabsContent>

            <TabsContent value="squarespace" className="mt-3">
              <CodeBlock 
                code={advancedEmbedCodes.squarespace} 
                type="squarespace" 
                label="Squarespace code block" 
              />
            </TabsContent>

            <TabsContent value="notion" className="mt-3">
              <CodeBlock 
                code={advancedEmbedCodes.notion} 
                type="notion" 
                label="Notion embed or bookmark" 
              />
            </TabsContent>

            <TabsContent value="markdown" className="mt-3">
              <CodeBlock 
                code={advancedEmbedCodes.markdown} 
                type="markdown" 
                label="GitHub READMEs and docs" 
              />
              <div className="mt-3 p-3 border rounded-lg flex justify-center bg-zinc-950">
                <img 
                  src="https://img.shields.io/badge/🖤_Get_a-Techno_Doggy-39FF14?style=for-the-badge&labelColor=0a0a0a" 
                  alt="Get a Techno Doggy"
                  className="h-7"
                />
              </div>
            </TabsContent>

            <TabsContent value="badge" className="mt-3">
              <CodeBlock 
                code={advancedEmbedCodes.badge} 
                type="badge" 
                label="Inline badge link — any HTML site" 
              />
              <div className="mt-3 p-4 border rounded-lg bg-zinc-950 flex justify-center">
                <a 
                  href="https://techno.dog/doggies" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-logo-green rounded-lg font-mono text-sm text-logo-green hover:bg-logo-green/10 transition-colors"
                >
                  <svg viewBox="0 0 64 64" width="22" height="22" fill="none">
                    <g stroke="currentColor" strokeWidth="2.5" fill="none">
                      <path d="M16 28Q12 18 18 12Q22 14 24 22"/>
                      <path d="M48 28Q52 18 46 12Q42 14 40 22"/>
                      <ellipse cx="32" cy="36" rx="16" ry="14"/>
                      <ellipse cx="32" cy="40" rx="3" ry="2.5" fill="currentColor"/>
                      <path d="M26 46Q32 52 38 46"/>
                    </g>
                  </svg>
                  Get a Techno Doggy
                </a>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Footer tip */}
        <p className="font-mono text-[10px] text-muted-foreground text-center pt-2 border-t border-border/50">
          Widget is self-contained • No dependencies • Works everywhere
        </p>
      </CardContent>
    </Card>
  );
};

export default DoggyEmbedCode;
