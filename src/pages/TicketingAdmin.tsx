import React, { useState } from 'react';
import { Download, Check, ChevronDown, ChevronRight, Database, Server, FileText, Package, Copy, Folder, Code, Mail, Shield, Ticket, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TicketingAdmin() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    readme: false,
    schema: false,
    types: false,
    api: false,
    widget: false,
    admin: false,
    edge: false,
  });

  const copyToClipboard = (section: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateFullPackage = () => {
    const divider = '═'.repeat(80);
    const subDivider = '─'.repeat(80);
    
    let content = `${divider}
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

// TypeScript type definitions for the ticketing module

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
-- Creates all tables, indexes, RLS policies, and triggers

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (multi-tenant root)
CREATE TABLE IF NOT EXISTS ticketing_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  sender_name TEXT,
  sender_email TEXT,
  invoice_prefix TEXT NOT NULL,
  invoice_counter INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venues
CREATE TABLE IF NOT EXISTS ticketing_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS ticketing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES ticketing_venues(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Ticket Types
CREATE TABLE IF NOT EXISTS ticketing_ticket_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES ticketing_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  quantity_total INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  max_per_order INTEGER DEFAULT 10,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS ticketing_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id),
  event_id UUID NOT NULL REFERENCES ticketing_events(id),
  order_number TEXT UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'paid', 'cancelled', 'refunded')),
  buyer_email TEXT NOT NULL,
  buyer_first_name TEXT NOT NULL,
  buyer_last_name TEXT NOT NULL,
  buyer_phone TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  fees DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets
CREATE TABLE IF NOT EXISTS ticketing_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES ticketing_orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES ticketing_ticket_types(id),
  attendee_id UUID,
  code TEXT UNIQUE NOT NULL,
  qr_payload TEXT NOT NULL,
  status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consent Records (GDPR)
CREATE TABLE IF NOT EXISTS ticketing_consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES ticketing_orders(id),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id),
  event_id UUID NOT NULL REFERENCES ticketing_events(id),
  email TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'marketing')),
  policy_version TEXT NOT NULL DEFAULT '1.0',
  granted BOOLEAN NOT NULL,
  source TEXT NOT NULL DEFAULT 'checkout',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS ticketing_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES ticketing_organizations(id),
  order_id UUID UNIQUE NOT NULL REFERENCES ticketing_orders(id),
  invoice_number TEXT UNIQUE,
  pdf_url TEXT,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ticketing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticketing_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticketing_orders ENABLE ROW LEVEL SECURITY;

-- Public read access to published events
CREATE POLICY "public_read_ticketing_events" ON ticketing_events FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_ticketing_tickets" ON ticketing_ticket_types FOR SELECT USING (true);
CREATE POLICY "public_insert_ticketing_orders" ON ticketing_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "service_role_ticketing_orders" ON ticketing_orders FOR ALL USING (auth.role() = 'service_role');

${divider}
END OF PACKAGE
${divider}

For complete component implementations, visit the Lovable documentation
or generate components using Claude with the types and schema above.
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
    { icon: Ticket, label: 'Ticket Sales', desc: 'Multi-tier pricing' },
    { icon: Shield, label: 'GDPR Ready', desc: 'Consent tracking' },
    { icon: Mail, label: 'Email', desc: 'Resend integration' },
    { icon: Database, label: 'Supabase', desc: 'Postgres + RLS' },
    { icon: Server, label: 'Edge Functions', desc: 'Deno runtime' },
    { icon: FileText, label: 'Invoices', desc: 'PDF generation' },
  ];

  const files = [
    { name: 'ticketing.types.ts', desc: 'TypeScript interfaces', icon: Code },
    { name: 'ticketing.schema.sql', desc: 'Database schema + RLS', icon: Database },
    { name: 'ticketing.seed.sql', desc: 'Test data', icon: Database },
    { name: 'ticketing.api.ts', desc: 'Supabase client', icon: Code },
    { name: 'TicketWidget.tsx', desc: 'Purchase widget', icon: Code },
    { name: 'AdminTicketing.tsx', desc: 'Admin dashboard', icon: Code },
    { name: 'Edge Functions (4)', desc: 'Server-side logic', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link to="/admin" className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Admin</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-4">
            <Package className="w-5 h-5 text-purple-300" />
            <span className="text-purple-200 text-sm font-medium">Lovable Drop-in Module</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Ticketing System</h1>
          <p className="text-purple-200">Complete event ticketing for Lovable + Supabase</p>
        </div>

        {/* Download Button */}
        <Button
          onClick={generateFullPackage}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mb-8 shadow-2xl shadow-purple-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-6 h-6" />
          Download Complete Module
        </Button>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <f.icon className="w-6 h-6 text-purple-300 mx-auto mb-1" />
              <div className="text-white text-sm font-medium">{f.label}</div>
              <div className="text-purple-300 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Files List */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Included Files
          </h2>
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-lg">
                <file.icon className="w-4 h-4 text-purple-400" />
                <span className="text-white font-mono text-sm">{file.name}</span>
                <span className="text-purple-300 text-xs ml-auto">{file.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Setup */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6">
          <h2 className="text-white font-semibold mb-4">Quick Setup</h2>
          <ol className="space-y-2 text-purple-100 text-sm">
            {[
              'Download and extract the module package',
              'Copy files to src/modules/ticketing/',
              'Run schema.sql in Supabase SQL Editor',
              'Deploy edge functions with CLI',
              'Set environment variables',
              'Add <TicketWidget /> to any page',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Usage Example */}
        <div className="bg-slate-800/80 rounded-xl p-4 font-mono text-sm mb-6">
          <div className="text-gray-400 mb-2">{'// Add to any page:'}</div>
          <div className="text-white">
            <span className="text-gray-400">{'<'}</span>
            <span className="text-yellow-300">TicketWidget</span>
          </div>
          <div className="text-white pl-4">
            <span className="text-purple-300">orgSlug</span>
            <span className="text-gray-400">=</span>
            <span className="text-green-300">"aquasella"</span>
          </div>
          <div className="text-white pl-4">
            <span className="text-purple-300">eventSlug</span>
            <span className="text-gray-400">=</span>
            <span className="text-green-300">"summer-fest-2025"</span>
          </div>
          <div className="text-white pl-4">
            <span className="text-purple-300">theme</span>
            <span className="text-gray-400">={'{{ '}</span>
            <span className="text-purple-300">primaryColor</span>
            <span className="text-gray-400">: </span>
            <span className="text-green-300">"#6366f1"</span>
            <span className="text-gray-400">{' }}'}</span>
          </div>
          <div className="text-gray-400">{'/>'}</div>
        </div>

        <p className="text-center text-purple-300/60 text-sm">
          Built for Lovable.dev • Supabase Postgres + Edge Functions + Resend
        </p>
      </div>
    </div>
  );
}
