import React, { useState } from 'react';
import { Database, Search, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronRight, ChevronDown, FileText, Users, Disc, Calendar, MapPin, Building, Radio, GitMerge, Zap, Shield, BarChart3, List, Grid3X3 } from 'lucide-react';

const entityIcons = {
  artists: Users,
  labels: Disc,
  releases: Disc,
  tracks: FileText,
  events: Calendar,
  venues: MapPin,
  promoters: Building,
  media: Radio
};

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  info: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

const mockAuditData = {
  schema: {
    tables: [
      { name: 'artists', columns: 12, rows: 847, hasRelations: true },
      { name: 'labels', columns: 9, rows: 234, hasRelations: true },
      { name: 'releases', columns: 14, rows: 1523, hasRelations: true },
      { name: 'tracks', columns: 11, rows: 4892, hasRelations: true },
      { name: 'events', columns: 10, rows: 312, hasRelations: true },
      { name: 'venues', columns: 8, rows: 89, hasRelations: true },
    ]
  },
  healthScores: {
    artists: 72,
    labels: 85,
    releases: 68,
    tracks: 74,
    events: 61,
    venues: 79
  },
  issues: [
    { id: 1, type: 'duplicate', severity: 'high', entity: 'artists', message: '23 potential duplicate artists detected (fuzzy name match)', count: 23 },
    { id: 2, type: 'missing_fields', severity: 'medium', entity: 'releases', message: '156 releases missing catalog_number', count: 156 },
    { id: 3, type: 'taxonomy', severity: 'medium', entity: 'artists', message: '47 artists using non-standard genre tags', count: 47 },
    { id: 4, type: 'orphaned', severity: 'high', entity: 'tracks', message: '89 tracks with broken release references', count: 89 },
    { id: 5, type: 'integrity', severity: 'critical', entity: 'events', message: '12 events referencing deleted venues', count: 12 },
    { id: 6, type: 'missing_fields', severity: 'low', entity: 'artists', message: '234 artists missing biography_short', count: 234 },
    { id: 7, type: 'duplicate', severity: 'medium', entity: 'labels', message: '8 potential duplicate labels (name variants)', count: 8 },
    { id: 8, type: 'missing_fields', severity: 'low', entity: 'venues', message: '34 venues missing capacity field', count: 34 },
  ],
  proposals: [
    { id: 1, action: 'merge', entity: 'artists', description: 'Merge "Ben Klock" and "B. Klock" (confidence: 0.94)', confidence: 0.94, risk: 'low' },
    { id: 2, action: 'normalize', entity: 'artists', description: 'Standardize 47 genre tags to controlled vocabulary', confidence: 0.88, risk: 'low' },
    { id: 3, action: 'repair', entity: 'tracks', description: 'Re-link 89 orphaned tracks to correct releases', confidence: 0.76, risk: 'medium' },
    { id: 4, action: 'enrich', entity: 'releases', description: 'Auto-fill 156 catalog numbers from Discogs API', confidence: 0.82, risk: 'low' },
    { id: 5, action: 'repair', entity: 'events', description: 'Archive or re-link 12 events with deleted venues', confidence: 0.91, risk: 'medium' },
  ]
};

