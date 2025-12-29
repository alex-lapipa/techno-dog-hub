import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronRight, ChevronDown, FileText, Users, Disc, Calendar, MapPin, Building, Radio, GitMerge, Zap, Shield, BarChart3, List, Grid3X3, Eye, Play, Loader2 } from 'lucide-react';
import { useAuditActions, AuditProposal, AuditIssue } from '@/hooks/useAuditActions';
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

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

export default function TechnoDocAuditAgent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedIssues, setExpandedIssues] = useState(new Set<string>());
  const [selectedProposals, setSelectedProposals] = useState(new Set<string>());
  const [viewMode, setViewMode] = useState('list');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<AuditProposal | null>(null);

  const {
    isLoading,
    auditData,
    previewData,
    runScan,
    getPreview,
    applyProposal,
    setPreviewData
  } = useAuditActions();

  // Run initial scan on mount
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
    await applyProposal(selectedProposal, false); // dryRun = false
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

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-100 font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d0e]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">techno.dog</h1>
                <p className="text-xs text-gray-500">TechnoDoc Audit Agent v1.0</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className={`w-2 h-2 rounded-full ${auditData ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span className="text-xs text-gray-400">{auditData ? 'Connected' : 'Connecting...'}</span>
              </div>
              <button
                onClick={() => runScan()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {isLoading ? 'Scanning...' : 'Run Audit'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-[#0d0d0e]/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'schema', label: 'Schema', icon: Grid3X3 },
              { id: 'issues', label: 'Issues', icon: AlertTriangle, badge: criticalCount + highCount },
              { id: 'proposals', label: 'Proposals', icon: Zap, badge: auditData?.proposals.length || 0 },
              { id: 'duplicates', label: 'Duplicates', icon: GitMerge },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {!auditData && isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Running database audit...</p>
            </div>
          </div>
        )}

        {auditData && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Health Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                <p className="text-sm text-gray-400 mb-2">Overall Health</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold">{overallHealth}</span>
                  <span className="text-2xl text-gray-500 mb-1">/100</span>
                </div>
                <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${overallHealth}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Total Records</p>
                <p className="text-3xl font-bold">{auditData.totalRecords.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Across {auditData.schema.tables.length} tables</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Critical Issues</p>
                <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
                <p className="text-xs text-gray-500 mt-2">Require immediate attention</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Pending Proposals</p>
                <p className="text-3xl font-bold text-purple-400">{auditData.proposals.length}</p>
                <p className="text-xs text-gray-500 mt-2">Ready for review</p>
              </div>
            </div>

            {/* Entity Health Grid */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Entity Health Scores
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(auditData.healthScores).map(([entity, score]) => {
                  const Icon = entityIcons[entity] || Database;
                  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
                  return (
                    <div key={entity} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm capitalize">{entity}</span>
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{score}%</p>
                      <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Issues Summary */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Priority Issues
              </h2>
              {auditData.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                  <p>No critical or high priority issues found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditData.issues.filter(i => i.severity === 'critical' || i.severity === 'high').map(issue => (
                    <div key={issue.id} className={`flex items-center justify-between p-3 rounded-lg border ${severityColors[issue.severity]}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-black/20">
                          {issue.severity}
                        </span>
                        <span className="text-sm">{issue.message}</span>
                      </div>
                      <span className="text-sm font-mono">{issue.count} records</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {auditData && activeTab === 'schema' && (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-purple-400" />
              Database Schema
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Table</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Entity</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Rows</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Relations</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {auditData.schema.tables.map(table => {
                    const Icon = entityIcons[table.entity] || Database;
                    const health = auditData.healthScores[table.entity] || 80;
                    return (
                      <tr key={table.name} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-purple-400" />
                            <span className="font-medium">{table.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400 capitalize">{table.entity}</td>
                        <td className="py-3 px-4 text-gray-400">{table.rows.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          {table.hasRelations ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-600" />
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${health >= 80 ? 'bg-green-500' : health >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${health}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{health}%</span>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                All Issues ({auditData.issues.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600' : 'bg-gray-800'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600' : 'bg-gray-800'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {auditData.issues.length === 0 ? (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
                <p className="text-xl font-medium text-gray-300">No issues detected</p>
                <p className="text-sm text-gray-500 mt-2">Your database is in good health</p>
              </div>
            ) : (
              <div className="space-y-2">
                {auditData.issues.map(issue => (
                  <div 
                    key={issue.id}
                    className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleIssue(issue.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {expandedIssues.has(issue.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded border ${severityColors[issue.severity]}`}>
                          {issue.severity}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">{issue.type}</span>
                        <span className="text-sm">{issue.message}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 capitalize">{issue.entity}</span>
                        <span className="text-sm font-mono text-gray-400">{issue.count}</span>
                      </div>
                    </button>
                    {expandedIssues.has(issue.id) && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-800 bg-gray-800/20">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Affected Table</p>
                            <p className="font-mono">{issue.table}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Records Affected</p>
                            <p>{issue.count}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Auto-fixable</p>
                            <p>{issue.fixable ? (
                              <span className="text-green-400">Yes</span>
                            ) : (
                              <span className="text-gray-500">Manual review required</span>
                            )}</p>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Improvement Proposals ({auditData.proposals.length})
              </h2>
              <button
                disabled={selectedProposals.size === 0 || isLoading}
                onClick={handleApplySelected}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Apply Selected ({selectedProposals.size})
              </button>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Non-Destructive Mode Active</p>
                <p className="text-xs text-yellow-400/70 mt-1">All changes create rollback snapshots. Original data is preserved with full recovery capability.</p>
              </div>
            </div>

            {auditData.proposals.length === 0 ? (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-12 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500/50" />
                <p className="text-xl font-medium text-gray-300">No proposals needed</p>
                <p className="text-sm text-gray-500 mt-2">Your data is looking good</p>
              </div>
            ) : (
              <div className="space-y-3">
                {auditData.proposals.map(proposal => (
                  <div 
                    key={proposal.id}
                    className={`bg-gray-900/50 rounded-lg border ${selectedProposals.has(proposal.id) ? 'border-purple-500' : 'border-gray-800'} p-4`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedProposals.has(proposal.id)}
                        onChange={() => toggleProposal(proposal.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            {proposal.action}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{proposal.entity}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            proposal.risk === 'low' ? 'bg-green-500/20 text-green-400' : 
                            proposal.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {proposal.risk} risk
                          </span>
                        </div>
                        <p className="text-sm mb-3">{proposal.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Confidence:</span>
                            <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${proposal.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{Math.round(proposal.confidence * 100)}%</span>
                          </div>
                          <span className="text-xs text-gray-500 font-mono">{proposal.targetIds?.length || 0} records</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePreview(proposal)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-xs font-medium"
                        >
                          <Eye className="w-3 h-3" />
                          Preview
                        </button>
                        <button 
                          onClick={() => handleApplyClick(proposal)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded text-xs font-medium"
                        >
                          <Play className="w-3 h-3" />
                          Apply
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
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-400" />
              Duplicate Detection
            </h2>
            
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="text-center py-8">
                <GitMerge className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">
                  {auditData.issues.filter(i => i.type === 'duplicate').reduce((sum, i) => sum + i.count, 0)} potential duplicates detected
                </p>
                <p className="text-sm text-gray-500 mb-6">Review and merge candidates to maintain data integrity</p>
                <button 
                  onClick={() => setActiveTab('proposals')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium"
                >
                  View Merge Proposals
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Preview: {selectedProposal?.action}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Review the changes before applying. This is a safe preview.
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Fix Type</p>
                  <p className="font-mono">{previewData.fixType}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Estimated Changes</p>
                  <p>{previewData.estimatedChanges} records</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-2">Action Description</p>
                <p className="text-sm bg-gray-800/50 p-3 rounded border border-gray-700">
                  {previewData.action}
                </p>
              </div>

              {previewData.affectedRecords.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-2">Affected Records (sample)</p>
                  <div className="max-h-48 overflow-y-auto bg-gray-800/50 rounded border border-gray-700">
                    {previewData.affectedRecords.slice(0, 5).map((record, idx) => (
                      <div key={idx} className="p-2 border-b border-gray-700 last:border-0 text-xs font-mono">
                        {JSON.stringify(record, null, 2).slice(0, 200)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Apply Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-400" />
              Confirm Apply
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              A rollback snapshot will be created before applying changes.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="py-4">
              <p className="text-sm mb-4">{selectedProposal.description}</p>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-xs">
                <p className="text-yellow-400 font-medium">Safe Mode Active</p>
                <p className="text-yellow-400/70 mt-1">Changes can be reverted using the rollback snapshot stored in agent_reports.</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmApply}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0d0d0e]/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-500">
          <span>TechnoDoc Audit Agent • Non-destructive by design</span>
          <span>Last audit: {auditData?.timestamp ? new Date(auditData.timestamp).toLocaleString() : 'Never'}</span>
        </div>
      </footer>
    </div>
  );
}
