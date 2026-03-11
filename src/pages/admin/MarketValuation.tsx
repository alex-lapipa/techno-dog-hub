import { useState } from 'react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { TrendingUp, DollarSign, Heart, ExternalLink, Star, Zap, Users, Globe, Award, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  marketSizeData, revenueBreakdown2024, festivalTrends, consolidationTimeline,
  undergroundStats, platformCapabilities, sophisticationRating,
  overallSophisticationScore, valuationMethods, comparablePlatforms,
  buildComplexityNarrative, monthlyCosts, totalMonthlyCostMin, totalMonthlyCostMax,
  donationTiers, growthScenarios, whyThisMatters, openCollectiveRationale,
  totalEstimatedHours,
} from '@/data/marketValuationData';

// ─── HELPERS ──────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon }: { label: string; value: string; sub?: string; icon?: any }) => (
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
    <CardContent className="pt-5 pb-4 px-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-mono font-bold text-foreground mt-1">{value}</p>
          {sub && <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {Icon && <Icon className="w-4 h-4 text-logo-green opacity-60" />}
      </div>
    </CardContent>
  </Card>
);

const SectionHeading = ({ children, sub }: { children: string; sub?: string }) => (
  <div className="mb-4">
    <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">{children}</h2>
    {sub && <p className="text-xs font-mono text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const Callout = ({ title, children, variant = 'default' }: { title: string; children: React.ReactNode; variant?: 'default' | 'green' | 'crimson' }) => {
  const borderColor = variant === 'green' ? 'border-logo-green/40' : variant === 'crimson' ? 'border-crimson/40' : 'border-border';
  return (
    <div className={`rounded-lg border ${borderColor} bg-card/30 p-4`}>
      <p className="text-xs font-mono uppercase tracking-wider text-foreground mb-2">{title}</p>
      <div className="text-xs font-mono text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// ─── MARKET SNAPSHOT TAB ──────────────────────────────────────────

const MarketSnapshotTab = () => (
  <div className="space-y-8">
    {/* Key Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Global Market (2024)" value="$12.4B" sub="CAGR 6–8%" icon={Globe} />
      <StatCard label="Live Events Share" value="42%" sub="$5.2B" icon={Users} />
      <StatCard label="Vinyl Resurgence" value="$1.2B" sub="85 pressing plants" icon={Star} />
      <StatCard label="Projected 2026" value="$14.5B" sub="+17% from 2024" icon={TrendingUp} />
    </div>

    {/* Market Size Chart */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Global Electronic Music Market Size</CardTitle>
        <CardDescription className="text-[10px] font-mono">USD Billions — 2021 to 2026 (projected)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketSizeData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }} />
              <Bar dataKey="live" name="Live Events" stackId="a" fill="hsl(var(--chart-1))" />
              <Bar dataKey="streaming" name="Streaming" stackId="a" fill="hsl(var(--chart-2))" />
              <Bar dataKey="vinyl" name="Vinyl" stackId="a" fill="hsl(var(--chart-3))" />
              <Bar dataKey="merch" name="Merch" stackId="a" fill="hsl(var(--chart-4))" />
              <Bar dataKey="sync" name="Sync" stackId="a" fill="hsl(var(--chart-5))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* Revenue Breakdown + Festival Trends */}
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-wider">Revenue Breakdown 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revenueBreakdown2024} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`} labelLine={{ stroke: 'hsl(var(--muted-foreground))' }} style={{ fontSize: '9px', fontFamily: 'monospace' }}>
                  {revenueBreakdown2024.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-wider">Festival Attendance Trends</CardTitle>
          <CardDescription className="text-[10px] font-mono">Millions of attendees at major electronic festivals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={festivalTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px' }} />
                <Line type="monotone" dataKey="attendance" name="Attendance (M)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))' }} />
                <Line type="monotone" dataKey="festivals" name="Festivals" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-3))' }} yAxisId={0} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Consolidation Timeline */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Industry Consolidation Timeline</CardTitle>
        <CardDescription className="text-[10px] font-mono">Key events reshaping the electronic music landscape</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {consolidationTimeline.map((event, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="flex-shrink-0 mt-1">
                <Badge variant="outline" className={`text-[9px] font-mono ${
                  event.type === 'acquisition' ? 'border-crimson/50 text-crimson' :
                  event.type === 'closure' ? 'border-destructive/50 text-destructive' :
                  event.type === 'milestone' ? 'border-logo-green/50 text-logo-green' :
                  'border-yellow-500/50 text-yellow-500'
                }`}>
                  {event.year}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-mono text-foreground">{event.event}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{event.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Underground Stats */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Underground Scene Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(undergroundStats).map(([key, value]) => (
            <div key={key}>
              <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                {key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
              </p>
              <p className="text-xs font-mono text-foreground font-semibold mt-1">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);


// ─── TECHNOLOGY VALUATION TAB ─────────────────────────────────────

const TechnologyValuationTab = () => (
  <div className="space-y-8">
    {/* Sophistication Score */}
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="md:col-span-1 border-logo-green/30 bg-logo-green/5">
        <CardContent className="pt-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Platform Sophistication</p>
          <p className="text-5xl font-mono font-black text-logo-green mt-2">{overallSophisticationScore}</p>
          <p className="text-lg font-mono text-logo-green/80">/10</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-3">
            Single-person AI-native platform<br />
            with multi-agent orchestration
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
              <span>AI Depth</span><span>9/10</span>
            </div>
            <Progress value={90} className="h-1" />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
              <span>RAG / Knowledge</span><span>8/10</span>
            </div>
            <Progress value={80} className="h-1" />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
              <span>Agent Orchestration</span><span>8/10</span>
            </div>
            <Progress value={80} className="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-mono uppercase tracking-wider">Sophistication Radar — techno.dog vs Market Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={sophisticationRating} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fontFamily: 'monospace', fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 8, fontFamily: 'monospace' }} stroke="hsl(var(--border))" />
                <Radar name="techno.dog" dataKey="technoDog" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                <Radar name="Market Average" dataKey="marketAverage" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Valuation Methods */}
    <SectionHeading sub="Four independent methodologies converge on a consistent range">Valuation Analysis</SectionHeading>
    <div className="grid md:grid-cols-2 gap-3">
      {valuationMethods.map((v, i) => (
        <Card key={i} className="border-border/50 hover:border-logo-green/30 transition-colors">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-mono uppercase tracking-wider text-foreground">{v.method}</p>
              <DollarSign className="w-3.5 h-3.5 text-logo-green opacity-60" />
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-xl font-mono font-bold text-foreground">€{v.min}K</span>
              <span className="text-xs font-mono text-muted-foreground">—</span>
              <span className="text-xl font-mono font-bold text-foreground">€{v.max}K</span>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">{v.reasoning}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Summary Valuation Range */}
    <Callout title="Consolidated Valuation Range" variant="green">
      <div className="flex items-baseline gap-3 mt-1">
        <span className="text-2xl font-mono font-black text-logo-green">€180K — €800K</span>
        <span className="text-xs font-mono text-muted-foreground">across all methodologies</span>
      </div>
      <p className="mt-2">Mid-point estimate: <strong className="text-foreground">€400K</strong> — reflecting a production-grade AI platform with {totalEstimatedHours.toLocaleString()}+ hours of engineering, 134 edge functions, 150 database tables, and 18+ AI agents, all built by a single founder.</p>
    </Callout>

    {/* Platform Capabilities Table */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Platform Capability Inventory</CardTitle>
        <CardDescription className="text-[10px] font-mono">{platformCapabilities.length} major capabilities — {totalEstimatedHours.toLocaleString()} estimated development hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-3 text-[9px] uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="text-left py-2 pr-3 text-[9px] uppercase tracking-wider text-muted-foreground">Feature</th>
                <th className="text-left py-2 pr-3 text-[9px] uppercase tracking-wider text-muted-foreground hidden md:table-cell">Complexity</th>
                <th className="text-right py-2 pr-3 text-[9px] uppercase tracking-wider text-muted-foreground">Hours</th>
                <th className="text-right py-2 text-[9px] uppercase tracking-wider text-muted-foreground">Unique</th>
              </tr>
            </thead>
            <tbody>
              {platformCapabilities.map((cap, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-2 pr-3 text-muted-foreground">{cap.category}</td>
                  <td className="py-2 pr-3 text-foreground font-medium">{cap.feature}</td>
                  <td className="py-2 pr-3 hidden md:table-cell">
                    <Badge variant="outline" className={`text-[8px] ${cap.complexity === 'Very High' ? 'border-crimson/40 text-crimson' : 'border-border'}`}>
                      {cap.complexity}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3 text-right text-foreground">{cap.estimatedHours}</td>
                  <td className="py-2 text-right">
                    <span className={`${cap.uniqueness >= 9 ? 'text-logo-green' : cap.uniqueness >= 7 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {cap.uniqueness}/10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-border">
                <td colSpan={3} className="py-2 font-bold text-foreground">Total</td>
                <td className="py-2 text-right font-bold text-foreground">{totalEstimatedHours.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Comparable Platforms */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Comparable Platform Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comparablePlatforms.map((p, i) => (
            <div key={i} className="rounded-lg border border-border/30 p-3 hover:border-logo-green/20 transition-colors">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-xs font-mono text-foreground font-semibold">{p.name}</p>
                  <p className="text-[9px] font-mono text-muted-foreground">{p.type} · {p.teamSize} · {p.funding}</p>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">Features: {p.features}</p>
              <p className="text-[10px] font-mono text-logo-green/80 mt-1 flex items-start gap-1">
                <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                {p.technoDogAdvantage}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Build Complexity Narrative */}
    <Card className="border-crimson/20 bg-crimson/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-crimson" />
          {buildComplexityNarrative.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {buildComplexityNarrative.paragraphs.map((p, i) => (
            <p key={i} className="text-xs font-mono text-muted-foreground leading-relaxed">{p}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);


// ─── OPEN SOURCE MODEL TAB ────────────────────────────────────────

const OpenSourceModelTab = () => (
  <div className="space-y-8">
    {/* Monthly Costs */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Min Monthly Cost" value={`€${totalMonthlyCostMin}`} sub="Bare minimum" icon={DollarSign} />
      <StatCard label="Max Monthly Cost" value={`€${totalMonthlyCostMax}`} sub="Full capacity" icon={DollarSign} />
      <StatCard label="Annual Min" value={`€${(totalMonthlyCostMin * 12).toLocaleString()}`} sub="Keep lights on" icon={TrendingUp} />
      <StatCard label="Annual Max" value={`€${(totalMonthlyCostMax * 12).toLocaleString()}`} sub="Full operations" icon={TrendingUp} />
    </div>

    {/* Cost Breakdown */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Monthly Infrastructure Costs</CardTitle>
        <CardDescription className="text-[10px] font-mono">What it costs to keep techno.dog alive</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {monthlyCosts.map((cost, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-mono text-foreground">{cost.item}</p>
                  <p className="text-xs font-mono text-foreground font-semibold">€{cost.min}–{cost.max}</p>
                </div>
                <Progress value={(cost.max / totalMonthlyCostMax) * 100} className="h-1" />
                <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{cost.notes}</p>
              </div>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-3 flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-foreground uppercase">Total</p>
            <p className="text-sm font-mono font-bold text-logo-green">€{totalMonthlyCostMin}–{totalMonthlyCostMax}/mo</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Growth Scenarios Chart */}
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider">Growth Scenarios — What Funding Unlocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthScenarios} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `€${v}`} />
              <YAxis type="category" dataKey="funding" tick={{ fontSize: 10, fontFamily: 'monospace' }} stroke="hsl(var(--muted-foreground))" width={70} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px' }} formatter={(value: any) => [`€${value}/mo`, 'Funding']} />
              <Bar dataKey="amount" name="Monthly Funding">
                {growthScenarios.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {growthScenarios.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <Badge variant="outline" className="text-[8px] font-mono flex-shrink-0 mt-0.5" style={{ borderColor: CHART_COLORS[i] }}>{s.funding}</Badge>
              <p className="text-[10px] font-mono text-muted-foreground">{s.unlocks}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Donation Tiers */}
    <SectionHeading sub="Structured support levels for Open Collective">Donation Tiers</SectionHeading>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
      {donationTiers.map((tier, i) => (
        <Card key={i} className={`border-border/50 hover:border-logo-green/30 transition-colors ${i === donationTiers.length - 1 ? 'border-logo-green/30 bg-logo-green/5' : ''}`}>
          <CardContent className="pt-5 pb-4">
            <div className="text-center mb-3">
              <span className="text-3xl">{tier.emoji}</span>
              <p className="text-xs font-mono uppercase tracking-wider text-foreground mt-2 font-bold">{tier.name}</p>
              <p className="text-xl font-mono font-black text-logo-green mt-1">€{tier.amount}<span className="text-xs text-muted-foreground">/mo</span></p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{tier.description}</p>
            </div>
            <div className="space-y-1 mt-3 pt-3 border-t border-border/30">
              {tier.perks.map((perk, j) => (
                <p key={j} className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                  <ChevronRight className="w-2.5 h-2.5 text-logo-green flex-shrink-0" />
                  {perk}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Why This Matters */}
    <Card className="border-crimson/20 bg-crimson/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-crimson" />
          {whyThisMatters.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {whyThisMatters.points.map((point, i) => (
            <div key={i} className={`rounded-lg p-3 ${i === whyThisMatters.points.length - 1 ? 'bg-logo-green/10 border border-logo-green/20' : 'bg-card/30 border border-border/20'}`}>
              <p className="text-xs font-mono font-semibold text-foreground">{point.heading}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{point.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Open Collective Rationale */}
    <Callout title="Why Open Collective?" variant="green">
      <ul className="space-y-2 mt-1">
        {openCollectiveRationale.map((point, i) => (
          <li key={i} className="flex items-start gap-2">
            <Award className="w-3 h-3 text-logo-green flex-shrink-0 mt-0.5" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </Callout>
  </div>
);


// ─── MAIN PAGE ────────────────────────────────────────────────────

const MarketValuation = () => {
  const [activeTab, setActiveTab] = useState('market');

  return (
    <AdminPageLayout
      title="Market & Valuation"
      description="Platform valuation, market analysis, and open-source funding model"
      icon={TrendingUp}
      iconColor="text-logo-green"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-card/50 border border-border/50 mb-6">
          <TabsTrigger value="market" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-logo-green/10 data-[state=active]:text-logo-green">
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            Market Snapshot
          </TabsTrigger>
          <TabsTrigger value="valuation" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-logo-green/10 data-[state=active]:text-logo-green">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" />
            Technology Valuation
          </TabsTrigger>
          <TabsTrigger value="opensource" className="font-mono text-xs uppercase tracking-wider data-[state=active]:bg-logo-green/10 data-[state=active]:text-logo-green">
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            Open Source Model
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market"><MarketSnapshotTab /></TabsContent>
        <TabsContent value="valuation"><TechnologyValuationTab /></TabsContent>
        <TabsContent value="opensource"><OpenSourceModelTab /></TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
};

export default MarketValuation;