export default function TechnoDocAuditAgent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(true);
  const [expandedIssues, setExpandedIssues] = useState(new Set());
  const [selectedProposals, setSelectedProposals] = useState(new Set());
  const [viewMode, setViewMode] = useState('list');

  const runAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 3000);
  };

  const toggleIssue = (id) => {
    const next = new Set(expandedIssues);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedIssues(next);
  };

  const toggleProposal = (id) => {
    const next = new Set(selectedProposals);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedProposals(next);
  };

  const overallHealth = Math.round(
    Object.values(mockAuditData.healthScores).reduce((a, b) => a + b, 0) / 
    Object.values(mockAuditData.healthScores).length
  );

  const criticalCount = mockAuditData.issues.filter(i => i.severity === 'critical').length;
  const highCount = mockAuditData.issues.filter(i => i.severity === 'high').length;

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
                <div className={`w-2 h-2 rounded-full ${auditComplete ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span className="text-xs text-gray-400">{auditComplete ? 'Connected' : 'Auditing...'}</span>
              </div>
              <button
                onClick={runAudit}
                disabled={isAuditing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
                {isAuditing ? 'Auditing...' : 'Run Audit'}
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
              { id: 'proposals', label: 'Proposals', icon: Zap, badge: mockAuditData.proposals.length },
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
                {tab.badge > 0 && (
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
        {activeTab === 'overview' && (
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
                <p className="text-3xl font-bold">7,897</p>
                <p className="text-xs text-gray-500 mt-2">Across 6 entity types</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Critical Issues</p>
                <p className="text-3xl font-bold text-red-400">{criticalCount}</p>
                <p className="text-xs text-gray-500 mt-2">Require immediate attention</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <p className="text-sm text-gray-400 mb-2">Pending Proposals</p>
                <p className="text-3xl font-bold text-purple-400">{mockAuditData.proposals.length}</p>
                <p className="text-xs text-gray-500 mt-2">Ready for review</p>
              </div>
            </div>

            {/* Entity Health Grid */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Entity Health Scores
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(mockAuditData.healthScores).map(([entity, score]) => {
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
              <div className="space-y-2">
                {mockAuditData.issues.filter(i => i.severity === 'critical' || i.severity === 'high').map(issue => (
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
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
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
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Columns</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Rows</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Relations</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAuditData.schema.tables.map(table => {
                    const Icon = entityIcons[table.name] || Database;
                    const health = mockAuditData.healthScores[table.name] || 0;
                    return (
                      <tr key={table.name} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-purple-400" />
                            <span className="font-medium">{table.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{table.columns}</td>
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

        {activeTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                All Issues ({mockAuditData.issues.length})
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
            
            <div className="space-y-2">
              {mockAuditData.issues.map(issue => (
                <div 
                  key={issue.id}
                  className={`bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden`}
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
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Affected Entity</p>
                          <p className="capitalize">{issue.entity}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Records Affected</p>
                          <p>{issue.count}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium">
                          View Records
                        </button>
                        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium">
                          Create Proposal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Improvement Proposals ({mockAuditData.proposals.length})
              </h2>
              <button
                disabled={selectedProposals.size === 0}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors"
              >
                Apply Selected ({selectedProposals.size})
              </button>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Non-Destructive Mode Active</p>
                <p className="text-xs text-yellow-400/70 mt-1">All changes are staged as proposals. Original data is preserved with full rollback capability.</p>
              </div>
            </div>

            <div className="space-y-3">
              {mockAuditData.proposals.map(proposal => (
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
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium">
                        Preview
                      </button>
                      <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'duplicates' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-purple-400" />
              Duplicate Detection
            </h2>
            
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <div className="text-center py-8">
                <GitMerge className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">31 potential duplicates detected</p>
                <p className="text-sm text-gray-500 mb-6">Review and merge candidates to maintain data integrity</p>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">
                  Start Review Queue
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Artist Duplicates
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm">Ben Klock ↔ B. Klock</span>
                    <span className="text-xs text-green-400">94%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm">Ellen Allien ↔ Ellen alien</span>
                    <span className="text-xs text-green-400">91%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm">DVS1 ↔ DVS 1</span>
                    <span className="text-xs text-yellow-400">78%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-gray-400" />
                  Label Duplicates
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm">Tresor ↔ Tresor Records</span>
                    <span className="text-xs text-green-400">96%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-sm">R&S ↔ R&S Records</span>
                    <span className="text-xs text-green-400">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-[#0d0d0e]/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-500">
          <span>TechnoDoc Audit Agent • Non-destructive by design</span>
          <span>Last audit: {new Date().toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
}
