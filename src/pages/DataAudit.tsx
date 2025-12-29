import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, ChevronDown, FileText, Users, Disc, Calendar, MapPin, Building, Radio, GitMerge, Zap, Shield, BarChart3, List, Grid3X3, Eye, Play, Loader2, Terminal, Activity, Link2 } from 'lucide-react';
import { useAuditActions, AuditProposal, SourceMapStats } from '@/hooks/useAuditActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const entityIcons: Record<string, any> = {
  artists: Users,
  labels: Disc,
  releases: Disc,
  tracks: FileText,
  events: Calendar,
  venues: MapPin,
  promoters: Building,
  media: Radio,
  articles: FileText,
  submissions: FileText,
  jobs: Zap
};

// VHS scanline overlay component
const VHSOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50">
    {/* Scanlines */}
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)',
        backgroundSize: '100% 2px'
      }}
    />
    {/* VHS tracking noise */}
    <div 
      className="absolute inset-0 opacity-[0.02] animate-pulse"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        backgroundSize: '100% 4px'
      }}
    />
  </div>
);

// Thin red line divider
const RedLine = ({ className = '' }: { className?: string }) => (
  <div className={`h-px bg-[hsl(var(--crimson))] opacity-60 ${className}`} />
);

// Status indicator with glow
const StatusDot = ({ status }: { status: 'ok' | 'warning' | 'error' }) => {
  const colors = {
    ok: 'bg-[hsl(var(--logo-green))]',
    warning: 'text-foreground',
    error: 'bg-[hsl(var(--crimson))]'
  };
  const glows = {
    ok: 'shadow-[0_0_8px_hsl(var(--logo-green))]',
    warning: '',
    error: 'shadow-[0_0_8px_hsl(var(--crimson))]'
  };
  return (
    <div className={`w-2 h-2 rounded-full ${colors[status]} ${glows[status]} animate-pulse`} />
  );
};

