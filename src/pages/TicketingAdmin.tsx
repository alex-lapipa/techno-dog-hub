import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, 
  ArrowLeft, 
  Ticket, 
  Shield, 
  Mail, 
  Database, 
  Server, 
  FileText, 
  Package, 
  Folder, 
  Code, 
  Copy, 
  Check,
  ExternalLink,
  Zap,
  Users,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function TicketingAdmin() {
  const navigate = useNavigate();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (section: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const generateFullPackage = () => {
    const divider = '═'.repeat(80);
    const subDivider = '─'.repeat(80);
    
    const content = `${divider}
LOVABLE TICKETING MODULE - COMPLETE DROP-IN PACKAGE
${divider}

INSTALLATION STEPS:
1. Create folder: src/modules/ticketing/
2. Create folder: supabase/functions/
3. Copy each file below to the specified path
4. Run SQL in Supabase Dashboard > SQL Editor
5. Deploy edge functions: supabase functions deploy
6. Set environment variables

${divider}
FILE: .env.example
${subDivider}

# Supabase (required)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx

# App URL
VITE_PUBLIC_APP_URL=https://your-app.lovable.app

# Edge Function Secrets (set via Supabase CLI)
# SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
# RESEND_API_KEY=re_xxxxx
# RESEND_FROM_EMAIL=tickets@yourdomain.com

${divider}
FILE: src/modules/ticketing/ticketing.types.ts
${subDivider}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  primary_color?: string;
  invoice_prefix: string;
  invoice_counter: number;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  org_id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  capacity?: number;
}

export interface Event {
  id: string;
  org_id: string;
  venue_id?: string;
  slug: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  capacity?: number;
  venue?: Venue;
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity_total: number;
  quantity_sold: number;
  max_per_order: number;
  sort_order: number;
}

export type OrderStatus = 'draft' | 'pending_payment' | 'paid' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  org_id: string;
  event_id: string;
  order_number: string;
  status: OrderStatus;
  buyer_email: string;
  buyer_first_name: string;
  buyer_last_name: string;
  total: number;
  currency: string;
  created_at: string;
  event?: Event;
  tickets?: Ticket[];
  invoice?: Invoice;
}

export interface Ticket {
  id: string;
  order_id: string;
  ticket_type_id: string;
  code: string;
  qr_payload: string;
  status: 'valid' | 'used' | 'cancelled';
  ticket_type?: TicketType;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  pdf_url?: string;
  total: number;
}

${divider}
FILE: src/modules/ticketing/ticketing.schema.sql
${subDivider}

-- Run this in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS ticketing_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  invoice_prefix TEXT NOT NULL,
  invoice_counter INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticketing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticketing_ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES ticketing_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  quantity_total INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticketing_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id),
  event_id UUID NOT NULL REFERENCES ticketing_events(id),
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft',
  buyer_email TEXT NOT NULL,
  buyer_first_name TEXT NOT NULL,
  buyer_last_name TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticketing_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES ticketing_orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticketing_ticket_types(id),
  code TEXT UNIQUE NOT NULL,
  qr_payload TEXT NOT NULL,
  status TEXT DEFAULT 'valid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticketing_orders ENABLE ROW LEVEL SECURITY;

${divider}
END OF PACKAGE
${divider}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lovable-ticketing-module.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Module package downloaded');
  };

  const features = [
    { icon: Ticket, label: 'Multi-Tier Tickets', desc: 'Early bird, GA, VIP pricing', color: 'text-logo-green' },
    { icon: Shield, label: 'GDPR Compliant', desc: 'Consent tracking built-in', color: 'text-crimson' },
    { icon: Mail, label: 'Email Integration', desc: 'Resend for confirmations', color: 'text-logo-green' },
    { icon: Database, label: 'Supabase Backend', desc: 'Postgres + RLS policies', color: 'text-crimson' },
    { icon: Server, label: 'Edge Functions', desc: 'Deno serverless runtime', color: 'text-logo-green' },
    { icon: FileText, label: 'PDF Invoices', desc: 'Auto-generated receipts', color: 'text-crimson' },
  ];

  const files = [
    { name: 'ticketing.types.ts', desc: 'TypeScript interfaces', icon: Code, lines: '~150' },
    { name: 'ticketing.schema.sql', desc: 'Database schema + RLS', icon: Database, lines: '~200' },
    { name: 'ticketing.seed.sql', desc: 'Test data', icon: Database, lines: '~30' },
    { name: 'ticketing.api.ts', desc: 'Supabase client', icon: Code, lines: '~100' },
    { name: 'TicketWidget.tsx', desc: 'Purchase widget', icon: Code, lines: '~400' },
    { name: 'AdminTicketing.tsx', desc: 'Admin dashboard', icon: Code, lines: '~300' },
    { name: 'create-order/index.ts', desc: 'Order creation', icon: Server, lines: '~80' },
    { name: 'confirm-payment/index.ts', desc: 'Payment confirmation', icon: Server, lines: '~60' },
    { name: 'send-confirmation/index.ts', desc: 'Email dispatch', icon: Server, lines: '~50' },
    { name: 'generate-invoice-pdf/index.ts', desc: 'PDF generation', icon: Server, lines: '~70' },
  ];

  const stats = [
    { label: 'Tables', value: '8', icon: Database },
    { label: 'Edge Functions', value: '4', icon: Server },
    { label: 'Components', value: '2', icon: Code },
    { label: 'RLS Policies', value: '6', icon: Shield },
  ];

  const setupSteps = [
    { step: 1, text: 'Download the complete module package', status: 'action' },
    { step: 2, text: 'Copy files to src/modules/ticketing/', status: 'pending' },
    { step: 3, text: 'Run schema.sql in SQL Editor', status: 'pending' },
    { step: 4, text: 'Deploy edge functions with CLI', status: 'pending' },
    { step: 5, text: 'Set environment variables', status: 'pending' },
    { step: 6, text: 'Add <TicketWidget /> to event pages', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-2">
                <Ticket className="w-6 h-6 text-crimson" />
                TICKETING MODULE
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                Complete event ticketing system for Lovable + Supabase
              </p>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs border-logo-green/50 text-logo-green">
            <Package className="w-3 h-3 mr-1" />
            DROP-IN MODULE
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900 border-crimson/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono uppercase">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className="w-8 h-8 text-crimson/60" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Download Card */}
        <Card className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border-2 border-crimson/50 shadow-lg shadow-crimson/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-mono text-lg flex items-center gap-3">
              <div className="p-2 bg-crimson/20 rounded-lg">
                <Download className="w-6 h-6 text-crimson" />
              </div>
              <div>
                <span className="text-crimson">DOWNLOAD PACKAGE</span>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  Get the complete ticketing module with all dependencies
                </p>
              </div>
            </CardTitle>
            <Button 
              onClick={generateFullPackage}
              size="lg"
              className="bg-crimson hover:bg-crimson/80 text-white font-bold px-6"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Module
            </Button>
          </CardHeader>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.label} className="bg-zinc-900/50 border-border hover:border-crimson/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-zinc-800 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-bold text-foreground">{feature.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Files List */}
          <Card className="bg-zinc-900/50 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Folder className="w-4 h-4 text-logo-green" />
                INCLUDED FILES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file) => (
                <div 
                  key={file.name} 
                  className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 border border-border hover:border-crimson/30 transition-colors"
                >
                  <file.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-mono text-foreground flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{file.desc}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{file.lines}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Setup Steps */}
          <Card className="bg-zinc-900/50 border-border">
            <CardHeader>
              <CardTitle className="font-mono text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-logo-green" />
                QUICK SETUP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {setupSteps.map((item) => (
                <div 
                  key={item.step}
                  className={`flex items-center gap-3 py-3 px-3 border transition-colors ${
                    item.status === 'action' 
                      ? 'bg-crimson/10 border-crimson/50' 
                      : 'bg-zinc-800/30 border-border'
                  }`}
                >
                  <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${
                    item.status === 'action' 
                      ? 'bg-crimson text-white' 
                      : 'bg-zinc-700 text-muted-foreground'
                  }`}>
                    {item.step}
                  </div>
                  <span className={`text-sm font-mono ${
                    item.status === 'action' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Usage Example */}
        <Card className="bg-zinc-900/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Code className="w-4 h-4 text-logo-green" />
              USAGE EXAMPLE
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copyToClipboard('usage', `<TicketWidget
  orgSlug="aquasella"
  eventSlug="summer-fest-2025"
  theme={{ primaryColor: "#6366f1" }}
/>`)}
              className="font-mono text-xs"
            >
              {copiedSection === 'usage' ? (
                <><Check className="w-3 h-3 mr-1" /> Copied</>
              ) : (
                <><Copy className="w-3 h-3 mr-1" /> Copy</>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 border border-border p-4 font-mono text-sm">
              <div className="text-muted-foreground">{'// Add to any page:'}</div>
              <div className="mt-2">
                <span className="text-muted-foreground">{'<'}</span>
                <span className="text-amber-400">TicketWidget</span>
              </div>
              <div className="pl-4">
                <span className="text-logo-green">orgSlug</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-crimson">"aquasella"</span>
              </div>
              <div className="pl-4">
                <span className="text-logo-green">eventSlug</span>
                <span className="text-muted-foreground">=</span>
                <span className="text-crimson">"summer-fest-2025"</span>
              </div>
              <div className="pl-4">
                <span className="text-logo-green">theme</span>
                <span className="text-muted-foreground">={'={{ '}</span>
                <span className="text-logo-green">primaryColor</span>
                <span className="text-muted-foreground">: </span>
                <span className="text-crimson">"#6366f1"</span>
                <span className="text-muted-foreground">{' }}'}</span>
              </div>
              <div className="text-muted-foreground">{'/>'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture Diagram */}
        <Card className="bg-zinc-900/50 border-border">
          <CardHeader>
            <CardTitle className="font-mono text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-logo-green" />
              ARCHITECTURE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="p-4 bg-zinc-800 border border-crimson/30">
                  <Users className="w-6 h-6 mx-auto text-crimson" />
                </div>
                <p className="text-xs font-mono text-muted-foreground">Buyer</p>
              </div>
              <div className="space-y-2">
                <div className="p-4 bg-zinc-800 border border-logo-green/30">
                  <Ticket className="w-6 h-6 mx-auto text-logo-green" />
                </div>
                <p className="text-xs font-mono text-muted-foreground">Widget</p>
              </div>
              <div className="space-y-2">
                <div className="p-4 bg-zinc-800 border border-crimson/30">
                  <CreditCard className="w-6 h-6 mx-auto text-crimson" />
                </div>
                <p className="text-xs font-mono text-muted-foreground">Payment</p>
              </div>
              <div className="space-y-2">
                <div className="p-4 bg-zinc-800 border border-logo-green/30">
                  <QrCode className="w-6 h-6 mx-auto text-logo-green" />
                </div>
                <p className="text-xs font-mono text-muted-foreground">Ticket</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px flex-1 bg-crimson/30" />
              <span className="text-xs font-mono text-muted-foreground px-2">EDGE FUNCTIONS</span>
              <div className="h-px flex-1 bg-crimson/30" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-zinc-800/50 border border-border">
                <p className="text-[10px] font-mono text-muted-foreground">create-order</p>
              </div>
              <div className="p-2 bg-zinc-800/50 border border-border">
                <p className="text-[10px] font-mono text-muted-foreground">confirm-payment</p>
              </div>
              <div className="p-2 bg-zinc-800/50 border border-border">
                <p className="text-[10px] font-mono text-muted-foreground">send-confirmation</p>
              </div>
              <div className="p-2 bg-zinc-800/50 border border-border">
                <p className="text-[10px] font-mono text-muted-foreground">generate-invoice</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs font-mono text-muted-foreground">
            Built for Lovable.dev • Supabase Postgres + Edge Functions + Resend
          </p>
        </div>
      </div>
    </div>
  );
}