export default function TechnoDocAuditAgent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedIssues, setExpandedIssues] = useState(new Set<string>());
  const [selectedProposals, setSelectedProposals] = useState(new Set<string>());
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<AuditProposal | null>(null);
  const [glitchFrame, setGlitchFrame] = useState(0);

  const {
    isLoading,
    auditData,
    previewData,
    runScan,
    getPreview,
    applyProposal,
  } = useAuditActions();

  // VHS glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchFrame(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    runScan();
  }, [runScan]);

  const toggleIssue = (id: string) => {
    const next = new Set(expandedIssues);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedIssues(next);
  };

  const toggleProposal = (id: string) => {
    const next = new Set(selectedProposals);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedProposals(next);
  };

  const handlePreview = async (proposal: AuditProposal) => {
    setSelectedProposal(proposal);
    await getPreview(proposal.fixType, proposal.table, proposal.targetIds);
    setPreviewDialogOpen(true);
  };

  const handleApplyClick = (proposal: AuditProposal) => {
    setSelectedProposal(proposal);
    setConfirmDialogOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedProposal) return;
    await applyProposal(selectedProposal, false);
    setConfirmDialogOpen(false);
    setSelectedProposal(null);
  };

  const handleApplySelected = async () => {
    if (!auditData) return;
    const selected = auditData.proposals.filter(p => selectedProposals.has(p.id));
    for (const proposal of selected) {
      await applyProposal(proposal, false);
    }
    setSelectedProposals(new Set());
  };

  const overallHealth = auditData 
    ? Math.round(
        Object.values(auditData.healthScores).reduce((a, b) => a + b, 0) / 
        Math.max(1, Object.values(auditData.healthScores).length)
      )
    : 0;

  const criticalCount = auditData?.issues.filter(i => i.severity === 'critical').length || 0;
  const highCount = auditData?.issues.filter(i => i.severity === 'high').length || 0;

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-[hsl(var(--crimson))] text-[hsl(var(--crimson))] bg-[hsl(var(--crimson))]/5';
      case 'high':
        return 'border-[hsl(var(--crimson))]/60 text-[hsl(var(--crimson))] bg-[hsl(var(--crimson))]/5';
      case 'medium':
        return 'border-foreground/30 text-foreground/80 bg-foreground/5';
      case 'low':
        return 'border-[hsl(var(--logo-green))]/30 text-[hsl(var(--logo-green))] bg-[hsl(var(--logo-green))]/5';
      default:
        return 'border-foreground/20 text-foreground/60 bg-foreground/5';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-mono relative">
      <VHSOverlay />
      
      {/* Header */}
      <header className="border-b border-[hsl(var(--crimson))]/30 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Terminal className="w-8 h-8 text-[hsl(var(--logo-green))]" />
                <div className="absolute -inset-1 bg-[hsl(var(--logo-green))]/20 blur-md -z-10" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-[0.3em] text-foreground uppercase">
                  TECHNODOC
                </h1>
                <p className="text-[10px] tracking-[0.2em] text-[hsl(var(--logo-green))] uppercase">
                  DATA INTEGRITY AGENT v1.0
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 border border-foreground/20">
                <StatusDot status={auditData ? 'ok' : 'warning'} />
                <span className="text-[10px] tracking-wider uppercase text-foreground/60">
                  {auditData ? 'CONNECTED' : 'SCANNING'}
                </span>
              </div>
              <button
                onClick={() => runScan()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--logo-green))]/50 text-[hsl(var(--logo-green))] hover:bg-[hsl(var(--logo-green))]/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs tracking-wider uppercase transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isLoading ? 'SCANNING' : 'RUN AUDIT'}
              </button>
            </div>
          </div>
        </div>
        <RedLine />
      </header>

      {/* Navigation */}
      <nav className="border-b border-foreground/10 bg-background/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0">
            {[
              { id: 'overview', label: 'OVERVIEW', icon: BarChart3 },
              { id: 'schema', label: 'SCHEMA', icon: Grid3X3 },
              { id: 'issues', label: 'ISSUES', icon: AlertTriangle, badge: criticalCount + highCount },
              { id: 'proposals', label: 'PROPOSALS', icon: Zap, badge: auditData?.proposals.length || 0 },
              { id: 'duplicates', label: 'DUPLICATES', icon: GitMerge },
            ].map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-[10px] font-medium tracking-[0.2em] uppercase border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-[hsl(var(--logo-green))] text-[hsl(var(--logo-green))]'
                    : 'border-transparent text-foreground/40 hover:text-foreground/70'
                } ${idx > 0 ? 'border-l border-foreground/10' : ''}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 bg-[hsl(var(--crimson))]/20 text-[hsl(var(--crimson))] text-[9px] border border-[hsl(var(--crimson))]/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!auditData && isLoading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="relative">
                <Database className="w-16 h-16 text-[hsl(var(--logo-green))]/50 mx-auto mb-6 animate-pulse" />
                <div className="absolute inset-0 bg-[hsl(var(--logo-green))]/10 blur-xl" />
              </div>
              <p className="text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
                SCANNING DATABASE
              </p>
              <div className="mt-4 w-48 h-px bg-gradient-to-r from-transparent via-[hsl(var(--logo-green))]/50 to-transparent mx-auto animate-pulse" />
            </div>
          </div>
        )}

        {auditData && activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Health Score Cards */}
            <div className="grid grid-cols-4 gap-4">
              {/* Main health score */}
              <div className="relative border border-[hsl(var(--logo-green))]/30 p-6 bg-[hsl(var(--logo-green))]/5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[hsl(var(--logo-green))]/5 blur-2xl" />
                <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-3">SYSTEM HEALTH</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-[hsl(var(--logo-green))]">{overallHealth}</span>
                  <span className="text-lg text-foreground/30">/100</span>
                </div>
                <div className="mt-4 h-1 bg-foreground/10 overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--logo-green))] transition-all duration-1000"
                    style={{ width: `${overallHealth}%` }}
                  />
                </div>
              </div>
              
              <div className="border border-foreground/10 p-6">
                <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-3">TOTAL RECORDS</p>
                <p className="text-3xl font-bold text-foreground">{auditData.totalRecords.toLocaleString()}</p>
                <p className="text-[9px] text-foreground/30 mt-2 uppercase tracking-wider">
                  {auditData.schema.tables.length} TABLES
                </p>
              </div>
              
              <div className="border border-[hsl(var(--crimson))]/30 p-6 bg-[hsl(var(--crimson))]/5">
                <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-3">CRITICAL ISSUES</p>
                <p className="text-3xl font-bold text-[hsl(var(--crimson))]">{criticalCount}</p>
                <p className="text-[9px] text-[hsl(var(--crimson))]/50 mt-2 uppercase tracking-wider">
                  IMMEDIATE ACTION
                </p>
              </div>
              
              <div className="border border-foreground/10 p-6">
                <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-3">PROPOSALS</p>
                <p className="text-3xl font-bold text-foreground">{auditData.proposals.length}</p>
                <p className="text-[9px] text-foreground/30 mt-2 uppercase tracking-wider">
                  READY FOR REVIEW
                </p>
              </div>
            </div>

            <RedLine className="my-8" />

            {/* Entity Health Grid */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-4 h-4 text-[hsl(var(--logo-green))]" />
                <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                  ENTITY HEALTH MATRIX
                </h2>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(auditData.healthScores).map(([entity, score]) => {
                  const Icon = entityIcons[entity] || Database;
                  const isHealthy = score >= 80;
                  const isWarning = score >= 60 && score < 80;
                  return (
                    <div 
                      key={entity} 
                      className={`border p-4 transition-all ${
                        isHealthy 
                          ? 'border-[hsl(var(--logo-green))]/20 bg-[hsl(var(--logo-green))]/5' 
                          : isWarning 
                            ? 'border-foreground/20' 
                            : 'border-[hsl(var(--crimson))]/30 bg-[hsl(var(--crimson))]/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-3 h-3 text-foreground/40" />
                        <span className="text-[9px] uppercase tracking-wider text-foreground/60">{entity}</span>
                      </div>
                      <p className={`text-2xl font-bold ${
                        isHealthy 
                          ? 'text-[hsl(var(--logo-green))]' 
                          : isWarning 
                            ? 'text-foreground' 
                            : 'text-[hsl(var(--crimson))]'
                      }`}>
                        {score}%
                      </p>
                      <div className="mt-2 h-0.5 bg-foreground/10 overflow-hidden">
                        <div 
                          className={`h-full ${
                            isHealthy 
                              ? 'bg-[hsl(var(--logo-green))]' 
                              : isWarning 
                                ? 'bg-foreground/50' 
                                : 'bg-[hsl(var(--crimson))]'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <RedLine className="my-8" />

            {/* Source Map Stats - DJ Artists ↔ Canonical Artists Link Status */}
            {auditData.sourceMapStats && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Link2 className="w-4 h-4 text-[hsl(var(--logo-green))]" />
                  <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                    ARTIST DATA UNIFICATION
                  </h2>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div className="border border-foreground/10 p-4">
                    <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-2">CANONICAL</p>
                    <p className="text-2xl font-bold text-foreground">{auditData.sourceMapStats.total_canonical}</p>
                    <p className="text-[9px] text-foreground/30 mt-1">verified artists</p>
                  </div>
                  <div className="border border-foreground/10 p-4">
                    <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-2">RAG</p>
                    <p className="text-2xl font-bold text-foreground">{auditData.sourceMapStats.total_rag}</p>
                    <p className="text-[9px] text-foreground/30 mt-1">dj_artists</p>
                  </div>
                  <div className={`border p-4 ${auditData.sourceMapStats.link_percentage >= 80 ? 'border-[hsl(var(--logo-green))]/30 bg-[hsl(var(--logo-green))]/5' : 'border-foreground/10'}`}>
                    <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-2">LINKED</p>
                    <p className={`text-2xl font-bold ${auditData.sourceMapStats.link_percentage >= 80 ? 'text-[hsl(var(--logo-green))]' : 'text-foreground'}`}>
                      {auditData.sourceMapStats.linked_count}
                    </p>
                    <p className="text-[9px] text-foreground/30 mt-1">{auditData.sourceMapStats.link_percentage}% linked</p>
                  </div>
                  <div className={`border p-4 ${auditData.sourceMapStats.canonical_only > 0 ? 'border-foreground/20' : 'border-foreground/10'}`}>
                    <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-2">CANONICAL ONLY</p>
                    <p className="text-2xl font-bold text-foreground/70">{auditData.sourceMapStats.canonical_only}</p>
                    <p className="text-[9px] text-foreground/30 mt-1">no RAG link</p>
                  </div>
                  <div className={`border p-4 ${auditData.sourceMapStats.rag_only > 0 ? 'border-[hsl(var(--crimson))]/30 bg-[hsl(var(--crimson))]/5' : 'border-foreground/10'}`}>
                    <p className="text-[9px] tracking-[0.2em] text-foreground/50 uppercase mb-2">RAG ONLY</p>
                    <p className={`text-2xl font-bold ${auditData.sourceMapStats.rag_only > 0 ? 'text-[hsl(var(--crimson))]' : 'text-foreground/70'}`}>
                      {auditData.sourceMapStats.rag_only}
                    </p>
                    <p className="text-[9px] text-foreground/30 mt-1">needs migration</p>
                  </div>
                </div>
                <div className="mt-4 h-1.5 bg-foreground/10 overflow-hidden">
                  <div 
                    className="h-full bg-[hsl(var(--logo-green))] transition-all duration-1000"
                    style={{ width: `${auditData.sourceMapStats.link_percentage}%` }}
                  />
                </div>
                <p className="text-[9px] text-foreground/30 mt-2 text-right uppercase tracking-wider">
                  SOURCE MAP COMPLETENESS: {auditData.sourceMapStats.link_percentage}%
                </p>
              </div>
            )}

            <RedLine className="my-8" />

            {/* Priority Issues */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--crimson))]" />
                <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                  PRIORITY ALERTS
                </h2>
              </div>
              {auditData.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0 ? (
                <div className="border border-[hsl(var(--logo-green))]/20 p-8 text-center">
                  <CheckCircle className="w-10 h-10 mx-auto mb-4 text-[hsl(var(--logo-green))]/50" />
                  <p className="text-[10px] tracking-[0.2em] text-foreground/40 uppercase">
                    NO CRITICAL ISSUES DETECTED
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditData.issues.filter(i => i.severity === 'critical' || i.severity === 'high').map(issue => (
                    <div key={issue.id} className={`flex items-center justify-between p-4 border ${getSeverityStyle(issue.severity)}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-[8px] uppercase font-bold px-2 py-1 border border-current">
                          {issue.severity}
                        </span>
                        <span className="text-xs">{issue.message}</span>
                      </div>
                      <span className="text-[10px] font-mono text-foreground/50">{issue.count} RECORDS</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {auditData && activeTab === 'schema' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Grid3X3 className="w-4 h-4 text-[hsl(var(--logo-green))]" />
              <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                DATABASE SCHEMA
              </h2>
            </div>
            <div className="border border-foreground/10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--crimson))]/20">
                    <th className="text-left py-3 px-4 text-[9px] tracking-[0.2em] text-foreground/40 uppercase">Table</th>
                    <th className="text-left py-3 px-4 text-[9px] tracking-[0.2em] text-foreground/40 uppercase">Entity</th>
                    <th className="text-left py-3 px-4 text-[9px] tracking-[0.2em] text-foreground/40 uppercase">Records</th>
                    <th className="text-left py-3 px-4 text-[9px] tracking-[0.2em] text-foreground/40 uppercase">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.schema.tables.map((table, idx) => {
                    const Icon = entityIcons[table.entity] || Database;
                    const health = auditData.healthScores[table.entity] || 80;
                    const isHealthy = health >= 80;
                    return (
                      <tr key={table.name} className={`border-b border-foreground/5 hover:bg-foreground/5 ${idx % 2 === 0 ? 'bg-foreground/[0.02]' : ''}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3 h-3 text-[hsl(var(--logo-green))]/50" />
                            <span className="font-mono">{table.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground/50 uppercase text-[10px] tracking-wider">{table.entity}</td>
                        <td className="py-3 px-4 font-mono text-foreground/70">{table.rows.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-1 bg-foreground/10 overflow-hidden">
                              <div 
                                className={`h-full ${isHealthy ? 'bg-[hsl(var(--logo-green))]' : 'bg-[hsl(var(--crimson))]'}`}
                                style={{ width: `${health}%` }}
                              />
                            </div>
                            <span className={`text-[10px] ${isHealthy ? 'text-[hsl(var(--logo-green))]' : 'text-[hsl(var(--crimson))]'}`}>
                              {health}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {auditData && activeTab === 'issues' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-[hsl(var(--crimson))]" />
                <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                  ALL ISSUES ({auditData.issues.length})
                </h2>
              </div>
            </div>
            
            {auditData.issues.length === 0 ? (
              <div className="border border-[hsl(var(--logo-green))]/20 p-16 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--logo-green))]/30" />
                <p className="text-[11px] tracking-[0.2em] text-foreground/40 uppercase">ZERO ISSUES DETECTED</p>
                <p className="text-[10px] text-foreground/20 mt-2">DATABASE INTEGRITY VERIFIED</p>
              </div>
            ) : (
              <div className="space-y-2">
                {auditData.issues.map(issue => (
                  <div 
                    key={issue.id}
                    className="border border-foreground/10 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleIssue(issue.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-foreground/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {expandedIssues.has(issue.id) ? (
                          <ChevronDown className="w-3 h-3 text-foreground/30" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-foreground/30" />
                        )}
                        <span className={`text-[8px] uppercase font-bold px-2 py-1 border ${getSeverityStyle(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className="text-[9px] text-foreground/40 uppercase tracking-wider">{issue.type}</span>
                        <span className="text-xs">{issue.message}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] text-foreground/30 uppercase">{issue.entity}</span>
                        <span className="text-[10px] font-mono text-foreground/50">{issue.count}</span>
                      </div>
                    </button>
                    {expandedIssues.has(issue.id) && (
                      <div className="px-4 pb-4 pt-2 border-t border-foreground/5 bg-foreground/[0.02]">
                        <RedLine className="mb-4" />
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-1">TABLE</p>
                            <p className="font-mono">{issue.table}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-1">AFFECTED</p>
                            <p>{issue.count} records</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-1">AUTO-FIX</p>
                            <p className={issue.fixable ? 'text-[hsl(var(--logo-green))]' : 'text-foreground/30'}>
                              {issue.fixable ? 'AVAILABLE' : 'MANUAL'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {auditData && activeTab === 'proposals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-[hsl(var(--logo-green))]" />
                <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                  IMPROVEMENT PROPOSALS ({auditData.proposals.length})
                </h2>
              </div>
              <button
                disabled={selectedProposals.size === 0 || isLoading}
                onClick={handleApplySelected}
                className="flex items-center gap-2 px-4 py-2 border border-[hsl(var(--logo-green))]/50 text-[hsl(var(--logo-green))] hover:bg-[hsl(var(--logo-green))]/10 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] tracking-wider uppercase transition-all"
              >
                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                APPLY SELECTED ({selectedProposals.size})
              </button>
            </div>
            
            <div className="border border-foreground/20 p-4 flex items-start gap-4 bg-foreground/[0.02]">
              <Shield className="w-5 h-5 text-[hsl(var(--logo-green))] mt-0.5" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[hsl(var(--logo-green))] uppercase">
                  NON-DESTRUCTIVE MODE ACTIVE
                </p>
                <p className="text-[9px] text-foreground/40 mt-1 tracking-wider">
                  ALL CHANGES CREATE ROLLBACK SNAPSHOTS. ORIGINAL DATA PRESERVED.
                </p>
              </div>
            </div>

            {auditData.proposals.length === 0 ? (
              <div className="border border-[hsl(var(--logo-green))]/20 p-16 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--logo-green))]/30" />
                <p className="text-[11px] tracking-[0.2em] text-foreground/40 uppercase">NO PROPOSALS NEEDED</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditData.proposals.map(proposal => (
                  <div 
                    key={proposal.id}
                    className={`border p-5 transition-all ${
                      selectedProposals.has(proposal.id) 
                        ? 'border-[hsl(var(--logo-green))]/50 bg-[hsl(var(--logo-green))]/5' 
                        : 'border-foreground/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProposals.has(proposal.id)}
                        onChange={() => toggleProposal(proposal.id)}
                        className="mt-1 w-4 h-4 rounded-none border-foreground/30 bg-transparent checked:bg-[hsl(var(--logo-green))] checked:border-[hsl(var(--logo-green))] focus:ring-[hsl(var(--logo-green))] focus:ring-offset-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[9px] uppercase font-bold px-2 py-1 border border-[hsl(var(--logo-green))]/30 text-[hsl(var(--logo-green))]">
                            {proposal.action}
                          </span>
                          <span className="text-[9px] text-foreground/40 uppercase tracking-wider">{proposal.entity}</span>
                          <span className={`text-[9px] px-2 py-1 border ${
                            proposal.risk === 'low' 
                              ? 'border-[hsl(var(--logo-green))]/30 text-[hsl(var(--logo-green))]' 
                              : proposal.risk === 'medium' 
                                ? 'border-foreground/30 text-foreground/60' 
                                : 'border-[hsl(var(--crimson))]/30 text-[hsl(var(--crimson))]'
                          }`}>
                            {proposal.risk.toUpperCase()} RISK
                          </span>
                        </div>
                        <p className="text-xs mb-4">{proposal.description}</p>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-foreground/30 uppercase">CONFIDENCE:</span>
                            <div className="w-20 h-1 bg-foreground/10 overflow-hidden">
                              <div 
                                className="h-full bg-[hsl(var(--logo-green))]"
                                style={{ width: `${proposal.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-[hsl(var(--logo-green))]">{Math.round(proposal.confidence * 100)}%</span>
                          </div>
                          <span className="text-[9px] text-foreground/30 font-mono">{proposal.targetIds?.length || 0} RECORDS</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePreview(proposal)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-foreground/20 text-foreground/60 hover:text-foreground hover:border-foreground/40 disabled:opacity-50 text-[9px] tracking-wider uppercase transition-all"
                        >
                          <Eye className="w-3 h-3" />
                          PREVIEW
                        </button>
                        <button 
                          onClick={() => handleApplyClick(proposal)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[hsl(var(--logo-green))]/50 text-[hsl(var(--logo-green))] hover:bg-[hsl(var(--logo-green))]/10 disabled:opacity-50 text-[9px] tracking-wider uppercase transition-all"
                        >
                          <Play className="w-3 h-3" />
                          APPLY
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {auditData && activeTab === 'duplicates' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <GitMerge className="w-4 h-4 text-[hsl(var(--logo-green))]" />
              <h2 className="text-[11px] tracking-[0.3em] text-foreground uppercase">
                DUPLICATE DETECTION
              </h2>
            </div>
            
            <div className="border border-foreground/10 p-12 text-center">
              <GitMerge className="w-12 h-12 text-foreground/20 mx-auto mb-6" />
              <p className="text-foreground/60 mb-2">
                {auditData.issues.filter(i => i.type === 'duplicate').reduce((sum, i) => sum + i.count, 0)} potential duplicates detected
              </p>
              <p className="text-[10px] text-foreground/30 mb-6 tracking-wider uppercase">
                REVIEW AND MERGE TO MAINTAIN INTEGRITY
              </p>
              <button 
                onClick={() => setActiveTab('proposals')}
                className="px-5 py-2 border border-[hsl(var(--logo-green))]/50 text-[hsl(var(--logo-green))] hover:bg-[hsl(var(--logo-green))]/10 text-[10px] tracking-wider uppercase transition-all"
              >
                VIEW MERGE PROPOSALS
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="bg-background border-[hsl(var(--crimson))]/30 text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase">
              <Eye className="w-4 h-4 text-[hsl(var(--logo-green))]" />
              PREVIEW: {selectedProposal?.action}
            </DialogTitle>
            <DialogDescription className="text-foreground/40 text-[10px] tracking-wider">
              SAFE PREVIEW - NO CHANGES APPLIED
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4 py-4">
              <RedLine />
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-1">FIX TYPE</p>
                  <p className="font-mono">{previewData.fixType}</p>
                </div>
                <div>
                  <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-1">ESTIMATED CHANGES</p>
                  <p>{previewData.estimatedChanges} records</p>
                </div>
              </div>
              
              <div>
                <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-2">ACTION</p>
                <p className="text-xs border border-foreground/10 p-3 bg-foreground/[0.02]">
                  {previewData.action}
                </p>
              </div>

              {previewData.affectedRecords.length > 0 && (
                <div>
                  <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-2">AFFECTED RECORDS (SAMPLE)</p>
                  <div className="max-h-40 overflow-y-auto border border-foreground/10 bg-foreground/[0.02]">
                    {previewData.affectedRecords.slice(0, 3).map((record, idx) => (
                      <div key={idx} className="p-2 border-b border-foreground/5 last:border-0 text-[10px] font-mono text-foreground/60">
                        {JSON.stringify(record, null, 2).slice(0, 150)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPreviewDialogOpen(false)}
              className="border-foreground/20 text-foreground/60 hover:bg-foreground/5 text-[10px] tracking-wider uppercase"
            >
              CLOSE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Apply Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-background border-[hsl(var(--crimson))]/30 text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase">
              <Shield className="w-4 h-4 text-[hsl(var(--logo-green))]" />
              CONFIRM APPLY
            </DialogTitle>
            <DialogDescription className="text-foreground/40 text-[10px] tracking-wider">
              ROLLBACK SNAPSHOT WILL BE CREATED
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="py-4">
              <p className="text-xs mb-4">{selectedProposal.description}</p>
              <div className="border border-[hsl(var(--logo-green))]/20 p-3 bg-[hsl(var(--logo-green))]/5 text-[10px]">
                <p className="text-[hsl(var(--logo-green))] font-bold tracking-wider uppercase">SAFE MODE ACTIVE</p>
                <p className="text-foreground/40 mt-1">
                  CHANGES STORED IN AGENT_REPORTS FOR RECOVERY
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              className="border-foreground/20 text-foreground/60 hover:bg-foreground/5 text-[10px] tracking-wider uppercase"
            >
              CANCEL
            </Button>
            <Button 
              onClick={handleConfirmApply}
              disabled={isLoading}
              className="bg-[hsl(var(--logo-green))]/20 border border-[hsl(var(--logo-green))]/50 text-[hsl(var(--logo-green))] hover:bg-[hsl(var(--logo-green))]/30 text-[10px] tracking-wider uppercase"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              APPLY CHANGES
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--crimson))]/20 bg-background/80 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[9px] text-foreground/30 tracking-wider uppercase">
          <span>TECHNODOC AUDIT AGENT • NON-DESTRUCTIVE BY DESIGN</span>
          <span>LAST AUDIT: {auditData?.timestamp ? new Date(auditData.timestamp).toLocaleString() : '—'}</span>
        </div>
      </footer>
    </div>
  );
}
